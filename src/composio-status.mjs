#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APEX_DIR = join(__dirname, '..')
const CONFIG_FILE = join(APEX_DIR, '.composio-config.json')
const COMPOSIO_API = 'https://backend.composio.dev/api/v3.1'

const SLUG_MAP = {
  'google-calendar': 'googlecalendar',
  'google-drive': 'googledrive',
  'google-sheets': 'googlesheets',
  'google-docs': 'googledocs',
  'microsoft-teams': 'microsoft_teams',
  'one-drive': 'one_drive',
  'share-point': 'share_point',
}

function apiSlug(tool) { return SLUG_MAP[tool] || tool.replace(/-/g, '') }

async function main() {
  if (!existsSync(CONFIG_FILE)) {
    console.log('\n  No Composio config found.')
    console.log('  Run: node src/composio-setup.mjs\n')
    process.exit(0)
  }

  const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
  const apiKey = raw.apiKey || ''
  const userId = raw.userId || ''

  if (!apiKey) {
    console.log('\n  No API key in config. Run node src/composio-setup.mjs\n')
    process.exit(0)
  }

  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║         Composio Status Report           ║')
  console.log('  ╚══════════════════════════════════════════╝')
  console.log('')
  console.log(`  Config file  : ${CONFIG_FILE}`)
  console.log(`  API Key      : ${apiKey.slice(0, 12)}...`)
  console.log(`  User ID      : ${userId}`)
  console.log('')

  // Fetch live connected accounts from API
  let accounts = []
  try {
    const res = await fetch(`${COMPOSIO_API}/connected_accounts?user_uuid=${userId}&limit=50`, {
      headers: { 'x-api-key': apiKey }
    })
    if (res.ok) {
      const data = await res.json()
      accounts = data.items || []
    } else {
      console.log('  ⚠️  Could not reach Composio API. Showing cached data only.\n')
    }
  } catch {
    console.log('  ⚠️  Could not reach Composio API. Showing cached data only.\n')
  }

  // Fetch auth configs
  let authConfigs = []
  try {
    const res = await fetch(`${COMPOSIO_API}/auth_configs?limit=50`, {
      headers: { 'x-api-key': apiKey }
    })
    if (res.ok) {
      const data = await res.json()
      authConfigs = data.items || []
    }
  } catch {}

  // Build a lookup of live accounts by tool slug
  const liveByTool = {}
  accounts.forEach(a => {
    const slug = a.toolkit?.slug || ''
    if (slug && a.status === 'ACTIVE') liveByTool[slug] = a
  })

  // Read connections from config (new format)
  const connections = raw.connections || []

  if (connections.length === 0) {
    console.log('  No connections registered. Run node src/composio-setup.mjs to add one.\n')
    // Fallback: check old format
    const oldTools = raw.connectedTools || []
    if (oldTools.length > 0) {
      console.log('  ─── Legacy Tools (migrate by re-running setup) ───\n')
      for (const tool of oldTools) {
        const slug = apiSlug(tool)
        const live = liveByTool[slug]
        const status = live ? '✅ Active' : '⚠️  No active connection'
        console.log(`  @${tool.padEnd(18)} ${status}`)
        if (live) {
          console.log(`  ${' '.repeat(20)} Connection: ${live.id}`)
          const ac = authConfigs.find(a => a.toolkit?.slug === slug)
          console.log(`  ${' '.repeat(20)} Auth Config: ${ac?.id || '—'}`)
          console.log(`  ${' '.repeat(20)} Last Refresh: ${new Date(live.updated_at).toLocaleString()}`)
        }
      }
      console.log('')
    }
    console.log('  Commands:')
    console.log('    node src/composio-setup.mjs       Interactive setup')
    console.log('    node src/composio-setup.mjs --list Show all accounts')
    console.log('')
    return
  }

  console.log('  ─── Connected Accounts ───')
  console.log('')

  for (const c of connections) {
    const slug = apiSlug(c.tool)
    const live = liveByTool[slug] || accounts.find(a => a.id === c.id)
    const status = live?.status === 'ACTIVE' ? '✅ Active' : live ? `⚠️  ${live.status || 'Unknown'}` : '❌ Disconnected'
    const email = c.accountEmail || live?.accountEmail || ''
    const authConfig = authConfigs.find(a => a.toolkit?.slug === slug || a.id === c.authConfigId)

    console.log(`  @${c.tool.padEnd(18)} ${status}`)
    console.log(`  ${' '.repeat(20)} Label:      ${c.label || c.tool}`)
    console.log(`  ${' '.repeat(20)} Connection: ${live?.id || c.id || '—'}`)
    console.log(`  ${' '.repeat(20)} Auth:       ${c.authType || 'OAUTH2'}`)
    if (authConfig) console.log(`  ${' '.repeat(20)} Auth Cfg:   ${authConfig.id}`)
    if (email) console.log(`  ${' '.repeat(20)} Account:    ${email}`)
    if (live?.updated_at) console.log(`  ${' '.repeat(20)} Updated:    ${new Date(live.updated_at).toLocaleString()}`)
    console.log('')
  }

  // Totals
  const activeCount = connections.filter(c => {
    const slug = apiSlug(c.tool)
    return liveByTool[slug]?.status === 'ACTIVE' || accounts.find(a => a.id === c.id)?.status === 'ACTIVE'
  }).length
  const failedCount = accounts.filter(a => a.status !== 'ACTIVE' && connections.some(c => c.id === a.id)).length

  console.log(`  Summary: ${activeCount} active, ${connections.length - activeCount} inactive`)
  if (failedCount > 0) console.log(`  (${failedCount} connection(s) need re-authorization)`)
  console.log('')
  console.log('  Commands:')
  console.log('    --list            Show all connected accounts')
  console.log('    --disconnect      Disconnect an account')
  console.log('    --disconnect-all  Disconnect everything')
  console.log('    node src/composio-setup.mjs  Add more tools')
  console.log('')
}

main().catch(e => {
  console.error(`\n  Error: ${e.message}\n`)
  process.exit(1)
})
