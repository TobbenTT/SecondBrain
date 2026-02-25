-- Esquema para la automatización de análisis de reuniones

CREATE TABLE IF NOT EXISTS reuniones_analisis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    titulo TEXT NOT NULL,
    transcripcion_raw TEXT, -- Almacenamiento local (opcional en BD según config)
    asistentes JSONB DEFAULT '[]', -- Lista de personas presentes
    acuerdos JSONB DEFAULT '[]',   -- Decisiones tomadas (diferente de tareas/compromisos)
    puntos_clave JSONB DEFAULT '[]',
    compromisos JSONB DEFAULT '[]', -- Estructura: [{"tarea": string, "quien": string, "cuando": string, "status": string}]
    entregables JSONB DEFAULT '[]',
    proxima_reunion DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda rápida por fecha y título
CREATE INDEX idx_reuniones_fecha ON reuniones_analisis(fecha);
CREATE INDEX idx_reuniones_titulo ON reuniones_analisis(titulo);
