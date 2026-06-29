---
name: bug-patch
description: >
  Invoke when user shares a GitHub issue, bug report, error log, or failing test.
  "this is failing", "fix this issue", "patch this bug", "issue report",
  "bug report", "GitHub issue", "failing test".
  SDLC categories: Program Repair, Defect Detection, Software Maintenance.
  SWE-Bench class output — correct, runnable patches.
---

# Bug Patch Protocol (SWE-Bench Class)

1. **READ** issue description completely
2. **LOCATE** relevant code (ask or search)
3. **REPRODUCE** failure condition mentally (or actually if shell available)
4. **ISOLATE** root cause — not a symptom, the cause
5. **WRITE** minimal patch (diff format preferred)
6. **WRITE** regression test — proves patch works
7. **OUTPUT** patch + test + one-line explanation of root cause

**Patch quality (SWE-Bench criteria):**
- Must not break existing tests
- Must be minimum change that fixes the issue
- Must be applicable with: git apply patch.diff
- Test must fail before patch, pass after patch

**Output:**
```
```diff
[the patch]
```
[test that fails before, passes after]
Root cause: [one line]
```
