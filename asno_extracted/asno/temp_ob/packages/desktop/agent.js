const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const DISPLAY = ':1';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'desktop-agent', version: '2.0.0' });
});

// Also support root path for health checks
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'desktop-agent' });
});

app.post('/computer-use', async (req, res) => {
    const { action, coordinates, text, button, clickCount, keys, command, app: appName, from, to } = req.body;
    console.log(`Executing action: ${action}`, req.body);

    try {
        switch (action) {
            case 'screenshot':
                const screenshotPath = '/tmp/screenshot.png';
                execSync(`DISPLAY=${DISPLAY} import -window root ${screenshotPath}`);
                const imageBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });
                return res.json({ image: imageBase64 });

            case 'move_mouse':
                execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${coordinates.x} ${coordinates.y}`);
                break;

            case 'click_mouse':
                const btn = button === 'right' ? 3 : (button === 'middle' ? 2 : 1);
                for (let i = 0; i < (clickCount || 1); i++) {
                    execSync(`DISPLAY=${DISPLAY} xdotool click ${btn}`);
                }
                break;

            case 'double_click':
                execSync(`DISPLAY=${DISPLAY} xdotool click --repeat 2 1`);
                break;

            case 'type_text':
                // Use xclip for better text handling (to avoid special char issues)
                execSync(`echo "${text.replace(/"/g, '\\"')}" | DISPLAY=${DISPLAY} xclip -selection clipboard`);
                execSync(`DISPLAY=${DISPLAY} xdotool key ctrl+v`);
                break;

            case 'type_keys':
                execSync(`DISPLAY=${DISPLAY} xdotool key ${keys.join(' ')}`);
                break;

            case 'key_combo':
                execSync(`DISPLAY=${DISPLAY} xdotool key ${keys.join('+')}`);
                break;

            case 'scroll':
                const scrollAmount = Math.max(1, Math.min(10, Math.abs(coordinates?.y || 3)));
                const direction = coordinates?.y > 0 ? 'down' : 'up';
                execSync(`DISPLAY=${DISPLAY} xdotool click --repeat ${scrollAmount} ${direction === 'down' ? 5 : 4}`);
                break;

            case 'open_app':
                // Map app names to commands
                const appCommands = {
                    'firefox': 'firefox',
                    'vscode': 'code',
                    'code': 'code',
                    'terminal': 'xfce4-terminal',
                    'thunar': 'thunar',
                    'files': 'thunar',
                    'writer': 'libreoffice --writer',
                    'calc': 'libreoffice --calc',
                    'impress': 'libreoffice --impress',
                    'libreoffice': 'libreoffice',
                    'home': 'thunar /home/vibeagent',
                };
                const cmd = appCommands[appName?.toLowerCase()] || appName;
                execSync(`DISPLAY=${DISPLAY} ${cmd} &`);
                // Wait for app to start
                await new Promise(r => setTimeout(r, 2000));
                return res.json({ launched: appName });

            case 'drag':
                // Move to start position, press button, move to end, release
                execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${from.x} ${from.y}`);
                execSync(`DISPLAY=${DISPLAY} mousedown 1`);
                execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${to.x} ${to.y}`);
                execSync(`DISPLAY=${DISPLAY} mouseup 1`);
                break;

            case 'shell_exec':
                // Execute a shell command
                const shellOutput = execSync(command, { cwd: '/home/vibeagent', encoding: 'utf8' });
                return res.json({ output: shellOutput });

            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Action failed', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Desktop Agent listening on port ${PORT}`);
});
