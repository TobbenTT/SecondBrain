/**
 * test_weekly.js - Genera el HTML semanal en un archivo local para inspección visual
 */
require('dotenv').config();
const fs = require('fs');
const { obtenerCompromisosSemana } = require('./db');
const { generarHTMLSemanal } = require('./weekly_sender');

(async () => {
    const reuniones = await obtenerCompromisosSemana();
    console.log('Reuniones encontradas:', reuniones.length);

    // Muestra los primeros 3 registros para inspección
    reuniones.slice(0, 3).forEach((r, i) => {
        let puntos = r.puntos_clave;
        if (typeof puntos === 'string') {
            try { puntos = JSON.parse(puntos); } catch (e) { }
        }
        console.log(`\n--- Reunión ${i + 1}: ${r.titulo} ---`);
        console.log('  puntos_clave (tipo):', typeof r.puntos_clave);
        console.log('  puntos_clave (value):', JSON.stringify(puntos).substring(0, 300));
    });

    const html = generarHTMLSemanal(reuniones);
    fs.writeFileSync('../test_email.html', html);
    console.log('\n✅ test_email.html generado con éxito.');
    process.exit(0);
})();
