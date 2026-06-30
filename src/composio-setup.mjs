#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import { execSync } from 'child_process'
import * as readline from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APEX_DIR = join(__dirname, '..')
const CONFIG_FILE = join(APEX_DIR, '.composio-config.json')
const COMPOSIO_API = 'https://backend.composio.dev/api/v3.1'

function readConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      if (raw.connections) return raw
      if (raw.connectedTools && Array.isArray(raw.connectedTools)) {
        const migrated = {
          apiKey: raw.apiKey,
          userId: raw.userId,
          updatedAt: raw.updatedAt,
          connections: raw.connectedTools.map(t => {
            const slug = t.tool || t
            return {
              id: t.id || raw.toolConfigs?.[slug] || '',
              tool: slug,
              label: t.label || 'Account 1',
              status: t.status || 'UNKNOWN',
              authConfigId: raw.authConfigs?.[slug] || '',
              authType: 'OAUTH2',
              createdAt: t.createdAt || raw.updatedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
        }
        saveConfig(migrated)
        return migrated
      }
      return { apiKey: raw.apiKey, userId: raw.userId, connections: [] }
    }
  } catch {}
  return { connections: [] }
}

function saveConfig(config) {
  config.updatedAt = new Date().toISOString()
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

function openBrowser(url) {
  const platform = process.platform
  try {
    if (platform === 'win32') execSync(`start "" "${url}"`, { stdio: 'ignore' })
    else if (platform === 'darwin') execSync(`open "${url}"`, { stdio: 'ignore' })
    else execSync(`xdg-open "${url}"`, { stdio: 'ignore' })
    return true
  } catch { return false }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

let _rl = null
function getRL() {
  if (!_rl) {
    _rl = createInterface({ input: process.stdin, output: process.stdout })
  }
  return _rl
}
function closeRL() { /* keep readline alive — never close */ }

async function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve))
}

async function promptYesNo(rl, question, defaultVal = 'y') {
  const hint = defaultVal === 'y' ? 'Y/n' : 'y/N'
  const answer = (await ask(rl, `  ${question} [${hint}]: `)).trim().toLowerCase()
  if (!answer) return defaultVal === 'y'
  return answer === 'y' || answer === 'yes'
}

async function fetchAuthConfigs(apiKey, toolkitSlug, scheme = 'OAUTH2') {
  try {
    const res = await fetch(`${COMPOSIO_API}/auth_configs?limit=100`, {
      headers: { 'x-api-key': apiKey }
    })
    if (!res.ok) return []
    const data = await res.json()
    if (scheme === 'OAUTH2') {
      return (data.items || []).filter(a =>
        a.toolkit && a.toolkit.slug === toolkitSlug &&
        a.auth_scheme === 'OAUTH2' &&
        a.is_composio_managed === true
      )
    }
    return (data.items || []).filter(a =>
      a.toolkit && a.toolkit.slug === toolkitSlug
    )
  } catch { return [] }
}

async function createAuthConfig(apiKey, toolkitSlug, authScheme = 'OAUTH2') {
  try {
    const res = await fetch(`${COMPOSIO_API}/auth_configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        name: `${toolkitSlug}-${Date.now()}`,
        toolkit: toolkitSlug,
        auth_scheme: authScheme,
        is_composio_managed: authScheme === 'OAUTH2'
      })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    return await res.json()
  } catch (e) {
    throw new Error(`Failed to create auth config: ${e.message}`)
  }
}

async function initiateOAuth(apiKey, toolkitSlug, userId, authConfigId) {
  try {
    const body = {
      user_id: userId,
      appUniqueId: toolkitSlug,
      auth_config: { id: authConfigId },
      connection: {},
      config: {}
    }
    const res = await fetch(`${COMPOSIO_API}/connected_accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HTTP ${res.status}: ${err}`)
    }
    return await res.json()
  } catch (e) {
    throw new Error(`Failed to initiate OAuth: ${e.message}`)
  }
}

async function createConnectionDirect(apiKey, toolkitSlug, userId, authConfigId, creds = {}) {
  try {
    const body = {
      user_id: userId,
      appUniqueId: toolkitSlug,
      auth_config: { id: authConfigId },
      connection: {},
      config: Object.keys(creds).length > 0 ? creds : {}
    }
    const res = await fetch(`${COMPOSIO_API}/connected_accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HTTP ${res.status}: ${err}`)
    }
    return await res.json()
  } catch (e) {
    throw new Error(`Failed to create connection: ${e.message}`)
  }
}

async function fetchConnections(apiKey, userId) {
  try {
    const res = await fetch(`${COMPOSIO_API}/connected_accounts?user_uuid=${userId}`, {
      headers: { 'x-api-key': apiKey }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch { return [] }
}

async function deleteConnection(apiKey, connectionId) {
  try {
    const res = await fetch(`${COMPOSIO_API}/connected_accounts/${connectionId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': apiKey }
    })
    return res.ok
  } catch { return false }
}

async function fetchAllTools(apiKey) {
  const all = []
  let cursor = null
  for (let i = 0; i < 10; i++) {
    const params = cursor ? `limit=100&cursor=${encodeURIComponent(cursor)}` : 'limit=100'
    const res = await fetch(`${COMPOSIO_API}/toolkits?${params}`, {
      headers: { 'x-api-key': apiKey }
    })
    if (!res.ok) break
    const data = await res.json()
    const items = data.items || []
    all.push(...items)
    cursor = data.next_cursor
    if (!cursor || items.length === 0) break
  }
  return all.sort((a, b) => a.name?.localeCompare(b.name))
}

async function getToolkitDetails(apiKey, slug) {
  try {
    const res = await fetch(`${COMPOSIO_API}/toolkits/${slug}`, {
      headers: { 'x-api-key': apiKey }
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function keypressSetup(stdin, onKeypress) {
  getRL()
  const wasRaw = stdin.isRaw
  try { stdin.setRawMode(true) } catch {}
  stdin.resume()
  stdin.on('keypress', onKeypress)
  // Store original state for cleanup
  return wasRaw === true
}

function keypressCleanup(stdin, wasRaw, onKeypress) {
  stdin.removeListener('keypress', onKeypress)
  if (stdin.setRawMode) {
    try { stdin.setRawMode(wasRaw === true) } catch {}
  }
  // Clear all picker output from screen
  process.stdout.write('\x1B[J')
  process.stdout.write('\x1B[?25h')
  // Clear readline's internal buffer so typed search chars don't leak
  const rl = getRL()
  try { rl.write(null, { ctrl: true, name: 'u' }) } catch {}
}

async function interactiveChoicePicker(options, prompt = 'Select an option') {
  let selectedIdx = 0
  const stdin = process.stdin

  return new Promise((resolve) => {
    let resolved = false
    let onKeypress = null
    const done = (val) => {
      if (resolved) return
      resolved = true
      keypressCleanup(stdin, wasRaw, onKeypress)
      resolve(val)
    }

    function render() {
      if (selectedIdx < 0) selectedIdx = 0
      if (selectedIdx >= options.length) selectedIdx = options.length - 1

      let output = `\x1B[?25l\n  ${prompt}\n`
      output += `  ${'─'.repeat(Math.min(60, process.stdout.columns || 60))}\n`
      for (let i = 0; i < options.length; i++) {
        const sel = i === selectedIdx
        const pre = sel ? '→' : ' '
        const hl = sel ? '\x1B[7m' : ''
        const rs = sel ? '\x1B[0m' : ''
        output += `  ${hl}${pre} ${options[i]}${rs}\n`
      }
      output += `  ${'─'.repeat(Math.min(60, process.stdout.columns || 60))}\n`
      output += '  ↑↓ Enter to select  |  ESC to cancel\n'

      try { readline.cursorTo(process.stdout, 0, 0); readline.clearScreenDown(process.stdout) } catch {}
      process.stdout.write(output)
    }

    onKeypress = function(str, key) {
      if (!key) return
      if (key.name === 'return' || key.name === 'enter') { done(selectedIdx); return }
      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) { done(-1); return }
      if (key.name === 'up') { selectedIdx = Math.max(0, selectedIdx - 1); render(); return }
      if (key.name === 'down') { selectedIdx = Math.min(options.length - 1, selectedIdx + 1); render(); return }
      if (key.name === 'home') { selectedIdx = 0; render(); return }
      if (key.name === 'end') { selectedIdx = options.length - 1; render(); return }
    }
    const wasRaw = keypressSetup(stdin, onKeypress)

    try { readline.cursorTo(process.stdout, 0, 0); readline.clearScreenDown(process.stdout) } catch {}
    render()
  })
}

async function interactiveToolPicker(tools) {
  let searchQuery = ''
  let selectedIdx = 0
  let scrollOffset = 0
  const maxVisible = 15
  const stdin = process.stdin

  return new Promise((resolve) => {
    let resolved = false
    let onKeypress = null
    const resolveOnce = (val) => {
      if (resolved) return
      resolved = true
      keypressCleanup(stdin, wasRaw, onKeypress)
      resolve(val)
    }

    function render() {
      const filteredList = searchQuery
        ? tools.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug?.toLowerCase().includes(searchQuery.toLowerCase()))
        : tools

      if (selectedIdx >= filteredList.length) selectedIdx = Math.max(0, filteredList.length - 1)
      if (selectedIdx < 0) selectedIdx = 0
      if (selectedIdx < scrollOffset) scrollOffset = selectedIdx
      if (selectedIdx >= scrollOffset + maxVisible) scrollOffset = selectedIdx - maxVisible + 1
      const visibleItems = filteredList.slice(scrollOffset, scrollOffset + maxVisible)

      let output = '\x1B[?25l\n'
      output += `  Search: ${searchQuery}█\n`
      output += `  ${'─'.repeat(56)}\n`
      for (let i = 0; i < visibleItems.length; i++) {
        const item = visibleItems[i]
        const listIdx = scrollOffset + i
        const isSelected = listIdx === selectedIdx
        const prefix = isSelected ? '→' : ' '
        const highlight = isSelected ? '\x1B[7m' : ''
        const reset = isSelected ? '\x1B[0m' : ''
        const num = String(listIdx + 1).padStart(filteredList.length > 9 ? 3 : 2)
        const name = (item.name || item.slug).padEnd(28).slice(0, 28)
        const slug = (item.slug || '').padEnd(20).slice(0, 20)
        output += `  ${highlight}${prefix} ${num}. ${name} ${slug}${reset}\n`
      }
      output += `  ${'─'.repeat(56)}\n`
      output += `  Showing ${filteredList.length} of ${tools.length} tools  |  ↑↓ navigate  |  Type to search  |  ESC to cancel\n`

      try { readline.cursorTo(process.stdout, 0, 0); readline.clearScreenDown(process.stdout) } catch {}
      process.stdout.write(output)
      try { readline.cursorTo(process.stdout, 9 + searchQuery.length, 1) } catch {}
    }

    onKeypress = function(str, key) {
      if (!key) return
      const filteredList = searchQuery
        ? tools.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug?.toLowerCase().includes(searchQuery.toLowerCase()))
        : tools

      if (key.name === 'return' || key.name === 'enter') {
        if (filteredList.length > 0) {
          const selected = filteredList[selectedIdx]
          keypressCleanup(stdin, wasRaw, onKeypress)
          process.stdout.write('\n')
          resolveOnce(selected)
        }
        return
      }
      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        keypressCleanup(stdin, wasRaw, onKeypress)
        process.stdout.write('\n')
        resolveOnce(null)
        return
      }
      if (key.name === 'up') { selectedIdx = Math.max(0, selectedIdx - 1); render(); return }
      if (key.name === 'down') { selectedIdx = Math.min(filteredList.length - 1, selectedIdx + 1); render(); return }
      if (key.name === 'pageup') { selectedIdx = Math.max(0, selectedIdx - maxVisible); render(); return }
      if (key.name === 'pagedown') { selectedIdx = Math.min(filteredList.length - 1, selectedIdx + maxVisible); render(); return }
      if (key.name === 'home') { selectedIdx = 0; render(); return }
      if (key.name === 'end') { selectedIdx = filteredList.length - 1; render(); return }
      if (key.name === 'backspace') {
        if (searchQuery.length > 0) { searchQuery = searchQuery.slice(0, -1); selectedIdx = 0; scrollOffset = 0; render() }
        return
      }
      if (key.ctrl || key.meta) return
      if (str && str.length === 1 && str.charCodeAt(0) >= 32) {
        searchQuery += str; selectedIdx = 0; scrollOffset = 0; render()
      }
    }
    const wasRaw = keypressSetup(stdin, onKeypress)

    try { readline.cursorTo(process.stdout, 0, 0); readline.clearScreenDown(process.stdout) } catch {}
    render()
  })
}

// ─── Commands ──────────────────────────────────────────────

async function cmdList(config, apiKey) {
  console.log('\n  ─── Connected Accounts ───\n')
  const connections = config.connections || []
  if (connections.length === 0) {
    console.log('  No connections yet. Run node src/composio-setup.mjs to add one.\n')
    return
  }

  const fresh = await fetchConnections(apiKey, config.userId).catch(() => [])
  const freshMap = {}
  fresh.forEach(c => { freshMap[c.id] = c })

  connections.forEach((c, i) => {
    const live = freshMap[c.id]
    const status = live ? (live.status || 'ACTIVE') : c.status
    const email = live?.accountEmail || c.accountEmail || ''
    const statusIcon = status === 'ACTIVE' ? '✅' : status === 'EXPIRED' ? '⚠️' : '❌'
    console.log(`  ${statusIcon}  [${i + 1}] ${c.tool} — "${c.label}"`)
    if (email) console.log(`       Account: ${email}`)
    console.log(`       Status:  ${status}`)
    console.log(`       ID:      ${c.id}`)
    console.log(`       Auth:    ${c.authType || 'OAUTH2'}`)
    console.log('')
  })
}

async function cmdDisconnect(config, apiKey, toolFilter) {
  const connections = config.connections || []
  let targets = connections

  if (toolFilter) {
    targets = connections.filter(c => c.tool === toolFilter)
    if (targets.length === 0) {
      console.log(`\n  No connections found for "${toolFilter}".\n`)
      return
    }
  }

  if (targets.length === 0) {
    console.log('\n  No connections to disconnect.\n')
    return
  }

  const rl = getRL()

  if (targets.length === 1) {
    const c = targets[0]
    const ok = await promptYesNo(rl, `Disconnect "${c.tool}" — "${c.label}"?`, 'n')
    if (!ok) { console.log('  Skipped.\n'); return }
    const deleted = await deleteConnection(apiKey, c.id)
    if (deleted) {
      config.connections = connections.filter(x => x.id !== c.id)
      saveConfig(config)
      console.log(`  ✅ Disconnected "${c.tool}" — "${c.label}".\n`)
    } else {
      console.log(`  ⚠️  API delete failed. Removing from local config.\n`)
      config.connections = connections.filter(x => x.id !== c.id)
      saveConfig(config)
    }
    return
  }

  console.log('\n  Select account to disconnect:\n')
  targets.forEach((c, i) => console.log(`  ${i + 1}. ${c.tool} — "${c.label}" [${c.status}]`))
  console.log('')
  const answer = (await ask(rl, `  Choice (1-${targets.length}) or Enter to cancel: `)).trim()
  if (!answer) { console.log('  Cancelled.\n'); return }
  const idx = parseInt(answer, 10) - 1
  if (idx < 0 || idx >= targets.length) { console.log('  Invalid.\n'); return }

  const c = targets[idx]
  const deleted = await deleteConnection(apiKey, c.id)
  if (deleted) {
    config.connections = connections.filter(x => x.id !== c.id)
    saveConfig(config)
    console.log(`  ✅ Disconnected "${c.tool}" — "${c.label}".\n`)
  } else {
    config.connections = connections.filter(x => x.id !== c.id)
    saveConfig(config)
    console.log(`  ⚠️  Removed from local config (API delete returned error).\n`)
  }
}

async function cmdDisconnectAll(config, apiKey) {
  const connections = config.connections || []
  if (connections.length === 0) { console.log('\n  No connections to disconnect.\n'); return }

  const rl = getRL()
  const ok = await promptYesNo(rl, `Disconnect ALL ${connections.length} connection(s)?`, 'n')
  if (!ok) { console.log('  Cancelled.\n'); return }

  let deleted = 0, failed = 0
  for (const c of connections) {
    const ok = await deleteConnection(apiKey, c.id)
    if (ok) deleted++; else failed++
  }
  config.connections = []
  saveConfig(config)
  console.log(`\n  Disconnected: ${deleted} successful, ${failed} failed. Config cleared.\n`)
}

// ─── Interactive Connect Flow ──────────────────────────────

async function connectToolFlow(rl, config, apiKey) {
  const tools = await fetchAllTools(apiKey)
  if (!tools || tools.length === 0) {
    console.log('  No tools available. Check API key.\n')
    return false
  }

  console.log(`  ${tools.length} tools available!\n`)
  console.log('  ═══ SELECT A TOOL ═══\n')
  closeRL()

  const selected = await interactiveToolPicker(tools)
  rl = getRL()

  if (!selected) {
    console.log('\n  Cancelled.\n')
    return false
  }
  const slug = selected.slug
  const name = selected.name || slug
  console.log(`\n  Selected: ${name} (${slug})\n`)

  // Check if managed OAuth is available
  let oauthConfigs = await fetchAuthConfigs(apiKey, slug, 'OAUTH2')

  // Check toolkit details for auth schemes
  const details = await getToolkitDetails(apiKey, slug)
  const authSchemes = details?.auth_schemes || []
  const hasManagedOAuth = oauthConfigs.length > 0
  const hasOAuthSupport = authSchemes.some(s => s === 'OAUTH2' || s === 'oauth2' || s === 'google_oauth2')

  if (hasManagedOAuth || hasOAuthSupport) {
    closeRL()
    const mode = await interactiveChoicePicker([
      'Auto OAuth (recommended — opens browser to authorize)',
      'Manual — paste auth config ID (ac_...)',
      'Manual — paste API key / token directly'
    ], `How to connect "${name}"?`)
    rl = getRL()

    if (mode < 0) { console.log('  Cancelled.\n'); return false }
    if (mode === 0) {
      return await runOAuthFlow(rl, config, apiKey, slug, name, oauthConfigs)
    } else if (mode === 1) {
      return await runManualAuthConfigFlow(rl, config, apiKey, slug, name)
    } else {
      return await runManualApiKeyFlow(rl, config, apiKey, slug, name)
    }
  } else {
    console.log(`  "${name}" doesn't have managed OAuth. Using manual setup.\n`)
    closeRL()
    const mode = await interactiveChoicePicker([
      'Paste auth config ID (ac_...)',
      'Paste API key / token directly'
    ], `How to connect "${name}"?`)
    rl = getRL()

    if (mode < 0) { console.log('  Cancelled.\n'); return false }
    if (mode === 0) {
      return await runManualAuthConfigFlow(rl, config, apiKey, slug, name)
    } else {
      return await runManualApiKeyFlow(rl, config, apiKey, slug, name)
    }
  }
}

async function runOAuthFlow(rl, config, apiKey, slug, name, existingConfigs) {
  let authConfigId = existingConfigs.length > 0 ? existingConfigs[0].id : null

  if (!authConfigId) {
    console.log(`  Creating managed auth config for ${slug}...`)
    try {
      const newConfig = await createAuthConfig(apiKey, slug, 'OAUTH2')
      authConfigId = newConfig.id
      console.log(`  ✅ Auth config created: ${authConfigId}\n`)
    } catch (e) {
      console.log(`  Failed to create auth config: ${e.message}`)
      return false
    }
  }

  console.log(`  Initiating OAuth for ${name}...\n`)
  let oauthData
  try {
    oauthData = await initiateOAuth(apiKey, slug, config.userId, authConfigId)
  } catch (e) {
    console.log(`  ❌ ${e.message}\n`)
    return false
  }

  const redirectUrl = oauthData.redirectUrl || oauthData.redirect_url || oauthData.url || oauthData.authUrl
  const connectionId = oauthData.id || oauthData.connectedAccountId || oauthData.connected_account_id

  if (redirectUrl) {
    console.log('  ═══════════════════════════════════════════════════')
    console.log('  ✅  OAuth link ready! Authorize your account.')
    console.log('  ═══════════════════════════════════════════════════\n')
    console.log(`  ${redirectUrl}\n`)

    if (openBrowser(redirectUrl)) {
      console.log('  🌐 Browser opened.')
    } else {
      console.log('  📋 Copy the URL above into your browser to authorize.')
    }

    console.log('\n  Press Enter here after authorizing...')
    await new Promise(resolve => { rl.once('line', resolve) })

    console.log('\n  Verifying connection...')
    await sleep(2000)

    let verified = null
    const freshConnections = await fetchConnections(apiKey, config.userId)
    verified = freshConnections.find(c =>
      c.toolkit?.slug === slug && c.status === 'ACTIVE'
    ) || null

    if (verified) {
      const entry = {
        id: verified.id,
        tool: slug,
        label: name,
        status: 'ACTIVE',
        authConfigId: authConfigId,
        authType: 'OAUTH2',
        accountEmail: verified.accountEmail || '',
        createdAt: verified.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (!config.connections) config.connections = []
      config.connections.push(entry)
      saveConfig(config)
      console.log(`  ✅  "${name}" connected successfully!\n`)
      return true
    } else if (connectionId) {
      const entry = {
        id: connectionId,
        tool: slug,
        label: name,
        status: 'PENDING',
        authConfigId: authConfigId,
        authType: 'OAUTH2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (!config.connections) config.connections = []
      config.connections.push(entry)
      saveConfig(config)
      console.log(`  ⚠️  Saved but could not verify. Run --list to check status.\n`)
      return true
    }
    return false
  }

  if (oauthData.error) {
    console.log(`  ❌ OAuth error: ${oauthData.error}\n`)
    return false
  }

  if (connectionId) {
    const entry = {
      id: connectionId,
      tool: slug,
      label: name,
      status: 'ACTIVE',
      authConfigId: authConfigId,
      authType: 'OAUTH2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (!config.connections) config.connections = []
    config.connections.push(entry)
    saveConfig(config)
    console.log(`  ✅  "${name}" connected (no redirect needed).\n`)
    return true
  }

  console.log(`  ❌ Failed: no redirect URL or connection ID returned.\n`)
  return false
}

async function runManualAuthConfigFlow(rl, config, apiKey, slug, name) {
  console.log('  You can paste an auth config ID you created in the Composio dashboard.\n')
  console.log('  Available auth configs for this tool:\n')
  const allConfigs = await fetchAuthConfigs(apiKey, slug, null)
  if (allConfigs.length > 0) {
    allConfigs.forEach((c, i) => console.log(`    ${i + 1}. ${c.id} — ${c.name || ''} (${c.auth_scheme})`))
  } else {
    console.log('  (none found — you can still paste one)\n')
  }
  console.log('')

  const authConfigId = (await ask(rl, '  Auth config ID (ac_...): ')).trim()
  if (!authConfigId) { console.log('  Cancelled.\n'); return false }
  if (!authConfigId.startsWith('ac_')) { console.log('  Invalid: should start with "ac_".\n'); return false }

  console.log(`\n  Connecting ${name} with auth config ${authConfigId}...`)

  try {
    const result = await createConnectionDirect(apiKey, slug, config.userId, authConfigId)
    const connectionId = result.id || result.connectedAccountId || result.connected_account_id

    if (connectionId) {
      const entry = {
        id: connectionId,
        tool: slug,
        label: name,
        status: result.status || 'ACTIVE',
        authConfigId: authConfigId,
        authType: 'MANUAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (!config.connections) config.connections = []
      config.connections.push(entry)
      saveConfig(config)
      console.log(`  ✅  "${name}" connected successfully!\n`)
      return true
    }

    console.log('  ⚠️  Connection created but no ID returned. Check --list.\n')
    return false
  } catch (e) {
    console.log(`  ❌ ${e.message}\n`)
    return false
  }
}

async function runManualApiKeyFlow(rl, config, apiKey, slug, name) {
  console.log('  Enter your API key or token for this tool.\n')
  console.log('  Credentials are stored ONLY in .composio-config.json locally.\n')

  const credential = (await ask(rl, '  API key / token: ')).trim()
  if (!credential) { console.log('  Cancelled.\n'); return false }

  // Create a non-managed auth config
  console.log(`\n  Creating auth config for ${slug}...`)
  let authConfigId
  try {
    const newConfig = await createAuthConfig(apiKey, slug, 'API_KEY')
    authConfigId = newConfig.id
    console.log(`  ✅ Auth config created: ${authConfigId}`)
  } catch (e) {
    console.log(`  ⚠️  Could not create auth config: ${e.message}`)
    const manualId = (await ask(rl, '  Paste existing auth config ID (ac_...) or Enter to cancel: ')).trim()
    if (!manualId) { console.log('  Cancelled.\n'); return false }
    authConfigId = manualId
  }

  console.log(`  Connecting ${name}...`)
  try {
    const result = await createConnectionDirect(apiKey, slug, config.userId, authConfigId, { api_key: credential })
    const connectionId = result.id || result.connectedAccountId || result.connected_account_id

    if (connectionId) {
      const entry = {
        id: connectionId,
        tool: slug,
        label: name,
        status: result.status || 'ACTIVE',
        authConfigId: authConfigId,
        authType: 'API_KEY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (!config.connections) config.connections = []
      config.connections.push(entry)
      saveConfig(config)
      console.log(`  ✅  "${name}" connected successfully!\n`)
      return true
    }
    console.log('  ⚠️  Connection created but no ID returned.\n')
    return false
  } catch (e) {
    console.log(`  ❌ ${e.message}\n`)
    return false
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const rl = getRL()

  process.stdout.write('\x1B[2J\x1B[H')

  console.log('')
  console.log('  ╔══════════════════════════════════════════════════════╗')
  console.log('  ║           APEX x Composio Setup Tool               ║')
  console.log('  ║   Connect 300+ tools to your AI agents             ║')
  console.log('  ╚══════════════════════════════════════════════════════╝')
  console.log('')
  console.log('  ── Composio Info ──')
  console.log('  Dashboard   : https://dashboard.composio.dev')
  console.log('  Docs        : https://docs.composio.dev')
  console.log('  API Key     : Create at Dashboard → Settings')
  console.log('  API Base    : https://backend.composio.dev/api/v3.1')
  console.log('  Tools       : 1000+ (Gmail, GitHub, Slack, Notion, etc.)')
  console.log('')

  let config = readConfig()
  let apiKey = config.apiKey || ''

  // ── Commands ──────────────────────────────────────────────

  if (args.includes('--list')) {
    if (!apiKey) { console.log('  No API key configured. Run setup first.\n'); closeRL(); return }
    await cmdList(config, apiKey)
    closeRL()
    return
  }

  if (args.includes('--disconnect-all')) {
    if (!apiKey) { console.log('  No API key configured.\n'); closeRL(); return }
    await cmdDisconnectAll(config, apiKey)
    closeRL()
    return
  }

  const discIdx = args.indexOf('--disconnect')
  if (discIdx >= 0) {
    if (!apiKey) { console.log('  No API key configured.\n'); closeRL(); return }
    const toolFilter = args[discIdx + 1] || null
    await cmdDisconnect(config, apiKey, toolFilter)
    closeRL()
    return
  }

  // ── API Key ───────────────────────────────────────────────

  if (args.includes('--api-key')) {
    apiKey = args[args.indexOf('--api-key') + 1] || ''
  }

  if (!apiKey && config.apiKey) {
    const reuse = await promptYesNo(rl, `Use existing API key (${config.apiKey.slice(0, 12)}...)?`, 'y')
    if (reuse) apiKey = config.apiKey
  }

  while (!apiKey) {
    const input = (await ask(rl, '  Paste your Composio API key (get from composio.dev/settings): ')).trim()
    if (input) {
      apiKey = input
    } else {
      console.log('  API key is required.\n')
    }
  }

  // Save API key / userId
  config.apiKey = apiKey
  if (!config.userId) {
    config.userId = 'asno_user_' + Math.random().toString(36).slice(2, 10)
  }
  if (!config.connections) config.connections = []
  saveConfig(config)

  // ── Verify API key ─────────────────────────────────────────

  console.log('\n  Verifying API key & fetching available tools...\n')

  let tools
  try {
    tools = await fetchAllTools(apiKey)
  } catch (e) {
    console.log(`  Failed to fetch tools: ${e.message}`)
    console.log('  Make sure your API key is correct.\n')
    closeRL()
    process.exit(1)
  }

  if (!tools || tools.length === 0) {
    console.log('  No tools found. Make sure your API key is valid.\n')
    closeRL()
    process.exit(1)
  }

  console.log(`  ✅ API key valid — ${tools.length} tools available!\n`)

  // ── Interactive: Connect Tools Loop ────────────────────────

  let keepGoing = true
  while (keepGoing) {
    const success = await connectToolFlow(rl, config, apiKey)
    if (!success) {
      console.log('  Connection failed or cancelled.\n')
    }

    keepGoing = await promptYesNo(rl, 'Connect another tool?', 'n')
    console.log('')
  }

  // ── Final Summary ──────────────────────────────────────────

  const finalConfig = readConfig()
  const conns = finalConfig.connections || []
  console.log('  ─── Connected Accounts ───')
  if (conns.length === 0) {
    console.log('  (none)')
  } else {
    conns.forEach(c => console.log(`  ✅  @${c.tool} — "${c.label}"`))
  }
  console.log('')
  console.log('  Commands:')
  console.log('    --list            Show all connected accounts')
  console.log('    --disconnect      Disconnect an account')
  console.log('    --disconnect-all  Disconnect everything')
  console.log('')
  console.log('  Use @toolName (e.g. @gmail, @github) to invoke tools.')
  console.log('')

  closeRL()
}

main().catch(e => {
  console.error(`\n  Error: ${e.message}\n`)
  process.exit(1)
})
