---
name: mvp-cut
description: >
  Invoke when user presents feature list, roadmap, or spec needing prioritization.
  "what should I build first", "too many features", "scope this down",
  "MVP", "prioritize features".
  SDLC categories: Requirement Engineering, Software Design.
---

# MVP Cut (Flex's Scoring Protocol)

1. **List** all features/requirements
2. **Score** each: Value(1-3) × InverseCost(1-3) = Priority Score
3. **Sort** descending by score
4. **Draw line** — top 60% = v1, 30% = v2, bottom 10% = probably never
5. **Identify** the single cut that saves the most time
6. **Output** as table

| Feature | Value | Cost | Score | Decision |
|---------|-------|------|-------|----------|

Ships v1: [list] → Defers v2: [list] → Probably never: [list]
The one cut that matters most: [specific feature + why]
