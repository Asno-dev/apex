#!/usr/bin/env node

import * as arch from "./hands/arch.mjs"
import * as ui from "./hands/ui.mjs"
import * as debug from "./hands/debug.mjs"
import * as perf from "./hands/perf.mjs"
import * as sec from "./hands/sec.mjs"
import * as infra from "./hands/infra.mjs"
import * as nova from "./hands/nova.mjs"
import * as reed from "./hands/reed.mjs"
import * as review from "./hands/review.mjs"
import * as flex from "./hands/flex.mjs"

const modules = { arch, ui, debug, perf, sec, infra, nova, reed, review, flex }

const allTools = Object.values(modules).flatMap(m => m.tools)

const handlers = {}
for (const [, mod] of Object.entries(modules)) {
  for (const tool of mod.tools) {
    handlers[tool.name] = mod.handleTool
  }
}

const serverInfo = {
  name: "apex-hands",
  version: "2.0.0",
  description: "APEX Hands — 56 purpose-built tools for 10 engineering agents"
}

function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n")
}

function parseMessage(line) {
  try {
    return JSON.parse(line.trim())
  } catch {
    return null
  }
}

function createErrorResponse(id, code, message) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  }
}

function createSuccessResponse(id, result) {
  return {
    jsonrpc: "2.0",
    id,
    result
  }
}

async function handleRequest(msg) {
  const { id, method, params } = msg

  switch (method) {
    case "initialize": {
      return createSuccessResponse(id, {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo
      })
    }

    case "notifications/initialized": {
      return null
    }

    case "ping": {
      return createSuccessResponse(id, {})
    }

    case "tools/list": {
      return createSuccessResponse(id, {
        tools: allTools
      })
    }

    case "tools/call": {
      const { name, arguments: args } = params
      const handler = handlers[name]
      if (!handler) {
        return createErrorResponse(id, -32602, `Unknown tool: ${name}. Available: ${allTools.map(t => t.name).join(", ")}`)
      }
      try {
        const result = await handler(name, args)
        return createSuccessResponse(id, result)
      } catch (err) {
        return createErrorResponse(id, -32603, `Tool execution failed: ${err.message}`)
      }
    }

    default: {
      return createErrorResponse(id, -32601, `Method not found: ${method}`)
    }
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
      if (response) {
        sendMessage(response)
      }
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
  console.error(`[apex-hands] Unhandled error: ${err.message}`)
})
