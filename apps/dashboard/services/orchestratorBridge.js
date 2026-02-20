const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Orchestrator Bridge
 * Allows the Second Brain to "act" on the system.
 */

const ALLOWED_COMMANDS_DIR = path.join(__dirname, '..', '..', '..', 'agents', 'execution');

// Ensure execution dir exists for custom scripts
if (!fs.existsSync(ALLOWED_COMMANDS_DIR)) {
    try {
        fs.mkdirSync(ALLOWED_COMMANDS_DIR, { recursive: true });
    } catch (e) { console.error("Could not create execution dir:", e); }
}

async function executeCommand(command, args = []) {
    // 1. Sanitize: For now, we only allow specific known commands or scripts in the safe dir
    // This is a basic security measure.

    // Example commands supported:
    // - "open-project": opens a folder
    // - "start-server": runs a bat file

    console.log(`[Orchestrator] Request: ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        let cmdStr = '';

        if (command === 'open-project') {
            // Windows specific: explorer
            const targetPath = args[0]; // expecting absolute path or relative to project
            if (!targetPath) return reject('No path provided');
            cmdStr = `start "" "${targetPath}"`;
        } else if (command === 'run-script') {
            const scriptName = args[0];
            // Security check against directory traversal
            if (scriptName.includes('..') || scriptName.includes('/') || scriptName.includes('\\')) {
                return reject('Invalid script name');
            }
            const fullPath = path.join(ALLOWED_COMMANDS_DIR, scriptName);
            if (!fs.existsSync(fullPath)) return reject('Script not found');
            cmdStr = `"${fullPath}"`;
        } else {
            return reject(`Unknown command: ${command}`);
        }

        exec(cmdStr, (error, stdout, stderr) => {
            if (error) {
                console.warn(`[Orchestrator] Exec error: ${error.message}`);
                return resolve({ success: false, error: error.message });
            }
            resolve({ success: true, output: stdout });
        });
    });
}

module.exports = { executeCommand };
