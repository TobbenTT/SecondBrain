"""
OpenClaw SecondBrain — Modulo Compartido v1.0

Base central: configuracion, clientes IA, logging.
Adaptado de Sistema-OpenClaw/compartido.py (v7.4) para SecondBrain.

Diferencia principal: No usa Obsidian. Todo va por SQLite via db/queries.py.
"""
import os
import logging
import logging.handlers
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Cargar .env desde el directorio de openclaw ──────────────────────────────
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

# Fallback: si no hay GEMINI_API_KEY, intentar leer del dashboard .env
if not os.getenv("GEMINI_API_KEY"):
    _dashboard_env = Path(__file__).parent / ".." / "apps" / "dashboard" / ".env"
    if _dashboard_env.exists():
        load_dotenv(_dashboard_env, override=False)

# ── Silenciar logs ruidosos ──────────────────────────────────────────────────
logging.getLogger("urllib3").setLevel(logging.CRITICAL)
logging.getLogger("httpx").setLevel(logging.CRITICAL)

# ── Logging central ─────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)

# File handler con rotacion diaria
_logs_dir = Path(__file__).parent / "logs"
_logs_dir.mkdir(exist_ok=True)
_fh = logging.handlers.TimedRotatingFileHandler(
    str(_logs_dir / "openclaw.log"), when="midnight", backupCount=14, encoding="utf-8"
)
_fh.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
logging.getLogger().addHandler(_fh)

logger = logging.getLogger("OpenClaw")

# ── Configuracion ────────────────────────────────────────────────────────────
CONFIG = {
    "gemini_api_key":    os.getenv("GEMINI_API_KEY", ""),
    "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY", ""),
    "gemini_model":      os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
    "claude_model":      os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
    "local_model":       os.getenv("LOCAL_MODEL", "llama3"),
    "ollama_url":        os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate"),
    "tts_enabled":       os.getenv("TTS_ENABLED", "false").lower() == "true",
    "intervalo_pm":       int(os.getenv("INTERVALO_PM", "30")),
    "intervalo_dev":      int(os.getenv("INTERVALO_DEV", "60")),
    "intervalo_qa":       int(os.getenv("INTERVALO_QA", "60")),
    "intervalo_builder":    int(os.getenv("INTERVALO_BUILDER", "45")),
    "intervalo_consulting": int(os.getenv("INTERVALO_CONSULTING", "45")),
    "intervalo_reviewer":   int(os.getenv("INTERVALO_REVIEWER", "90")),
}

# ── Cliente Gemini ───────────────────────────────────────────────────────────
cliente_gemini = None
try:
    if CONFIG["gemini_api_key"]:
        from google import genai
        cliente_gemini = genai.Client(api_key=CONFIG["gemini_api_key"])
        logger.info("Gemini configurado OK (modelo: %s)", CONFIG["gemini_model"])
    else:
        logger.warning("GEMINI_API_KEY no configurada — agentes DEV y CONSULTING no funcionaran")
except Exception as _e:
    logger.warning("Gemini no disponible: %s", _e)

# ── Cliente Claude ───────────────────────────────────────────────────────────
cliente_claude = None
try:
    if CONFIG["anthropic_api_key"]:
        import anthropic
        cliente_claude = anthropic.Anthropic(api_key=CONFIG["anthropic_api_key"])
        logger.info("Claude configurado OK (modelo: %s)", CONFIG["claude_model"])
    else:
        logger.warning("ANTHROPIC_API_KEY no configurada — agentes QA y REVIEWER no funcionaran")
except Exception as _e:
    logger.warning("Claude no disponible: %s", _e)


# ── Token estimation ─────────────────────────────────────────────────────────

def _estimate_tokens(text):
    """Approximate token count (~4 chars per token)."""
    return len(text or "") // 4


# ── Motores de IA ────────────────────────────────────────────────────────────

def pensar_con_gemini(prompt, modelo=None):
    """Inferencia en nube con Google Gemini. Retorna '' si falla."""
    if not cliente_gemini:
        return ""
    try:
        res = cliente_gemini.models.generate_content(
            model=modelo or CONFIG["gemini_model"],
            contents=prompt
        )
        return res.text or ""
    except Exception as e:
        logger.warning("Gemini error: %s", e)
        return ""


def pensar_con_claude(prompt, sistema="", modelo=None, max_tokens=4096):
    """Inferencia en nube con Anthropic Claude. Retorna '' si falla."""
    if not cliente_claude:
        return ""
    try:
        kwargs = {
            "model": modelo or CONFIG["claude_model"],
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if sistema:
            kwargs["system"] = sistema
        resp = cliente_claude.messages.create(**kwargs)
        return resp.content[0].text if resp.content else ""
    except Exception as e:
        logger.warning("Claude error: %s", e)
        return ""


def pensar_con_local(prompt):
    """Inferencia local via Ollama. Fallback cuando Gemini/Claude no responden."""
    payload = {"model": CONFIG["local_model"], "prompt": prompt, "stream": False}
    try:
        logger.info("Ollama: conectando a %s (modelo: %s)...", CONFIG["ollama_url"], CONFIG["local_model"])
        r = requests.post(CONFIG["ollama_url"], json=payload, timeout=300, verify=False)
        if r.status_code == 200:
            text = r.json().get("response", "").strip()
            if text:
                logger.info("Ollama: respuesta OK (%d chars)", len(text))
            else:
                logger.warning("Ollama: respuesta vacia")
            return text
        else:
            logger.warning("Ollama: HTTP %d — %s", r.status_code, r.text[:200])
            return ""
    except requests.exceptions.ConnectionError:
        logger.warning("Ollama: no se pudo conectar a %s — esta corriendo 'ollama serve'?", CONFIG["ollama_url"])
        return ""
    except Exception as e:
        logger.warning("Ollama: error inesperado — %s", e)
        return ""


# ── Motor universal: Ollama primario, cloud fallback ────────────────────────

def pensar(prompt, sistema="", max_tokens=4096, fallback="gemini"):
    """Inferencia universal. Ollama primero, cloud como respaldo.

    Args:
        prompt:   Texto del prompt.
        sistema:  System instruction (para Claude y Ollama /api/generate).
        fallback: 'gemini' o 'claude' — cual cloud probar primero si Ollama falla.

    Returns:
        str con la respuesta, o '' si todo falla.
    """
    input_tokens = _estimate_tokens(prompt) + _estimate_tokens(sistema)
    logger.info("AI request: ~%d input tokens (prompt=%d, system=%d)",
                input_tokens, _estimate_tokens(prompt), _estimate_tokens(sistema))

    # 1. Ollama (primario)
    full_prompt = f"{sistema}\n\n{prompt}" if sistema else prompt
    resultado = pensar_con_local(full_prompt)
    if resultado:
        output_tokens = _estimate_tokens(resultado)
        logger.info("AI response (local): ~%d output tokens, ~%d total", output_tokens, input_tokens + output_tokens)
        return resultado

    logger.info("Ollama no respondio, intentando cloud (%s)...", fallback)

    # 2. Cloud fallback
    if fallback == "claude":
        resultado = pensar_con_claude(prompt, sistema=sistema, max_tokens=max_tokens)
        if resultado:
            logger.info("AI response (claude): ~%d output tokens, ~%d total", _estimate_tokens(resultado), input_tokens + _estimate_tokens(resultado))
            return resultado
        resultado = pensar_con_gemini(full_prompt)
        if resultado:
            logger.info("AI response (gemini): ~%d output tokens, ~%d total", _estimate_tokens(resultado), input_tokens + _estimate_tokens(resultado))
        return resultado
    else:
        resultado = pensar_con_gemini(full_prompt)
        if resultado:
            logger.info("AI response (gemini): ~%d output tokens, ~%d total", _estimate_tokens(resultado), input_tokens + _estimate_tokens(resultado))
            return resultado
        resultado = pensar_con_claude(prompt, sistema=sistema, max_tokens=max_tokens)
        if resultado:
            logger.info("AI response (claude): ~%d output tokens, ~%d total", _estimate_tokens(resultado), input_tokens + _estimate_tokens(resultado))
        return resultado


# ── Utilidades de consola ────────────────────────────────────────────────────

def log(agente, mensaje, emoji="i"):
    """Imprime un mensaje con formato de agente."""
    print(f"  {emoji} [{agente}] {mensaje}")


def hablar(texto):
    """Notificacion de voz (TTS opcional)."""
    if not CONFIG["tts_enabled"]:
        return
    try:
        from gtts import gTTS
        import tempfile
        tts = gTTS(text=texto, lang='es', tld='com.mx')
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            tts.save(f.name)
            try:
                from playsound import playsound
                playsound(f.name)
            except Exception:
                pass
            finally:
                os.unlink(f.name)
    except Exception:
        pass


# ── Telegram (opcional) ──────────────────────────────────────────────────────

def enviar_telegram(mensaje):
    """Envia notificacion por Telegram Bot API. Falla silenciosamente."""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    if not bot_token or not chat_id:
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": mensaje, "parse_mode": "HTML"},
            timeout=10,
        )
        logger.info("Telegram enviado: %s", mensaje[:60])
    except Exception as e:
        logger.debug("Telegram no disponible: %s", e)
