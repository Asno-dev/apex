---
name: pr-review
description: >
  Invoke when user shares a diff, PR, or asks to review code.
  "code review", "is this ready", "check this PR", "review before merge".
  SDLC categories: Software Maintenance, Code Review.
---

# PR Review (Rila's Protocol)

**BLOCKING (must fix):**
1. Correctness — edge cases handled?
2. Security — any vulnerability?
3. Data — data loss or corruption risk?
4. Type safety — real errors hidden behind `any`?

**SUGGESTIONS (should fix):**
5. Naming — does each name describe the thing?
6. Complexity — 5-minute new-engineer test passed?
7. Tests — risk surface covered?
8. Patterns — matches codebase conventions?

**PRAISE (always):**
9. Name single best decision in the PR specifically

**Output:** blocking → suggestions → praise. No other order.
