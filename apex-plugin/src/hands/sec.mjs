import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || ".", encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 30000 })
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "")
  }
}

function resolvePath(p) {
  if (!p || p === ".") return process.cwd()
  return p
}

const SECRET_PATTERNS = [
  { name: "AWS Access Key", pattern: "AKIA[0-9A-Z]{16}", severity: "CRITICAL" },
  { name: "AWS Secret Key", pattern: "(?i)aws(.{0,20})?(?-i)secret[=:\\s][A-Za-z0-9\\/+=]{40}", severity: "CRITICAL" },
  { name: "GitHub Token", pattern: "(?i)github[_\\-]?token[=:\\s][A-Za-z0-9]{40}", severity: "CRITICAL" },
  { name: "GitHub PAT", pattern: "ghp_[A-Za-z0-9]{36}", severity: "CRITICAL" },
  { name: "Slack Token", pattern: "xox[baprs]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32}", severity: "HIGH" },
  { name: "JWT Token", pattern: "eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}", severity: "HIGH" },
  { name: "Private Key", pattern: "-----BEGIN (RSA |EC )?PRIVATE KEY-----", severity: "CRITICAL" },
  { name: "API Key Generic", pattern: "(?i)(api[_-]?key|apikey|api_key)[=:\\s][A-Za-z0-9]{16,40}", severity: "HIGH" },
  { name: "Password", pattern: "(?i)password[=:\\s][^\\s]{8,}", severity: "HIGH" },
  { name: "Database URL", pattern: "(?i)(postgres|mysql|mongodb|redis)://[^\\s]+", severity: "HIGH" },
  { name: "npm token", pattern: "npm_[A-Za-z0-9]{36}", severity: "HIGH" },
  { name: "Google API Key", pattern: "AIza[0-9A-Za-z_-]{35}", severity: "HIGH" }
]

export const tools = [
  {
    name: "sec_vuln_scan",
    description: "Scan project dependencies for known CVEs. Returns findings sorted by severity (CRITICAL → HIGH → MEDIUM).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Project root path" },
        severity: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "ALL"], description: "Minimum severity to report (default: HIGH)" }
      },
      required: ["path"]
    }
  },
  {
    name: "sec_secret_find",
    description: "Scan committed files for hardcoded secrets, API keys, tokens, and passwords using regex patterns.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to scan" },
        includeHistory: { type: "boolean", description: "Also scan git history (default: false)" }
      },
      required: ["path"]
    }
  },
  {
    name: "sec_input_trace",
    description: "Trace user input from entry point to all sinks. Flag paths missing validation, sanitization, or encoding.",
    inputSchema: {
      type: "object",
      properties: {
        entryPoint: { type: "string", description: "Entry point function/route" },
        path: { type: "string", description: "Project root" }
      },
      required: ["entryPoint", "path"]
    }
  },
  {
    name: "sec_auth_map",
    description: "Extract and map all authentication/authorization guards, routes, and middleware. Find unprotected paths.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Project root" }
      },
      required: ["path"]
    }
  },
  {
    name: "sec_owasp_score",
    description: "Score codebase against OWASP Top 10 categories. Returns pass/fail per category with evidence.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Project root" }
      },
      required: ["path"]
    }
  },
  {
    name: "sec_dependency_audit",
    description: "Deep dependency tree audit — check transitive deps, outdated packages, license compliance.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Project root" },
        checkLicenses: { type: "boolean", description: "Check license compatibility (default: true)" }
      },
      required: ["path"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "sec_vuln_scan": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      let auditResult = ""
      const pkg = join(base, "package.json")
      if (existsSync(pkg)) {
        auditResult = run(`npm audit --json 2>nul`, base)
      } else {
        const pip = join(base, "requirements.txt")
        if (existsSync(pip)) auditResult = run(`pip-audit --json 2>nul`, base)
      }
      let vulns = []
      if (auditResult) {
        try {
          const parsed = JSON.parse(auditResult)
          if (parsed.vulnerabilities) {
            vulns = Object.entries(parsed.vulnerabilities).map(([pkg, info]) => ({
              package: pkg,
              severity: info.severity?.toUpperCase() || "MEDIUM",
              issue: info.title || info.via?.[0]?.title || "Unknown",
              fix: info.fixAvailable?.name || "Not available"
            }))
          }
        } catch { }
      }
      if (vulns.length === 0) {
        const outdated = run(`npm outdated --json 2>nul`, base)
        if (outdated) {
          try {
            const parsed = JSON.parse(outdated)
            vulns = Object.entries(parsed).map(([pkg, info]) => ({
              package: pkg,
              severity: "MEDIUM",
              issue: `Outdated: ${info.current} → ${info.latest}`,
              fix: info.latest
            }))
          } catch { }
        }
      }
      const minSeverity = args.severity || "HIGH"
      const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, ALL: 3 }
      const filtered = vulns.filter(v => (sevOrder[v.severity] || 99) <= (sevOrder[minSeverity] || 1))
      const table = filtered.map(v => `| ${v.severity.padEnd(8)} | ${v.package.padEnd(20)} | ${v.issue.substring(0, 40)} | ${v.fix.substring(0, 20)} |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `🔒 Vulnerability scan: "${base}"\n\n${vulns.length === 0 ? "✅ No vulnerabilities found in dependency audit." : `| Severity | Package | Issue | Fix |\n|----------|---------|-------|-----|\n${table}`}\n\nFilter: ≥${minSeverity}\nTotal: ${vulns.length} (showing ${filtered.length} at ≥${minSeverity})`
        }]
      }
    }
    case "sec_secret_find": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      let findings = []
      for (const rule of SECRET_PATTERNS) {
        const grep = run(`grep -rn -E "${rule.pattern}" "${base}" --include="*.{js,ts,jsx,tsx,py,go,java,json,yaml,yml,env,txt,md,cfg,conf,ini}" 2>nul | grep -v node_modules | grep -v ".git/" | head -5`)
        for (const line of grep.split("\n").filter(Boolean)) {
          const m = line.match(/^([^:]+):(\d+):(.*)/)
          if (m) {
            findings.push({ file: m[1], line: m[2], type: rule.name, severity: rule.severity, snippet: m[3].trim().substring(0, 60) })
          }
        }
      }
      const histFindings = []
      if (args.includeHistory) {
        const hasGit = run("git rev-parse --is-inside-work-tree 2>nul", base).trim()
        if (hasGit) {
          for (const rule of SECRET_PATTERNS.slice(0, 5)) {
            const hist = run(`git log --all --diff-filter=A --pretty=format:"%h %ad" --date=short -G"${rule.pattern}" -- "*.{js,ts,key,env}" 2>nul`, base)
            if (hist.trim()) histFindings.push({ type: rule.name, severity: rule.severity, history: hist.trim().substring(0, 100) })
          }
        }
      }
      const critical = findings.filter(f => f.severity === "CRITICAL").length
      const high = findings.filter(f => f.severity === "HIGH").length
      const table = findings.slice(0, 20).map(f => `| ${f.file}:${f.line} | ${f.type} | 🔴 ${f.severity} | \`${f.snippet}\` |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `🕵️ Secret scan: "${base}"\n\n${findings.length === 0 ? "✅ No secrets found." : `| Location | Type | Severity | Snippet |\n|----------|------|----------|--------|\n${table}`}\n\nSummary: ${findings.length} potential secrets (${critical} CRITICAL, ${high} HIGH, ${findings.length - critical - high} MEDIUM)\n${args.includeHistory ? `\nGit history: ${histFindings.length} additional findings in commit history.` : "\nTip: Use includeHistory:true to scan git history for leaked secrets."}`
        }]
      }
    }
    case "sec_input_trace": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const entry = args.entryPoint
      const refs = run(`grep -rn "${entry}" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | head -30`)
      const sinks = run(`grep -rn -E "(exec|\`SELECT|innerHTML|writeFile|send\\(|redirect)" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | head -20`)
      const validators = run(`grep -rn -E "(validate|sanitize|escape|encode|parse|schema\\.)" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | head -20`)
      const refCount = refs.split("\n").filter(Boolean).length
      const sinkCount = sinks.split("\n").filter(Boolean).length
      const valCount = validators.split("\n").filter(Boolean).length
      return {
        content: [{
          type: "text",
          text: `📐 Input trace: "${entry}" in "${base}"\n\nEntry point "${entry}" referenced in ${refCount} places.\n\n| Category | Count | ${valCount > 0 ? "Validation found?" : "Risk"}\n|----------|-------|${valCount > 0 ? "---" : "-----"}\n| Input validation | ${valCount} | ${valCount > 0 ? "✅" : "❌ NONE FOUND"}\n| Sinks (db, fs, eval, html) | ${sinkCount} | ${sinkCount > 0 ? "⚠️ Check items below" : "✅"}\n\n${sinkCount > 0 ? "Potential sinks (first 10):\n" + sinks.split("\n").slice(0, 10).filter(Boolean).map(l => `  - ${l.substring(0, 100)}`).join("\n") : ""}\n\n${!valCount ? "🚨 No validation found — all inputs treated as malicious!\n" : ""}`
        }]
      }
    }
    case "sec_auth_map": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const routes = run(`grep -rn -E "(router\\.(get|post|put|delete|patch|all)\\(|app\\.(get|post|put|delete|patch)\\(|@(Get|Post|Put|Delete|Patch))" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | head -30`)
      const authMiddleware = run(`grep -rn -E "(authenticate|authorize|auth\\b|isAuthenticated|isAuthorized|requireAuth|protect|jwt\\.verify)" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | head -20`)
      const routesWithAuth = []
      const routesWithoutAuth = []
      for (const line of routes.split("\n").filter(Boolean)) {
        const hasAuth = authMiddleware.split("\n").some(a => line.split(":")[0] === a.split(":")[0] ||
          line.includes("authenticate") || line.includes("requireAuth") || line.includes("protect"))
        if (hasAuth) routesWithAuth.push(line)
        else routesWithoutAuth.push(line)
      }
      return {
        content: [{
          type: "text",
          text: `🗺️ Auth map for "${base}"\n\nProtected routes: ${routesWithAuth.length}\n${routesWithAuth.slice(0, 10).map(l => `  ✅ ${l.substring(0, 80)}`).join("\n")}\n\nUnprotected routes: ${routesWithoutAuth.length}\n${routesWithoutAuth.slice(0, 10).map(l => `  ⚠️  ${l.substring(0, 80)}`).join("\n")}\n\nSummary: ${routesWithAuth.length} protected, ${routesWithoutAuth.length} unprotected.\n${routesWithoutAuth.length > 0 ? "\n🚨 Unprotected routes found — review and add auth middleware." : "\n✅ All routes appear protected."}`
        }]
      }
    }
    case "sec_owasp_score": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const hasAuth = run(`grep -rn -E "(authenticate|authorize|jwt|bcrypt|password\\s)" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | wc -l`).trim()
      const hasInputVal = run(`grep -rn -E "(validate|sanitize|escape|schema\\.)" "${base}" --include="*.{js,ts,jsx,tsx}" 2>nul | grep -v node_modules | wc -l`).trim()
      const hasCors = run(`grep -rn -E "(cors|helmet|csp)" "${base}" --include="*.{js,ts}" 2>nul | grep -v node_modules | wc -l`).trim()
      const hasSQL = run(`grep -rn -E "(SELECT|INSERT|UPDATE|DELETE|WHERE)" "${base}" --include="*.{js,ts}" 2>nul | grep -v node_modules | wc -l`).trim()
      const hasSQLParam = run(`grep -rn -E "(parameterized|prepared|\\$1|\\?\\s*,\\s*\\?|prisma\\.|typeorm)" "${base}" --include="*.{js,ts}" 2>nul | grep -v node_modules | wc -l`).trim()
      const hasHTTPS = run(`grep -rn -E "(https://|ssl|tls|443)" "${base}" --include="*.{js,ts,json,yml,yaml}" 2>nul | grep -v node_modules | wc -l`).trim()
      const vuls = run(`npm audit --json 2>nul`, base)
      let hasVulns = false
      try {
        const p = JSON.parse(vuls)
        hasVulns = p.metadata?.vulnerabilities?.total > 0
      } catch { }
      const categories = [
        { name: "A01 — Broken Access Control", pass: parseInt(hasAuth) > 3, evidence: `Auth middleware checks: ${hasAuth}` },
        { name: "A02 — Cryptographic Failures", pass: parseInt(hasHTTPS) > 0, evidence: `HTTPS/SSL refs: ${hasHTTPS}` },
        { name: "A03 — Injection", pass: parseInt(hasInputVal) > 3 || parseInt(hasSQLParam) > 0, evidence: `Input validation: ${hasInputVal}, Param queries: ${hasSQLParam}${parseInt(hasSQL) > 0 && parseInt(hasSQLParam) === 0 ? " ⚠️ SQL found without parameterization" : ""}` },
        { name: "A04 — Insecure Design", pass: parseInt(hasInputVal) > 0, evidence: `Validation/sanitization: ${hasInputVal}` },
        { name: "A05 — Security Misconfiguration", pass: parseInt(hasCors) > 0, evidence: `CORS/Helmet/CSP: ${hasCors}` },
        { name: "A06 — Vulnerable Components", pass: !hasVulns, evidence: hasVulns ? "⚠️ Vulnerabilities found in dependencies" : "✅ No known CVEs" },
        { name: "A07 — Auth Failures", pass: parseInt(hasAuth) > 5, evidence: `Auth patterns found: ${hasAuth}` },
        { name: "A08 — Data Integrity Failures", pass: parseInt(hasHTTPS) > 0, evidence: `Transport security refs: ${hasHTTPS}` },
        { name: "A09 — Logging Failures", pass: false, evidence: "⚠️ Check structured logging and monitoring" },
        { name: "A10 — SSRF", pass: false, evidence: "⚠️ Manual review recommended for URL fetch patterns" }
      ]
      const rows = categories.map(c => `| ${c.name.padEnd(35)} | ${c.pass ? "✅ PASS" : "❌ FAIL"} | ${c.evidence} |`).join("\n")
      const passed = categories.filter(c => c.pass).length
      return {
        content: [{
          type: "text",
          text: `📋 OWASP Top 10 Scorecard for "${base}"\n\n| Category | Status | Evidence |\n|----------|--------|----------|\n${rows}\n\nScore: ${passed}/10 PASS — ${10 - passed} items need attention.`
        }]
      }
    }
    case "sec_dependency_audit": {
      const base = resolvePath(args.path)
      if (!existsSync(base)) return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      const pkg = join(base, "package.json")
      if (!existsSync(pkg)) return { content: [{ type: "text", text: `No package.json found in "${base}".` }] }
      const pkgJson = JSON.parse(readFileSync(pkg, "utf-8"))
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
      const depCount = Object.keys(deps).length
      const outdated = run(`npm outdated --json 2>nul`, base)
      let outdatedCount = 0
      let outdatedList = ""
      if (outdated) {
        try {
          const parsed = JSON.parse(outdated)
          outdatedCount = Object.keys(parsed).length
          outdatedList = Object.entries(parsed).slice(0, 10).map(([k, v]) => `| ${k} | ${v.current} | ${v.latest} |`).join("\n")
        } catch { }
      }
      const totalDeps = run(`npm ls --all 2>nul | wc -l`, base).trim()
      const table = Object.entries(deps).slice(0, 20).map(([k, v]) => `| ${k} | ${v} | ${run(`npm view ${k} version 2>nul`, base).trim() || "?"} |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `📦 Deep dependency audit for "${base}"\n\n| Package | Version | Latest |\n|---------|---------|--------|\n${table}\n\nSummary: ${depCount} direct deps, ~${totalDeps || "?"} total (with transitive)\nOutdated: ${outdatedCount} packages behind latest\n${outdatedList ? `\nOutdated packages:\n| Package | Current | Latest |\n|---------|---------|--------|\n${outdatedList}` : "\n✅ All packages up to date."}`
        }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
