import { homedir } from 'os'
import { join, dirname } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

const CONFIG_DIR = join(homedir(), '.apex')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

export function isPlaceholder(value) {
  if (typeof value !== 'string') return false
  const val = value.trim()
  if (val === '') return false
  return (
    val === 'ak_...' ||
    val === 'ac_...' ||
    val.includes('...') ||
    val.includes('paste_your') ||
    val.startsWith('ac_xxxx')
  )
}

function ensureDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

function load() {
  ensureDir()
  let config
  if (!existsSync(CONFIG_PATH)) {
    config = {
      userId: 'apex-default'
    }
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
  } else {
    try {
      config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
    } catch {
      config = { userId: 'apex-default' }
    }
  }

  if (config.authConfigs) {
    for (const [t, c] of Object.entries(config.authConfigs)) {
      if (c && isPlaceholder(c)) {
        delete config.authConfigs[t]
        changed = true
      }
    }
  }
  if (changed) {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
  }

  return config
}

function save(config) {
  ensureDir()
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export function getUserId() {
  return load().userId || 'apex-default'
}

export function setUserId(id) {
  const config = load()
  config.userId = id
  save(config)
}

export function getAuthConfig(tool) {
  const config = load()
  return config.authConfigs[tool] || ''
}

export function setAuthConfig(tool, configId) {
  const config = load()
  config.authConfigs[tool] = configId
  save(config)
}

export function getAllAuthConfigs() {
  return load().authConfigs || {}
}

export function getAllConfig() {
  const c = load()
  return {
    userId: c.userId,
    authConfigs: Object.keys(c.authConfigs || {}).reduce((acc, k) => {
      acc[k] = '***set***'
      return acc
    }, {})
  }
}


