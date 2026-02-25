// Usando fetch nativo de Node>=18
require('dotenv').config();
const { procesarReunionDiaria } = require('./main_orchestrator');

async function obtenerUltimasReuniones() {
    const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY;
    if (!FIREFLIES_API_KEY) {
        console.error('No se encontro FIREFLIES_API_KEY en .env');
        return;
    }

    const query = `
        query {
            transcripts(limit: 5) {
                id
                title
                date
            }
        }
    `;

    try {
        const response = await fetch('https://api.fireflies.ai/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIREFLIES_API_KEY}`
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        if (result.errors) {
            console.error('Error de GraphQL:', result.errors);
            return;
        }

        const transcripts = result.data.transcripts;
        console.log('\n--- Últimas 5 Reuniones en Fireflies ---');
        transcripts.forEach((t, i) => {
            const fecha = new Date(parseInt(t.date)).toLocaleString();
            console.log(`${i + 1}. [${fecha}] ${t.title} (ID: ${t.id})`);
        });

        if (transcripts.length > 0) {
            const ultima = transcripts[0];
            console.log(`\n✅ Seleccionando la más reciente: ${ultima.title} (ID: ${ultima.id})`);
            console.log('Descargando transcripción completa...');

            // Obtener Transcripcion Completa (replicando server.js)
            const queryTranscripcion = `
                query Transcript($transcriptId: String!) {
                    transcript(id: $transcriptId) {
                        id
                        title
                        date
                        duration
                        transcript_url
                        participants
                        sentences { text speaker_name }
                        summary { overview action_items shorthand_bullet }
                    }
                }
            `;

            const transRes = await fetch('https://api.fireflies.ai/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FIREFLIES_API_KEY}` },
                body: JSON.stringify({ query: queryTranscripcion, variables: { transcriptId: ultima.id } })
            });
            const transResult = await transRes.json();
            const t = transResult.data.transcript;

            let fullText = '';
            const speakersDetectados = [];
            if (t.sentences) {
                const speakers = [...new Set(t.sentences.map(s => s.speaker_name).filter(n => n && n !== 'null'))];
                speakersDetectados.push(...speakers);
                fullText = t.sentences.map(s => {
                    const speaker = (s.speaker_name && s.speaker_name !== 'null') ? s.speaker_name : '';
                    return speaker ? `${speaker}: ${s.text}` : s.text;
                }).join('\n');
            }

            const firefliesMetadata = {
                participants: t.participants || [],
                speakers: speakersDetectados,
                overview: (t.summary && t.summary.overview) || null,
                action_items: (t.summary && t.summary.action_items) || null,
                shorthand_bullet: (t.summary && t.summary.shorthand_bullet) || null
            };

            const reunion = {
                id: t.id,
                title: t.title,
                date: t.date ? new Date(parseInt(t.date)).toISOString() : new Date().toISOString(),
                fullText: fullText,
                fireflies: firefliesMetadata
            };

            console.log('--- Procesando mediante orquestador avanzado con el nuevo prompt ---');
            await procesarReunionDiaria(reunion);

        } else {
            console.log('No se encontraron reuniones.');
        }

    } catch (e) {
        console.error('Error al consultar Fireflies:', e);
    }
}

obtenerUltimasReuniones();
