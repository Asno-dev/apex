import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

const APEX_DIR = path.resolve(process.cwd(), '..');
const CONFIG_FILE = path.join(APEX_DIR, '.composio-config.json');

function readConfig(): Record<string, any> {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read config file:', e);
  }
  return {};
}

function writeConfig(config: Record<string, any>) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`Config saved to ${CONFIG_FILE} — connectedTools:`, config.connectedTools?.length || 0);
  } catch (e) {
    console.error('Failed to write config file:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

  app.use(express.json({ limit: '1mb' }));

  // ── APEX Config Endpoints ──────────────────────────────────

  // Save composio config (called from webapp)
  app.post('/api/apex/config', (req, res) => {
    try {
      const { apiKey, userId, connectedTools, toolConfigs } = req.body;
      const config = readConfig();
      if (apiKey !== undefined) config.apiKey = apiKey;
      if (userId !== undefined) config.userId = userId;
      if (connectedTools !== undefined) config.connectedTools = connectedTools;
      if (toolConfigs !== undefined) config.toolConfigs = toolConfigs;
      config.updatedAt = new Date().toISOString();
      writeConfig(config);
      res.json({ ok: true, saved: true });
    } catch (error: any) {
      console.error('POST /api/apex/config error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Read composio config (for APEX agents)
  app.get('/api/apex/config', (req, res) => {
    try {
      const config = readConfig();
      if (config.apiKey && !req.query.raw) {
        config.apiKey = config.apiKey.substring(0, 8) + '...';
      }
      res.json(config);
    } catch (error: any) {
      res.json({});
    }
  });

  // Get connected tools list (for APEX agents, returns full info)
  app.get('/api/apex/connected-tools', (req, res) => {
    try {
      const config = readConfig();
      res.json({
        connectedTools: config.connectedTools || [],
        hasApiKey: !!config.apiKey,
        hasUserId: !!config.userId,
      });
    } catch (error: any) {
      res.json({ connectedTools: [], hasApiKey: false });
    }
  });

  // Sync connected tools by querying the Composio backend API directly
  app.post('/api/apex/sync', async (req, res) => {
    try {
      const config = readConfig();
      const apiKey = config.apiKey;
      const userId = config.userId;
      if (!apiKey || !userId) {
        return res.json({ connectedTools: config.connectedTools || [], synced: false, reason: 'no api key or user id' });
      }

      const response = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts?user_uuid=${userId}`, {
        headers: { 'x-api-key': apiKey },
      });
      if (!response.ok) {
        return res.json({ connectedTools: config.connectedTools || [], synced: false, reason: `API error ${response.status}` });
      }

      const data = await response.json();
      const accounts = (data.items || []) as any[];
      const slugs = accounts
        .filter((a: any) => a.status === 'ACTIVE' || a.status === 'active' || a.status === 'connected' || a.status === 'INITIATED')
        .map((a: any) => (a.appName || a.appUniqueId || '').toLowerCase())
        .filter(Boolean);

      config.connectedTools = [...new Set([...(config.connectedTools || []), ...slugs])];
      config.updatedAt = new Date().toISOString();
      writeConfig(config);

      res.json({ connectedTools: config.connectedTools, synced: true, found: slugs.length });
    } catch (error: any) {
      const config = readConfig();
      res.json({ connectedTools: config.connectedTools || [], synced: false, reason: error.message });
    }
  });

  // Proxy Composio API calls to avoid CORS issues
  app.all('/api/composio/*', async (req, res) => {
    try {
      const targetPath = req.path.replace('/api/composio/', '');
      const targetUrl = `https://backend.composio.dev/${targetPath}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (req.headers['x-api-key']) {
        headers['x-api-key'] = req.headers['x-api-key'] as string;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: error.message || 'Proxy request failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<html><body><h1>APEX Composio</h1><p>Build dist/index.html not found. Run npm run build.</p></body></html>');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   APEX Composio Tool Connectors         ║`);
    console.log(`  ║   Running at: http://localhost:${PORT}        ║`);
    console.log(`  ║   Config: ${path.basename(CONFIG_FILE)}              ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
}

startServer();
