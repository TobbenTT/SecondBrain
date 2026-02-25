// Test: guardar metadata de Fireflies a un archivo para inspección
require('dotenv').config();
const https = require('https');
const fs = require('fs');

const query = JSON.stringify({
    query: `{ transcript(id: "01KHWN3KEBYV2308THKE6785TV") { 
        title 
        participants 
        summary { overview action_items shorthand_bullet } 
    } }`
});

const opts = {
    hostname: 'api.fireflies.ai',
    path: '/graphql',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + process.env.FIREFLIES_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(query)
    }
};

const req = https.request(opts, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        try {
            const d = JSON.parse(body);
            const t = d.data && d.data.transcript;
            if (!t) {
                fs.writeFileSync('_debug_fireflies.txt', 'NO DATA: ' + body.substring(0, 1000));
                return;
            }
            let output = '';
            output += '=== TITLE ===\n' + t.title + '\n\n';
            output += '=== PARTICIPANTS ===\n' + JSON.stringify(t.participants, null, 2) + '\n\n';
            output += '=== OVERVIEW ===\n' + (t.summary?.overview || '(null)') + '\n\n';
            output += '=== ACTION_ITEMS ===\n' + (t.summary?.action_items || '(null)') + '\n\n';
            output += '=== SHORTHAND_BULLET ===\n' + (t.summary?.shorthand_bullet || '(null)') + '\n\n';

            fs.writeFileSync('_debug_fireflies.txt', output, 'utf-8');
            console.log('Saved to _debug_fireflies.txt');
        } catch (e) {
            fs.writeFileSync('_debug_fireflies.txt', 'PARSE ERROR: ' + e.message + '\n' + body.substring(0, 2000));
        }
    });
});

req.on('error', (e) => {
    fs.writeFileSync('_debug_fireflies.txt', 'REQUEST ERROR: ' + e.message);
});
req.write(query);
req.end();
