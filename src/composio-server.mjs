#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APEX_DIR = join(__dirname, '..')
const CONFIG_FILE = join(APEX_DIR, '.composio-config.json')
const COMPOSIO_API = 'https://backend.composio.dev/api/v3.1'

let config = {}
try {
  if (existsSync(CONFIG_FILE)) {
    config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
  }
} catch {}

const apiKey = config.apiKey || ''
const userId = config.userId || ''
const connections = config.connections || []
const connectedTools = config.connectedTools || []
const toolConfigs = config.toolConfigs || {}

// Build toolkit list from connections (new format) and legacy format
const registeredTools = new Map()
for (const c of connections) {
  registeredTools.set(c.tool, { id: c.id, status: c.status })
}
for (const t of connectedTools) {
  if (!registeredTools.has(t)) registeredTools.set(t, { id: toolConfigs[t] || '' })
}

const TOOLKIT_CONFIG = {}
const SLUG_MAP = {
  'google-calendar': 'googlecalendar',
  'google-drive': 'googledrive',
  'google-sheets': 'googlesheets',
  'google-docs': 'googledocs',
  'microsoft-teams': 'microsoft_teams',
  'one-drive': 'one_drive',
  'share-point': 'share_point',
}

for (const [tool] of registeredTools) {
  const searchName = (SLUG_MAP[tool] || tool).toUpperCase()
  TOOLKIT_CONFIG[tool] = {
    search: searchName,
    prefix: searchName.replace(/[^A-Z0-9_]/g, '_')
  }
}

// Legacy hardcoded entries (always available)
if (!TOOLKIT_CONFIG.gmail) TOOLKIT_CONFIG.gmail = { search: 'GMAIL', prefix: 'GMAIL' }
if (!TOOLKIT_CONFIG['google-calendar']) TOOLKIT_CONFIG['google-calendar'] = { search: 'GOOGLECALENDAR', prefix: 'GOOGLECALENDAR' }
if (!TOOLKIT_CONFIG.googlecalendar) TOOLKIT_CONFIG.googlecalendar = { search: 'GOOGLECALENDAR', prefix: 'GOOGLECALENDAR' }

let toolsCache = null

async function fetchToolsForToolkit(searchTerm, prefix) {
  const result = []
  let cursor = null

  for (let i = 0; i < 20; i++) {
    const params = cursor
      ? `search=${encodeURIComponent(searchTerm)}&cursor=${encodeURIComponent(cursor)}`
      : `search=${encodeURIComponent(searchTerm)}`

    const res = await fetch(`${COMPOSIO_API}/tools?${params}`, {
      headers: { 'x-api-key': apiKey }
    })
    if (!res.ok) break

    const data = await res.json()
    const items = (data.items || []).filter(t => t.slug && t.slug.startsWith(prefix))
    result.push(...items)

    cursor = data.next_cursor
    if (!cursor) break
  }

  return result
}

async function loadTools() {
  if (toolsCache) return toolsCache
  if (!apiKey) {
    toolsCache = []
    return toolsCache
  }

  const allTools = []

  for (const [toolkit] of registeredTools) {
    const tkConfig = TOOLKIT_CONFIG[toolkit] || {
      search: toolkit.toUpperCase(),
      prefix: toolkit.toUpperCase().replace(/-/g, '').replace(/[^A-Z0-9_]/g, '_')
    }

    const tools = await fetchToolsForToolkit(tkConfig.search, tkConfig.prefix)
    const info = registeredTools.get(toolkit)
    const connId = info?.id || toolConfigs[toolkit] || ''

    for (const t of tools) {
      const props = { ...(t.input_parameters?.properties || {}) }

      allTools.push({
        name: t.slug,
        description: `[${toolkit}] ${(t.description || t.slug).replace(/<[^>]*>/g, '')}`,
        inputSchema: {
          type: 'object',
          properties: props
        }
      })
    }
  }

  toolsCache = allTools
  return toolsCache
}

async function executeTool(toolSlug, args) {
  const body = {
    ...(userId ? { entity_id: userId } : {}),
    connected_account_id: '',
    arguments: args || {},
    version: 'latest'
  }

  const res = await fetch(`${COMPOSIO_API}/tools/execute/${toolSlug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Composio error (${res.status}): ${err}`)
  }

  return await res.json()
}

const serverInfo = {
  name: 'apex-composio',
  version: '1.0.0',
  description: 'Composio MCP — tools for Gmail, Google Calendar, and more'
}

function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n')
}

function parseMessage(line) {
  try { return JSON.parse(line.trim()) } catch { return null }
}

function createErrorResponse(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

function createSuccessResponse(id, result) {
  return { jsonrpc: '2.0', id, result }
}

async function handleRequest(msg) {
  const { id, method, params } = msg

  switch (method) {
    case 'initialize':
      return createSuccessResponse(id, {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo
      })

    case 'notifications/initialized':
      return null

    case 'ping':
      return createSuccessResponse(id, {})

    case 'tools/list': {
      try {
        const tools = await loadTools()
        return createSuccessResponse(id, { tools })
      } catch (e) {
        return createErrorResponse(id, -32603, `Failed to load tools: ${e.message}`)
      }
    }

    case 'tools/call': {
      const { name, arguments: args } = params
      try {
        const result = await executeTool(name, args)
        return createSuccessResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        })
      } catch (e) {
        return createErrorResponse(id, -32603, `Tool execution failed: ${e.message}`)
      }
    }

    default:
      return createErrorResponse(id, -32601, `Method not found: ${method}`)
  }
}

let buffer = ''
process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString()
  const parts = buffer.split('\n')
  buffer = parts.pop()
  for (const line of parts) {
    const msg = parseMessage(line)
    if (msg) {
      const response = await handleRequest(msg)
      if (response) sendMessage(response)
    }
  }
})

process.stdin.on('end', () => {
  if (buffer.trim()) {
    const msg = parseMessage(buffer)
    if (msg) {
      handleRequest(msg).then(response => {
        if (response) sendMessage(response)
      })
    }
  }
})

process.on('uncaughtException', (err) => {
  console.error(`[apex-composio] Error: ${err.message}`)
})
