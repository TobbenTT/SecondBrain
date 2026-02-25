const fs = require('fs');
const path = require('path');

/**
 * Manejador de almacenamiento local para transcripciones de Fireflies.ai
 * Genera archivos físicos para mantener la base de datos optimizada.
 */
function guardarArchivoReunion(data) {
    // Asegurar que el nombre de archivo sea seguro
    const safeTitle = data.title.replace(/[/\\?%*:|"<>]/g, '-');
    const safeDate = data.date.split('T')[0];
    
    const fileName = `${safeDate}_${safeTitle}.txt`;
    const directory = path.join(__dirname, '..', 'repositorio_reuniones');
    const filePath = path.join(directory, fileName);

    const contenido = `Título: ${data.title}\n` +
                      `Fecha: ${data.date}\n` +
                      `ID: ${data.id}\n\n` +
                      `------------------------------------------\n` +
                      `TRANSCRIPCIÓN COMPLETA:\n` +
                      `------------------------------------------\n\n` +
                      `${data.fullText}`;

    try {
        // Crear directorio si no existe (por seguridad adicional)
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(filePath, contenido, 'utf8');
        console.log(`[Success] Archivo guardado en: ${filePath}`);
        
        return {
            status: 'success',
            path: filePath,
            fileName: fileName
        };
    } catch (error) {
        console.error(`[Error] Fallo al guardar archivo local: ${error.message}`);
        return {
            status: 'error',
            message: error.message
        };
    }
}

// Exportación para uso en nodos de automatización
module.exports = { guardarArchivoReunion };
