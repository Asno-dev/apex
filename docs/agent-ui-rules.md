# APEX UI Generation Rules — Zara's Strict Constraints

> Injected into every UI task context. These are NON-NEGOTIABLE rules for code generation.

---

## HARD CONSTRAINTS (Never Break)

### 1. Component Architecture
- **One component per file** — never build everything in a single file
- **Import from library**: always `import { Button } from "@/components/ui/button"`
- **Never inline components**: no defining components inside `page.tsx`
- **File organization**: `ui/` for shadcn primitives, `layout/` for shell, `sections/` for page sections, `shared/` for reusable patterns, `pages/` for page compositions
- **Props**: always define `interface ComponentNameProps` with TypeScript — never `any`

### 2. Design Tokens
- **Colors**: CSS variables from `:root` block only — never hardcoded hex in JSX
- **Spacing**: Tailwind scale values only (`p-4`, not `p-[16px]`) — never arbitrary values
- **Shadows**: Tailwind shadow scale only (`shadow-sm`, `shadow-md`, `shadow-lg`)
- **Border radius**: Tailwind radius scale only (`rounded`, `rounded-md`, `rounded-lg`)
- **Never** use `[arbitrary]` Tailwind values for ANY property

### 3. Responsive Design
- **Mobile-first**: base styles (no prefix) → `sm:` → `md:` → `lg:` → `xl:` → `2xl:`
- **Test every breakpoint**: 640px, 768px, 1024px, 1280px, 1536px
- **No horizontal scroll** at any viewport width
- **No 100vw** — use `w-full` inside containers
- **Touch targets**: minimum 44x44px on mobile

### 4. Dark Mode
- **Every component** gets complete `dark:` variants
- Test: all `bg-*` have `dark:bg-*`, all `text-*` have `dark:text-*`
- Dark mode borders are typically darker (not lighter) than light mode

### 5. Accessibility (WCAG AA)
- **Contrast**: text on background ≥ 4.5:1 (normal text), ≥ 3:1 (large text ≥18px bold or ≥24px)
- **Focus**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` on ALL interactive elements
- **Semantic HTML**: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>` — never bare `<div>` for structural elements
- **Images**: every `<img>` has `alt` attribute (empty string `alt=""` for decorative)
- **Forms**: every `<input>` has associated `<label>` or `aria-label`
- **Icon buttons**: `aria-label` + `<span className="sr-only">Visible text</span>`
- **Keyboard navigation**: all interactive elements reachable and operable by keyboard
- **Reduced motion**: respect `prefers-reduced-motion`

### 6. Icons
- **Lucide React only** — from `lucide-react`
- **Sizes**: only `h-4 w-4` (16px), `h-5 w-5` (20px), `h-6 w-6` (24px)
- **Stroke width**: `strokeWidth={1.5}` (default), `strokeWidth={2}` for 16px icons
- **Icon buttons**: use `variant="ghost" size="icon"` from shadcn Button

### 7. Transitions & Motion
- **Default duration**: `duration-200` (200ms)
- **Hover states**: `hover:opacity-80` OR `hover:shadow-md` — NEVER both
- **Loading**: `<Skeleton className="..." />` from shadcn/ui — NEVER spinners
- **Entrance animations**: subtle — fade in, slide up from 4px, scale from 95%
- **No page load animations** — only interaction-driven animations
- **Accessibility**: wrap animations with `@media (prefers-reduced-motion: reduce)`

### 8. Component States
Every interactive component handles these states:
- **Default** — visible, interactive, styled
- **Hover** — visual feedback (`hover:*` classes)
- **Focus** — `focus-visible:ring-2` ring
- **Active** — press state via `active:scale-[0.98]` or similar
- **Disabled** — `opacity-50 cursor-not-allowed`
- **Loading** — `<Skeleton>` for content areas, disabled + spinner for buttons
- **Error** — `border-destructive` on inputs, error messages below
- **Empty** — meaningful placeholder message + optional illustration
- **Edge cases** — very long text truncation, very short text alignment, missing data fallback

### 9. Anti-Slop Violations (NEVER do these)
| Violation | Instead Do |
|-----------|-----------|
| Gradient backgrounds | Solid color or layered transparency |
| Box shadow on every element | Elevation hierarchy (shadow-sm/md/lg) |
| 3+ font families | 2 max: display + body |
| Arbitrary Tailwind values | Scale values only |
| Decorative emoji in UI | Lucide icons or nothing |
| ALL CAPS labels | `font-semibold` text |
| Lorem ipsum | "Feature title" / real descriptive text |
| Card with shadow AND border | Choose shadow OR border |
| Inline styles (`style={{}}`) | CSS classes only |
| Hardcoded hex in JSX | CSS variable through Tailwind |
| Bare `<div>` as clickable | `<button>` or `<a>` with proper roles |
| Missing alt text on images | Alt on every `<img>` |
| Dead buttons (no onClick/href) | Every clickable has a handler |
| `100vh` layout | `min-h-screen` |
| Random icon sizes | h-4, h-5, or h-6 only |
| Missing dark mode variants | Complete dark: prefix coverage |
| Single-file page components | One component per file |
| `any` TypeScript types | Proper interfaces |

### 10. Generation Order
Always generate in this order:

1. **Design tokens** — CSS variables in `:root` + `.dark`
2. **UI primitives** — atoms first (Button, Input, Card)
3. **Composed components** — molecules from atoms (SearchBar, NavItem)
4. **Section components** — organisms from molecules (Hero, Features, Pricing)
5. **Layout components** — page shells (DashboardLayout, MarketingLayout)
6. **Page components** — full page compositions from sections + layout
7. **Route files** — link pages to routes
8. **Usage examples** — show how to combine everything

### 11. Color Palette Selection Rules

| If the project is... | Use palette... |
|---------------------|---------------|
| Fintech, banking, insurance | Trust |
| Healthcare, medical, wellness | Trust or Warmth |
| Legal, compliance, security | Authority |
| Startup, consumer app | Energy |
| Social media, entertainment | Energy or Aurora |
| Enterprise B2B, admin tools | Authority |
| Developer tools, API, documentation | Clarity |
| Education, non-profit | Warmth |
| E-commerce, retail | Energy or Trust |
| Creative portfolio, agency | Aurora or Minimal |
| Luxury, premium brand | Midnight |
| Nature, outdoors, organic | Forest |
| Travel, hospitality | Ocean |
| Content, editorial, publishing | Minimal or Clarity |
| Gaming, entertainment | Aurora or Energy |
| Dark-first experience | Midnight |

### 12. Typography Selection Rules

| If the palette is... | Use font pairing... |
|---------------------|-------------------|
| Trust | Inter + Inter (or Plus Jakarta Sans + Inter) |
| Energy | DM Sans + Inter |
| Authority | Space Grotesk + Inter |
| Clarity | Space Grotesk + Inter (or JetBrains Mono for code) |
| Warmth | Fraunces + Inter |
| Midnight | Plus Jakarta Sans + Inter |
| Forest | Playfair Display + Inter |
| Ocean | Inter + Inter |
| Aurora | Fredoka + Inter |
| Minimal | Outfit + Outfit |

### 13. Verified-by-Default Checklist

Before any output, verify:

```
___ Chosen palette matches domain
___ WCAG AA contrast (all text/background pairs)
___ 2 fonts max (display + body)
___ Mobile-first responsive (no horizontal scroll)
___ Complete dark mode (dark: variants everywhere)
___ focus-visible:ring-2 on all interactive
___ Semantic HTML (nav, main, section, article, aside)
___ All images have alt text
___ Icons: aria-hidden or sr-only, consistent sizes
___ Skeleton loaders (not spinners)
___ Empty states (meaningful placeholders)
___ Error states (graceful fallbacks)
___ 200ms transitions, hover effects
___ No arbitrary Tailwind values
___ One component per file
___ shadcn/ui imports (not custom builds)
___ No anti-slop violations (gradients, ALL CAPS, emoji)
___ Real content (not lorem ipsum)
```
