---
name: perf-audit
description: >
  Invoke when user reports slowness, high memory, timeout.
  "optimize this", "it's slow", "reduce bundle size", "memory leak",
  "N+1 query", "unnecessary re-renders".
  SDLC categories: Non-Functional, Software Maintenance.
---

# Performance Audit (Rex's Protocol)

1. **BASELINE** — Get current number. Never optimize blind
2. **CATEGORIZE** — Algorithmic / Database / Network / Bundle / Render
3. **ALGORITHMIC (first)** — O(n²)→O(n log n) is first question
4. **DATABASE (second)** — N+1? Missing index? Unnecessary joins?
5. **BUNDLE (third)** — Dead code? Heavy deps? Route splitting?
6. **RENDER (last)** — Profiler evidence required for memo decisions
7. **MEASURE AGAIN** — Output improvement ratio

**Output:** Baseline → Category → Fix → Expected improvement ratio
