#!/usr/bin/env node

import { execSync, exec } from 'child_process'

const serverInfo = {
  name: "mirage-vfs",
  version: "2.0.0",
  description: "Mirage Unified Virtual File System — mount S3, GDrive, Slack, Gmail, Redis, Postgres and more as one filesystem"
}

function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n")
}

function parseMessage(line) {
  try { return JSON.parse(line.trim()) } catch { return null }
}

function createErrorResponse(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } }
}

function createSuccessResponse(id, result) {
  return { jsonrpc: "2.0", id, result }
}

function hasMirage() {
  try {
    execSync('mirage --version', { stdio: 'pipe', timeout: 5000 })
    return true
  } catch {
    return false
  }
}

function getMirageVersion() {
  try {
    return execSync('mirage --version', { encoding: 'utf-8', timeout: 5000 }).trim()
  } catch {
    return 'not installed'
  }
}

const tools = [
  {
    name: "mirage_execute",
    description: "Execute a bash command across all mounted backends (S3, GDrive, Slack, etc.) in a Mirage workspace. Use standard bash syntax: ls, grep, cp, mv, find, cat, etc.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Bash command to execute (e.g. 'grep -r error /s3/logs/', 'cp /gdrive/report.csv /data/')" },
        workspace_id: { type: "string", description: "Mirage workspace ID (optional, uses default if not set)" }
      },
      required: ["command"]
    }
  },
  {
    name: "mirage_workspace_create",
    description: "Create a new Mirage workspace with configured backends",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workspace ID" },
        config: { type: "string", description: "Workspace YAML/JSON config inline or path" }
      },
      required: ["id"]
    }
  },
  {
    name: "mirage_workspace_snapshot",
    description: "Snapshot a Mirage workspace to a tar file for portability",
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: { type: "string", description: "Workspace ID to snapshot" },
        output: { type: "string", description: "Output tar file path" }
      },
      required: ["workspace_id", "output"]
    }
  },
  {
    name: "mirage_workspace_load",
    description: "Load a workspace from a snapshot tar file",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string", description: "Snapshot tar file path" },
        id: { type: "string", description: "New workspace ID to restore as" }
      },
      required: ["input", "id"]
    }
  },
  {
    name: "mirage_provision",
    description: "Provision files into a workspace (makes files available across backends)",
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: { type: "string", description: "Workspace ID" },
        command: { type: "string", description: "Provision command or file path" }
      },
      required: ["workspace_id", "command"]
    }
  },
  {
    name: "mirage_version",
    description: "Check Mirage installation version",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
]

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
      return createSuccessResponse(id, { tools })
    case "tools/call": {
      const { name, arguments: args } = paramsObj
      if (!hasMirage()) {
        return createErrorResponse(id, -32000, "Mirage CLI not found. Install with: pip install mirage-ai && npm install -g @struktoai/mirage-cli")
      }
      try {
        let result
        switch (name) {
          case "mirage_execute": {
            const { command, workspace_id } = args
            const wsFlag = workspace_id ? `--workspace_id ${workspace_id}` : ''
            const output = execSync(`mirage execute ${wsFlag} --command "${command.replace(/"/g, '\\"')}"`, {
              encoding: 'utf-8',
              timeout: 60000,
              maxBuffer: 10 * 1024 * 1024
            }).trim()
            result = { output, success: true }
            break
          }
          case "mirage_workspace_create": {
            const { id: wsId, config: wsConfig } = args
            const configFlag = wsConfig ? `--config "${wsConfig.replace(/"/g, '\\"')}"` : ''
            const output = execSync(`mirage workspace create ${wsConfig ? '' : 'ws.yaml'} --id ${wsId} ${configFlag}`, {
              encoding: 'utf-8',
              timeout: 30000
            }).trim()
            result = { output, success: true }
            break
          }
          case "mirage_workspace_snapshot": {
            const { workspace_id, output: outFile } = args
            const output = execSync(`mirage workspace snapshot ${workspace_id} ${outFile}`, {
              encoding: 'utf-8',
              timeout: 120000
            }).trim()
            result = { output, success: true }
            break
          }
          case "mirage_workspace_load": {
            const { input: inFile, id: newId } = args
            const output = execSync(`mirage workspace load ${inFile} --id ${newId}`, {
              encoding: 'utf-8',
              timeout: 60000
            }).trim()
            result = { output, success: true }
            break
          }
          case "mirage_provision": {
            const { workspace_id, command: provCmd } = args
            const output = execSync(`mirage provision --workspace_id ${workspace_id} --command "${provCmd.replace(/"/g, '\\"')}"`, {
              encoding: 'utf-8',
              timeout: 60000
            }).trim()
            result = { output, success: true }
            break
          }
          case "mirage_version": {
            const version = getMirageVersion()
            result = { version, installed: hasMirage() }
            break
          }
          default:
            return createErrorResponse(id, -32602, `Unknown mirage tool: ${name}`)
        }
        return createSuccessResponse(id, { content: [{ type: "text", text: JSON.stringify(result) }] })
      } catch (err) {
        return createErrorResponse(id, -32603, `Mirage operation failed: ${err.message}`)
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
  console.error(`[mirage-vfs] Error: ${err.message}`)
})
