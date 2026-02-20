# 🦅 Value Strategy Consulting Hub
### Plataforma Integral de Gestión de Conocimiento y Orquestación de IA

---

**Versión:** 2.2.0 (Stable) | **Build:** 2026.02
**Documentación Técnica y Operativa**

---

## 📑 Tabla de Contenidos

1. [Introducción Ejecutiva](#1-introducción-ejecutiva)
2. [Arquitectura del Ecosistema](#2-arquitectura-del-ecosistema)
3. [Requisitos del Sistema](#3-requisitos-del-sistema)
4. [Guía de Despliegue](#4-guía-de-despliegue)
5. [Manual de Operaciones](#5-manual-de-operaciones)
    - [5.1 Gestión de Proyectos](#51-gestión-de-proyectos)
    - [5.2 Biblioteca de Conocimiento (Second Brain)](#52-biblioteca-de-conocimiento-second-brain)
    - [5.3 Agentes de IA](#53-agentes-de-ia)
6. [Solución de Problemas y FAQ](#6-solución-de-problemas-y-faq)

---

## 1. Introducción Ejecutiva

El **Value Strategy Consulting Hub** (internamente "Second Brain") es una solución empresarial diseñada para centralizar la inteligencia operativa de la organización. Su propósito es reducir la carga cognitiva mediante la integración de:

*   **Gestión de Conocimiento Activa**: Transformación de documentos estáticos en interfaces dinámicas.
*   **Orquestación de Agentes**: Automatización de tareas de investigación y análisis.
*   **Visibilidad de Proyectos**: Seguimiento de iniciativas estratégicas en tiempo real.

---

## 2. Arquitectura del Ecosistema

La plataforma opera bajo una arquitectura de micro-servicios modulares:

| Módulo | Puerto | Descripción Técnica | Tecnología |
| :--- | :--- | :--- | :--- |
| **Dashboard (Hub)** | `3000` | Interfaz principal, gestión de archivos y chat RAG. | Node.js / Express / EJS |
| **Orchestrator** | `3001` | Motor de ejecución para agentes autónomos complejos. | Next.js / TypeScript |
| **Lililia** | `3002` | Módulo experimental de visualización de datos. | React / Vite |
| **Core / Memory** | N/A | Base de datos vectorial y relacional compartida. | SQLite / JSON |

---

## 3. Requisitos del Sistema

Para garantizar el funcionamiento óptimo del entorno local:

*   **Runtime**: [Node.js](https://nodejs.org/) v18.17.0 o superior (LTS recomendado).
*   **Control de Versiones**: Git 2.40+.
*   **Navegador**: Chrome, Edge o Brave (Soporte nativo para Web Speech API).
*   **Conectividad**: Acceso a internet para la API de Google Gemini (GenAI).

---

## 4. Guía de Despliegue

### 4.1 Instalación de Dependencias

Ejecute los siguientes comandos en su terminal para inicializar los módulos. Es necesario realizar esto solo en la primera ejecución.

```powershell
# Instalación del Núcleo (Dashboard)
cd apps/dashboard
npm install

# Instalación de Módulos Satélite (Opcional)
cd ../orchestrator
npm install
cd ../lililia
npm install
```

### 4.2 Inicialización del Servidor

Para iniciar el ecosistema completo, utilice el script de automatización ubicado en la carpeta `scripts`.

1.  Navegue al directorio raíz del proyecto.
2.  Ejecute el archivo **`scripts/start-all.bat`**.

> **Nota Técnica:** El script abrirá terminales independientes para cada servicio. No cierre estas ventanas mientras opera la plataforma.

---

## 5. Manual de Operaciones

### 5.1 Gestión de Proyectos

El módulo de proyectos permite un seguimiento granular del ciclo de vida de las iniciativas.

**Estados del Ciclo de Vida:**
*   🟢 **Activo**: Proyecto en ejecución regular.
*   🟣 **En Revisión**: Fase de control de calidad o aprobación.
*   🔵 **En Desarrollo**: Fase de ingeniería o construcción activa.
*   🔴 **Cancelado**: Iniciativa detenida indefinidamente.
*   ✅ **Completado**: Proyecto finalizado y archivado.

### 5.2 Biblioteca de Conocimiento (Second Brain)

El sistema implementa una arquitectura híbrida para la gestión documental:

1.  **Ingesta de Documentos**:
    *   Formatos soportados: Markdown (`.md`), PDF (`.pdf`), Texto Plano (`.txt`).
    *   Método: Drag & Drop en el panel "Subir Archivo".

2.  **Protocolos Dinámicos (Dynamic Linking)**:
    *   El sistema detecta automáticamente la correlación entre un documento PDF (ej. *Estrategia GitHub*) y su contraparte HTML interactiva en `knowledge/dinamicas`.
    *   Al abrir el archivo, el usuario es redirigido a la experiencia web optimizada en lugar del visor estático.

3.  **Búsqueda Semántica**:
    *   Utilice la barra de herramientas para filtrar activos por metadatos o contenido.

### 5.3 Agentes de IA

El Hub integra modelos de lenguaje avanzados (LLMs) para asistir en tiempo real.

*   **Chat Asistente**: Acceso contextual a la información del proyecto.
*   **Deep Research Agent**: Agente autónomo capaz de realizar búsquedas recursivas en la web para sintetizar temas complejos.
*   **Voice Notes Interface**:
    *   Dictado de notas con transcripción en tiempo real.
    *   Almacenamiento dual: Texto en base de datos y Audio (`.webm`) en el sistema de archivos.

---

## 6. Solución de Problemas y FAQ

### Diagnóstico de Errores Comunes

| Síntoma | Causa Probable | Solución |
| :--- | :--- | :--- |
| **Error de Conexión (Port 3000)** | El proceso de Node.js no se inició o el puerto está ocupado. | Cierre todas las instancias de Node.js y reinicie `start-all.bat`. |
| **PDF no carga versión dinámica** | Ruta de carpeta incorrecta en `server.js` o nombre de archivo no coincide. | Verifique que la carpeta exista en `knowledge/dinamicas` y coincida parcialmente con el nombre del PDF. |
| **IA no responde** | Fallo en la API Key o desconexión de red. | Revise los logs en la terminal del Dashboard para errores de API. |

---

**© 2026 Value Strategy Consulting.**
*Confidential & Proprietary. Authorized use only.*
