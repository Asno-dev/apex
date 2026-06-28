/**
 * Bud Desktop Computer-Use Agent
 * Exposes a REST API for the AI agent to control the virtual desktop.
 * Supports: screenshot, mouse move/click, keyboard input, file ops, shell exec, app launch.
 */

const express = require('express');
const { execSync, exec } = require('child_process');
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

const DISPLAY = process.env.DISPLAY || ':1';

// Detect the correct Firefox binary
function getFirefoxBin() {
  try { execSync('which firefox-esr', { encoding: 'utf8' }); return 'firefox-esr'; } catch {}
  try { execSync('which firefox', { encoding: 'utf8' }); return 'firefox'; } catch {}
  return null;
}

const FIREFOX_BIN = getFirefoxBin();

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const apps = {};
  try { execSync('which firefox-esr || which firefox', { encoding: 'utf8' }); apps.firefox = true; } catch { apps.firefox = false; }
  try { execSync('which code', { encoding: 'utf8' }); apps.vscode = true; } catch { apps.vscode = false; }
  try { execSync('which libreoffice', { encoding: 'utf8' }); apps.libreoffice = true; } catch { apps.libreoffice = false; }
  try { execSync('which xfce4-terminal', { encoding: 'utf8' }); apps.terminal = true; } catch { apps.terminal = false; }
  try { execSync('which thunar', { encoding: 'utf8' }); apps.filemanager = true; } catch { apps.filemanager = false; }

  res.json({ status: 'ok', display: DISPLAY, apps });
});

// ── Computer-use actions ──────────────────────────────────────────────────────
app.post('/computer-use', async (req, res) => {
  const { action, coordinates, text, button, clickCount, keys, command, path: filePath, content } = req.body;
  console.log(`[action] ${action}`, JSON.stringify(req.body).slice(0, 200));

  try {
    switch (action) {

      case 'screenshot': {
        const tmp = '/tmp/vibe_screenshot.png';
        execSync(`DISPLAY=${DISPLAY} import -window root ${tmp}`);
        const img = fs.readFileSync(tmp, { encoding: 'base64' });
        return res.json({ image: img });
      }

      case 'move_mouse': {
        execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${coordinates.x} ${coordinates.y}`);
        break;
      }

      case 'click_mouse': {
        const btn = button === 'right' ? 3 : button === 'middle' ? 2 : 1;
        const count = clickCount || 1;
        if (coordinates) execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${coordinates.x} ${coordinates.y}`);
        for (let i = 0; i < count; i++) execSync(`DISPLAY=${DISPLAY} xdotool click ${btn}`);
        break;
      }

      case 'double_click': {
        if (coordinates) execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${coordinates.x} ${coordinates.y}`);
        execSync(`DISPLAY=${DISPLAY} xdotool click --repeat 2 --delay 100 1`);
        break;
      }

      case 'drag': {
        const { from, to } = req.body;
        execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${from.x} ${from.y}`);
        execSync(`DISPLAY=${DISPLAY} xdotool mousedown 1`);
        execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${to.x} ${to.y}`);
        execSync(`DISPLAY=${DISPLAY} xdotool mouseup 1`);
        break;
      }

      case 'scroll': {
        if (coordinates) execSync(`DISPLAY=${DISPLAY} xdotool mousemove ${coordinates.x} ${coordinates.y}`);
        const scrollBtn = req.body.direction === 'up' ? 4 : 5;
        const amount = Math.abs(req.body.amount || 3);
        for (let i = 0; i < amount; i++) execSync(`DISPLAY=${DISPLAY} xdotool click ${scrollBtn}`);
        break;
      }

      case 'type_text': {
        const safe = text.replace(/'/g, "'\\''");
        execSync(`DISPLAY=${DISPLAY} xdotool type --clearmodifiers --delay 20 '${safe}'`);
        break;
      }

      case 'type_keys': {
        const keyStr = Array.isArray(keys) ? keys.join('+') : keys;
        execSync(`DISPLAY=${DISPLAY} xdotool key --clearmodifiers ${keyStr}`);
        break;
      }

      case 'key_combo': {
        const combo = Array.isArray(keys) ? keys.join('+') : keys;
        execSync(`DISPLAY=${DISPLAY} xdotool key --clearmodifiers ${combo}`);
        break;
      }

      case 'shell_exec': {
        const result = execSync(command, {
          env: { ...process.env, DISPLAY },
          timeout: 30000,
          encoding: 'utf8',
        });
        return res.json({ output: result });
      }

      case 'file_read': {
        const data = fs.readFileSync(filePath, 'utf8');
        return res.json({ content: data });
      }

      case 'file_write': {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf8');
        return res.json({ success: true });
      }

      case 'open_app': {
        const appName = req.body.app;
        const appMap = {
          firefox:   FIREFOX_BIN || 'firefox',
          vscode:    'code --no-sandbox --user-data-dir=/home/vibeagent/.vscode-data',
          code:      'code --no-sandbox --user-data-dir=/home/vibeagent/.vscode-data',
          terminal:  'xfce4-terminal',
          writer:    'libreoffice --writer',
          calc:      'libreoffice --calc',
          impress:   'libreoffice --impress',
          libreoffice: 'libreoffice',
          files:     'thunar',
          filemanager: 'thunar',
          home:      'thunar /home/vibeagent',
          filesystem: 'thunar /',
          gedit:     'gedit',
          mousepad:  'mousepad',
        };
        const cmd = appMap[appName?.toLowerCase()] || appName;

        // Check if the binary exists before trying to launch
        const binary = cmd.split(' ')[0];
        try {
          execSync(`which ${binary}`, { encoding: 'utf8' });
        } catch {
          return res.status(400).json({ error: `Application '${appName}' (binary: ${binary}) is not installed.` });
        }

        exec(`DISPLAY=${DISPLAY} ${cmd} &`, {
          env: { ...process.env, DISPLAY, DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS || '' }
        });
        return res.json({ success: true, launched: cmd });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[error]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Task queue (for compatibility) ────────────────────────────────────────────
const tasks = [];
app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => {
  const task = { id: Date.now(), title: req.body.title, status: 'in-progress', createdAt: new Date() };
  tasks.unshift(task);
  setTimeout(() => { task.status = 'completed'; }, 5000);
  res.json(task);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Bud Desktop Agent listening on :${PORT}`));
