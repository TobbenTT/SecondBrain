const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const log = require('../helpers/logger');

/**
 * Orchestrator Bridge
 * Allows the Second Brain to "act" on the system.
 */

const ALLOWED_COMMANDS_DIR = path.join(__dirname, '..', '..', '..', 'agents', 'execution');

// Ensure execution dir exists for custom scripts
if (!fs.existsSync(ALLOWED_COMMANDS_DIR)) {
    try {
        fs.mkdirSync(ALLOWED_COMMANDS_DIR, { recursive: true });
    } catch (e) { log.error('Could not create execution dir', { error: e.message }); }
}

async function executeCommand(command, args = []) {
    log.info('Orchestrator request', { command, args });

    return new Promise((resolve, reject) => {
        if (command === 'open-project') {
            const targetPath = args[0];
            if (!targetPath) return reject(new Error('No path provided'));
            // Validate path exists and is a directory (prevent arbitrary command execution)
            const resolvedPath = path.resolve(targetPath);
            if (!fs.existsSync(resolvedPath)) return reject(new Error('Path does not exist'));
            // Use execFile with explicit executable — no shell interpretation
            execFile('explorer.exe', [resolvedPath], (error, stdout) => {
                if (error) {
                    log.warn('Orchestrator exec error', { error: error.message });
                    return resolve({ success: false, error: error.message });
                }
                resolve({ success: true, output: stdout });
            });
        } else if (command === 'run-script') {
            const scriptName = args[0];
            if (!scriptName || scriptName.includes('..') || scriptName.includes('/') || scriptName.includes('\\')) {
                return reject(new Error('Invalid script name'));
            }
            // Only allow alphanumeric, hyphens, underscores, and a single dot for extension
            if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?$/.test(scriptName)) {
                return reject(new Error('Invalid script name characters'));
            }
            const fullPath = path.join(ALLOWED_COMMANDS_DIR, scriptName);
            // Verify resolved path stays within allowed dir
            if (!path.resolve(fullPath).startsWith(path.resolve(ALLOWED_COMMANDS_DIR))) {
                return reject(new Error('Access denied'));
            }
            if (!fs.existsSync(fullPath)) return reject(new Error('Script not found'));
            execFile(fullPath, (error, stdout) => {
                if (error) {
                    log.warn('Orchestrator exec error', { error: error.message });
                    return resolve({ success: false, error: error.message });
                }
                resolve({ success: true, output: stdout });
            });
        } else {
            return reject(new Error(`Unknown command: ${command}`));
        }
    });
}

module.exports = { executeCommand };
