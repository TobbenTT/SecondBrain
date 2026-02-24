/**
 * Ollama Client — HTTP client for local LLM inference via Ollama.
 *
 * Used as PRIMARY model; cloud (Gemini/Claude) serves as fallback.
 * Supports /api/generate (simple prompts) and /api/chat (conversations).
 */
const log = require('../helpers/logger');

const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '300000', 10); // 5 min default

function _estimateTokens(text) { return Math.ceil((text || '').length / 4); }

/**
 * Simple text generation via /api/generate.
 * @param {string} prompt - The prompt text
 * @param {string} [system] - Optional system instruction
 * @returns {string|null} Generated text, or null if Ollama unavailable (triggers fallback)
 */
async function generate(prompt, system = '') {
    try {
        const body = { model: OLLAMA_MODEL, prompt, stream: false };
        if (system) body.system = system;

        const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
        });

        if (!resp.ok) {
            log.warn('Ollama generate HTTP error', { status: resp.status });
            return null;
        }

        const data = await resp.json();
        const text = (data.response || '').trim();
        if (text) {
            const inputTokens = _estimateTokens(prompt) + _estimateTokens(system);
            const outputTokens = _estimateTokens(text);
            log.info('Ollama generate OK', { model: OLLAMA_MODEL, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens });
        }
        return text || null;
    } catch (err) {
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
    try {
        const msgs = [];
        if (system) msgs.push({ role: 'system', content: system });
        msgs.push(...messages);

        const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, messages: msgs, stream: false }),
            signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
        });

        if (!resp.ok) {
            log.warn('Ollama chat HTTP error', { status: resp.status });
            return null;
        }

        const data = await resp.json();
        const text = (data.message?.content || '').trim();
        if (text) {
            const inputTokens = msgs.reduce((sum, m) => sum + _estimateTokens(m.content), 0);
            const outputTokens = _estimateTokens(text);
            log.info('Ollama chat OK', { model: OLLAMA_MODEL, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens });
        }
        return text || null;
    } catch (err) {
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

module.exports = { generate, chat, OLLAMA_URL, OLLAMA_MODEL };
