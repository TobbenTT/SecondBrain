import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'orchestrator.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  dbInstance = new Database(DB_PATH);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);
  migrateSchema(dbInstance);
  return dbInstance;
}

function migrateSchema(db: Database.Database) {
  // Add asignaciones_training table if not exists (migration for training assignment feature)
  db.exec(`
    CREATE TABLE IF NOT EXISTS asignaciones_training (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      cantidad_personas INTEGER NOT NULL DEFAULT 1,
      estado TEXT DEFAULT 'PENDIENTE',
      fecha_asignacion TEXT DEFAULT (datetime('now')),
      fecha_completado TEXT,
      notas TEXT,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id)
    );
    `);
}

function initSchema(db: Database.Database) {
  const initialized = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='roles'").get();
  if (initialized) return;

  db.exec(`
    -- =============================================
    -- MODULE 1: STAFFING
    -- =============================================
    CREATE TABLE IF NOT EXISTS departamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS patrones_turno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ciclo_dias INTEGER NOT NULL,
      equipos_requeridos INTEGER NOT NULL,
      horas_diarias REAL DEFAULT 12,
      horas_semanales_promedio REAL NOT NULL,
      horas_anuales REAL,
      cumple_regulacion INTEGER DEFAULT 1,
      riesgo_fatiga TEXT DEFAULT 'Moderado',
      base_legal TEXT
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      departamento_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      categoria TEXT NOT NULL,
      turno_tipo TEXT DEFAULT 'Turno Rotativo',
      headcount_por_turno INTEGER DEFAULT 1,
      nivel_competencia TEXT DEFAULT 'Competente',
      educacion_minima TEXT,
      experiencia_minima TEXT,
      salario_base_mensual REAL DEFAULT 0,
      certificaciones TEXT,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
    );

    CREATE TABLE IF NOT EXISTS dotacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      patron_turno_id INTEGER NOT NULL,
      personas_por_turno INTEGER NOT NULL,
      numero_equipos INTEGER DEFAULT 4,
      factor_relevo REAL DEFAULT 1.22,
      headcount_total INTEGER NOT NULL,
      fecha_inicio_estimada TEXT,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (patron_turno_id) REFERENCES patrones_turno(id)
    );

    -- =============================================
    -- MODULE 2: TRAINING
    -- =============================================
    CREATE TABLE IF NOT EXISTS competencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comp_id TEXT NOT NULL UNIQUE,
      categoria TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      nivel_1 TEXT,
      nivel_2 TEXT,
      nivel_3 TEXT,
      nivel_4 TEXT,
      nivel_5 TEXT
    );

    CREATE TABLE IF NOT EXISTS matriz_rol_competencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      competencia_id INTEGER NOT NULL,
      nivel_requerido INTEGER DEFAULT 3,
      prioridad TEXT DEFAULT 'Importante',
      certificacion TEXT,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (competencia_id) REFERENCES competencias(id)
    );

    CREATE TABLE IF NOT EXISTS plan_capacitacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      competencia_id INTEGER NOT NULL,
      nivel_requerido INTEGER NOT NULL,
      nivel_actual INTEGER DEFAULT 0,
      brecha INTEGER GENERATED ALWAYS AS (nivel_requerido - nivel_actual) STORED,
      clasificacion_brecha TEXT,
      metodo_entrenamiento TEXT,
      horas_estimadas REAL DEFAULT 0,
      prioridad_training TEXT DEFAULT 'Pre-commissioning',
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (competencia_id) REFERENCES competencias(id)
    );

    CREATE TABLE IF NOT EXISTS cursos_capacitacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      audiencia TEXT,
      asistentes_sesion INTEGER DEFAULT 15,
      num_sesiones INTEGER DEFAULT 1,
      duracion_dias INTEGER DEFAULT 1,
      metodo TEXT,
      proveedor TEXT,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      ubicacion TEXT,
      costo_estimado REAL DEFAULT 0,
      prerequisitos TEXT,
      fase INTEGER DEFAULT 1
    );

    -- =============================================
    -- MODULE 3: FINANCE
    -- =============================================
    CREATE TABLE IF NOT EXISTS presupuesto_opex (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      headcount INTEGER NOT NULL,
      salario_base REAL NOT NULL,
      carga_social_pct REAL DEFAULT 0.25,
      gratificacion_pct REAL DEFAULT 0.0475,
      vacaciones_pct REAL DEFAULT 0.07,
      beneficios_pct REAL DEFAULT 0.10,
      factor_carga_total REAL DEFAULT 1.55,
      costo_anual_pp REAL GENERATED ALWAYS AS (salario_base * 12 * factor_carga_total) STORED,
      costo_total REAL GENERATED ALWAYS AS (salario_base * 12 * factor_carga_total * headcount) STORED,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS costos_capacitacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id INTEGER NOT NULL,
      costo_por_sesion REAL DEFAULT 0,
      num_sesiones INTEGER DEFAULT 1,
      costo_total REAL GENERATED ALWAYS AS (costo_por_sesion * num_sesiones) STORED,
      FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id)
    );

    CREATE TABLE IF NOT EXISTS resumen_opex (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria TEXT NOT NULL,
      subcategoria TEXT,
      monto_anual REAL DEFAULT 0,
      porcentaje_total REAL DEFAULT 0
    );

    -- =============================================
    -- MODULE 4: AUDIT
    -- =============================================
    CREATE TABLE IF NOT EXISTS reglas_compliance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      descripcion TEXT NOT NULL,
      dominio TEXT NOT NULL,
      fuente_regulacion TEXT,
      severidad_1_5 INTEGER DEFAULT 3,
      probabilidad_deteccion_1_5 INTEGER DEFAULT 3
    );

    CREATE TABLE IF NOT EXISTS resultados_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      regla_id INTEGER NOT NULL,
      estado TEXT DEFAULT 'NO_EVALUADO',
      score_pct REAL DEFAULT 0,
      risk_score INTEGER DEFAULT 0,
      detalle TEXT,
      fecha TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (regla_id) REFERENCES reglas_compliance(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modulo TEXT NOT NULL,
      accion TEXT NOT NULL,
      detalle TEXT,
      usuario TEXT DEFAULT 'system',
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

  seedData(db);
}

function seedData(db: Database.Database) {
  // --- DEPARTMENTS ---
  const insertDept = db.prepare('INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)');
  const depts = [
    ['Gestión Planta', 'Dirección y gestión de la planta concentradora'],
    ['Operaciones', 'Operación de la planta concentradora, molienda y flotación'],
    ['Mantenimiento', 'Mantenimiento mecánico, eléctrico e instrumentación'],
    ['HSE', 'Seguridad, salud ocupacional y medio ambiente'],
    ['Laboratorio', 'Control de calidad y análisis metalúrgico'],
    ['Bodega', 'Almacenamiento y gestión de repuestos'],
    ['Administración', 'Soporte administrativo y RRHH'],
  ];
  for (const d of depts) insertDept.run(d[0], d[1]);

  // --- SHIFT PATTERNS ---
  const insertShift = db.prepare(`INSERT INTO patrones_turno 
    (nombre, ciclo_dias, equipos_requeridos, horas_diarias, horas_semanales_promedio, horas_anuales, cumple_regulacion, riesgo_fatiga, base_legal) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertShift.run('4x4 Continental', 16, 4, 12, 42, 2080, 1, 'Moderado', 'Art. 38 Código del Trabajo');
  insertShift.run('7x7', 14, 2, 12, 42, 2184, 1, 'Moderado-Alto', 'Art. 38 Código del Trabajo');
  insertShift.run('4x3 (12hrs)', 7, 4, 12, 42, 2256, 1, 'Moderado', 'Art. 22 excepcional');
  insertShift.run('5x2 (Día)', 7, 1, 9, 45, 2205, 1, 'Bajo', 'Art. 22 ordinario');
  insertShift.run('10x10', 20, 2, 12, 42, 2190, 1, 'Alto', 'Art. 38 excepcional');

  // --- ROLES (from create-staffing-plan.md mining concentrator example) ---
  const insertRole = db.prepare(`INSERT INTO roles 
    (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  // Gestión Planta
  insertRole.run(1, 'Gerente de Planta', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Metalúrgico/Químico', '15+ años', 6500000, null);
  insertRole.run(1, 'Superintendente de Área', 'Supervisión', 'Día', 3, 'Avanzado', 'Ing. Civil/Ejecución', '10+ años', 4800000, null);
  // Operaciones
  insertRole.run(2, 'Jefe de Turno', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Metalurgia', '5+ años molienda', 3200000, 'DS 132');
  insertRole.run(2, 'Operador de Sala de Control', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico Nivel Superior', '3+ años', 1800000, 'DCS ABB 800xA');
  insertRole.run(2, 'Operador de Campo – Chancado', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Nivel Medio', '2+ años', 1400000, 'DS 132');
  insertRole.run(2, 'Operador de Campo – Molienda', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
  insertRole.run(2, 'Operador de Campo – Flotación', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
  insertRole.run(2, 'Operador de Campo – Espesamiento', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Nivel Medio', '2+ años', 1400000, 'DS 132');
  insertRole.run(2, 'Operador de Campo – Relaves/Agua', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1400000, 'DS 132');
  insertRole.run(2, 'Ingeniero de Procesos', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Civil Metalúrgico', '5+ años', 3500000, null);
  insertRole.run(2, 'Metalurgista', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Metalurgia Extractiva', '3+ años', 3000000, null);
  // Mantenimiento
  insertRole.run(3, 'Superintendente Mantenimiento', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Mecánico/Eléctrico', '12+ años', 5000000, null);
  insertRole.run(3, 'Supervisor Mantenimiento', 'Supervisión', 'Turno Rotativo', 3, 'Avanzado', 'Ing. Ejecución', '8+ años', 3000000, null);
  insertRole.run(3, 'Planificador Mantenimiento', 'Profesional', 'Día', 4, 'Avanzado', 'Ing. Ejecución', '5+ años', 2800000, 'SAP-PM');
  insertRole.run(3, 'Mecánico', 'Staff', 'Turno Rotativo', 8, 'Competente', 'Técnico NMS Mecánica', '3+ años', 1600000, 'DS 132');
  insertRole.run(3, 'Soldador/Calderero', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Soldadura', '3+ años', 1700000, 'AWS Certificado');
  insertRole.run(3, 'Electricista', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Electricidad', '3+ años', 1700000, 'SEC Clase A/B');
  insertRole.run(3, 'Instrumentista', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Instrumentación', '3+ años', 1800000, null);
  insertRole.run(3, 'Técnico PdM', 'Profesional', 'Día', 3, 'Avanzado', 'Técnico NMS + Certificación', '5+ años', 2200000, 'Vibración CAT II');
  insertRole.run(3, 'Ingeniero Confiabilidad', 'Profesional', 'Día', 1, 'Experto', 'Ing. Civil Mecánico', '8+ años', 4000000, 'CMRP');
  // HSE
  insertRole.run(4, 'Jefe HSE', 'Gestión', 'Día', 1, 'Experto', 'Ing. Prevención de Riesgos', '10+ años', 4200000, null);
  insertRole.run(4, 'Coordinador HSE', 'Staff', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Prevención de Riesgos', '5+ años', 2500000, 'DS 132');
  insertRole.run(4, 'Paramédico', 'Staff', 'Turno Rotativo', 1, 'Competente', 'Paramédico Certificado', '3+ años', 1600000, 'ACLS');
  insertRole.run(4, 'Técnico Ambiental', 'Staff', 'Día', 2, 'Competente', 'Técnico Ambiental', '3+ años', 1500000, null);
  // Laboratorio
  insertRole.run(5, 'Técnico Laboratorio', 'Staff', 'Turno Rotativo', 2, 'Competente', 'TNS Química/Metalurgia', '2+ años', 1400000, null);
  // Bodega
  insertRole.run(6, 'Bodeguero', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1100000, 'SAP-MM');
  // Admin
  insertRole.run(7, 'Administrativo', 'Staff', 'Día', 3, 'Competente', 'Secretariado/Administración', '2+ años', 1000000, null);
  insertRole.run(7, 'Coordinador Capacitación', 'Profesional', 'Día', 1, 'Avanzado', 'Psicólogo/RRHH', '5+ años', 2200000, null);
  insertRole.run(7, 'Soporte TI', 'Profesional', 'Día', 1, 'Competente', 'Ing. Informática', '3+ años', 2000000, null);

  // --- DOTACION (staffing assignments, using 4x4 Continental as default rotating) ---
  const insertDot = db.prepare(`INSERT INTO dotacion 
    (role_id, patron_turno_id, personas_por_turno, numero_equipos, factor_relevo, headcount_total, fecha_inicio_estimada) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  const roles = db.prepare('SELECT id, turno_tipo, headcount_por_turno FROM roles').all() as Array<{ id: number, turno_tipo: string, headcount_por_turno: number }>;
  for (const r of roles) {
    const isDia = r.turno_tipo === 'Día';
    const patronId = isDia ? 4 : 1; // 5x2 for day, 4x4 for rotating
    const equipos = isDia ? 1 : 4;
    const relevo = isDia ? 1.0 : 1.22;
    const total = isDia ? r.headcount_por_turno : Math.ceil(r.headcount_por_turno * equipos * relevo);
    insertDot.run(r.id, patronId, r.headcount_por_turno, equipos, relevo, total, '2026-02-01');
  }

  // --- COMPETENCIAS (from xlsx template) ---
  const insertComp = db.prepare(`INSERT INTO competencias 
    (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const competencias = [
    ['COMP-SEG-001', 'Seguridad', 'Inducción HSE Sitio', 'Conocimiento de estándares de seguridad del sitio', 'Conoce las reglas de oro', 'Aplica sistema de permisos con supervisión', 'Aplica permisos autónomamente', 'Lidera conversaciones seguridad', 'Diseña procedimientos HSE'],
    ['COMP-SEG-002', 'Seguridad', 'Primeros Auxilios y RCP', 'Capacidad de respuesta ante emergencias médicas', 'Conoce pasos básicos RCP', 'Realiza RCP con supervisión', 'Certificado vigente RCP', 'Instruye primeros auxilios internos', 'Diseña protocolos respuesta médica'],
    ['COMP-SEG-003', 'Seguridad', 'Combate de Incendios', 'Uso de equipos de extinción y respuesta a emergencias', 'Conoce tipos de extintores', 'Usa extintor básico', 'Maneja equipos contra incendio', 'Lidera brigada de emergencia', 'Diseña planes de emergencia'],
    ['COMP-SEG-004', 'Seguridad', 'Trabajo en Altura / Esp. Confinados', 'Procedimientos para trabajos de alto riesgo', 'Conoce riesgos asociados', 'Trabaja con supervisión directa', 'Trabaja autónomamente con permisos', 'Supervisa equipos de trabajo', 'Diseña procedimientos de alto riesgo'],
    ['COMP-TEC-001', 'Técnica – Proceso', 'Fundamentos Concentración Cobre', 'Conocimiento del proceso de flotación y molienda', 'Conoce etapas generales', 'Describe variables de proceso', 'Opera con comprensión técnica', 'Optimiza parámetros', 'Diseña mejoras de proceso'],
    ['COMP-TEC-002', 'Técnica – Proceso', 'Operación Molino SAG', 'Operación y control del molino SAG', 'Identifica componentes', 'Opera con supervisión', 'Opera autónomamente', 'Resuelve problemas complejos', 'Optimiza rendimiento SAG'],
    ['COMP-TEC-003', 'Técnica – Proceso', 'Operación Molinos de Bolas', 'Operación y control de molinos de bolas', 'Identifica componentes', 'Opera con supervisión', 'Opera autónomamente', 'Diagnóstica anomalías operacionales', 'Optimiza circuito molienda'],
    ['COMP-TEC-004', 'Técnica – Proceso', 'Operación Celdas de Flotación', 'Control del proceso de flotación', 'Conoce principios flotación', 'Controla con supervisión', 'Controla autónomamente', 'Ajusta reactivos complejo', 'Diseña circuitos flotación'],
    ['COMP-TEC-005', 'Técnica – Proceso', 'Control de Calidad y Muestreo', 'Toma de muestras e interpretación de resultados', 'Conoce puntos de muestreo', 'Toma muestras con supervisión', 'Toma muestras e interpreta', 'Diseña planes de muestreo', 'Optimiza calidad producto'],
    ['COMP-TEC-006', 'Técnica – Equipo', 'Mantenimiento Preventivo Molienda', 'Ejecución de PM en equipos de molienda', 'Conoce componentes', 'Ejecuta PM con supervisión', 'Ejecuta PM autónomamente', 'Diagnostica fallas preventivas', 'Diseña programas PM'],
    ['COMP-SIS-001', 'Sistemas', 'DCS ABB 800xA', 'Operación del sistema de control distribuido', 'Navega pantallas básicas', 'Monitorea con supervisión', 'Opera autónomamente', 'Configura alarmas y tendencias', 'Administra sistema DCS'],
    ['COMP-SIS-002', 'Sistemas', 'SAP-PM', 'Gestión de órdenes de trabajo y activos', 'Navega módulo PM', 'Crea OT con supervisión', 'Gestiona OT autónomamente', 'Genera reportes avanzados', 'Administra módulo PM'],
    ['COMP-OPS-001', 'Operacional', 'Arranque de Planta', 'Procedimientos de arranque secuencial de equipos', 'Conoce secuencia general', 'Ejecuta con supervisión paso a paso', 'Ejecuta arranque autónomamente', 'Resuelve contingencias arranque', 'Diseña procedimientos arranque'],
    ['COMP-OPS-002', 'Operacional', 'Parada Programada', 'Procedimientos de parada secuencial', 'Conoce secuencia parada', 'Ejecuta con supervisión', 'Ejecuta parada autónomamente', 'Coordina parada multi-equipo', 'Diseña procedimientos parada'],
    ['COMP-OPS-003', 'Operacional', 'Parada de Emergencia', 'Respuesta ante situaciones de emergencia operacional', 'Conoce botón E-Stop', 'Activa ESD con supervisión', 'Ejecuta parada emergencia', 'Lidera respuesta emergencia', 'Diseña sistemas ESD'],
    ['COMP-OPS-004', 'Operacional', 'Operación Anormal – Molienda', 'Manejo de condiciones anormales en molienda', 'Identifica alarmas básicas', 'Responde con guía', 'Diagnostica y corrige', 'Resuelve escenarios complejos', 'Documenta y previene recurrencia'],
    ['COMP-OPS-005', 'Operacional', 'Operación Anormal – Flotación', 'Manejo de condiciones anormales en flotación', 'Identifica alarmas básicas', 'Responde con guía', 'Diagnostica y corrige', 'Resuelve escenarios complejos', 'Documenta y previene recurrencia'],
    ['COMP-OPS-006', 'Operacional', 'Rondas de Campo', 'Inspección visual y operacional de equipos', 'Conoce ruta de ronda', 'Realiza ronda con guía', 'Realiza ronda autónomamente', 'Detecta anomalías sutiles', 'Optimiza rutas y checklists'],
    ['COMP-OPS-007', 'Operacional', 'Transferencia de Turno', 'Comunicación efectiva entre turnos', 'Conoce formato de entrega', 'Entrega con supervisión', 'Entrega y recibe autónomamente', 'Gestiona turnos complejos', 'Diseña protocolos transferencia'],
    ['COMP-COND-001', 'Conductual', 'Trabajo en Equipo', 'Colaboración efectiva en entorno industrial', 'Conoce su rol en equipo', 'Colabora bajo dirección', 'Colabora proactivamente', 'Facilita resolución conflictos', 'Lidera equipos de alto desempeño'],
    ['COMP-COND-002', 'Conductual', 'Comunicación Operacional', 'Comunicación clara en entorno de operaciones', 'Usa radio básicamente', 'Comunica situaciones simples', 'Comunica situaciones complejas', 'Coordina entre múltiples áreas', 'Diseña protocolos comunicación'],
  ];
  for (const c of competencias) insertComp.run(...c);

  // --- CURSOS CAPACITACION (7 phases from template) ---
  const insertCurso = db.prepare(`INSERT INTO cursos_capacitacion 
    (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const cursos = [
    ['CAP-SEG-001', 'Inducción HSE Sitio Los Bronces', 'Todos los roles', 15, 1, 3, 'Aula + Campo', 'HSE Corporativo', '2026-03-07', '2026-03-09', 'Sala Capacitación Sitio', 800, null, 1],
    ['CAP-SEG-002', 'Primeros Auxilios y RCP (Certificación)', 'Todos los roles', 15, 1, 2, 'Curso Certificado', 'ACHS / Cruz Roja Chile', '2026-03-10', '2026-03-11', 'Sala Capacitación Sitio', 2400, 'CAP-SEG-001', 1],
    ['CAP-SEG-003', 'Combate de Incendios Básico', 'Todos los roles', 15, 1, 1, 'Teórico-Práctico', 'Bomberos / Proveedor Externo', '2026-03-12', '2026-03-12', 'Cancha Emergencias', 1800, 'CAP-SEG-001', 1],
    ['CAP-SEG-004', 'Trabajo en Altura y Espacios Confinados', 'Operadores campo', 13, 1, 2, 'Certificación Práctica', 'ACHS / Proveedor Certificado', '2026-03-13', '2026-03-14', 'Torre Entrenamiento', 3200, 'CAP-SEG-001', 1],
    ['CAP-TEC-001', 'Fundamentos Concentración de Cobre', 'Todos los operadores', 15, 1, 5, 'Aula + Visita Planta', 'Metalurgista Senior + Ing. Proceso', '2026-03-18', '2026-03-22', 'Sala Capacitación Sitio', 0, 'CAP-SEG-001', 2],
    ['CAP-TEC-002', 'Control de Calidad y Muestreo', 'Todos los operadores', 15, 1, 3, 'Aula + Laboratorio', 'Jefe Laboratorio', '2026-03-25', '2026-03-27', 'Laboratorio Planta', 500, 'CAP-TEC-001', 2],
    ['CAP-TEC-003', 'Operación Molino SAG (OEM)', 'JT Molienda + Op. Senior + Op. Junior', 8, 1, 4, 'Aula + Manual OEM', 'Proveedor OEM Molino SAG', '2026-04-01', '2026-04-04', 'Sala Capacitación Sitio', 15000, 'CAP-TEC-001', 3],
    ['CAP-TEC-004', 'Operación Molinos de Bolas (OEM)', 'JT Molienda + Op. Senior + Op. Junior', 13, 1, 4, 'Aula + Manual OEM', 'Proveedor OEM Molinos Bolas', '2026-04-06', '2026-04-09', 'Sala Capacitación Sitio', 10000, 'CAP-TEC-001', 3],
    ['CAP-TEC-005', 'Operación Celdas Flotación', 'JT Flotación + Asist. Flotación', 5, 1, 4, 'Aula + Manual OEM', 'Proveedor OEM Flotación', '2026-04-10', '2026-04-14', 'Sala Capacitación Sitio', 8000, 'CAP-TEC-001', 3],
    ['CAP-SIS-001', 'DCS ABB 800xA – Certificación Operador', 'Todos los operadores', 15, 2, 4, 'Laboratorio DCS + Simulador', 'ABB Chile', '2026-04-20', '2026-05-07', 'Sala DCS / Centro ABB Santiago', 45000, 'CAP-TEC-001', 4],
    ['CAP-SIS-002', 'SAP-PM Gestión de Órdenes de Trabajo', 'JT + Op. Senior + Planificadores', 10, 1, 3, 'Aula + Sistema SAP', 'SAP / Consultor Interno', '2026-05-08', '2026-05-12', 'Sala TI', 5000, null, 4],
    ['CAP-SOP-001', 'SOPs Línea 3 – Molienda', 'JT Molienda + Op. Senior + Op. Junior', 8, 1, 5, 'Aula + Simulador DCS', 'Ing. Proceso + JT Senior', '2026-05-18', '2026-05-23', 'Sala DCS', 0, 'CAP-SIS-001', 5],
    ['CAP-SOP-002', 'SOPs Línea 3 – Flotación', 'JT Flotación + Asist. Flotación', 5, 1, 5, 'Aula + Simulador DCS', 'Metalurgista + JT Senior', '2026-05-25', '2026-05-30', 'Sala DCS', 0, 'CAP-SIS-001', 5],
    ['CAP-SOP-003', 'Operaciones Anormales y Emergencias', 'Todos los operadores', 15, 1, 5, 'Simulador DCS + Drill', 'Ing. Proceso + HSE', '2026-06-02', '2026-06-08', 'Sala DCS + Cancha Emergencias', 0, 'CAP-SOP-001', 5],
    ['CAP-OJT-001', 'OJT Supervisado – Molienda', 'Op. Senior + Op. Junior Molienda', 8, 1, 25, 'OJT + Mentoring', 'JT Molienda (Mentor)', '2026-06-15', '2026-07-18', 'Línea 3 – Planta Molienda', 0, 'CAP-SOP-001', 6],
    ['CAP-OJT-002', 'OJT Supervisado – Flotación', 'Asistentes de Flotación', 3, 1, 20, 'OJT + Mentoring', 'Metalúrgico + JT', '2026-06-15', '2026-07-11', 'Línea 3 – Planta Flotación', 0, 'CAP-SOP-002', 6],
    ['CAP-EVAL-001', 'Evaluación Final de Competencias', 'Todos los operadores', 15, 1, 5, 'Evaluación Práctica + Oral', 'Comité: Jefe Planta + HSE + RRHH', '2026-07-20', '2026-07-24', 'Sala + Planta L3', 0, 'Todas las fases', 7],
  ];
  for (const c of cursos) insertCurso.run(...c);

  // --- COMPLIANCE RULES ---
  const insertRegla = db.prepare(`INSERT INTO reglas_compliance 
    (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) 
    VALUES (?, ?, ?, ?, ?, ?)`);
  const reglas = [
    ['CT-ART22', 'Jornada semanal no debe exceder 45 horas ordinarias', 'Laboral', 'Código del Trabajo Art. 22', 4, 5],
    ['CT-ART38', 'Turnos excepcionales deben estar aprobados por Dirección del Trabajo', 'Laboral', 'Código del Trabajo Art. 38', 5, 4],
    ['CT-ART67', 'Feriado anual mínimo 15 días hábiles', 'Laboral', 'Código del Trabajo Art. 67', 3, 3],
    ['DS132-FAT', 'Factor de relevo debe estar entre 1.15 y 1.28 para operaciones 24/7', 'Seguridad Minera', 'DS 132 Cap. 6 - Fatiga', 4, 4],
    ['DS132-CAP', 'Todo personal minero debe completar inducción seguridad antes de operar', 'Seguridad Minera', 'DS 132 - Capacitación', 5, 5],
    ['DS594-AMB', 'Condiciones ambientales de trabajo dentro de límites permisibles', 'Salud Ocupacional', 'DS 594 MINSAL', 4, 3],
    ['STAFF-SUP', 'Ratio supervisor:trabajador entre 1:8 y 1:12', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2],
    ['STAFF-PLAN', 'Ratio planificador:técnico entre 1:15 y 1:20', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2],
    ['COMP-CERT', 'Todos los roles deben tener competencias y certificaciones definidas', 'Competencias', 'ISO 55001 / create-staffing-plan', 4, 4],
    ['TRAIN-REG', 'Capacitación regulatoria completada antes del trabajo en planta', 'Capacitación', 'DS 132 + create-training-plan', 5, 5],
    ['FIN-BURDEN', 'Factor de carga laboral entre 1.40 y 1.70 sobre salario bruto', 'Financiero', 'model-opex-budget.md', 3, 2],
    ['ERP-DRILL', 'Simulacros de emergencia realizados al menos cada 6 meses', 'Emergencia', 'DS 132 + NFPA', 4, 4],
  ];
  for (const r of reglas) insertRegla.run(...r);

  // Log the seed
  db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'SEED', 'Base de datos inicializada con datos de ejemplo Los Bronces L3')").run();
}
