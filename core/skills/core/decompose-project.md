# Skill: Descomponer Proyecto en Sub-tareas (GTD)

## Proposito
Tomar un proyecto identificado y descomponerlo en actividades accionables con responsables, contextos y una proxima accion clara.

## Proceso de Descomposicion

### 1. Definir el Resultado
- ¿Cual es el resultado exitoso de este proyecto?
- Escribirlo en 1 frase concreta y medible.
- Ejemplo: "Plan de dotacion de 50 personas aprobado por gerencia para el proyecto ACME"

### 2. Brainstorm de Actividades
- Listar TODAS las actividades necesarias para llegar al resultado.
- No censurar ni ordenar todavia.
- Incluir: investigacion, coordinacion, ejecucion, revision, aprobacion.

### 3. Organizar en Secuencia
- Agrupar actividades relacionadas.
- Ordenar por dependencias (que va primero).
- Identificar actividades que pueden ser paralelas.

### 4. Asignar Campos GTD a Cada Actividad
Para cada sub-tarea:
- **texto**: Descripcion clara y accionable (verbo + objeto + contexto)
  - MAL: "Presupuesto"
  - BIEN: "Calcular presupuesto OPEX mensual para dotacion del proyecto ACME"
- **assigned_to**: Persona del equipo mas adecuada segun expertise
- **contexto**: Donde se ejecuta (@computador, @email, @reunion, etc.)
- **energia**: Nivel requerido (baja, media, alta)
- **estimated_time**: Tiempo realista
- **priority**: alta/media/baja
- **es_proxima_accion**: SOLO UNA debe ser true (la primera en ejecutarse)

### 5. Validacion
- ¿Cada sub-tarea es una accion fisica concreta?
- ¿Hay exactamente UNA proxima accion?
- ¿Todos los responsables tienen las competencias?
- ¿Los tiempos son realistas?
- ¿Hay entre 3 y 8 sub-tareas? (si hay mas, agrupar)

## Plantilla de Output
```json
{
    "project_name": "Nombre corto",
    "objetivo": "Resultado medible esperado",
    "sub_tasks": [
        {
            "texto": "Accion concreta con verbo",
            "assigned_to": "username",
            "contexto": "@contexto",
            "energia": "media",
            "estimated_time": "2 horas",
            "priority": "alta",
            "es_proxima_accion": true
        }
    ]
}
```

## Criterios de Calidad
- Maximo 8 sub-tareas por proyecto (sino, subdividir en sub-proyectos)
- Cada sub-tarea completable en maximo 4 horas
- Nombres de sub-tareas empiezan con verbo de accion
- Sin sub-tareas vagas como "revisar" o "ver" — siempre especificar QUE
