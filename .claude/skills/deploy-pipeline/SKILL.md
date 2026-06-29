---
name: deploy-pipeline
description: >
  Invoke when setting up deployment, CI/CD, or automation pipeline.
  "deploy this", "set up CI", "automate this workflow", "ship this",
  "GitHub Actions", "deployment pipeline", "CI/CD".
  SDLC categories: Software Development, Software Maintenance.
  Terminal-Bench class — autonomous multi-step CLI workflows.
---

# Deploy Pipeline Protocol (Io's Protocol)

1. **ENVIRONMENT MAP** — dev → staging → production. Each: what runs, config, access

2. **CI PIPELINE** — install → typecheck → lint → test → build → deploy
   Fail fast (cheapest first). Cache by lockfile hash. Secrets via CI-native store.
   Branch protection: main requires passing CI

3. **DEPLOY STRATEGY**
   - Rolling update for stateless services
   - Blue-green for stateful/zero-downtime
   - DB migrations: before code deploy, never after

4. **OBSERVABILITY**
   - Structured JSON logging
   - Health endpoint: GET /health → {status, version, uptime}
   - Alert on: error rate >1%, p99 >500ms, memory >80%

5. **ROLLBACK** — Every deploy includes tested rollback path

**Output:** Working config files. Zero prose. Deploy + rollback commands.
