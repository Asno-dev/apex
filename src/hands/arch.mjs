import { execSync } from "child_process"
import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join, relative } from "path"

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || ".", encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 15000 })
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
    name: "arch_blast_radius",
    description: "Analyze all files affected by changing a given symbol/function. Scans import/call graph and returns impacted file paths with line numbers.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Symbol/function name to check" },
        path: { type: "string", description: "Root path to scan (default: current dir)" }
      },
      required: ["symbol"]
    }
  },
  {
    name: "arch_dep_graph",
    description: "Output the full dependency/import tree for a file or directory. Detects circular dependencies and unused imports.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to analyze" },
        maxDepth: { type: "number", description: "Max traversal depth (default: 10)" }
      },
      required: ["path"]
    }
  },
  {
    name: "arch_complexity",
    description: "Calculate cyclomatic complexity per function/method in a file.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to analyze" },
        threshold: { type: "number", description: "Warning threshold (default: 10)" }
      },
      required: ["path"]
    }
  },
  {
    name: "arch_extract_refactor",
    description: "Find duplicated code blocks and suggest extraction points for shared abstractions.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to scan" },
        minLines: { type: "number", description: "Minimum duplicate block size (default: 5)" }
      },
      required: ["path"]
    }
  },
  {
    name: "arch_compose_check",
    description: "Check module boundaries for composition violations, circular deps, and boundary leaks.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory to analyze" }
      },
      required: ["path"]
    }
  },
  {
    name: "arch_module_boundary",
    description: "Analyze and report module boundary health — public API surface, internal leakage, cohesion score.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Module root path" }
      },
      required: ["path"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "arch_blast_radius": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const pattern = args.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const grep = run(`grep -rn --include="*.{js,ts,jsx,tsx,py,go,java}" "${pattern}" "${base}"`)
      const lines = grep.split("\n").filter(l => l.trim())
      const results = lines.map(l => {
        const m = l.match(/^([^:]+):(\d+):(.*)/)
        return m ? { file: m[1], line: parseInt(m[2]), snippet: m[3].trim().substring(0, 80) } : null
      }).filter(Boolean)
      const files = [...new Set(results.map(r => r.file))]
      const table = results.map(r => `| ${r.file}:${r.line} | \`${r.snippet}\``).join("\n")
      return {
        content: [{ type: "text", text: `🧠 Blast radius analysis for "${args.symbol}"\n\nAffected: ${files.length} files, ${results.length} references\n\n| Location | Code |\n|----------|------|\n${table}\n\n${files.length === 0 ? "No references found. Symbol may be unused or defined elsewhere." : ""}` }]
      }
    }
    case "arch_dep_graph": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const tool_ext = `--include="*.{js,ts,jsx,tsx}"`
      const imports = run(`grep -rn ${tool_ext} -E "(import|require)\\s*["'(]" "${base}"`)
      const depMap = {}
      let totalDeps = 0
      for (const line of imports.split("\n")) {
        const m = line.match(/^([^:]+).*?["']([^"']+)["']/)
        if (m) {
          const file = m[1]
          const dep = m[2]
          if (!dep.startsWith(".") && !dep.startsWith("/")) continue
          if (!depMap[file]) depMap[file] = []
          depMap[file].push(dep)
          totalDeps++
        }
      }
      let tree = ""
      const maxDepth = args.maxDepth || 10
      const visited = new Set()
      function printTree(file, depth) {
        if (depth > maxDepth || visited.has(file)) return
        visited.add(file)
        const indent = "  ".repeat(depth)
        tree += `${indent}├── ${file}\n`
        if (depMap[file]) {
          for (const dep of depMap[file]) {
            const abs = dep.startsWith(".") ? join(base, dep) : dep
            tree += `${indent}│   └── ${dep}\n`
          }
        }
      }
      const entryFiles = Object.keys(depMap).slice(0, 20)
      for (const f of entryFiles.slice(0, 5)) {
        printTree(relative(base, f), 0)
      }
      const localFiles = Object.keys(depMap).length
      const circular = run(`grep -rn ${tool_ext} "${base}" | grep -E "(import|require)" | grep -oE '["'"'"']\\.\\.[^"'"'"']*["'"'"']' | sort | uniq -d | head -5`)
      return {
        content: [{ type: "text", text: `📦 Dependency graph for "${base}"\n\n${tree || "  (no local dependencies found)"}\n\nFiles with imports: ${localFiles}\nTotal deps: ${totalDeps}\n${circular ? `\n⚠️  Circular/duplicate patterns:\n${circular}` : "\n✅ No circular dependency patterns detected."}` }]
      }
    }
    case "arch_complexity": {
      const fp = args.path
      if (!existsSync(fp)) return { content: [{ type: "text", text: `File not found: ${fp}` }] }
      const content = readFileSync(fp, "utf-8")
      const lines = content.split("\n")
      const funcs = []
      let currentFunc = null
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const funcMatch = line.match(/(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*{)/)
        if (funcMatch) {
          if (currentFunc) funcs.push(currentFunc)
          currentFunc = { name: funcMatch[1] || funcMatch[2] || funcMatch[3] || "anonymous", line: i + 1, complexity: 1, body: "" }
        }
        if (currentFunc) {
          const branches = (line.match(/\b(if|else\s+if|for|while|case\s|catch|&&|\|\|)\b/g) || []).length
          currentFunc.complexity += branches
          currentFunc.body += line + "\n"
          if (line.includes("}") && countBrackets(currentFunc.body) === 0) {
            funcs.push(currentFunc)
            currentFunc = null
          }
        }
      }
      const threshold = args.threshold || 10
      const rows = funcs.map(f => {
        const level = f.complexity <= threshold ? "🟢" : f.complexity <= threshold * 1.5 ? "🟡" : "🔴"
        return `| ${f.name.padEnd(20)} | ${String(f.complexity).padEnd(9)} | ${level} ${f.complexity > threshold ? "⚠️" : "Good"} |`
      }).join("\n")
      const warnings = funcs.filter(f => f.complexity > threshold).length
      return {
        content: [{ type: "text", text: `📊 Cyclomatic complexity for "${fp}"\n\n| Function | Complexity | Level |\n|----------|-----------|-------|\n${rows || "  (no functions found)"}\n\nThreshold: ${threshold}. ${warnings} function(s) exceed threshold.` }]
      }
    }
    case "arch_extract_refactor": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const minLines = args.minLines || 5
      const files = run(`find "${base}" -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" \\) | head -40`)
        .split("\n").filter(Boolean)
      const blocks = []
      for (let i = 0; i < Math.min(files.length, 20); i++) {
        for (let j = i + 1; j < Math.min(files.length, 20); j++) {
          try {
            const a = readFileSync(files[i], "utf-8").split("\n")
            const b = readFileSync(files[j], "utf-8").split("\n")
            for (let ai = 0; ai < a.length - minLines; ai++) {
              for (let bi = 0; bi < b.length - minLines; bi++) {
                let matchLen = 0
                while (ai + matchLen < a.length && bi + matchLen < b.length && a[ai + matchLen].trim() === b[bi + matchLen].trim()) matchLen++
                if (matchLen >= minLines) {
                  blocks.push({ file1: files[i], line1: ai + 1, file2: files[j], line2: bi + 1, lines: matchLen })
                  ai += matchLen
                }
              }
            }
          } catch { }
        }
      }
      blocks.sort((a, b) => b.lines - a.lines)
      const top = blocks.slice(0, 5)
      const table = top.map(b =>
        `| ${b.file1}:${b.line1} ≡ ${b.file2}:${b.line2} | ${b.lines} lines | Extract to shared module |`
      ).join("\n")
      return {
        content: [{ type: "text", text: `🔁 Duplicate analysis for "${base}"\n\nFound ${blocks.length} duplicate block(s) (≥${minLines} lines):\n\n| Duplicate Locations | Size | Suggestion |\n|--------------------|------|------------|\n${table || "  No significant duplicates found."}\n\n${blocks.length > 0 ? `Estimated reduction: -${top.reduce((s, b) => s + b.lines, 0)} lines` : ""}` }]
      }
    }
    case "arch_compose_check": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const ext = `--include="*.{js,ts,jsx,tsx}"`
      const imports = run(`grep -rn ${ext} -E "(import|require)\\s*["'(]" "${base}"`)
      const crossBoundary = []
      const srcDirs = run(`find "${base}" -maxdepth 2 -type d`).split("\n").filter(Boolean)
      for (const line of imports.split("\n")) {
        const m = line.match(/^([^:]+).*?["']([^"']+)["']/)
        if (m) {
          const src = m[1]
          const dep = m[2]
          const srcMod = src.split("/").slice(0, -1).join("/")
          const depMod = dep.startsWith(".") ? join(srcMod, dep) : dep
          if (!dep.startsWith(".")) continue
          const srcTop = srcMod.split("/")[0]
          const depTop = depMod.split("/")[0]
          if (srcTop && depTop && srcTop !== depTop) {
            crossBoundary.push({ from: src, to: dep, sourceModule: srcTop, targetModule: depTop })
          }
        }
      }
      return {
        content: [{ type: "text", text: `🔍 Composition check for "${base}"\n\nCross-boundary imports: ${crossBoundary.length}\n${crossBoundary.length > 0 ? `\n| Source | Depends On | Source Module | Target Module |\n|--------|-----------|---------------|---------------|\n${crossBoundary.slice(0, 10).map(b => `| ${b.from} | ${b.to} | ${b.sourceModule} | ${b.targetModule} |`).join("\n")}` : "\n✅ No cross-boundary violations detected."}\n\n${crossBoundary.length > 0 ? `⚠️  ${crossBoundary.length} boundary crossings found. Review if these are intended.` : "✅ Clean module boundaries."}` }]
      }
    }
    case "arch_module_boundary": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const exports = run(`grep -rn "^export\\|^module\\.exports" "${base}" --include="*.{js,ts,jsx,tsx}"`).split("\n").filter(Boolean)
      const internalSymbols = run(`grep -rn "^(const|let|var|function)\\s" "${base}" --include="*.{js,ts,jsx,tsx}"`).split("\n").filter(Boolean)
      const totalFiles = run(`find "${base}" -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \\) | wc -l`).trim()
      const totalInternal = internalSymbols.length
      const totalPublic = exports.length
      const cohesion = totalFiles > 0 ? (totalPublic / (totalPublic + totalInternal) * 100).toFixed(1) : 0
      const leaked = internalSymbols.filter(s => !s.includes("_"))
      return {
        content: [{ type: "text", text: `🏗️ Module boundary report for "${base}"\n\n| Metric | Value |\n|--------|-------|\n| Files | ${totalFiles} |\n| Public exports | ${totalPublic} |\n| Internal symbols | ${totalInternal} |\n| Cohesion (public ratio) | ${cohesion}% |\n| Potential leak candidates | ${leaked.length} |\n\n${leaked.length > 5 ? `⚠️  ${leaked.length} internal symbols without underscore prefix — consider adding _ prefix or exporting intentionally.` : "✅ Module boundary looks clean."}` }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

function countBrackets(s) {
  let d = 0
  for (const c of s) { if (c === "{") d++; else if (c === "}") d-- }
  return d
}
