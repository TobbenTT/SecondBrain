-- =============================================
-- PROYECTO: Quebrada Blanca Fase 2 (QB2)
-- EMPRESA: Teck Resources
-- TIPO: Planta Concentradora de Cobre-Molibdeno
-- UBICACIÓN: Región de Tarapacá, Chile
-- CAPACIDAD: 140,000 tpd
-- =============================================

-- Limpiar datos existentes (mantener estructura y audit log)
DELETE FROM asignaciones_training;
DELETE FROM resultados_audit;
DELETE FROM reglas_compliance;
DELETE FROM costos_capacitacion;
DELETE FROM presupuesto_opex;
DELETE FROM resumen_opex;
DELETE FROM plan_capacitacion;
DELETE FROM matriz_rol_competencia;
DELETE FROM cursos_capacitacion;
DELETE FROM dotacion;
DELETE FROM roles;
DELETE FROM competencias;
DELETE FROM departamentos;

-- =============================================
-- DEPARTAMENTOS QB2
-- =============================================
INSERT INTO departamentos (nombre, descripcion) VALUES ('Dirección de Planta', 'Gestión estratégica y operativa de la planta concentradora QB2');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Chancado y Transporte', 'Operación de chancado primario, secundario y correas transportadoras');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Molienda y Clasificación', 'Operación de molinos SAG, bolas y clasificadores');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Flotación y Remolienda', 'Celdas de flotación rougher, cleaner y remolienda');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Espesamiento y Filtrado', 'Espesadores de concentrado y relaves, filtros de presión');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Mantenimiento Mecánico', 'Mantenimiento preventivo y correctivo de equipos mecánicos');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Mantenimiento Eléctrico e Instrumentación', 'Sistemas eléctricos, instrumentación y automatización');
INSERT INTO departamentos (nombre, descripcion) VALUES ('HSEC y Medio Ambiente', 'Seguridad, salud ocupacional, medio ambiente y comunidades');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Laboratorio Metalúrgico', 'Análisis químico y metalúrgico del proceso');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Logística y Bodega', 'Gestión de materiales, repuestos y logística de sitio');

-- =============================================
-- ROLES QB2
-- =============================================
-- Dirección de Planta
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Director de Planta', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Metalúrgico', '18+ años', 7200000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Superintendente de Operaciones', 'Gestión', 'Día', 2, 'Experto', 'Ing. Civil Procesos', '12+ años', 5500000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Coordinador de Gestión', 'Profesional', 'Día', 1, 'Avanzado', 'Ing. Industrial', '5+ años', 2800000, NULL);

-- Chancado y Transporte
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Supervisor Chancado', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Mining', '7+ años', 3400000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Operador Chancado Primario', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Nivel Medio', '2+ años minería', 1350000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Operador Correas Transportadoras', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1300000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Ayudante Chancado', 'Staff', 'Turno Rotativo', 2, 'Básico', 'Enseñanza Media', '1+ año', 1100000, 'DS 132');

-- Molienda y Clasificación
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Jefe de Turno Molienda', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Metalurgia', '8+ años', 3600000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Sala Control Molienda', 'Staff', 'Turno Rotativo', 2, 'Competente', 'TNS Automatización', '3+ años', 1900000, 'DCS ABB 800xA');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Campo Molino SAG', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Campo Molinos Bolas', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Hidrociclones', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1400000, 'DS 132');

-- Flotación y Remolienda
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Jefe de Turno Flotación', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Metalurgia', '8+ años', 3600000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Celdas Rougher', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Celdas Cleaner', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1550000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Remolienda', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico NMS Metalurgia', '2+ años', 1500000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Metalurgista Flotación', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Civil Metalúrgico', '5+ años', 3200000, NULL);

-- Espesamiento y Filtrado
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Operador Espesadores', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1350000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Operador Filtros Presión', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico NMS', '2+ años', 1450000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Operador Relaves', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Ambiental', '2+ años', 1400000, 'DS 132');

-- Mantenimiento Mecánico
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Superintendente Mantenimiento', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Mecánico', '15+ años', 5200000, 'CMRP');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Supervisor Mantenimiento Mecánico', 'Supervisión', 'Turno Rotativo', 2, 'Avanzado', 'Ing. Ejecución Mecánica', '8+ años', 3200000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Planificador Mantención', 'Profesional', 'Día', 3, 'Avanzado', 'Ing. Ejecución', '5+ años', 2900000, 'SAP-PM');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Mecánico Molienda', 'Staff', 'Turno Rotativo', 5, 'Competente', 'Técnico NMS Mecánica', '3+ años', 1700000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Soldador Calificado', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Soldadura', '4+ años', 1800000, 'AWS D1.1');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Lubricador', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1300000, 'ICML MLT I');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Ingeniero Confiabilidad', 'Profesional', 'Día', 1, 'Experto', 'Ing. Civil Mecánico', '10+ años', 4500000, 'CMRP');

-- Mantenimiento Eléctrico e Instrumentación
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Supervisor Eléctrico', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Eléctrica', '8+ años', 3300000, 'SEC Clase A');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Electricista MT/BT', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Electricidad', '3+ años', 1800000, 'SEC Clase B');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Instrumentista', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Instrumentación', '3+ años', 1850000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Técnico PdM Vibraciones', 'Profesional', 'Día', 2, 'Avanzado', 'Técnico NMS + CAT II', '5+ años', 2400000, 'ISO 18436-2 CAT II');

-- HSEC
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Gerente HSEC', 'Gestión', 'Día', 1, 'Experto', 'Ing. Prevención de Riesgos', '12+ años', 4800000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Coordinador HSE Terreno', 'Staff', 'Turno Rotativo', 2, 'Avanzado', 'Ing. Prevención de Riesgos', '5+ años', 2600000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Paramédico', 'Staff', 'Turno Rotativo', 1, 'Competente', 'Paramédico TENS', '3+ años', 1600000, 'ACLS + PHTLS');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Especialista Medio Ambiente', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Ambiental', '5+ años', 2800000, NULL);

-- Laboratorio
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (9, 'Jefe Laboratorio', 'Supervisión', 'Día', 1, 'Experto', 'Químico / Ing. Químico', '8+ años', 3200000, 'ISO 17025');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (9, 'Analista Químico', 'Staff', 'Turno Rotativo', 2, 'Competente', 'TNS Química Analítica', '2+ años', 1500000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (9, 'Muestrero', 'Staff', 'Turno Rotativo', 2, 'Básico', 'Técnico Nivel Medio', '1+ año', 1200000, NULL);

-- Logística y Bodega
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (10, 'Jefe Bodega', 'Supervisión', 'Día', 1, 'Avanzado', 'Ing. Industrial / Logístico', '5+ años', 2500000, 'SAP-MM');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (10, 'Bodeguero', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1150000, 'SAP-MM');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (10, 'Operador Grúa/Montacargas', 'Staff', 'Turno Rotativo', 1, 'Competente', 'Licencia D+', '3+ años', 1250000, 'Lic. Clase D');

-- =============================================
-- PATRONES DE TURNO (usar los existentes si ya están)
-- =============================================

-- =============================================
-- DOTACIÓN (headcount total con factor relevo)
-- =============================================
INSERT INTO dotacion (role_id, patron_turno_id, personas_por_turno, numero_equipos, factor_relevo, headcount_total, fecha_inicio_estimada) SELECT r.id, CASE WHEN r.turno_tipo = 'Día' THEN 4 ELSE 1 END, r.headcount_por_turno, CASE WHEN r.turno_tipo = 'Día' THEN 1 ELSE 4 END, CASE WHEN r.turno_tipo = 'Día' THEN 1.0 ELSE 1.22 END, CASE WHEN r.turno_tipo = 'Día' THEN r.headcount_por_turno ELSE CAST(r.headcount_por_turno * 4 * 1.22 + 0.5 AS INTEGER) END, '2026-06-01' FROM roles r;

-- =============================================
-- COMPETENCIAS QB2
-- =============================================
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-001', 'Seguridad', 'Inducción HSE QB2', 'Estándares seguridad sitio QB2 alta montaña', 'Conoce reglas de oro', 'Aplica con supervisión', 'Aplica autónomamente', 'Lidera safety talks', 'Diseña procedimientos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-002', 'Seguridad', 'Primeros Auxilios Altura Geográfica', 'Respuesta emergencias en altitud (3,800 msnm)', 'Conoce síntomas soroche', 'Primeros auxilios básicos', 'Certificado RCP + altitud', 'Instruye respuesta emergencia', 'Diseña protocolos altura');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-003', 'Seguridad', 'Trabajo en Altura / Esp. Confinados', 'Procedimientos alto riesgo minería QB2', 'Conoce riesgos', 'Trabaja supervisado', 'Trabaja autónomo con permiso', 'Supervisa equipos', 'Diseña procedimientos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-001', 'Técnica', 'Proceso Concentración Cu-Mo', 'Flotación selectiva cobre-molibdeno', 'Conoce etapas', 'Describe variables', 'Opera con dominio', 'Optimiza parámetros', 'Diseña circuitos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-002', 'Técnica', 'Operación Chancado Primario', 'Operación chancador giratorio y alimentación', 'Identifica componentes', 'Opera con supervisión', 'Opera autónomamente', 'Resuelve problemas', 'Optimiza throughput');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-003', 'Técnica', 'Operación Molino SAG 40ft', 'Operación molino SAG de 40 pies QB2', 'Identifica partes', 'Opera supervisado', 'Opera autónomo', 'Diagnóstica anomalías', 'Optimiza rendimiento');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-004', 'Técnica', 'Flotación Selectiva Cu-Mo', 'Separación cobre-molibdeno por flotación', 'Conoce principios', 'Controla supervisado', 'Controla autónomo', 'Ajusta reactivos complejos', 'Diseña protocolos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SIS-001', 'Sistemas', 'DCS ABB 800xA QB2', 'Sistema control distribuido planta QB2', 'Navega pantallas', 'Monitorea supervisado', 'Opera autónomo', 'Configura alarmas', 'Administra sistema');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SIS-002', 'Sistemas', 'SAP EAM QB2', 'Gestión de activos empresariales', 'Navega módulo', 'Crea OT supervisado', 'Gestiona OT autónomo', 'Reportes avanzados', 'Administra módulo');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-OPS-001', 'Operacional', 'Arranque Secuencial Planta', 'Procedimiento arranque planta concentradora', 'Conoce secuencia', 'Ejecuta supervisado', 'Ejecuta autónomo', 'Resuelve contingencias', 'Diseña procedimientos');

-- =============================================
-- CURSOS QB2 (7 fases - commissioning Julio 2026)
-- =============================================
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SEG-001', 'Inducción HSE QB2 + Aclimatación Altura', 'Todos los roles', 20, 1, 4, 'Aula + Campo + Médico', 'HSE Corporativo Teck', '2026-01-12', '2026-01-15', 'Campamento QB2', 1200, NULL, 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SEG-002', 'Primeros Auxilios en Altitud + RCP', 'Todos los roles', 15, 1, 2, 'Curso Certificado', 'ACHS + Médico Altitud', '2026-01-18', '2026-01-19', 'Campamento QB2', 3000, 'QB2-SEG-001', 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SEG-003', 'Trabajo Altura / Espacios Confinados', 'Operadores campo + Mantenimiento', 12, 1, 3, 'Certificación Práctica', 'ACHS Certificado', '2026-01-21', '2026-01-23', 'Torre Entrenamiento', 3500, 'QB2-SEG-001', 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-TEC-001', 'Fundamentos Concentración Cu-Mo', 'Todos los operadores', 15, 1, 5, 'Aula + Visita Planta', 'Metalurgista Senior QB2', '2026-02-02', '2026-02-06', 'Sala Capacitación QB2', 0, 'QB2-SEG-001', 2);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-TEC-002', 'Chancado Primario Giratorio (OEM)', 'Operadores Chancado', 8, 1, 4, 'Aula + Equipo', 'FLSmidth Chile', '2026-02-10', '2026-02-13', 'Planta Chancado', 18000, 'QB2-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-TEC-003', 'Operación Molino SAG 40ft (OEM)', 'JT + Operadores Molienda', 10, 1, 5, 'Aula + Manual OEM', 'Metso Outotec Chile', '2026-02-17', '2026-02-21', 'Sala Capacitación QB2', 22000, 'QB2-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-TEC-004', 'Flotación Selectiva Cu-Mo', 'JT + Operadores Flotación', 8, 1, 4, 'Aula + Laboratorio', 'Outotec + Metalurgista', '2026-02-24', '2026-02-27', 'Planta Flotación', 12000, 'QB2-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SIS-001', 'DCS ABB 800xA Certificación', 'Todos los operadores', 15, 2, 5, 'Simulador + Laboratorio DCS', 'ABB Chile', '2026-03-10', '2026-03-28', 'Centro ABB Santiago', 55000, 'QB2-TEC-001', 4);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SIS-002', 'SAP EAM Gestión Activos', 'Planificadores + Supervisores', 10, 1, 3, 'Aula + Sistema SAP', 'Consultor SAP', '2026-04-01', '2026-04-03', 'Sala TI QB2', 6000, NULL, 4);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SOP-001', 'SOPs Molienda y Clasificación QB2', 'Operadores Molienda', 10, 1, 5, 'Aula + Simulador', 'Ing. Proceso + JT', '2026-04-14', '2026-04-18', 'Sala DCS QB2', 0, 'QB2-SIS-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SOP-002', 'SOPs Flotación y Remolienda QB2', 'Operadores Flotación', 8, 1, 5, 'Aula + Simulador', 'Metalurgista + JT', '2026-04-21', '2026-04-25', 'Sala DCS QB2', 0, 'QB2-SIS-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-SOP-003', 'Emergencias Operacionales QB2', 'Todos los operadores', 15, 1, 4, 'Simulador + Drill Campo', 'Ing. Proceso + HSE', '2026-04-28', '2026-05-01', 'Planta + Cancha', 0, 'QB2-SOP-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-OJT-001', 'OJT Supervisado Operaciones QB2', 'Todos los operadores', 10, 1, 30, 'OJT + Mentoring', 'JT + Supervisores', '2026-05-12', '2026-06-19', 'Planta Concentradora QB2', 0, 'QB2-SOP-001', 6);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('QB2-EVAL-001', 'Evaluación Final Competencias QB2', 'Todos los operadores', 15, 1, 5, 'Eval. Práctica + Oral', 'Comité: Dir. Planta + HSE + RRHH', '2026-06-23', '2026-06-27', 'QB2 Planta + Sala', 0, 'Todas las fases', 7);

-- =============================================
-- REGLAS COMPLIANCE QB2
-- =============================================
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART22', 'Jornada semanal no debe exceder 45 horas ordinarias', 'Laboral', 'Código del Trabajo Art. 22', 4, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART38', 'Turnos excepcionales aprobados por Dirección del Trabajo', 'Laboral', 'Código del Trabajo Art. 38', 5, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART67', 'Feriado anual mínimo 15 días hábiles', 'Laboral', 'Código del Trabajo Art. 67', 3, 3);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS132-FAT', 'Factor relevo entre 1.15 y 1.28 para operaciones 24/7', 'Seguridad Minera', 'DS 132 Cap. 6 - Fatiga', 4, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS132-CAP', 'Personal minero debe completar inducción seguridad', 'Seguridad Minera', 'DS 132 - Capacitación', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS594-ALT', 'Aclimatación obligatoria sobre 3,000 msnm', 'Salud Ocupacional', 'DS 594 MINSAL + Protocolo Altura', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('STAFF-SUP', 'Ratio supervisor:trabajador entre 1:8 y 1:12', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('STAFF-PLAN', 'Ratio planificador:técnico entre 1:15 y 1:20', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('COMP-CERT', 'Roles con competencias y certificaciones definidas', 'Competencias', 'ISO 55001', 4, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('TRAIN-REG', 'Capacitación regulatoria completada antes de operar', 'Capacitación', 'DS 132', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('FIN-BURDEN', 'Factor carga laboral entre 1.40 y 1.70', 'Financiero', 'model-opex-budget.md', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('ERP-DRILL', 'Simulacros emergencia cada 6 meses mínimo', 'Emergencia', 'DS 132 + NFPA', 4, 4);

-- Log
INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'IMPORT', 'Base de datos importada: Quebrada Blanca Fase 2 (QB2) - Teck Resources - 140,000 tpd Cu-Mo');
