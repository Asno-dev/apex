#!/usr/bin/env node

import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APEX_DIR = resolve(dirname(__dirname), '..')
const CONFIG_FILE = join(APEX_DIR, '.composio-config.json')

const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3.1'

const serverInfo = {
  name: "apex-composio",
  version: "2.0.0",
  description: "APEX Composio — execute connected external tools (Gmail, GitHub, Slack, etc.) via official SDK"
}

let ComposioSdk
try {
  const mod = await import('@composio/core')
  ComposioSdk = mod.Composio
} catch (e) {
  ComposioSdk = null
}

const TOOL_NAMES = {
  gmail: 'Gmail', github: 'GitHub', slack: 'Slack',
  'google-calendar': 'Google Calendar', 'google-drive': 'Google Drive',
  'google-sheets': 'Google Sheets', 'google-docs': 'Google Docs',
  notion: 'Notion', jira: 'Jira',
  linear: 'Linear', trello: 'Trello', confluence: 'Confluence',
  discord: 'Discord', outlook: 'Outlook', telegram: 'Telegram',
  whatsapp: 'WhatsApp', stripe: 'Stripe', hubspot: 'HubSpot',
  figma: 'Figma', firebase: 'Firebase', aws: 'AWS',
  vercel: 'Vercel', netlify: 'Netlify', sentry: 'Sentry',
  datadog: 'Datadog', pagerduty: 'PagerDuty', zoom: 'Zoom',
  'google-meet': 'Google Meet', 'microsoft-teams': 'Microsoft Teams',
  'asana': 'Asana', clickup: 'ClickUp', 'salesforce': 'Salesforce',
  zendesk: 'Zendesk', shopify: 'Shopify', twilio: 'Twilio',
  dropbox: 'Dropbox', bitbucket: 'Bitbucket', gitlab: 'GitLab',
  circleci: 'CircleCI', cloudflare: 'Cloudflare', datadog: 'Datadog',
  postman: 'Postman', airtable: 'Airtable', onedrive: 'OneDrive',
  sendgrid: 'SendGrid', mailchimp: 'Mailchimp', 'google-analytics': 'Google Analytics',
  instagram: 'Instagram', wordpress: 'WordPress', wix: 'Wix',
  squarespace: 'Squarespace', todoist: 'Todoist', monday: 'Monday.com',
  docker: 'Docker', 'github-actions': 'GitHub Actions',
  'google-ads': 'Google Ads', 'google-search-console': 'Google Search Console',
  'google-my-business': 'Google My Business', 'google-play': 'Google Play Console',
  'google-cloud': 'Google Cloud', 'google-forms': 'Google Forms',
  'google-keep': 'Google Keep', 'google-tasks': 'Google Tasks',
  'google-photos': 'Google Photos', 'google-contacts': 'Google Contacts',
  'google-translate': 'Google Translate', hubstaff: 'Hubstaff',
  clockify: 'Clockify', toggl: 'Toggl', harvest: 'Harvest',
  xero: 'Xero', quickbooks: 'QuickBooks', freshbooks: 'FreshBooks',
  stripe: 'Stripe', braintree: 'Braintree', paypal: 'PayPal',
  square: 'Square', razorpays: 'Razorpay', wise: 'Wise',
  plaid: 'Plaid', coinbase: 'Coinbase', binance: 'Binance',
  kraken: 'Kraken', metamask: 'MetaMask', openai: 'OpenAI',
  anthropic: 'Anthropic', replicate: 'Replicate', huggingface: 'Hugging Face',
  stability: 'Stability AI', elevenlabs: 'ElevenLabs', assembly: 'AssemblyAI',
  deepgram: 'Deepgram', spotify: 'Spotify', youtube: 'YouTube',
  vimeo: 'Vimeo', twitch: 'Twitch', tiktok: 'TikTok',
  pinterest: 'Pinterest', reddit: 'Reddit', linkedin: 'LinkedIn',
  facebook: 'Facebook', twitter: 'Twitter / X', medium: 'Medium',
  producthunt: 'Product Hunt', crunchbase: 'Crunchbase', pitchbook: 'PitchBook',
  apollo: 'Apollo.io', lusha: 'Lusha', clearbit: 'Clearbit',
  hubspot: 'HubSpot', salesforce: 'Salesforce', pipedrive: 'Pipedrive',
  'close-crm': 'Close CRM', 'zoho-crm': 'Zoho CRM', 'freshsales': 'Freshsales',
  'hubstaff': 'Hubstaff', 'monday': 'Monday.com', 'clickup': 'ClickUp',
  'asana': 'Asana', 'wrike': 'Wrike', 'teamwork': 'Teamwork',
  'basecamp': 'Basecamp', 'notion': 'Notion', 'confluence': 'Confluence',
  'onedrive': 'OneDrive', 'dropbox': 'Dropbox', 'box': 'Box',
  'egnyte': 'Egnyte', 'sharepoint': 'SharePoint', 'googledrive': 'Google Drive',
  's3': 'Amazon S3', 'r2': 'Cloudflare R2', 'wasabi': 'Wasabi',
  'backblaze': 'Backblaze B2', dnsimple: 'DNSimple', statuspage: 'Statuspage',
  'planet-scale': 'PlanetScale', 'supabase-db': 'Supabase Database',
  here: 'HERE Technologies', perplexity: 'Perplexity AI',
  groq: 'Groq Cloud', claude: 'Claude (Anthropic)',
  gcm: 'Google Cloud Messaging', messenger: 'Messenger',
  brevo: 'Brevo (Sendinblue)', pusher: 'Pusher Beams'
}

function resolve(start, rel) {
  const parts = (rel.startsWith('/') ? rel : join(start, rel)).split(/[\\/]/)
  const result = []
  for (const p of parts) {
    if (p === '.' || p === '') continue
    if (p === '..') result.pop()
    else result.push(p)
  }
  return result.join('/')
}

function readConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    }
  } catch {}
  return {}
}

let sdkInstance = null

function getSdk() {
  if (sdkInstance) return sdkInstance
  if (!ComposioSdk) return null
  const config = readConfig()
  if (config.apiKey) {
    process.env.COMPOSIO_API_KEY = config.apiKey
  }
  sdkInstance = new ComposioSdk()
  return sdkInstance
}

let actionsCache = {}
let cacheTimestamp = 0
const CACHE_TTL = 60000

async function refreshActions(userId) {
  const sdk = getSdk()
  if (!sdk || !userId) {
    actionsCache = {}
    cacheTimestamp = Date.now()
    return
  }
  try {
    const connectedAccounts = await sdk.connectedAccounts.list({ userIds: [userId] })
    const connectedToolkits = [...new Set((connectedAccounts.items || []).map(i => i.toolkit?.slug).filter(Boolean))]
    const result = {}
    for (const toolkitSlug of connectedToolkits) {
      try {
        const tkTools = await sdk.tools.get(userId, { toolkits: [toolkitSlug], limit: 1000 })
        const actionNames = Object.values(tkTools)
          .filter(t => t?.type === 'function' && t?.function?.name)
          .map(t => t.function.name)
        result[toolkitSlug] = actionNames
      } catch {
        result[toolkitSlug] = []
      }
    }
    actionsCache = result
    cacheTimestamp = Date.now()
  } catch {
    actionsCache = {}
    cacheTimestamp = Date.now()
  }
}

function getToolActions(tool) {
  return actionsCache[tool] || []
}

async function ensureActionsFresh(userId) {
  if (!userId) return
  if (Date.now() - cacheTimestamp > CACHE_TTL || !actionsCache[userId]) {
    await refreshActions(userId)
  }
}

function createErrorResponse(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } }
}

function createSuccessResponse(id, result) {
  return { jsonrpc: "2.0", id, result }
}

function getToolsForMCP() {
  const config = readConfig()
  const connected = config.connectedTools || []
  const allTools = [
    {
      name: "composio_connected",
      description: "List all currently connected Composio tools (from 1000+ available). Only shows tools the user has actually connected.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "composio_execute",
      description: "Execute ANY connected Composio tool (1000+ available). Use pattern {TOOLKIT}_{ACTION}. Run composio_actions to discover patterns.",
      inputSchema: {
        type: "object",
        properties: {
          tool: {
            type: "string",
            description: "Toolkit slug (e.g. gmail, github, slack). Run composio_connected first."
          },
          action: {
            type: "string",
            description: "Full action slug (e.g. GMAIL_FETCH_EMAILS, GITHUB_CREATE_ISSUE) or short name. Pattern: {TOOLKIT}_{VERB}_{NOUN}"
          },
          args: {
            type: "object",
            description: "Tool-specific parameters as key-value pairs",
            properties: {}
          }
        },
        required: ["tool", "action"]
      }
    },
    {
      name: "composio_sync",
      description: "Force sync connected tools from the Composio backend. Run this if you just connected a tool and it doesn't show up yet.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "composio_actions",
      description: "Get available actions for a connected tool. Run composio_connected first to get the tool slug, then use this to discover what actions are possible.",
      inputSchema: {
        type: "object",
        properties: {
          tool: {
            type: "string",
            description: "Tool slug (e.g. gmail, github, slack)"
          }
        },
        required: ["tool"]
      }
    },
    {
      name: "composio_mentions",
      description: "Get the list of @mention tags for all connected tools. These are the @tool names users can use to invoke tools (e.g. @gmail, @github, @slack).",
      inputSchema: { type: "object", properties: {} }
    }
  ]

  if (connected.length > 0) {
    allTools.push({
      name: "composio_connected_details",
      description: "Show detailed info about all connected tools including their capabilities",
      inputSchema: { type: "object", properties: {} }
    })
  }

  return allTools
}

function toFullSlug(tool, action) {
  const upper = tool.toUpperCase()
  const act = action.toUpperCase()
  if (act.startsWith(upper + '_')) return act
  return `${upper}_${act}`
}

async function composioRestExecute(tool, action, args, apiKey, userId) {
  const toolSlug = toFullSlug(tool, action)
  const requestBody = JSON.stringify({
    user_id: userId,
    arguments: args || {}
  })

  let response
  try {
    response = await fetch(`${COMPOSIO_API_BASE}/tools/execute/${encodeURIComponent(toolSlug)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: requestBody
    })
  } catch (fetchErr) {
    throw new Error(`Network error calling Composio API: ${fetchErr.message}`)
  }

  if (!response.ok) {
    let errMsg = `Execution failed (HTTP ${response.status})`
    try {
      const errData = await response.json()
      if (typeof errData === 'object') {
        errMsg = errData.message || (typeof errData.error === 'string' ? errData.error : errData.error?.message || JSON.stringify(errData.error)) || errData.detail || JSON.stringify(errData)
      } else {
        errMsg = String(errData)
      }
    } catch {
      try { errMsg = await response.text() } catch {}
    }
    throw new Error(errMsg)
  }

  let result
  try {
    result = await response.json()
  } catch (jsonErr) {
    throw new Error(`Failed to parse API response: ${jsonErr.message}`)
  }

  if (result.successful === false && result.error) {
    const errObj = typeof result.error === 'string' ? result.error : result.error.message || result.error.error || JSON.stringify(result.error)
    throw new Error(`API error: ${errObj}`)
  }

  return result.data || result.response || result
}

async function composioValidateSdk(tool, action) {
  const sdk = getSdk()
  if (!sdk) return null
  const config = readConfig()
  const userId = config.userId
  if (!userId) return null

  const slug = toFullSlug(tool, action)

  try {
    const tools = await sdk.tools.get(userId, { toolkits: [tool], limit: 1000 })
    const validSlugs = Object.values(tools)
      .filter(t => t?.type === 'function' && t?.function?.name)
      .map(t => t.function.name)

    if (validSlugs.length === 0) return null

    if (!validSlugs.includes(slug)) {
      const similar = validSlugs.filter(s => s.includes(action.toUpperCase()) || action.toUpperCase().includes(s.split('_').pop()))
      const hint = similar.length > 0
        ? `Did you mean one of: ${similar.slice(0, 5).join(', ')}?`
        : `Available actions: ${validSlugs.slice(0, 20).join(', ')}${validSlugs.length > 20 ? `... (${validSlugs.length} total)` : ''}`
      throw new Error(`Action "${slug}" not found for tool "${tool}". ${hint}`)
    }

    return { valid: true, slug, validSlugs }
  } catch (err) {
    if (err.message && (
      err.message.includes('not found') ||
      err.message.includes('not available')
    )) throw err
    return null
  }
}

async function composioExecute(tool, action, args) {
  const config = readConfig()
  const apiKey = config.apiKey
  const userId = config.userId

  if (!apiKey) {
    throw new Error('Composio API key not set. Run the webapp at http://localhost:3001 to configure.')
  }

  const validation = await composioValidateSdk(tool, action)
  if (validation && validation.valid === false) {
    throw new Error(`Action "${validation.slug}" not found for tool "${tool}". Check available actions with composio_actions({ tool: "${tool}" }).`)
  }

  return await composioRestExecute(tool, action, args, apiKey, userId)
}

async function composioSync() {
  const config = readConfig()
  const apiKey = config.apiKey
  const userId = config.userId

  let slugsFromApi = []

  if (getSdk() && userId) {
    try {
      const sdk = getSdk()
      const connectedAccounts = await sdk.connectedAccounts.list({ userIds: [userId] })
      slugsFromApi = [...new Set((connectedAccounts.items || []).map(i => i.toolkit?.slug).filter(Boolean))]
      await refreshActions(userId)
    } catch {}
  }

  try {
    if (apiKey && userId) {
      const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts?user_uuid=${userId}`, {
        headers: { 'x-api-key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        const accounts = (data.items || [])
        const apiSlugs = accounts
          .filter(a => a.status === 'ACTIVE' || a.status === 'active' || a.status === 'connected' || a.status === 'INITIATED')
          .map(a => (a.appName || a.appUniqueId || '').toLowerCase())
          .filter(Boolean)
        slugsFromApi = [...new Set([...slugsFromApi, ...apiSlugs])]
      }
    }
  } catch {}

  const merged = [...new Set([...(config.connectedTools || []), ...slugsFromApi])]
  config.connectedTools = merged
  config.updatedAt = new Date().toISOString()
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
  } catch {}
  return merged
}

function parseMessage(line) {
  try {
    return JSON.parse(line)
  } catch { return null }
}

function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n')
}

async function handleRequest(msg) {
  const { id, method, params } = msg
  const paramsObj = params || {}

  switch (method) {
    case "initialize":
      return createSuccessResponse(id, {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo
      })
    case "notifications/initialized":
      return null
    case "ping":
      return createSuccessResponse(id, {})
    case "tools/list":
      return createSuccessResponse(id, { tools: getToolsForMCP() })
    case "tools/call": {
      const { name, arguments: args } = paramsObj
      try {
        let result
        switch (name) {
          case "composio_connected": {
            const config = readConfig()
            const tools = config.connectedTools || []
            const sdk = getSdk()
            let dynamicActions = {}
            if (sdk && config.userId) {
              await ensureActionsFresh(config.userId)
              dynamicActions = actionsCache
            }
            result = {
              hasApiKey: !!config.apiKey,
              sdkAvailable: !!ComposioSdk,
              total: tools.length,
              tools: tools.map(slug => {
                const name = TOOL_NAMES[slug] || slug
                const actions = dynamicActions[slug] || getToolActions(slug)
                return {
                  slug,
                  name,
                  description: `Connected ${name} tool — ${actions.length} actions available`,
                  actionCount: actions.length,
                  exampleAction: actions[0] || null
                }
              }),
              hint: 'Run composio_actions({ tool: "slug" }) to see all actions for a tool'
            }
            break
          }
          case "composio_connected_details": {
            const config = readConfig()
            const tools = config.connectedTools || []
            const sdk = getSdk()
            let dynamicActions = {}
            if (sdk && config.userId) {
              await ensureActionsFresh(config.userId)
              dynamicActions = actionsCache
            }
            result = {
              hasApiKey: !!config.apiKey,
              sdkAvailable: !!ComposioSdk,
              total: tools.length,
              tools: tools.map(slug => {
                const name = TOOL_NAMES[slug] || slug
                const actions = dynamicActions[slug] || getToolActions(slug)
                return {
                  slug,
                  name,
                  description: `Connected ${name} tool`,
                  actionCount: actions.length,
                  exampleActions: actions.slice(0, 5)
                }
              })
            }
            break
          }
          case "composio_execute": {
            const { tool, action, args: toolArgs } = args
            if (!tool) throw new Error('tool is required')
            if (!action) throw new Error('action is required')
            const data = await composioExecute(tool, action, toolArgs || {})
            result = { executed: true, tool, action, data }
            break
          }
          case "composio_sync": {
            const tools = await composioSync()
            result = { synced: true, connectedTools: tools, total: tools.length }
            break
          }
          case "composio_actions": {
            const { tool } = args
            if (!tool) throw new Error('tool is required')
            const config = readConfig()
            const connected = config.connectedTools || []
            if (!connected.includes(tool)) throw new Error(`Tool "${tool}" is not connected. Connected tools: ${connected.join(', ')}`)
            const name = TOOL_NAMES[tool] || tool
            const prefix = tool.toUpperCase()

            const sdk = getSdk()
            let actions = []
            if (sdk && config.userId) {
              await ensureActionsFresh(config.userId)
              actions = actionsCache[tool] || []
            }

            if (actions.length === 0) {
              actions = getToolActions(tool)
            }

            const exampleSlug = actions[0] || `${prefix}_LIST_ITEMS`
            result = {
              tool,
              name,
              connected: true,
              sdkAvailable: !!ComposioSdk,
              actionSlugPattern: `${prefix}_VERB_NOUN`,
              totalActions: actions.length,
              actions,
              examples: actions.slice(0, 8),
              hint: `Use composio_execute({ tool: "${tool}", action: "${exampleSlug}", args: {...} })`
            }
            break
          }
          case "composio_mentions": {
            const config = readConfig()
            const tools = config.connectedTools || []
            const mentions = tools
              .filter(slug => TOOL_NAMES[slug])
              .map(slug => ({
                mention: `@${slug}`,
                slug,
                name: TOOL_NAMES[slug]
              }))
            result = {
              total: mentions.length,
              mentions,
              hint: `User can type @<tool> to invoke (e.g. ${mentions.slice(0, 5).map(m => m.mention).join(', ')})`
            }
            break
          }
          default:
            return createErrorResponse(id, -32602, `Unknown tool: ${name}`)
        }
        return createSuccessResponse(id, { content: [{ type: "text", text: JSON.stringify(result) }] })
      } catch (err) {
        return createErrorResponse(id, -32603, `Composio operation failed: ${err.message}`)
      }
    }
    default:
      return createErrorResponse(id, -32601, `Method not found: ${method}`)
  }
}

let buffer = ""
process.stdin.on("data", async (chunk) => {
  buffer += chunk.toString()
  const parts = buffer.split("\n")
  buffer = parts.pop()
  for (const line of parts) {
    const msg = parseMessage(line)
    if (msg) {
      const response = await handleRequest(msg)
      if (response) sendMessage(response)
    }
  }
})

process.stdin.on("end", () => {
  if (buffer.trim()) {
    const msg = parseMessage(buffer)
    if (msg) {
      handleRequest(msg).then(response => {
        if (response) sendMessage(response)
      })
    }
  }
})

process.on("uncaughtException", (err) => {
  console.error(`[apex-composio] Error: ${err.message}`)
})
