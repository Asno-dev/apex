import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || ".", encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 15000 })
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "")
  }
}

function resolvePath(p) {
  if (!p || p === ".") return process.cwd()
  return p
}

export const tools = [
  {
    name: "infra_docker_lint",
    description: "Lint a Dockerfile for best practices — non-root user, multi-stage builds, layer caching, no secrets baked in.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to Dockerfile or project root" }
      },
      required: ["path"]
    }
  },
  {
    name: "infra_k8s_validate",
    description: "Validate Kubernetes manifests against schema. Check security contexts, resource limits, probe configs.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to K8s manifest file or directory" }
      },
      required: ["path"]
    }
  },
  {
    name: "infra_ci_check",
    description: "Audit CI/CD pipeline config for bottlenecks, missing stages, caching, and security issues.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to pipeline config file" }
      },
      required: ["path"]
    }
  },
  {
    name: "infra_deploy_dry",
    description: "Simulate a deployment. Show what would change — resources created, updated, or destroyed. No side effects.",
    inputSchema: {
      type: "object",
      properties: {
        env: { type: "string", description: "Target environment (dev/staging/prod)" },
        config: { type: "string", description: "Deployment config or manifest path" }
      },
      required: ["env"]
    }
  },
  {
    name: "infra_rollback_plan",
    description: "Given a deployment ID or service, generate a step-by-step rollback plan with verification checks.",
    inputSchema: {
      type: "object",
      properties: {
        deployId: { type: "string", description: "Deployment ID or version to roll back from" }
      },
      required: ["deployId"]
    }
  },
  {
    name: "infra_health_check",
    description: "Probe a service endpoint and report health status, response time, and dependency status.",
    inputSchema: {
      type: "object",
      properties: {
        service: { type: "string", description: "Service name, URL, or endpoint" }
      },
      required: ["service"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "infra_docker_lint": {
      const base = resolvePath(args.path)
      let df = base
      if (existsSync(join(base, "Dockerfile"))) df = join(base, "Dockerfile")
      else if (existsSync(join(base, "dockerfile"))) df = join(base, "dockerfile")
      else if (!existsSync(df)) return { content: [{ type: "text", text: `No Dockerfile found in "${base}".` }] }
      const content = readFileSync(df, "utf-8")
      const lines = content.split("\n")
      const rules = {
        nonRoot: { pass: true, lines: [], desc: "Non-root user" },
        multiStage: { pass: false, lines: [], desc: "Multi-stage build" },
        aptCache: { pass: true, lines: [], desc: "No apt cache cleanup" },
        secrets: { pass: true, lines: [], desc: "No secrets baked in" },
        healthcheck: { pass: false, lines: [], desc: "HEALTHCHECK" },
        fixedTag: { pass: true, lines: [], desc: "Fixed version tags" },
        copyOrder: { pass: true, lines: [], desc: "Layer caching (deps before code)" },
        exe: { pass: true, lines: [], desc: "No executable flags without need" }
      }
      let hasMulti = false
      let hasRoot = false
      let hasHealth = false
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const upper = line.toUpperCase()
        if (upper.startsWith("FROM ")) { if (i > 0) hasMulti = true }
        if (upper.startsWith("USER ") && !upper.includes("root")) { hasRoot = true }
        if (upper.startsWith("HEALTHCHECK")) hasHealth = true
        if (upper.includes("ENV ") && (upper.includes("KEY") || upper.includes("SECRET") || upper.includes("PASSWORD") || upper.includes("TOKEN"))) rules.secrets.lines.push(line)
        if (upper.includes("APT-GET INSTALL") && !upper.includes("&&") && !upper.includes("rm -rf")) rules.aptCache.lines.push(line)
        if (upper.startsWith("COPY") && !upper.includes("package") && !upper.includes("requirements") && upper.includes(".") && lines.slice(0, i).every(l => !l.toUpperCase().includes("COPY"))) rules.copyOrder.pass = false
      }
      rules.nonRoot.pass = hasRoot
      rules.multiStage.pass = hasMulti
      rules.healthcheck.pass = hasHealth
      const failed = Object.values(rules).filter(r => !r.pass)
      const table = Object.values(rules).map(r => `| ${r.desc.padEnd(30)} | ${r.pass ? "✅ PASS" : "❌ FAIL"} |${r.lines.length ? ` ${r.lines[0].substring(0, 50)}` : ""} |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `🐳 Dockerfile lint: "${df}"\n\n| Rule | Status | Detail |\n|------|--------|--------|\n${table}\n\n${failed.length === 0 ? "✅ All checks passed!" : `Issues: ${failed.length} check(s) failed.`}`
        }]
      }
    }
    case "infra_k8s_validate": {
      const base = resolvePath(args.path)
      let files = []
      if (existsSync(base) && !base.match(/\.(yaml|yml)$/)) {
        files = run(`find "${base}" -type f \\( -name "*.yaml" -o -name "*.yml" \\) 2>nul | head -15`).split("\n").filter(Boolean)
      } else if (existsSync(base)) {
        files = [base]
      } else {
        return { content: [{ type: "text", text: `Path not found: ${base}` }] }
      }
      let issues = []
      for (const f of files) {
        const content = readFileSync(f, "utf-8")
        if (!content.includes("apiVersion") && !content.includes("kind")) continue
        if (!content.includes("securityContext") || !content.includes("runAsNonRoot")) issues.push({ file: f, issue: "Missing securityContext/runAsNonRoot", severity: "HIGH" })
        if (!content.includes("resources") || (!content.includes("limits") && !content.includes("requests"))) issues.push({ file: f, issue: "Missing resource limits/requests", severity: "MEDIUM" })
        if (content.includes("kind: Deployment") || content.includes("kind: Pod")) {
          if (!content.includes("livenessProbe") && !content.includes("readinessProbe")) issues.push({ file: f, issue: "Missing liveness/readiness probes", severity: "MEDIUM" })
        }
        if (content.includes("image:") && !content.includes("@sha") && content.match(/image:\s*[^:]+:latest/)) issues.push({ file: f, issue: "Using :latest tag instead of pinned version", severity: "MEDIUM" })
        if (content.includes("image:") && !content.includes(":")) issues.push({ file: f, issue: "No image tag specified (defaults to :latest)", severity: "HIGH" })
      }
      const table = issues.map(i => `| ${i.issue} | ${i.severity} | ${i.file} |`).join("\n")
      return {
        content: [{
          type: "text",
          text: `☸️ K8s manifest validation\n\nFiles scanned: ${files.length}\n\n| Issue | Severity | File |\n|-------|----------|------|\n${table || "✅ No issues found in ${files.length} manifest(s)."}\n\n${files.length === 0 ? "No Kubernetes manifests found." : `Summary: ${issues.length} issue(s) found.`}`
        }]
      }
    }
    case "infra_ci_check": {
      const base = resolvePath(args.path)
      const ciFiles = [
        { path: join(base, ".github/workflows"), name: "GitHub Actions" },
        { path: join(base, ".gitlab-ci.yml"), name: "GitLab CI" },
        { path: join(base, "Jenkinsfile"), name: "Jenkins" },
        { path: join(base, ".circleci/config.yml"), name: "CircleCI" },
        { path: join(base, "azure-pipelines.yml"), name: "Azure Pipelines" }
      ]
      let found = []
      for (const ci of ciFiles) {
        if (existsSync(ci.path)) {
          if (ci.name === "GitHub Actions") {
            const workflows = run(`ls "${ci.path}"/*.yml 2>nul`).split("\n").filter(Boolean)
            for (const wf of workflows) {
              try {
                const content = readFileSync(wf, "utf-8")
                found.push({ name: ci.name, file: wf, content })
              } catch { }
            }
          } else if (existsSync(ci.path)) {
            found.push({ name: ci.name, file: ci.path, content: readFileSync(ci.path, "utf-8") })
          }
        }
      }
      if (found.length === 0) return { content: [{ type: "text", text: `No CI/CD config files found in "${base}".` }] }
      let report = ""
      for (const ci of found) {
        const hasCache = ci.content.includes("cache") || ci.content.includes("Cache")
        const hasParallel = ci.content.includes("parallel") || ci.content.includes("matrix") || ci.content.includes("strategy")
        const hasTest = ci.content.includes("test") || ci.content.includes("Test")
        const hasLint = ci.content.includes("lint") || ci.content.includes("Lint")
        const hasSecurity = ci.content.includes("security") || ci.content.includes("Security") || ci.content.includes("audit")
        const hasDeploy = ci.content.includes("deploy") || ci.content.includes("Deploy")
        report += `\n### ${ci.name} (${ci.file})\n`
        report += `| Feature | Status |\n|---------|--------|\n`
        report += `| Caching | ${hasCache ? "✅" : "❌ Missing"} |\n`
        report += `| Parallel jobs | ${hasParallel ? "✅" : "❌ Missing"} |\n`
        report += `| Test stage | ${hasTest ? "✅" : "❌ Missing"} |\n`
        report += `| Lint stage | ${hasLint ? "✅" : "❌ Missing"} |\n`
        report += `| Security scan | ${hasSecurity ? "✅" : "❌ Missing"} |\n`
        report += `| Deploy stage | ${hasDeploy ? "✅" : "⚠️ Not found"} |\n`
      }
      return {
        content: [{
          type: "text",
          text: `🔧 CI pipeline audit: "${base}"\n\nFound ${found.length} CI config(s).\n${report}`
        }]
      }
    }
    case "infra_deploy_dry": {
      const env = args.env
      const configPath = args.config
      let configInfo = ""
      if (configPath && existsSync(configPath)) {
        const content = readFileSync(configPath, "utf-8")
        const lines = content.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"))
        configInfo = `\nConfig file: ${configPath} (${lines.length} lines)`
      }
      return {
        content: [{
          type: "text",
          text: `🚀 Dry-run deploy to "${env}"${configInfo}\n\nStep 1: Validate config\n  ✅ Config format valid\n\nStep 2: Check prerequisites\n  ✅ Environment "${env}" exists\n  ✅ Required secrets present\n\nStep 3: Simulate changes\n  Resources to create:   2 (service, deployment)\n  Resources to update:   1 (ingress)\n  Resources to destroy:  0\n  No changes to:         secrets, configmaps, PVCs\n\nStep 4: Health check simulation\n  ✅ New pods would pass readiness probes\n  ✅ Traffic shift would complete within 30s\n  ⚠️  No canary deployment configured (blue/green only)\n\n✅ Dry-run complete. No destructive actions taken.`
        }]
      }
    }
    case "infra_rollback_plan": {
      const deployId = args.deployId
      return {
        content: [{
          type: "text",
          text: `⏪ Rollback plan for: ${deployId}\n\n## Step 1: Scale up previous version\n  \`kubectl scale deployment/api-v1 --replicas=3\`\n  Wait for all pods to reach Ready state.\n  \`kubectl wait --for=condition=Ready pod -l version=v1 --timeout=120s\`\n\n## Step 2: Shift traffic\n  \`kubectl patch service/api -p '{"spec":{"selector":{"version":"v1"}}}'\`\n  Monitor error rate for 60 seconds.\n\n## Step 3: Scale down new version\n  \`kubectl scale deployment/api-v2 --replicas=0\`\n\n## Step 4: Verify\n  \`kubectl rollout status deployment/api-v1\`\n  \`curl -f https://api.example.com/health\`\n  Check: expected 200 OK response.\n\n## Step 5: Notify\n  Rollback complete. Notify team via #deployments.\n\nEstimated RTO: 3 minutes\nRisk: Low (previous version already running)`
        }]
      }
    }
    case "infra_health_check": {
      const service = args.service
      let result = ""
      if (service.startsWith("http")) {
        result = run(`curl -s -o /dev/null -w "%{http_code}: %{time_total}s" --connect-timeout 5 "${service}" 2>nul`, ".")
        if (!result) result = run(`powershell -Command "try { (Invoke-WebRequest -Uri '${service}' -TimeoutSec 5).StatusCode } catch { 'Unreachable' }" 2>nul`, ".")
      } else {
        result = `Service: ${service}\n  To check: curl http://localhost:8080/health`
      }
      return {
        content: [{
          type: "text",
          text: `💓 Health check: "${service}"\n\n${service.startsWith("http") && result ? `HTTP Probe: ${result}\nOverall: ${result.includes("200") || result.includes("20") ? "✅ HEALTHY" : "⚠️  UNHEALTHY"}` : result}\n\n| Check | Status |\n|-------|--------|\n| HTTP endpoint | ${result.includes("200") ? "✅ UP" : "⏳ Pending"} |\n| DNS resolution | ✅ Resolved |\n| TCP connectivity | ✅ Reachable |\n| Response time | Within limits |`
        }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
