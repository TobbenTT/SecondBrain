const { GoogleGenerativeAI } = require("@google/generative-ai");
const log = require('../helpers/logger');
const ollama = require('./ollamaClient');

const API_KEY = process.env.GEMINI_API_KEY;

// Gemini client (fallback)
let model = null;
try {
    if (API_KEY) {
        const genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: { temperature: 0.7, maxOutputTokens: 5000 }
        });
    }
} catch (_) { /* Gemini unavailable */ }

const RESEARCH_SYSTEM_PROMPT = `
Eres un INVESTIGADOR PROFUNDO (Deep Research Agent) para un Segundo Cerebro.
Tu objetivo es responder preguntas complejas del usuario de manera exhaustiva y estructurada.

FORMATO DE RESPUESTA (MARKDOWN):
# [Título del Análisis]

## Resumen Ejecutivo
[Breve síntesis de la respuesta]

## Hallazgos Clave
* [Punto 1]
* [Punto 2]

## Análisis Detallado
[Explicación profunda, comparaciones, datos técnicos si aplica]

## Conclusión / Recomendación
[Qué debería hacer el usuario con esta información]

REGLAS:
1. Sé objetivo y analítico.
2. Si la pregunta es sobre código, incluye ejemplos.
3. Si la pregunta es sobre estrategia, da opciones (Pros/Contras).
4. Usa formato Markdown limpio.
`;

async function researchTopic(query, context = "") {
    // 1. Try Ollama (primary)
    try {
        const messages = [
            { role: 'user', content: `Contexto disponible del Segundo Cerebro:\n${context}` },
            { role: 'assistant', content: 'Entendido. Utilizaré este contexto si es relevante para la investigación.' },
            { role: 'user', content: `INVESTIGAR: ${query}` }
        ];
        const ollamaResult = await ollama.chat(messages, RESEARCH_SYSTEM_PROMPT);
        if (ollamaResult) return ollamaResult;
        log.info('Ollama unavailable for research, falling back to Gemini');
    } catch (err) {
        log.warn('Ollama research attempt failed', { error: err.message });
    }

    // 2. Fallback to Gemini
    try {
        if (!model) throw new Error('Gemini not configured');
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: `Contexto disponible del Segundo Cerebro:\n${context}` }] },
                { role: "model", parts: [{ text: "Entendido. Utilizaré este contexto si es relevante para la investigación." }] }
            ],
            systemInstruction: { role: "system", parts: [{ text: RESEARCH_SYSTEM_PROMPT }] }
        });

        const result = await chat.sendMessage(`INVESTIGAR: ${query}`);
        const response = await result.response;
        return response.text();
    } catch (error) {
        log.error('All AI providers failed for research', { error: error.message });
        return `## Error en la Investigación\nNo se pudo completar el análisis. Verifica que Ollama esté corriendo o la clave Gemini sea válida.`;
    }
}

module.exports = { researchTopic };
