/**
 * SecondBrain OpenClaw Skill — Programmatic Handler
 *
 * Connects OpenClaw to the SecondBrain Express.js API for:
 * - Capturing ideas (voice/text from WhatsApp, Telegram, etc.)
 * - Querying tasks, checklists, and delegations
 * - Generating daily digests
 * - Managing context/memory
 * - Chatting with specialized AI agents
 */

const BASE_URL_DEFAULT = "http://localhost:3000";

async function apiFetch(endpoint, options = {}, ctx = {}) {
    const baseUrl = ctx.env?.SECONDBRAIN_URL || ctx.secrets?.SECONDBRAIN_URL || BASE_URL_DEFAULT;
    const apiKey = ctx.env?.SECONDBRAIN_API_KEY || ctx.secrets?.SECONDBRAIN_API_KEY;

    if (!apiKey) {
        return { error: true, message: "SECONDBRAIN_API_KEY no configurada. Ejecuta: openclaw config set SECONDBRAIN_API_KEY <tu-key>" };
    }

    const url = `${baseUrl}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...options.headers
    };

    try {
        const res = await fetch(url, {
            method: options.method || "GET",
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!res.ok) {
            const text = await res.text();
            return { error: true, status: res.status, message: text.slice(0, 500) };
        }
        return await res.json();
    } catch (err) {
        return {
            error: true,
            message: `No se pudo conectar a SecondBrain (${baseUrl}). Verifica que el servidor esta corriendo: cd apps/dashboard && node server.js`
        };
    }
}

export async function run(params, ctx) {
    const { action } = params;

    switch (action) {
        // ─── Capture ────────────────────────────────────────────────
        case "capture": {
            const { text, speaker, source } = params;
            if (!text) return { error: true, message: "Se requiere 'text' para capturar una idea." };
            return apiFetch("/api/external/capture", {
                method: "POST",
                body: { text, speaker: speaker || undefined, source: source || "openclaw" }
            }, ctx);
        }

        // ─── Summary ────────────────────────────────────────────────
        case "summary": {
            const { username } = params;
            const qs = username ? `?username=${encodeURIComponent(username)}` : "";
            return apiFetch(`/api/external/summary${qs}`, {}, ctx);
        }

        // ─── Digest ─────────────────────────────────────────────────
        case "digest": {
            return apiFetch("/api/external/digest", {}, ctx);
        }

        // ─── Checklist ──────────────────────────────────────────────
        case "checklist": {
            const { username } = params;
            if (!username) return { error: true, message: "Se requiere 'username' (david/gonzalo/jose)." };
            return apiFetch(`/api/checklist/${encodeURIComponent(username)}`, {}, ctx);
        }

        // ─── List Ideas ─────────────────────────────────────────────
        case "ideas": {
            const { filters } = params;
            const qs = new URLSearchParams();
            if (filters?.code_stage) qs.set("code_stage", filters.code_stage);
            if (filters?.para_type) qs.set("para_type", filters.para_type);
            if (filters?.area_id) qs.set("area_id", String(filters.area_id));
            const query = qs.toString();
            return apiFetch(`/api/ideas${query ? '?' + query : ''}`, {}, ctx);
        }

        // ─── List Areas ─────────────────────────────────────────────
        case "areas": {
            return apiFetch("/api/areas", {}, ctx);
        }

        // ─── Waiting For ────────────────────────────────────────────
        case "waiting": {
            return apiFetch("/api/waiting-for", {}, ctx);
        }

        // ─── Complete Task ──────────────────────────────────────────
        case "complete_task": {
            const { username, idea_id } = params;
            if (!username || !idea_id) return { error: true, message: "Se requiere 'username' e 'idea_id'." };
            return apiFetch("/api/webhook/openclaw", {
                method: "POST",
                body: { event: "task_completed", payload: { username, idea_id } }
            }, ctx);
        }

        // ─── Complete Delegation ────────────────────────────────────
        case "complete_delegation": {
            const { waiting_id } = params;
            if (!waiting_id) return { error: true, message: "Se requiere 'waiting_id'." };
            return apiFetch("/api/webhook/openclaw", {
                method: "POST",
                body: { event: "delegation_completed", payload: { waiting_id } }
            }, ctx);
        }

        // ─── Save Context ───────────────────────────────────────────
        case "save_context": {
            const { context } = params;
            if (!context?.key || !context?.content) return { error: true, message: "Se requiere context.key y context.content." };
            return apiFetch("/api/webhook/openclaw", {
                method: "POST",
                body: { event: "context_add", payload: context }
            }, ctx);
        }

        // ─── Chat with Agent ────────────────────────────────────────
        case "chat": {
            const { text, agent } = params;
            if (!text) return { error: true, message: "Se requiere 'text' para el chat." };
            return apiFetch("/api/ai/chat", {
                method: "POST",
                body: { message: text, agent: agent || undefined }
            }, ctx);
        }

        default:
            return { error: true, message: `Accion desconocida: '${action}'. Acciones validas: capture, summary, digest, checklist, ideas, areas, waiting, complete_task, complete_delegation, save_context, chat` };
    }
}
