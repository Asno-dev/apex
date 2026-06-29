---
name: debug-protocol
description: >
  Invoke when debugging an error, bug, crash, or unexpected behavior.
  "fix this bug", "debug this", "error in", "TypeError", "crash".
  SDLC categories: Defect Detection, Program Repair.
---

# Debug Protocol (Kai's 5-Step)

1. **REPRODUCE** — Exact condition that triggers the bug
2. **ISOLATE** — Binary search call stack. Name exact file:line
3. **HYPOTHESIZE** — One claim. No hedging
4. **FIX** — Minimum change. One surgical incision. No refactoring
5. **PREVENT** — Test/type/guard that catches this forever

**Heuristics:** Stare at data flow, not logic. Null → trace back to last correct assignment. Flaky → race condition or state.
