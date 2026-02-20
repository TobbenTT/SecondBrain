-- =============================================
-- PROYECTO: Planta de Litio Salar de Atacama
-- EMPRESA: SQM Lithium
-- TIPO: Planta de Carbonato de Litio
-- UBICACIÓN: Región de Antofagasta, Chile
-- CAPACIDAD: 180,000 ton/año LCE
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
-- DEPARTAMENTOS LITIO
-- =============================================
INSERT INTO departamentos (nombre, descripcion) VALUES ('Gerencia de Planta', 'Dirección general de la planta de carbonato de litio');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Cosecha Salmuera', 'Extracción y cosecha de salmuera desde pozas de evaporación');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Planta Química', 'Proceso de carbonatación, purificación y cristalización');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Secado y Envasado', 'Secado, micronizado, envasado y despacho de producto');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Laboratorio Control Calidad', 'Análisis químico de salmuera y producto terminado');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Mantenimiento', 'Mantenimiento mecánico, eléctrico e instrumentación');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Medio Ambiente y Sustentabilidad', 'Monitoreo ambiental, manejo de residuos y relaciones comunitarias');
INSERT INTO departamentos (nombre, descripcion) VALUES ('Seguridad y Salud Ocupacional', 'Prevención de riesgos, salud ocupacional y emergencias');

-- =============================================
-- ROLES LITIO
-- =============================================
-- Gerencia
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Gerente de Planta Litio', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Químico', '15+ años', 7000000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Subgerente Operaciones', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Procesos', '12+ años', 5200000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Ingeniero de Procesos Senior', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Civil Químico', '7+ años', 3800000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (1, 'Coordinador Producción', 'Profesional', 'Día', 1, 'Avanzado', 'Ing. Industrial', '5+ años', 2800000, NULL);

-- Cosecha Salmuera
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Supervisor Cosecha', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Química', '7+ años', 3100000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Operador Bombeo Salmuera', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico Nivel Medio', '2+ años', 1300000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Operador Pozas Evaporación', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico Nivel Medio', '2+ años', 1250000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (2, 'Muestrero Campo', 'Staff', 'Turno Rotativo', 2, 'Básico', 'Técnico Nivel Medio', '1+ año', 1100000, NULL);

-- Planta Química
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Jefe de Turno Planta Química', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución Química', '8+ años', 3500000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Sala Control Química', 'Staff', 'Turno Rotativo', 2, 'Competente', 'TNS Automatización', '3+ años', 1800000, 'DCS Honeywell');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Carbonatación', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Química', '2+ años', 1500000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Purificación', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Química', '2+ años', 1500000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Cristalización', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico NMS Química', '2+ años', 1550000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Operador Reactivos Químicos', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Químico', '3+ años', 1450000, 'Manejo Sust. Peligrosas');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (3, 'Químico de Proceso', 'Profesional', 'Día', 2, 'Avanzado', 'Químico / Ing. Químico', '5+ años', 3200000, NULL);

-- Secado y Envasado
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Supervisor Secado y Despacho', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución', '5+ años', 2900000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Secador Rotatorio', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Nivel Medio', '2+ años', 1350000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Micronizado', 'Staff', 'Turno Rotativo', 1, 'Competente', 'Técnico Nivel Medio', '2+ años', 1300000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (4, 'Operador Envasado y Despacho', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Enseñanza Media', '1+ año', 1150000, 'Grúa Horquilla');

-- Laboratorio
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Jefe Laboratorio', 'Supervisión', 'Día', 1, 'Experto', 'Químico', '10+ años', 3500000, 'ISO 17025');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Analista Químico ICP/AA', 'Staff', 'Turno Rotativo', 2, 'Competente', 'TNS Química Analítica', '2+ años', 1600000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Analista Físico (XRD/PSA)', 'Staff', 'Día', 1, 'Competente', 'TNS Química/Física', '2+ años', 1550000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (5, 'Muestrero Laboratorio', 'Staff', 'Turno Rotativo', 2, 'Básico', 'Técnico Nivel Medio', '1+ año', 1150000, NULL);

-- Mantenimiento
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Jefe Mantenimiento', 'Gestión', 'Día', 1, 'Experto', 'Ing. Civil Mecánico', '12+ años', 4800000, 'CMRP');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Supervisor Mantenimiento', 'Supervisión', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Ejecución', '8+ años', 3100000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Planificador Mantenimiento', 'Profesional', 'Día', 2, 'Avanzado', 'Ing. Ejecución', '5+ años', 2700000, 'SAP-PM');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Mecánico Industrial', 'Staff', 'Turno Rotativo', 4, 'Competente', 'Técnico NMS Mecánica', '3+ años', 1650000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Electricista', 'Staff', 'Turno Rotativo', 3, 'Competente', 'Técnico NMS Electricidad', '3+ años', 1700000, 'SEC Clase B');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Instrumentista', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico NMS Instrumentación', '3+ años', 1800000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (6, 'Técnico Corrosión', 'Profesional', 'Día', 1, 'Avanzado', 'Técnico NMS + Certificación', '5+ años', 2200000, 'NACE CIP Level 1');

-- Medio Ambiente
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Jefe Medio Ambiente', 'Gestión', 'Día', 1, 'Experto', 'Ing. Ambiental', '10+ años', 4200000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Monitor Ambiental', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Ambiental', '2+ años', 1400000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Especialista Relaciones Comunitarias', 'Profesional', 'Día', 1, 'Avanzado', 'Trabajo Social / Sociología', '5+ años', 2600000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (7, 'Operador Planta Aguas', 'Staff', 'Turno Rotativo', 2, 'Competente', 'Técnico Medio', '2+ años', 1300000, NULL);

-- Seguridad
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Jefe Seguridad y Salud', 'Gestión', 'Día', 1, 'Experto', 'Ing. Prevención de Riesgos', '10+ años', 4000000, NULL);
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Prevencionista Terreno', 'Staff', 'Turno Rotativo', 1, 'Avanzado', 'Ing. Prevención Riesgos', '5+ años', 2400000, 'DS 132');
INSERT INTO roles (departamento_id, titulo, categoria, turno_tipo, headcount_por_turno, nivel_competencia, educacion_minima, experiencia_minima, salario_base_mensual, certificaciones) VALUES (8, 'Paramédico TENS', 'Staff', 'Turno Rotativo', 1, 'Competente', 'TENS Certificado', '3+ años', 1500000, 'ACLS');

-- =============================================
-- DOTACIÓN LITIO
-- =============================================
INSERT INTO dotacion (role_id, patron_turno_id, personas_por_turno, numero_equipos, factor_relevo, headcount_total, fecha_inicio_estimada) SELECT r.id, CASE WHEN r.turno_tipo = 'Día' THEN 4 ELSE 1 END, r.headcount_por_turno, CASE WHEN r.turno_tipo = 'Día' THEN 1 ELSE 4 END, CASE WHEN r.turno_tipo = 'Día' THEN 1.0 ELSE 1.22 END, CASE WHEN r.turno_tipo = 'Día' THEN r.headcount_por_turno ELSE CAST(r.headcount_por_turno * 4 * 1.22 + 0.5 AS INTEGER) END, '2026-09-01' FROM roles r;

-- =============================================
-- COMPETENCIAS LITIO
-- =============================================
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-001', 'Seguridad', 'Inducción HSE Salar', 'Seguridad en ambiente desértico de salar', 'Conoce reglas de oro', 'Aplica con supervisión', 'Aplica autónomamente', 'Lidera safety talks', 'Diseña procedimientos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-002', 'Seguridad', 'Manejo Sustancias Peligrosas', 'Manejo seguro de reactivos químicos (Na2CO3, HCl, NaOH)', 'Conoce pictogramas SGA', 'Maneja con supervisión', 'Maneja autónomamente', 'Supervisa manejo', 'Diseña protocolos');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SEG-003', 'Seguridad', 'Deshidratación y Calor Extremo', 'Prevención de riesgos por calor en ambiente desértico', 'Conoce síntomas', 'Aplica medidas básicas', 'Gestiona protocolos', 'Supervisa condiciones', 'Diseña protocolos calor');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-001', 'Técnica', 'Proceso Carbonato de Litio', 'Evaporación solar, carbonatación y purificación Li2CO3', 'Conoce etapas generales', 'Describe variables', 'Opera con dominio técnico', 'Optimiza rendimiento', 'Diseña mejoras proceso');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-002', 'Técnica', 'Manejo de Salmueras', 'Bombeo, monitoreo y balance de salmueras en pozas', 'Identifica equipos', 'Opera con supervisión', 'Opera autónomamente', 'Optimiza evaporación', 'Diseña sistema pozas');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-003', 'Técnica', 'Carbonatación Li2CO3', 'Reacción de carbonatación y precipitación de litio', 'Conoce reacción', 'Controla con supervisión', 'Controla autónomamente', 'Ajusta parámetros complejos', 'Diseña reactor');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-TEC-004', 'Técnica', 'Purificación y Cristalización', 'Purificación de Li2CO3 a battery-grade', 'Conoce especificaciones', 'Opera con supervisión', 'Opera autónomamente', 'Optimiza pureza', 'Diseña procesos purificación');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-SIS-001', 'Sistemas', 'DCS Honeywell Experion', 'Sistema de control distribuido planta química', 'Navega pantallas', 'Monitorea supervisado', 'Opera autónomamente', 'Configura alarmas', 'Administra sistema');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-QC-001', 'Calidad', 'Control Calidad Li2CO3', 'Análisis ICP/AA, XRD, humedad, granulometría', 'Conoce especificaciones', 'Analiza con supervisión', 'Analiza autónomamente', 'Interpreta tendencias', 'Diseña plan QC');
INSERT INTO competencias (comp_id, categoria, nombre, descripcion, nivel_1, nivel_2, nivel_3, nivel_4, nivel_5) VALUES ('COMP-AMB-001', 'Ambiental', 'Monitoreo Ambiental Salar', 'Monitoreo aguas, suelos, flora y fauna del salar', 'Conoce parámetros', 'Muestrea con supervisión', 'Muestrea e interpreta', 'Genera reportes', 'Diseña plan monitoreo');

-- =============================================
-- CURSOS LITIO (7 fases - commissioning Oct 2026)
-- =============================================
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SEG-001', 'Inducción HSE Salar de Atacama', 'Todos los roles', 20, 1, 3, 'Aula + Campo', 'HSE Corporativo SQM', '2026-04-06', '2026-04-08', 'Campamento Salar', 1000, NULL, 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SEG-002', 'Manejo Sustancias Peligrosas', 'Operadores Planta Química + Mantenimiento', 15, 1, 2, 'Curso Certificado', 'ACHS + HSE', '2026-04-09', '2026-04-10', 'Sala Capacitación', 2500, 'LI-SEG-001', 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SEG-003', 'Prevención Riesgos Calor y Deshidratación', 'Todos los roles', 20, 1, 1, 'Teórico + Práctico', 'Médico Ocupacional', '2026-04-11', '2026-04-11', 'Campamento', 800, 'LI-SEG-001', 1);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-TEC-001', 'Fundamentos Producción Li2CO3', 'Todos los operadores', 15, 1, 5, 'Aula + Visita Planta Piloto', 'Ing. Proceso Senior SQM', '2026-04-20', '2026-04-24', 'Sala Capacitación', 0, 'LI-SEG-001', 2);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-TEC-002', 'Manejo Pozas y Salmueras', 'Operadores Cosecha', 8, 1, 4, 'Aula + Campo', 'Supervisor Senior + Ing. Proceso', '2026-04-27', '2026-04-30', 'Pozas Evaporación', 0, 'LI-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-TEC-003', 'Operación Reactor Carbonatación', 'JT + Operadores Planta Química', 10, 1, 4, 'Aula + Equipo', 'Proveedor Reactor + Ing. Proceso', '2026-05-04', '2026-05-07', 'Planta Química', 15000, 'LI-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-TEC-004', 'Purificación y Cristalización Battery-Grade', 'Operadores Purificación + Cristalización', 6, 1, 4, 'Aula + Lab + Equipo', 'Químico Senior + Proveedor', '2026-05-11', '2026-05-14', 'Planta Química', 10000, 'LI-TEC-001', 3);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SIS-001', 'DCS Honeywell Experion Certificación', 'Todos los operadores', 12, 2, 4, 'Simulador + Lab DCS', 'Honeywell Chile', '2026-05-25', '2026-06-10', 'Centro Honeywell Santiago', 48000, 'LI-TEC-001', 4);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-QC-001', 'Control Calidad Li2CO3 (ICP, XRD, PSA)', 'Analistas Laboratorio', 6, 1, 5, 'Laboratorio + Equipos', 'Jefe Lab + Proveedor Equipos', '2026-06-15', '2026-06-19', 'Laboratorio Planta', 8000, NULL, 4);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SOP-001', 'SOPs Planta Química Li2CO3', 'Todos operadores Planta Química', 12, 1, 5, 'Aula + Simulador DCS', 'Ing. Proceso + JT', '2026-07-01', '2026-07-05', 'Sala DCS', 0, 'LI-SIS-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SOP-002', 'SOPs Secado, Micronizado y Envasado', 'Operadores Secado', 8, 1, 3, 'Aula + Equipo', 'Supervisor + Proveedor', '2026-07-07', '2026-07-09', 'Planta Secado', 0, 'LI-SOP-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-SOP-003', 'Emergencias Químicas y Derrames', 'Todos los operadores', 15, 1, 3, 'Simulacro + Drill', 'HSE + Bomberos Industriales', '2026-07-14', '2026-07-16', 'Planta + Cancha Emergencia', 2000, 'LI-SOP-001', 5);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-OJT-001', 'OJT Supervisado Planta Li2CO3', 'Todos los operadores', 10, 1, 30, 'OJT + Mentoring', 'JT + Supervisores Senior', '2026-07-27', '2026-09-04', 'Planta Litio SQM', 0, 'LI-SOP-001', 6);
INSERT INTO cursos_capacitacion (curso_id, nombre, audiencia, asistentes_sesion, num_sesiones, duracion_dias, metodo, proveedor, fecha_inicio, fecha_fin, ubicacion, costo_estimado, prerequisitos, fase) VALUES ('LI-EVAL-001', 'Evaluación Final Competencias Litio', 'Todos los operadores', 15, 1, 5, 'Eval. Práctica + Oral', 'Comité: Gerente + HSE + RRHH', '2026-09-08', '2026-09-12', 'Planta + Sala', 0, 'Todas las fases', 7);

-- =============================================
-- REGLAS COMPLIANCE LITIO
-- =============================================
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART22', 'Jornada semanal no debe exceder 45 horas ordinarias', 'Laboral', 'Código del Trabajo Art. 22', 4, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART38', 'Turnos excepcionales aprobados por Dirección del Trabajo', 'Laboral', 'Código del Trabajo Art. 38', 5, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('CT-ART67', 'Feriado anual mínimo 15 días hábiles', 'Laboral', 'Código del Trabajo Art. 67', 3, 3);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS132-FAT', 'Factor relevo entre 1.15 y 1.28 para operaciones 24/7', 'Seguridad Minera', 'DS 132 Cap. 6 - Fatiga', 4, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS132-CAP', 'Personal minero debe completar inducción antes de operar', 'Seguridad Minera', 'DS 132 - Capacitación', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('DS594-QUIM', 'Manejo sustancias peligrosas según DS 594 y SGA', 'Salud Ocupacional', 'DS 594 MINSAL + Reglamento SGA', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('STAFF-SUP', 'Ratio supervisor:trabajador entre 1:8 y 1:12', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('STAFF-PLAN', 'Ratio planificador:técnico entre 1:15 y 1:20', 'Organizacional', 'Best Practice SMRP 5.2', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('COMP-CERT', 'Roles con competencias y certificaciones definidas', 'Competencias', 'ISO 55001', 4, 4);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('TRAIN-REG', 'Capacitación regulatoria completada antes de operar', 'Capacitación', 'DS 132', 5, 5);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('FIN-BURDEN', 'Factor carga laboral entre 1.40 y 1.70', 'Financiero', 'model-opex-budget.md', 3, 2);
INSERT INTO reglas_compliance (codigo, descripcion, dominio, fuente_regulacion, severidad_1_5, probabilidad_deteccion_1_5) VALUES ('RCA-IMPACT', 'Cumplimiento Resolución Calificación Ambiental RCA', 'Ambiental', 'Ley 19.300 + RCA proyecto', 5, 5);

-- Log
INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'IMPORT', 'Base de datos importada: Planta Litio Salar de Atacama - SQM - 180,000 ton/año Li2CO3');
