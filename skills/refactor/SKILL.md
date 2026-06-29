---
name: refactor
description: >
  Invoke when user pastes code asking to clean, simplify, improve, compress.
  "this is too long", "make it cleaner", "too complex", "refactor this",
  "improve this code", "clean this up", "simplify this".
  SDLC categories: Code Editing, Software Maintenance.
---

# Refactor Skill

1. Read entire code unit (not just pasted section)
2. Identify single core responsibility
3. Find existing utilities/patterns in codebase that overlap
4. Find composition point — where does complexity live across callers?
5. Output: minimum correct replacement
6. State: what was eliminated and why (1 line)
7. If refactor changes behavior: flag explicitly

**Success metric:** output LOC < 30% of input LOC.
If <30% impossible: explain why complexity is irreducible.

**Heuristics:** Comment→rename. Twice→extract. Inherit→compose. 20+ lines→abstraction.
One-method class→function. Boolean params→split. Switch on types→dispatch.
