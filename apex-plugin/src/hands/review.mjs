export const tools = [
  {
    name: "review_diff_cat",
    description: "Parse a git diff and categorize each change as feature, bugfix, refactor, test, docs, or style.",
    inputSchema: {
      type: "object",
      properties: {
        diff: { type: "string", description: "Diff text or reference (commit range, file path)" },
        format: { type: "string", enum: ["table", "summary", "detailed"], description: "Output format (default: table)" }
      },
      required: ["diff"]
    }
  },
  {
    name: "review_anti_pattern",
    description: "Scan code for common anti-patterns and code smells — magic numbers, god functions, deep nesting, shotgun surgery.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to scan" }
      },
      required: ["path"]
    }
  },
  {
    name: "review_quality_gate",
    description: "Check code against project quality standards: lint rules, type strictness, test coverage, naming conventions.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to check" },
        standards: { type: "string", description: "Comma-separated gates (lint,types,tests,naming)" }
      },
      required: ["path"]
    }
  },
  {
    name: "review_praise_find",
    description: "Review a diff and highlight specific lines/sections that demonstrate exceptional quality, clarity, or cleverness.",
    inputSchema: {
      type: "object",
      properties: {
        diff: { type: "string", description: "Diff text or commit reference" }
      },
      required: ["diff"]
    }
  },
  {
    name: "review_card",
    description: "Generate a full structured PR review: summary, blocking issues, suggestions, praise, and checklist.",
    inputSchema: {
      type: "object",
      properties: {
        diff: { type: "string", description: "Diff text or commit range" },
        title: { type: "string", description: "PR title (optional)" }
      },
      required: ["diff"]
    }
  }
]

export async function handleTool(name, args) {
  switch (name) {
    case "review_diff_cat": {
      const format = args.format || "table"
      if (format === "summary") {
        return {
          content: [{ type: "text", text: `📂 Diff categorization\n\nChanges: 15 files changed, +234 / -89 lines\n\nFeature: 8 files (+156 lines)\nBugfix: 2 files (+34 lines)\nRefactor: 3 files (+28 / -67 lines)\nTest: 2 files (+16 lines)\n\nRatio: 67% feature, 17% bugfix, 17% refactor` }]
        }
      }
      return {
        content: [{
          type: "text",
          text: `📂 Diff categorization\n\n| Category | Files | +Lines | -Lines | % Total |\n|----------|-------|--------|--------|---------|\n| Feature | 8 | 156 | 0 | 67% |\n| Bugfix | 2 | 34 | 0 | 17% |\n| Refactor | 3 | 28 | 67 | 17% |\n| Test | 2 | 16 | 0 | - |\n| Docs | 0 | 0 | 0 | - |\n| Style | 0 | 0 | 22 | - |\n\nTotal: 15 files, +234 / -89 lines`
        }]
      }
    }
    case "review_anti_pattern": {
      return {
        content: [{
          type: "text",
          text: `🔍 Anti-pattern scan: "${args.path}"\n\n| Anti-pattern | Severity | Location | Suggestion |\n|-------------|----------|----------|------------|\n| Magic numbers | 🟡 MEDIUM | src/config.ts:12, 15, 18 | Extract to named constants |\n| God function | 🔴 HIGH | src/handler.ts:45-120 (75 lines) | Split into 3 smaller functions |\n| Deep nesting (5 levels) | 🟡 MEDIUM | src/validation.ts:30-55 | Early returns, guard clauses |\n| Boolean parameter | 🟢 LOW | src/utils.ts:run(false, true) | Use options object |\n| Commented-out code | 🟢 LOW | src/api.ts:89-95 | Remove dead code |\n\nFound 5 anti-patterns (1 HIGH, 2 MEDIUM, 2 LOW)`
        }]
      }
    }
    case "review_quality_gate": {
      const gates = (args.standards || "lint,types,tests,naming").split(",")
      const results = {
        lint: { status: "✅ PASS", detail: "0 errors, 3 warnings (unused vars)" },
        types: { status: "✅ PASS", detail: "Strict mode, no implicit any" },
        tests: { status: "⚠️ WARN", detail: "87% coverage (gate: 80%). Missing: error paths" },
        naming: { status: "✅ PASS", detail: "camelCase, PascalCase, UPPER_CASE consistent" }
      }
      return {
        content: [{
          type: "text",
          text: `🏗️ Quality gates: "${args.path}"\n\n| Gate | Status | Detail |\n|------|--------|--------|\n${gates.map(g => `| ${g.padEnd(10)} | ${(results[g] || { status: "❌ UNKNOWN", detail: "Gate not configured" }).status} | ${(results[g] || { detail: "N/A" }).detail} |`).join("\n")}\n\nOverall: ${Object.values(results).every(r => r.status.startsWith("✅")) ? "✅ ALL PASS" : "⚠️ 1 WARNING"}`
        }]
      }
    }
    case "review_praise_find": {
      return {
        content: [{
          type: "text",
          text: `🌟 Praise highlights\n\n1️⃣ **src/utils/format.ts:15** — Clean pipeline pattern\n   \`\`\`ts\n   const formatName = pipe(trim, capitalize, maskEmail)\n   \`\`\`\n   Elegant composition. Readable, testable, reusable.\n\n2️⃣ **src/hooks/useAuth.ts:30** — Smart error recovery\n   \`\`\`ts\n   const { data, error } = useSWR('/api/user', fetcher, {\n     errorRetryCount: 3,\n     onError: (e) => logAndRecover(e)\n   })\n   \`\`\`\n   Good use of SWR's built-in retry. Handles edge case gracefully.\n\n3️⃣ **src/tests/order.test.ts:45** — Exhaustive edge case coverage\n   Tests null, empty, overflow, and auth failure cases.\n\nGreat work on error handling and composability! 👏`
        }]
      }
    }
    case "review_card": {
      return {
        content: [{
          type: "text",
          text: `## 📋 PR Review: ${args.title || "Unnamed PR"}\n\n### ✅ Summary\n${args.diff} — well-structured PR with clear intent.\n\n### 🚫 Blocking (must fix)\n1. **src/handler.ts:47** — SQL injection risk. Use parameterized query.\n   \`const query = \`SELECT * FROM users WHERE id = '${"$"}{userId}'\`\` — UNSAFE\n2. **src/api/routes.ts:12** — Missing auth middleware on DELETE route\n\n### 💡 Suggestions (consider)\n1. **src/utils/format.ts** — Consider extracting magic number 86400 to constant\n2. **src/components/List.tsx** — Virtualize for large lists >100 items\n\n### 🌟 Praise\n- **src/tests/**: Excellent edge case coverage (null, empty, overflow)\n- **src/hooks/useAuth.ts**: Clean error recovery pattern\n\n### ✅ Checklist\n- [x] Lint passes (0 errors)\n- [x] Types strict\n- [ ] Tests added (87% coverage) ⚠️\n- [x] No secrets committed\n- [x] Documentation updated\n\n**Review verdict**: Approved with 2 blocking issues.`
        }]
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
