"""
Agente BUILDER — Pipeline Software (Build & Validation)

Toma ideas con execution_status='developed',
escribe los archivos a disco en projects/{id}/,
crea un venv, instala dependencias, valida sintaxis,
e intenta ejecutar el proyecto.

Si todo OK: execution_status='built' (para QA)
Si falla:   execution_status='queued_software' (vuelve a DEV con feedback de error)
"""
import os
import re
import sys
import shutil
import subprocess
import time
from pathlib import Path

from compartido import log, logger, enviar_whatsapp
from db.connection import get_connection
from db import queries

NOMBRE = "BUILDER"
PROJECTS_DIR = Path(__file__).parent.parent / "projects"
STARTUP_TIMEOUT = 15        # seconds to wait for process startup
INSTALL_TIMEOUT = 120       # seconds for pip install
COMPILE_TIMEOUT = 30        # seconds for syntax check
PORT_BASE = 5100            # actual port = PORT_BASE + (idea_id % 1000)
MAX_BUILD_FAILURES = 3      # after this many, block the idea


# ── File Extraction ─────────────────────────────────────────────────────────

def _extraer_archivos(execution_output):
    """Parse execution_output into list of (filename, content) tuples.

    Handles three formats:
    1. Markdown: **Archivo: name.py**\\n```python\\n...\\n```
    2. Raw: === FILE: name.py === ... === ENDFILE ===
    3. Single code block → defaults to main.py
    """
    archivos = []

    # Format 1: Markdown from DEV's _extraer_codigo
    patron_md = r'\*\*Archivo:\s*(.*?)\*\*\s*\n```(?:python)?\s*\n(.*?)```'
    matches = re.findall(patron_md, execution_output, re.DOTALL)
    if matches:
        for nombre, contenido in matches:
            archivos.append((nombre.strip(), contenido.strip()))
        return archivos

    # Format 2: Raw FILE/ENDFILE pattern
    patron_raw = r'===\s*FILE:\s*(.*?)\s*===(.*?)===\s*ENDFILE\s*==='
    matches = re.findall(patron_raw, execution_output, re.DOTALL | re.IGNORECASE)
    if matches:
        for nombre, contenido in matches:
            archivos.append((nombre.strip(), contenido.strip()))
        return archivos

    # Format 3: Single code block → assume main.py
    bloques = re.findall(r'```(?:python)?\s*\n(.*?)```', execution_output, re.DOTALL)
    if bloques:
        archivos.append(("main.py", bloques[0].strip()))
        return archivos

    return []


def _safe_filename(name):
    """Sanitize filename to prevent path traversal."""
    name = name.replace('\\', '/')
    # Allow one level of subdirectory (e.g. templates/index.html)
    parts = name.split('/')
    safe_parts = []
    for part in parts:
        part = part.strip()
        if not part or part == '..' or part.startswith('.'):
            continue
        part = re.sub(r'[^\w.\-]', '_', part)
        if part:
            safe_parts.append(part)
    return '/'.join(safe_parts) if safe_parts else None


# ── File Writing ────────────────────────────────────────────────────────────

# Common third-party packages for auto-generating requirements.txt
KNOWN_THIRD_PARTY = {
    'flask': 'flask', 'fastapi': 'fastapi', 'uvicorn': 'uvicorn',
    'requests': 'requests', 'pandas': 'pandas', 'numpy': 'numpy',
    'sqlalchemy': 'sqlalchemy', 'pydantic': 'pydantic',
    'click': 'click', 'rich': 'rich', 'httpx': 'httpx',
    'aiohttp': 'aiohttp', 'pytest': 'pytest', 'redis': 'redis',
    'celery': 'celery', 'boto3': 'boto3', 'pillow': 'Pillow',
    'PIL': 'Pillow', 'sklearn': 'scikit-learn', 'cv2': 'opencv-python',
    'dotenv': 'python-dotenv', 'yaml': 'pyyaml', 'bs4': 'beautifulsoup4',
    'jinja2': 'jinja2', 'jwt': 'pyjwt', 'cryptography': 'cryptography',
    'matplotlib': 'matplotlib', 'seaborn': 'seaborn', 'scipy': 'scipy',
    'django': 'django', 'tornado': 'tornado', 'gunicorn': 'gunicorn',
    'streamlit': 'streamlit',
}


def _generar_requirements(project_dir, archivos):
    """Scan imports in .py files and generate a basic requirements.txt."""
    imports = set()
    for nombre, contenido in archivos:
        if nombre.endswith('.py'):
            for line in contenido.split('\n'):
                line = line.strip()
                mod = None
                if line.startswith('import '):
                    mod = line.split()[1].split('.')[0]
                elif line.startswith('from ') and ' import ' in line:
                    mod = line.split()[1].split('.')[0]
                if mod and mod in KNOWN_THIRD_PARTY:
                    imports.add(KNOWN_THIRD_PARTY[mod])

    if imports:
        req_path = project_dir / 'requirements.txt'
        req_path.write_text('\n'.join(sorted(imports)) + '\n', encoding='utf-8')


def _escribir_proyecto(idea_id, archivos):
    """Write extracted files to projects/{idea_id}/ directory.

    Returns:
        (project_dir, None) on success, (None, error_msg) on failure.
    """
    project_dir = PROJECTS_DIR / str(idea_id)

    # Clean previous attempt
    if project_dir.exists():
        shutil.rmtree(project_dir)

    project_dir.mkdir(parents=True, exist_ok=True)

    written = []
    for nombre, contenido in archivos:
        safe_name = _safe_filename(nombre)
        if not safe_name:
            continue
        filepath = project_dir / safe_name
        # Create subdirectories if needed (e.g. templates/index.html)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(contenido, encoding='utf-8')
        written.append(safe_name)

    if not written:
        shutil.rmtree(project_dir)
        return None, "No se pudieron escribir archivos (nombres invalidos)"

    # Auto-generate requirements.txt if not provided
    if not any(n.endswith('requirements.txt') for n in written):
        _generar_requirements(project_dir, archivos)

    return project_dir, None


# ── Build & Validation ──────────────────────────────────────────────────────

def _crear_venv(project_dir):
    """Create a venv inside the project directory.

    Returns:
        ((python_path, pip_path), None) on success, (None, error_msg) on failure.
    """
    venv_dir = project_dir / 'venv'
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'venv', str(venv_dir)],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            return None, f"venv creation failed: {result.stderr}"
    except subprocess.TimeoutExpired:
        return None, "venv creation timed out (60s)"

    # Resolve paths (cross-platform)
    if os.name == 'nt':
        python_path = str(venv_dir / 'Scripts' / 'python.exe')
        pip_path = str(venv_dir / 'Scripts' / 'pip.exe')
    else:
        python_path = str(venv_dir / 'bin' / 'python')
        pip_path = str(venv_dir / 'bin' / 'pip')

    if not Path(python_path).exists():
        return None, f"venv python not found at {python_path}"

    return (python_path, pip_path), None


def _instalar_dependencias(pip_path, project_dir):
    """Install requirements.txt if it exists.

    Returns:
        (True, None) on success, (False, error_msg) on failure.
    """
    req_file = project_dir / 'requirements.txt'
    if not req_file.exists():
        return True, None

    content = req_file.read_text().strip()
    if not content:
        return True, None

    try:
        result = subprocess.run(
            [pip_path, 'install', '-r', str(req_file)],
            capture_output=True, text=True,
            timeout=INSTALL_TIMEOUT,
            cwd=str(project_dir)
        )
        if result.returncode != 0:
            return False, f"pip install failed:\n{result.stderr[-1000:]}"
        return True, None
    except subprocess.TimeoutExpired:
        return False, f"pip install timed out ({INSTALL_TIMEOUT}s)"


def _validar_sintaxis(python_path, project_dir):
    """Run py_compile on all .py files.

    Returns:
        (True, None) if all pass, (False, error_details) if any fail.
    """
    errores = []
    for py_file in project_dir.glob('**/*.py'):
        # Skip venv files
        if 'venv' in py_file.parts:
            continue
        try:
            result = subprocess.run(
                [python_path, '-m', 'py_compile', str(py_file)],
                capture_output=True, text=True,
                timeout=COMPILE_TIMEOUT
            )
            if result.returncode != 0:
                errores.append(f"{py_file.name}: {result.stderr.strip()}")
        except subprocess.TimeoutExpired:
            errores.append(f"{py_file.name}: compile check timed out")

    if errores:
        return False, "Syntax errors:\n" + "\n".join(errores)
    return True, None


def _detectar_entrypoint(project_dir):
    """Find the main entry point file.

    Priority: main.py > app.py > server.py > first .py file
    """
    for candidate in ['main.py', 'app.py', 'server.py']:
        if (project_dir / candidate).exists():
            return candidate
    py_files = [f.name for f in project_dir.glob('*.py') if f.name != '__init__.py']
    return py_files[0] if py_files else None


def _intentar_ejecucion(python_path, project_dir, idea_id):
    """Start the project as a subprocess and check if it runs.

    For web apps: checks if it stays running for STARTUP_TIMEOUT seconds.
    For scripts: checks if it exits with code 0.

    Returns:
        (True, info_dict) on success, (False, error_msg) on failure.
    """
    entrypoint = _detectar_entrypoint(project_dir)
    if not entrypoint:
        return False, "No Python entry point found (main.py, app.py, or server.py)"

    port = PORT_BASE + (idea_id % 1000)
    env = os.environ.copy()
    env['PORT'] = str(port)
    env['FLASK_RUN_PORT'] = str(port)

    proc = None
    try:
        proc = subprocess.Popen(
            [python_path, entrypoint],
            cwd=str(project_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env
        )

        # Wait and check if it stays alive
        time.sleep(STARTUP_TIMEOUT)

        if proc.poll() is not None:
            # Process exited
            stdout = proc.stdout.read().decode('utf-8', errors='replace')[-1000:]
            stderr = proc.stderr.read().decode('utf-8', errors='replace')[-1000:]

            if proc.returncode == 0:
                return True, {'type': 'script', 'stdout': stdout}
            else:
                return False, (
                    f"Process exited with code {proc.returncode}\n"
                    f"stderr: {stderr}\nstdout: {stdout}"
                )
        else:
            # Process is still running -> likely a web server
            info = {'type': 'webapp', 'port': port, 'pid': proc.pid}
            return True, info
    except Exception as e:
        return False, f"Failed to start: {e}"
    finally:
        # Always clean up the process
        if proc and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()


# ── Build Report ────────────────────────────────────────────────────────────

def _build_report(project_dir, archivos, run_result):
    """Generate a human-readable build report."""
    files_list = "\n".join(f"- {name}" for name, _ in archivos)
    report = f"**Archivos escritos:** {len(archivos)}\n{files_list}\n\n"
    report += f"**Directorio:** `{project_dir}`\n\n"
    report += "**venv:** OK | **pip install:** OK | **Syntax:** OK\n\n"

    if isinstance(run_result, dict):
        if run_result.get('type') == 'webapp':
            report += f"**Tipo:** Web application\n"
            report += f"**Puerto asignado:** {run_result['port']}\n"
        elif run_result.get('type') == 'script':
            report += f"**Tipo:** Script (exit code 0)\n"
            stdout = run_result.get('stdout', '')
            if stdout:
                report += f"**Output:**\n```\n{stdout[:500]}\n```\n"

    return report


# ── Project Registration ───────────────────────────────────────────────────

def _extraer_tech(project_dir):
    """Read requirements.txt and return tech as comma-separated string."""
    req = project_dir / 'requirements.txt'
    if not req.exists():
        return 'Python'
    deps = [line.strip() for line in req.read_text().splitlines() if line.strip()]
    if deps:
        return 'Python,' + ','.join(deps[:5])
    return 'Python'


def _registrar_proyecto(db, idea_id, task, project_dir, run_result):
    """Register the built project in the projects table for the dashboard."""
    name = (task['ai_summary'] or task['text'] or f'Proyecto #{idea_id}')
    if len(name) > 80:
        name = name[:77] + '...'

    description = task['text'] or ''

    url = ''
    if isinstance(run_result, dict) and run_result.get('type') == 'webapp':
        url = f"http://localhost:{run_result['port']}"

    tech = _extraer_tech(project_dir)
    area_id = task['related_area_id']

    db.execute("""
        INSERT OR REPLACE INTO projects (id, name, description, url, icon, status, tech, related_area_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, [str(idea_id), name, description, url, '🤖', 'development', tech, area_id])
    db.commit()
    log(NOMBRE, f"#{idea_id} registrado en Proyectos dashboard", "+")


# ── Main Cycle ──────────────────────────────────────────────────────────────

def ciclo():
    """Un ciclo del BUILDER: toma una tarea developed y la construye/valida.

    Returns:
        1 si proceso algo, 0 si no.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'developed')
    if not tasks:
        return 0

    task = tasks[0]
    idea_id = task['id']
    text = task['text'] or ''
    execution_output = task['execution_output'] or ''

    # Check for max build failures
    error_previo = task['execution_error'] or ''
    build_fails = error_previo.count('BUILDER RECHAZADO')
    if build_fails >= MAX_BUILD_FAILURES:
        queries.update_execution_status(
            db, idea_id, 'blocked',
            error=f"BLOQUEADO tras {build_fails} fallos de build. Requiere revision manual.",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} BLOQUEADO tras {build_fails} build failures", "X")
        return 0

    log(NOMBRE, f"#{idea_id}: {text[:60]}...", ">")

    # Step 1: Extract files
    archivos = _extraer_archivos(execution_output)
    if not archivos:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=(
                "BUILDER RECHAZADO:\n"
                "No se encontraron archivos de codigo en el output del DEV.\n"
                "Genera el codigo usando el formato:\n"
                "=== FILE: nombre.py ===\n<codigo>\n=== ENDFILE ===\n"
                "IMPORTANTE: Incluye requirements.txt y un main.py como entrypoint."
            ),
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} no files found -> back to DEV", "~")
        return 0

    # Step 2: Write files to disk
    project_dir, err = _escribir_proyecto(idea_id, archivos)
    if err:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=f"BUILDER RECHAZADO:\n{err}",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} write failed: {err}", "!")
        return 0

    log(NOMBRE, f"#{idea_id} archivos escritos en {project_dir}", "+")

    # Step 3: Create venv
    paths, err = _crear_venv(project_dir)
    if err:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=f"BUILDER RECHAZADO:\nvenv creation failed:\n{err}",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} venv failed: {err}", "!")
        return 0

    python_path, pip_path = paths
    log(NOMBRE, f"#{idea_id} venv OK", "+")

    # Step 4: Install dependencies
    ok, err = _instalar_dependencias(pip_path, project_dir)
    if not ok:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=f"BUILDER RECHAZADO:\n{err}\n\nCorrige las dependencias en requirements.txt.",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} pip install failed", "!")
        return 0

    log(NOMBRE, f"#{idea_id} dependencias instaladas", "+")

    # Step 5: Syntax check
    ok, err = _validar_sintaxis(python_path, project_dir)
    if not ok:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=f"BUILDER RECHAZADO:\n{err}\n\nCorrige los errores de sintaxis.",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} syntax errors", "!")
        return 0

    log(NOMBRE, f"#{idea_id} syntax OK", "+")

    # Step 6: Try to run
    ok, result = _intentar_ejecucion(python_path, project_dir, idea_id)
    if not ok:
        queries.update_execution_status(
            db, idea_id, 'queued_software',
            error=f"BUILDER RECHAZADO:\nRuntime error:\n{result}\n\nCorrige el codigo para que ejecute sin errores.",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} runtime error", "!")
        return 0

    # SUCCESS
    build_info = _build_report(project_dir, archivos, result)
    full_output = f"{execution_output}\n\n---\n### Build Report (BUILDER)\n{build_info}"

    queries.update_execution_status(
        db, idea_id, 'built',
        output=full_output,
        agent_name=NOMBRE
    )

    # Register in dashboard's Proyectos page
    _registrar_proyecto(db, idea_id, task, project_dir, result)

    log(NOMBRE, f"#{idea_id} BUILD OK -> built", "+")
    logger.info("BUILD OK: #%d (%d archivos)", idea_id, len(archivos))
    enviar_whatsapp(
        f"🏗 *Proyecto SecondBrain — Build Exitoso*\n"
        f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
        f"📁 Path: projects/{idea_id}/\n"
        f"🔍 Esperando review de QA."
    )
    return 1
