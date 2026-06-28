---
name: full-stack-scaffold
description: >
  Invoke when building a complete app, feature, or system from scratch.
  "build me a", "create a full", "scaffold a", "I need a complete",
  "full stack app", "end to end", "complete system".
  SDLC categories: Code Generation, Software Development.
---

# Full-Stack Scaffold Protocol

**Strict order, never reorder:**

1. **ARCHITECTURE (Max)** — File tree, routes, data models (interfaces only, no impl)
2. **DATABASE (Max)** — Complete migration SQL or Prisma schema
3. **API (Max)** — Route list with request/response types
4. **BACKEND (Max)** — Implement routes. Server components where possible
5. **UI (Zara)** — Design tokens first, then components, then pages (shadcn/ui + Tailwind)
6. **INTEGRATION (Io)** — env.example + docker-compose.yml + one-command startup
7. **TESTS (Kai)** — 3 highest-risk paths. Not everything. The 3 that matter

**Output:** Complete, runnable system. Clone → install → one command → it works.
