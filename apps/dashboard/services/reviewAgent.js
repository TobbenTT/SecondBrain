const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const REVIEW_SYSTEM_PROMPT = `
Eres el JEFE DE GABINETE (Chief of Staff) de este Segundo Cerebro.
Tu trabajo es realizar la REVISIÓN SEMANAL (Weekly Review).

Recibirás una lista de "Ideas/Notas" capturadas recientemente.
Debes procesarlas y generar un plan de ataque para la próxima semana.

FORMATO DE SALIDA (MARKDOWN):
# 📅 Revisión Semanal: [Rango de Fechas]

## 🏆 Logros y Capturas
* Hemos capturado X nuevas ideas.
* [Menciona 1-2 ideas destacadas]

## 🚦 Semáforo de Proyectos
* **[Proyecto A]**: [Estado/Acción sugerida]
* **[Proyecto B]**: [Estado/Acción sugerida]

## 🎯 Enfoque para la Próxima Semana
1. [Prioridad 1]
2. [Prioridad 2]
3. [Prioridad 3]

## 🗑️ Limpieza Mental
* [Lista de cosas que parecen ruido o deberían borrarse/archivarse]

REGLAS:
1. Sé directivo y motivador.
2. Agrupa temas similares.
3. Si no hay nada importante, sugiérele al usuario que se tome un descanso o busque inspiración.
`;

async function generateWeeklyReview(ideas) {
    try {
        // Convert ideas array to string context
        const ideasList = ideas.map(i => `- [${i.created_at}] ${i.text} (Estado: ${i.status})`).join('\n');

        const prompt = `
        Realiza una Revisión Semanal CONCISA (max 400 palabras) con estas notas:
        
        ${ideasList}
        
        Fecha actual: ${new Date().toLocaleDateString()}
        
        Prioriza:
        1. Logros clave.
        2. Bloqueos.
        3. Foco para la semana que viene.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { role: "system", parts: [{ text: REVIEW_SYSTEM_PROMPT }] }
        });

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Weekly Review Error:", error);
        return `## Error en la Revisión\nNo pude procesar las ideas: ${error.message}`;
    }
}

module.exports = { generateWeeklyReview };
