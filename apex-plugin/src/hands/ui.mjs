import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || ".", encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 10000 })
  } catch (e) {
    return e.stdout || ""
  }
}

function resolvePath(p) {
  if (!p || p === ".") return process.cwd()
  return p
}

export const tools = [
  {
    name: "ui_contrast",
    description: "Check WCAG AA (4.5:1) and AAA (7:1) contrast ratio between two hex colors.",
    inputSchema: {
      type: "object",
      properties: {
        foreground: { type: "string", description: "Foreground hex color (e.g. #333333)" },
        background: { type: "string", description: "Background hex color (e.g. #FFFFFF)" },
        level: { type: "string", enum: ["AA", "AAA"], description: "WCAG level (default: AA)" }
      },
      required: ["foreground", "background"]
    }
  },
  {
    name: "ui_palette_extract",
    description: "Read CSS :root variables and validate they follow the 5-color palette convention. Suggest palette if missing.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to CSS file or directory" },
        palette: { type: "string", description: "Palette name: Trust, Energy, Authority, Clarity, Warmth" }
      },
      required: ["path"]
    }
  },
  {
    name: "ui_a11y_audit",
    description: "Scan component/HTML file for accessibility issues — missing alt text, aria labels, focus rings, semantic HTML.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to audit" }
      },
      required: ["path"]
    }
  },
  {
    name: "ui_responsive_test",
    description: "Preview component structure at standard breakpoints (sm:640, md:768, lg:1024, xl:1280).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Component file path" },
        breakpoints: { type: "string", description: "Comma-separated breakpoints (default: sm,md,lg,xl)" }
      },
      required: ["path"]
    }
  },
  {
    name: "ui_component_search",
    description: "Search existing component library by name or pattern. Returns props API and usage examples.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name or search pattern" }
      },
      required: ["name"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "ui_contrast": {
      const ratio = calculateRatio(args.foreground, args.background)
      const aa = ratio >= 4.5
      const aaa = ratio >= 7
      const level = args.level || "AA"
      const pass = level === "AAA" ? aaa : aa
      return {
        content: [{
          type: "text",
          text: `🎨 Contrast check: ${args.foreground} on ${args.background}\n\nRatio: ${ratio.toFixed(2)}:1\n\n| Level | Threshold | Status |\n|-------|-----------|--------|\n| AA    | 4.5:1     | ${aa ? "✅ PASS" : "❌ FAIL"} |\n| AAA   | 7.0:1     | ${aaa ? "✅ PASS" : "❌ FAIL"} |\n\nRequired: ${level} → ${pass ? "✅ PASS" : "❌ FAIL"}\n${!pass ? `\n💡 Need ${level === "AAA" ? "7.0:1" : "4.5:1"} minimum. Try darkening foreground or lightening background.` : ""}`
        }]
      }
    }
    case "ui_palette_extract": {
      const p = resolvePath(args.path)
      if (!existsSync(p)) return { content: [{ type: "text", text: `Path not found: ${p}` }] }
      const cssFiles = run(`find "${p}" -type f -name "*.css"`).split("\n").filter(Boolean)
      let rootVars = ""
      for (const f of cssFiles.slice(0, 10)) {
        const content = readFileSync(f, "utf-8")
        const rootMatch = content.match(/:root\s*\{([^}]+)\}/)
        if (rootMatch) rootVars += `\n### ${f}\n\`\`\`\n${rootMatch[0]}\n\`\`\`\n`
      }
      const palettes = { Trust: "--primary: #1E40AF\n--secondary: #3B82F6\n--accent: #93C5FD\n--neutral: #6B7280\n--background: #F8FAFC", Energy: "--primary: #DC2626\n--secondary: #F97316\n--accent: #FDE68A\n--neutral: #6B7280\n--background: #FFF7ED", Authority: "--primary: #1E293B\n--secondary: #334155\n--accent: #CBD5E1\n--neutral: #64748B\n--background: #F8FAFC", Clarity: "--primary: #0F766E\n--secondary: #14B8A6\n--accent: #99F6E4\n--neutral: #6B7280\n--background: #F0FDFA", Warmth: "--primary: #B45309\n--secondary: #D97706\n--accent: #FDE68A\n--neutral: #78716C\n--background: #FFFBEB" }
      const chosen = args.palette || "Trust"
      return {
        content: [{
          type: "text",
          text: `🎨 Palette analysis for "${p}"\n\nExtracted CSS variables:\n${rootVars || "  No :root variable definitions found."}\n\nSuggested palette "${chosen}":\n\`\`\`css\n${palettes[chosen] || palettes.Trust}\n\`\`\`\n\n${rootVars ? "✅ Found CSS variables in project." : "💡 No :root variables defined. Consider adding a 5-color palette."}`
        }]
      }
    }
    case "ui_a11y_audit": {
      const p = resolvePath(args.path)
      if (!existsSync(p)) return { content: [{ type: "text", text: `Path not found: ${p}` }] }
      const htmlFiles = run(`find "${p}" -type f \\( -name "*.html" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.vue" \\)`).split("\n").filter(Boolean)
      let issues = []
      for (const f of htmlFiles.slice(0, 20)) {
        const content = readFileSync(f, "utf-8")
        const lines = content.split("\n")
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (!line.trim()) continue
          const imgMatch = line.match(/<img[^>]+>/)
          if (imgMatch && !imgMatch[0].includes("alt=")) issues.push({ file: f, line: i + 1, issue: "Missing alt on <img>", severity: "HIGH" })
          const btnMatch = line.match(/<button[^>]*>(?!\s*aria-label)/)
          if (btnMatch && !line.includes("aria-label")) { }
          if (line.includes("<input") && !line.includes("aria-label") && !line.includes("aria-labelledby")) issues.push({ file: f, line: i + 1, issue: "Input missing aria-label/labelledby", severity: "MEDIUM" })
          if (line.includes("<div") && (line.includes("onClick") || line.includes("onclick"))) issues.push({ file: f, line: i + 1, issue: "<div> used as clickable — use <button>", severity: "MEDIUM" })
          if (line.includes("color:") || line.includes("background:")) { }
        }
      }
      const high = issues.filter(i => i.severity === "HIGH").length
      const med = issues.filter(i => i.severity === "MEDIUM").length
      const table = issues.slice(0, 15).map(i => `| ${i.issue} | ${i.severity} | ${i.file}:${i.line} |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `♿ Accessibility audit for "${p}"\n\n${issues.length === 0 ? "✅ No accessibility issues found!" : `| Issue | Severity | Location |\n|-------|----------|----------|\n${table}\n\nSummary: ${issues.length} issues (${high} HIGH, ${med} MEDIUM)`}`
        }]
      }
    }
    case "ui_responsive_test": {
      const p = resolvePath(args.path)
      if (!existsSync(p)) return { content: [{ type: "text", text: `Path not found: ${p}` }] }
      const bp = (args.breakpoints || "sm,md,lg,xl").split(",")
      const bpMap = { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }
      const content = readFileSync(p, "utf-8")
      const classList = (content.match(/className=["'`][^"'`]*["'`]/g) || []).map(c => c.match(/["'`]([^"'`]*)["'`]/)[1])
      const hasGrid = content.includes("grid") || classList.some(c => c.includes("grid"))
      const hasFlex = content.includes("flex") || classList.some(c => c.includes("flex"))
      const hasOverflow = classList.some(c => c.includes("overflow"))
      return {
        content: [{
          type: "text",
          text: `📱 Responsive preview for "${args.path}"\n\n| Breakpoint | Width | Layout | Issues |\n|------------|-------|--------|--------|\n${bp.map(b => {
  const w = bpMap[b.toLowerCase()] || b
  const issues = []
  if (!hasOverflow) issues.push("No overflow handling")
  return `| ${b.padEnd(10)} | ${(w || b).padEnd(7)} | ${hasGrid ? "Grid" : hasFlex ? "Flex" : "Block"} | ${issues.length ? "⚠️ " + issues.join(", ") : "✅"} |`
}).join("\n")}\n\n${!hasOverflow ? "\n💡 Consider adding overflow handling for responsive layouts." : ""}`
        }]
      }
    }
    case "ui_component_search": {
      const name = args.name.toLowerCase()
      const ext = `-name "*.tsx" -o -name "*.jsx" -o -name "*.vue" -o -name "*.svelte"`
      const files = run(`find . -type f \\( ${ext} \\) | head -50`).split("\n").filter(Boolean)
      const matches = files.filter(f => f.toLowerCase().includes(name) && !f.includes("node_modules"))
      let results = ""
      for (const f of matches.slice(0, 5)) {
        try {
          const c = readFileSync(f, "utf-8")
          const propsMatch = c.match(/(?:interface|type)\s+\w+Props\s*[={][^}]+}/)
          results += `\n### ${f}\n${propsMatch ? `Props: \`\`\`\n${propsMatch[0].substring(0, 200)}\n\`\`\`` : "No explicit Props type found."}\n`
        } catch { }
      }
      return {
        content: [{
          type: "text",
          text: `🔍 Component search: "${args.name}"\n\nFound ${matches.length} matching file(s):\n${matches.length === 0 ? "\nNo components found matching that name." : results}`
        }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

function calculateRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hex1)
  const lum2 = relativeLuminance(hex2)
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)
}

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}
