const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Using the robust model as requested
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 5000,
    }
});

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
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `Contexto disponible del Segundo Cerebro:\n${context}` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido. Utilizaré este contexto si es relevante para la investigación." }]
                }
            ],
            systemInstruction: {
                role: "system",
                parts: [{ text: RESEARCH_SYSTEM_PROMPT }]
            }
        });

        const result = await chat.sendMessage(`INVESTIGAR: ${query}`);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Deep Research Error:", error);
        return `## Error en la Investigación\nNo se pudo completar el análisis debido a: ${error.message}`;
    }
}

module.exports = { researchTopic };
