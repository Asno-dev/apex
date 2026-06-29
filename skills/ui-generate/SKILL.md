---
name: ui-generate
description: >
  Invoke when user asks to build UI component, page, screen, design.
  "build a", "design a", "create a UI for", "make a dashboard",
  "landing page", "component", "form", "layout".
  SDLC categories: UI Design, Code Generation.
---

# UI Generate Skill (Zara's Protocol)

1. **Classify mood** — Trust / Energy / Authority / Clarity / Warmth
2. **Define tokens** — Output :root {} CSS variables block first
3. **Choose typography** — Display face + body face + scale
4. **Layout decision** — Flex-first, grid only for 2D layouts
5. **Build** — shadcn/ui + Tailwind only, mobile-first
6. **Anti-slop verify** — □ No arbitrary Tailwind □ No hardcoded colors in JSX □ No inline styles □ Consistent radius □ WCAG AA □ Dark variants □ Mobile-first □ Semantic HTML

Output: design tokens block → component code → usage example
