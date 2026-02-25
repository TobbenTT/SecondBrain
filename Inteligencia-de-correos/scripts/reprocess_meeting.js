/**
 * reprocess_meeting.js - Re-procesa una reunión desde el archivo de backup
 * Uso: node scripts/reprocess_meeting.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { procesarReunionDiaria } = require('./main_orchestrator');

async function main() {
    const archivo = path.join(__dirname, '..', 'repositorio_reuniones', '2026-02-20_Daily Meeting.txt');

    if (!fs.existsSync(archivo)) {
        console.error('❌ No se encontró el archivo:', archivo);
        process.exit(1);
    }

    console.log('📂 Leyendo transcripción desde:', archivo);
    const contenido = fs.readFileSync(archivo, 'utf-8');

    // Extraer metadata del archivo
    const tituloMatch = contenido.match(/^Título: (.+)$/m);
    const fechaMatch = contenido.match(/^Fecha: (.+)$/m);
    const idMatch = contenido.match(/^ID: (.+)$/m);

    // Extraer solo la transcripción (después del separador)
    const separador = 'TRANSCRIPCIÓN COMPLETA:\n------------------------------------------\n\n';
    const idxSep = contenido.indexOf(separador);
    const fullText = idxSep >= 0
        ? contenido.substring(idxSep + separador.length)
        : contenido;

    const reunion = {
        id: idMatch ? idMatch[1].trim() : 'reprocess-' + Date.now(),
        title: tituloMatch ? tituloMatch[1].trim() : 'Daily Meeting',
        date: fechaMatch ? fechaMatch[1].trim() : new Date().toISOString(),
        fullText: fullText,
        fireflies: {
            participants: [],
            speakers: ['Gonzalo Olavarria', 'David Cabezas Rojas', 'Jose Cortinat'],
            overview: null,
            action_items: null,
            shorthand_bullet: null
        }
    };

    // Extraer speakers únicos de la transcripción
    const speakerRegex = /^([A-Za-záéíóúñÁÉÍÓÚÑ\s]+):/gm;
    const speakers = new Set();
    let match;
    while ((match = speakerRegex.exec(fullText)) !== null) {
        const name = match[1].trim();
        if (name.length >= 3 && name.length <= 40) {
            speakers.add(name);
        }
    }
    reunion.fireflies.speakers = [...speakers];
    reunion.fireflies.participants = [...speakers];

    console.log(`\n🔄 RE-PROCESANDO: ${reunion.title}`);
    console.log(`   📅 Fecha: ${reunion.date}`);
    console.log(`   📝 Transcripción: ${fullText.length} chars`);
    console.log(`   👥 Speakers detectados: ${reunion.fireflies.speakers.join(', ')}`);
    console.log(`   🔑 API Key: ${process.env.AI_API_KEY ? process.env.AI_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA'}`);
    console.log('');

    try {
        const resultado = await procesarReunionDiaria(reunion);
        console.log('\n✅ Re-procesamiento completado:', JSON.stringify(resultado, null, 2));
    } catch (error) {
        console.error('\n❌ Error al re-procesar:', error.message);
    }
}

main();
