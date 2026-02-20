const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// API Key (Provided by user)
const API_KEY = "AIzaSyBKZQCjeIhzxzxlALkPYdZaejf9SvTaNJA";

const genAI = new GoogleGenerativeAI(API_KEY);
// Updated based on User provided Release Notes (2026): gemini-1.5 is retired.
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// System Instructions based on resumen.txt
const SYSTEM_INSTRUCTION = `
Eres un asistente de IA para un sistema "Second Brain" que opera bajo la metodología de Teresa Torres.
Tus reglas principales son:
1. **Crecimiento Orgánico**: Empieza pequeño, no abrumes.
2. **No te Repitas (DRY)**: Si el usuario explica algo que podrías necesitar después, sugiere guardarlo en Contexto.
3. **Método de Entrevista**: Si necesitas info, haz preguntas específicas al usuario para construir contexto.
4. **Mantenimiento**: Sugiere proactivamente actualizaciones al contexto.
5. **Delegación**: Actúa como un empleado entrenado siguiendo SOPs.

Cuando analices IDEAS:
- Identifica si es Proyecto, Tarea, Referencia o Algún día/Quizás.
- Sugiere siguientes acciones (estilo GTD).
- Revisa si algún Contexto existente aplica.
`;

async function generateResponse(prompt, history = [], systemInstruction = null) {
    try {
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.message }]
            })),
            generationConfig: {
                maxOutputTokens: 2000, // Increased for detailed agent outputs
            },
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction || SYSTEM_INSTRUCTION }]
            }
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "Lo siento, encontré un error al procesar tu solicitud. Por favor, verifica tu conexión o intenta más tarde.";
    }
}

async function processIdea(ideaText, context = "") {
    const prompt = `
    Analiza esta nueva idea basándote en mi Contexto y clasifícala:
    "${ideaText}"
    
    Contexto:
    ${context}
    
    Responde ÚNICAMENTE con un objeto JSON (sin markdown) con estos campos en ESPAÑOL:
    - tipo: (Tarea, Proyecto, Nota, Meta)
    - categoria: (Trabajo, Personal, Salud, Finanzas, Otro) - Infiere la mejor categoría
    - resumen: (Resumen muy breve de la idea)
    - accion_inmediata: (El siguiente paso físico y accionable, estilo GTD)
    - sugerencia_contexto: (true/false si esto parece información permanente que debería guardarse en Contexto)
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        return JSON.parse(text);
    } catch (e) {
        console.error("AI Process Error:", e);
        // Log to file for debugging
        fs.appendFileSync(path.join(__dirname, '..', 'ai_error.log'), `${new Date().toISOString()} - ${e.message}\n${e.stack}\n---\n`);

        // Fallback response so frontend doesn't crash on null
        return {
            tipo: "Error",
            categoria: "Desconocido",
            resumen: "No se pudo procesar la idea. Verifique la clave API o conexión.",
            accion_inmediata: "Reintentar manualmente",
            sugerencia_contexto: false
        };
    }
}

module.exports = { generateResponse, processIdea };
