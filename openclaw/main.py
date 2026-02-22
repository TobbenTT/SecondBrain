"""
OpenClaw SecondBrain — Launcher Unificado v1.0

Ejecuta todos los agentes desde un solo terminal con threading.

Pipelines:
  Software:   PM -> DEV -> BUILDER -> QA
  Consulting: PM -> Consulting -> Reviewer

Uso:
  python main.py                       -- Ejecuta todos los agentes
  python main.py --solo pm             -- Solo el Project Manager
  python main.py --solo dev            -- Solo el Programador
  python main.py --solo qa             -- Solo el Revisor
  python main.py --solo consulting     -- Solo el agente consultor
  python main.py --solo reviewer       -- Solo el revisor de documentos
"""
import os
import sys
import signal
import threading
from datetime import datetime

# Asegurar que estamos en el directorio correcto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from compartido import hablar, log, CONFIG, logger
from db.connection import get_connection
from db import queries

# ── Configuracion ────────────────────────────────────────────────────────────
INTERVALOS = {
    "pm":         CONFIG["intervalo_pm"],
    "dev":        CONFIG["intervalo_dev"],
    "builder":    CONFIG["intervalo_builder"],
    "qa":         CONFIG["intervalo_qa"],
    "consulting": CONFIG["intervalo_consulting"],
    "reviewer":   CONFIG["intervalo_reviewer"],
}

# ── Estado global ────────────────────────────────────────────────────────────
stats = {
    "pm": 0, "dev": 0, "builder": 0, "qa": 0, "consulting": 0, "reviewer": 0,
    "errores": 0, "inicio": datetime.now()
}
_shutdown = threading.Event()


# ── Hilo generico ────────────────────────────────────────────────────────────
def _hilo_agente(nombre, importar_ciclo, stat_key, intervalo):
    """Hilo generico para ejecutar un agente en loop."""
    from db.connection import close_connection
    ciclo = importar_ciclo()
    try:
        while not _shutdown.is_set():
            try:
                n = ciclo()
                stats[stat_key] += n
            except Exception as e:
                stats["errores"] += 1
                log(nombre, f"Error en ciclo: {e}", "!")
                logger.exception("Error en agente %s", nombre)
            _shutdown.wait(timeout=intervalo)
    finally:
        close_connection()


# ── Funciones de hilo por agente ─────────────────────────────────────────────
def hilo_pm():
    def importar():
        from agents.pm import ciclo
        return ciclo
    _hilo_agente("PM", importar, "pm", INTERVALOS["pm"])


def hilo_dev():
    def importar():
        from agents.dev import ciclo
        return ciclo
    _hilo_agente("DEV", importar, "dev", INTERVALOS["dev"])


def hilo_builder():
    def importar():
        from agents.builder import ciclo
        return ciclo
    _hilo_agente("BUILDER", importar, "builder", INTERVALOS["builder"])


def hilo_qa():
    def importar():
        from agents.qa import ciclo
        return ciclo
    _hilo_agente("QA", importar, "qa", INTERVALOS["qa"])


def hilo_consulting():
    def importar():
        from agents.consulting import ciclo
        return ciclo
    _hilo_agente("CONSULTING", importar, "consulting", INTERVALOS["consulting"])


def hilo_reviewer():
    def importar():
        from agents.reviewer import ciclo
        return ciclo
    _hilo_agente("REVIEWER", importar, "reviewer", INTERVALOS["reviewer"])


# ── Monitor de status ────────────────────────────────────────────────────────
def mostrar_status():
    """Muestra estadisticas cada 2 minutos."""
    while not _shutdown.is_set():
        _shutdown.wait(timeout=120)
        if _shutdown.is_set():
            break

        uptime = datetime.now() - stats["inicio"]
        mins = int(uptime.total_seconds() / 60)

        # Pipeline stats from DB
        try:
            db = get_connection()
            ps = queries.get_pipeline_stats(db)
            logger.info(
                "STATUS [%dmin] — PM:%d DEV:%d BLD:%d QA:%d CONS:%d REV:%d | Errores:%d | "
                "DB: pending=%s queued=%s active=%s build=%s review=%s done=%s fail=%s",
                mins, stats['pm'], stats['dev'], stats['builder'], stats['qa'],
                stats['consulting'], stats['reviewer'], stats['errores'],
                ps['pending'], ps['queued'], ps['in_progress'], ps['building'],
                ps['in_review'], ps['completed'], ps['failed']
            )
        except Exception:
            logger.info(
                "STATUS [%dmin] — PM:%d DEV:%d BLD:%d QA:%d CONS:%d REV:%d | Errores:%d",
                mins, stats['pm'], stats['dev'], stats['builder'], stats['qa'],
                stats['consulting'], stats['reviewer'], stats['errores']
            )


# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.system('cls' if os.name == 'nt' else 'clear')

    print("+" + "=" * 58 + "+")
    print("|       OPENCLAW SECONDBRAIN v1.0                          |")
    print("|       Orquestador Autonomo Multi-Agente                  |")
    print("+" + "=" * 58 + "+")
    print("|   PM         — Project Manager / Router (Gemini)         |")
    print("|   DEV        — Ingeniero Software (Gemini + Ollama)      |")
    print("|   BUILDER    — Build & Validation (subprocess)          |")
    print("|   QA         — Code Reviewer (Claude)                    |")
    print("|   CONSULTING — Agente Consultor (Gemini + Skills/SOPs)   |")
    print("|   REVIEWER   — Director de Calidad (Claude)              |")
    print("+" + "=" * 58 + "+")
    print()

    # Verificar DB
    try:
        db = get_connection()
        log("SYS", "Database conectada OK", "+")
    except FileNotFoundError as e:
        log("SYS", str(e), "!")
        sys.exit(1)

    # Parsear argumento --solo
    solo = None
    if "--solo" in sys.argv:
        idx = sys.argv.index("--solo")
        if idx + 1 < len(sys.argv):
            solo = sys.argv[idx + 1].lower()

    AGENTES_MAP = {
        "pm": ("PM", hilo_pm),
        "dev": ("DEV", hilo_dev),
        "builder": ("BUILDER", hilo_builder),
        "qa": ("QA", hilo_qa),
        "consulting": ("CONSULTING", hilo_consulting),
        "reviewer": ("REVIEWER", hilo_reviewer),
    }

    agentes = []
    if solo:
        if solo in AGENTES_MAP:
            label, fn = AGENTES_MAP[solo]
            agentes.append((label, fn))
        else:
            log("SYS", f"Agente desconocido: '{solo}'. Validos: {', '.join(AGENTES_MAP.keys())}", "!")
            sys.exit(1)
    else:
        for label, fn in AGENTES_MAP.values():
            agentes.append((label, fn))

    # Iniciar threads
    threads = []
    for label, fn in agentes:
        t = threading.Thread(target=fn, daemon=True, name=label)
        t.start()
        threads.append(t)
        log("SYS", f"{label} en linea (cada {INTERVALOS.get(label.lower(), '?')}s)", ">")

    # Status thread
    t_status = threading.Thread(target=mostrar_status, daemon=True, name="STATUS")
    t_status.start()

    hablar(f"OpenClaw SecondBrain iniciado con {len(agentes)} agentes activos.")
    print(f"\n  Ctrl+C para detener\n")

    # Graceful shutdown
    def shutdown_handler(signum, frame):
        logger.info("Senal de apagado recibida...")
        _shutdown.set()

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        while not _shutdown.is_set():
            _shutdown.wait(timeout=1)
    except KeyboardInterrupt:
        _shutdown.set()

    # Resumen final
    uptime = datetime.now() - stats["inicio"]
    mins = int(uptime.total_seconds() / 60)
    logger.info("Sistema detenido despues de %d minutos", mins)
    logger.info(
        "Total — PM:%d DEV:%d BLD:%d QA:%d CONS:%d REV:%d | Errores:%d",
        stats['pm'], stats['dev'], stats['builder'], stats['qa'],
        stats['consulting'], stats['reviewer'], stats['errores']
    )
    hablar("OpenClaw SecondBrain detenido. Hasta pronto.")
