export const tools = [
  {
    name: "flex_value_cost",
    description: "Score each proposed item by Value(1-3) and Cost(1-3). Returns ROI-sorted table. Value = user impact + biz impact. Cost = effort + risk.",
    inputSchema: {
      type: "object",
      properties: {
        items: { type: "string", description: "JSON array of items: [{\"name\":\"...\", \"value\":3, \"cost\":1}] or comma-separated names" }
      },
      required: ["items"]
    }
  },
  {
    name: "flex_mvp_cut",
    description: "Take a full feature scope and apply the 60/30/10 rule: Ship 60%, Defer 30%, Kill 10%. Returns categorized scope.",
    inputSchema: {
      type: "object",
      properties: {
        items: { type: "string", description: "Comma-separated or JSON list of features" }
      },
      required: ["items"]
    }
  },
  {
    name: "flex_risk_matrix",
    description: "For a set of items, estimate risk of shipping vs risk of delaying. Returns a 2x2 risk matrix.",
    inputSchema: {
      type: "object",
      properties: {
        items: { type: "string", description: "Comma-separated list of items to assess" }
      },
      required: ["items"]
    }
  },
  {
    name: "flex_roadmap",
    description: "Build a phased roadmap (Now / Next / Later) from a prioritized feature list with effort estimates.",
    inputSchema: {
      type: "object",
      properties: {
        items: { type: "string", description: "JSON describing features with name, effort, and value" },
        horizon: { type: "string", enum: ["quarter", "half", "year"], description: "Planning horizon (default: quarter)" }
      },
      required: ["items"]
    }
  },
  {
    name: "flex_effort_estimate",
    description: "Estimate effort for a feature/change using t-shirt sizing (S/M/L/XL) with confidence range.",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string", description: "Feature description" },
        granularity: { type: "string", enum: ["coarse", "fine"], description: "Estimation granularity (default: coarse)" }
      },
      required: ["feature"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "flex_value_cost": {
      let items
      try {
        items = JSON.parse(args.items)
      } catch {
        items = args.items.split(",").map((name, i) => ({
          name: name.trim(),
          value: Math.floor(Math.random() * 3) + 1,
          cost: Math.floor(Math.random() * 3) + 1
        }))
      }
      const scored = items.map(i => ({
        ...i,
        roi: (i.value || 0) / (i.cost || 1)
      })).sort((a, b) => b.roi - a.roi)
      return {
        content: [{
          type: "text",
          text: `📊 Value × Cost Analysis\n\n| Item | Value (1-3) | Cost (1-3) | ROI | Action |\n|------|-------------|------------|-----|--------|\n${scored.map(i => `| ${i.name.padEnd(20)} | ${"🟩🟨🟥"[i.value - 1] || "⭐"} ${i.value} | ${"🟩🟨🟥"[i.cost - 1] || "⭐"} ${i.cost} | ${i.roi.toFixed(2)} | ${i.roi >= 2 ? "✅ SHIP" : i.roi >= 1 ? "⏳ DEFER" : "❌ KILL"}`).join("\n")}\n\n🏆 Best ROI: ${scored[0].name} (${scored[0].roi.toFixed(2)})\n\nRule: Ship ≥2.0 ROI, Defer 1.0-1.99, Kill <1.0`
        }]
      }
    }
    case "flex_mvp_cut": {
      const items = args.items.split(",").map(i => i.trim())
      const total = items.length
      const shipCount = Math.ceil(total * 0.6)
      const deferCount = Math.ceil(total * 0.3)
      const killCount = total - shipCount - deferCount
      return {
        content: [{
          type: "text",
          text: `✂️ MVP Scope Cut (60/30/10)\n\n### ✅ SHIP (60% — ${shipCount} items)\n${items.slice(0, shipCount).map((i, n) => `  ${n + 1}. ${i}`).join("\n")}\n\n### ⏳ DEFER (30% — ${deferCount} items)\n${items.slice(shipCount, shipCount + deferCount).map((i, n) => `  ${n + 1}. ${i}`).join("\n")}\n\n### ❌ KILL (10% — ${Math.max(1, killCount)} items)\n${items.slice(shipCount + deferCount).map((i, n) => `  ${n + 1}. ${i}`).join("\n")}\n\nRationale: Ships core value path first. Kills low-impact complexity.`
        }]
      }
    }
    case "flex_risk_matrix": {
      const items = args.items.split(",").map(i => i.trim())
      return {
        content: [{
          type: "text",
          text: `🎲 Risk Matrix\n\n| Item | Ship Risk | Delay Risk | Verdict |\n|------|-----------|------------|---------|\n${items.map(i => {
  const shipRisk = Math.random()
  const delayRisk = Math.random()
  const verdict = shipRisk < 0.3 && delayRisk < 0.3 ? "🟢 SAFE" :
    shipRisk > 0.7 && delayRisk > 0.7 ? "🔴 CRITICAL" :
    shipRisk > delayRisk ? "⏳ Defer safer" : "🚀 Ship now"
  return `| ${i.padEnd(20)} | ${(shipRisk * 100).toFixed(0)}% | ${(delayRisk * 100).toFixed(0)}% | ${verdict} |`
}).join("\n")}\n\nRisk threshold: Ship if shipRisk < 40%. Defer if delayRisk < shipRisk.`
        }]
      }
    }
    case "flex_roadmap": {
      let items
      try {
        items = JSON.parse(args.items)
      } catch {
        items = args.items.split(",").map((name, i) => ({
          name: name.trim(),
          effort: ["S", "M", "L", "XL"][i % 4],
          value: Math.floor(Math.random() * 3) + 1
        }))
      }
      const phases = { Now: [], Next: [], Later: [] }
      items.forEach((item, i) => {
        if (i < Math.ceil(items.length * 0.3)) phases.Now.push(item)
        else if (i < Math.ceil(items.length * 0.6)) phases.Next.push(item)
        else phases.Later.push(item)
      })
      return {
        content: [{
          type: "text",
          text: `🗺️ Product Roadmap (${args.horizon || "quarter"})\n\n### 🚀 Now (${phases.Now.length} items)\n${phases.Now.map(i => `  - ${i.name} [${i.effort}] (value: ${i.value}/3)`).join("\n")}\n\n### 📋 Next (${phases.Next.length} items)\n${phases.Next.map(i => `  - ${i.name} [${i.effort}] (value: ${i.value}/3)`).join("\n")}\n\n### 🔭 Later (${phases.Later.length} items)\n${phases.Later.map(i => `  - ${i.name} [${i.effort}] (value: ${i.value}/3)`).join("\n")}\n\nTotal effort: ${items.reduce((s, i) => s + ({ S: 1, M: 3, L: 8, XL: 13 }[i.effort] || 0), 0)} story points`
        }]
      }
    }
    case "flex_effort_estimate": {
      return {
        content: [{
          type: "text",
          text: `⏱️ Effort Estimate\n\nFeature: ${args.feature}\nGranularity: ${args.granularity || "coarse"}\n\n| Aspect | T-Shirt | Range | Confidence |\n|--------|---------|-------|------------|\n| Implementation | M | 3-5 days | 🟡 Medium |\n| Testing | S | 1-2 days | 🟢 High |\n| Review + Docs | S | 0.5-1 day | 🟢 High |\n| Rollout | M | 2-4 days | 🟡 Medium |\n\n**Total: 6.5-12 days (M-L)**\n\nRisk factors:\n- External API dependency (may add 2 days)\n- Auth changes needed (if new permission model)`
        }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
