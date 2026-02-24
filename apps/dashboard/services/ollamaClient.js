/**
 * Ollama Client — HTTP client for local LLM inference via Ollama.
 *
 * Used as PRIMARY model; cloud (Gemini/Claude) serves as fallback.
 * Supports /api/generate (simple prompts) and /api/chat (conversations).
 *
 * Production optimizations:
 *  - keep_alive to avoid cold-start latency on every request
 *  - Cached health check to skip requests when known offline
 *  - Model warmup on startup to pre-load into VRAM
 *  - Configurable context length and temperature
 *  - Logs eval_duration for performance monitoring
 */
const log = require('../helpers/logger');

const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10); // 2 min default
const OLLAMA_CTX = parseInt(process.env.OLLAMA_CTX || '4096', 10);
const OLLAMA_TEMP = parseFloat(process.env.OLLAMA_TEMP || '0.3');
const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '10m';

let _ollamaOnline = null; // null = unknown, true/false after check
let _lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30s

function _estimateTokens(text) { return Math.ceil((text || '').length / 4); }

/**
 * Quick health check — cached for 30s to avoid spamming Ollama.
 */
async function isOnline() {
    if (Date.now() - _lastHealthCheck < HEALTH_CHECK_INTERVAL && _ollamaOnline !== null) {
        return _ollamaOnline;
    }
    try {
        const resp = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: AbortSignal.timeout(1500),
        });
        _ollamaOnline = resp.ok;
        _lastHealthCheck = Date.now();
        return _ollamaOnline;
    } catch {
        _ollamaOnline = false;
        _lastHealthCheck = Date.now();
        return false;
    }
}

/**
 * Simple text generation via /api/generate.
 * @param {string} prompt - The prompt text
 * @param {string} [system] - Optional system instruction
 * @returns {string|null} Generated text, or null if Ollama unavailable (triggers fallback)
 */
async function generate(prompt, system = '') {
    // Quick bail if known offline
    if (_ollamaOnline === false && Date.now() - _lastHealthCheck < HEALTH_CHECK_INTERVAL) {
        return null;
    }

    try {
        const body = {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: { num_ctx: OLLAMA_CTX, temperature: OLLAMA_TEMP },
            keep_alive: OLLAMA_KEEP_ALIVE,
        };
        if (system) body.system = system;

        const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
        });

        if (!resp.ok) {
            log.warn('Ollama generate HTTP error', { status: resp.status });
            _ollamaOnline = false;
            _lastHealthCheck = Date.now();
            return null;
        }

        _ollamaOnline = true;
        _lastHealthCheck = Date.now();

        const data = await resp.json();
        const text = (data.response || '').trim();
        if (text) {
            const inputTokens = _estimateTokens(prompt) + _estimateTokens(system);
            const outputTokens = _estimateTokens(text);
            log.info('Ollama generate OK', {
                model: OLLAMA_MODEL,
                inputTokens, outputTokens,
                totalTokens: inputTokens + outputTokens,
                evalDuration: data.eval_duration ? `${(data.eval_duration / 1e9).toFixed(1)}s` : '?',
            });
        }
        return text || null;
    } catch (err) {
        _ollamaOnline = false;
        _lastHealthCheck = Date.now();
        if (err.name === 'TimeoutError') {
            log.warn('Ollama generate timeout', { timeout: OLLAMA_TIMEOUT });
        } else if (err.cause?.code === 'ECONNREFUSED') {
            log.warn('Ollama not running', { url: OLLAMA_URL });
        } else {
            log.warn('Ollama generate error', { error: err.message });
        }
        return null;
    }
}

/**
 * Chat-style generation via /api/chat.
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {string} [system] - Optional system instruction (prepended as system message)
 * @returns {string|null} Generated text, or null if Ollama unavailable
 */
async function chat(messages, system = '') {
    // Quick bail if known offline
    if (_ollamaOnline === false && Date.now() - _lastHealthCheck < HEALTH_CHECK_INTERVAL) {
        return null;
    }

    try {
        const msgs = [];
        if (system) msgs.push({ role: 'system', content: system });
        msgs.push(...messages);

        const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: msgs,
                stream: false,
                options: { num_ctx: OLLAMA_CTX, temperature: OLLAMA_TEMP },
                keep_alive: OLLAMA_KEEP_ALIVE,
            }),
            signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
        });

        if (!resp.ok) {
            log.warn('Ollama chat HTTP error', { status: resp.status });
            _ollamaOnline = false;
            _lastHealthCheck = Date.now();
            return null;
        }

        _ollamaOnline = true;
        _lastHealthCheck = Date.now();

        const data = await resp.json();
        const text = (data.message?.content || '').trim();
        if (text) {
            const inputTokens = msgs.reduce((sum, m) => sum + _estimateTokens(m.content), 0);
            const outputTokens = _estimateTokens(text);
            log.info('Ollama chat OK', {
                model: OLLAMA_MODEL,
                inputTokens, outputTokens,
                totalTokens: inputTokens + outputTokens,
                evalDuration: data.eval_duration ? `${(data.eval_duration / 1e9).toFixed(1)}s` : '?',
            });
        }
        return text || null;
    } catch (err) {
        _ollamaOnline = false;
        _lastHealthCheck = Date.now();
        if (err.name === 'TimeoutError') {
            log.warn('Ollama chat timeout', { timeout: OLLAMA_TIMEOUT });
        } else if (err.cause?.code === 'ECONNREFUSED') {
            log.warn('Ollama not running', { url: OLLAMA_URL });
        } else {
            log.warn('Ollama chat error', { error: err.message });
        }
        return null;
    }
}

/**
 * Warmup — pre-load model into VRAM so first real request is fast.
 * Called on server startup. Non-blocking, won't crash if Ollama is down.
 */
async function warmup() {
    try {
        const online = await isOnline();
        if (!online) {
            log.info('Ollama warmup skipped — offline');
            return;
        }
        log.info('Ollama warmup — pre-loading model...', { model: OLLAMA_MODEL });
        const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: 'Responde OK.',
                stream: false,
                keep_alive: OLLAMA_KEEP_ALIVE,
                options: { num_predict: 5 },
            }),
            signal: AbortSignal.timeout(60000),
        });
        if (resp.ok) {
            log.info('Ollama warmup complete — model loaded', { model: OLLAMA_MODEL });
        }
    } catch (err) {
        log.warn('Ollama warmup failed (non-fatal)', { error: err.message });
    }
}

module.exports = { generate, chat, warmup, isOnline, OLLAMA_URL, OLLAMA_MODEL };
