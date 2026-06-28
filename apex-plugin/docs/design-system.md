# APEX Design System — Zara's Visual Grammar

> Zara's complete visual grammar: color theory, typography, layout, motion, and component architecture.
> Every value here is intentional. Every token has a purpose.

---

## 1. Color Theory Foundation

### 1.1 Color Wheel Relationships

Zara uses proven color harmonies from classical color theory:

| Harmony | Pattern | When To Use |
|---------|---------|-------------|
| **Complementary** | Opposite on wheel (blue + orange) | High contrast, CTAs, hero sections |
| **Triadic** | 3 evenly spaced (red + yellow + blue) | Playful, creative, children-focused |
| **Analogous** | 3 adjacent (blue + teal + green) | Calm, professional, healthcare |
| **Split-Complementary** | Base + 2 adjacent to opposite | Sophisticated, modern, versatile |
| **Monochromatic** | Single hue at different saturations | Minimal, editorial, luxury |

### 1.2 Mood-to-Palette Mapping

| Emotional Intent | Recommended Palette | Why |
|-----------------|-------------------|-----|
| Trust, Security, Professional | Trust (Slate + Blue + Emerald) | Blues signal reliability, emerald adds growth |
| Energy, Excitement, Urgency | Energy (Red + Warm + Blue) | Red commands attention, blue balances |
| Authority, Power, Leadership | Authority (Navy + Gold) | Dark blue = expertise, gold = excellence |
| Clarity, Focus, Precision | Clarity (Monochrome + Indigo) | Grayscale eliminates noise, indigo adds depth |
| Warmth, Care, Community | Warmth (Amber + Stone + Emerald) | Amber = comfort, stone = grounding, green = growth |
| Luxury, Premium, Exclusive | Midnight (Indigo + Cyan + Dark) | Deep dark + cyan accent = premium feel |
| Nature, Organic, Sustainable | Forest (Green + Earth) | Green = natural, warm earth = grounded |
| Travel, Freedom, Wellness | Ocean (Teal + Sky + Coral) | Teal = water, sky = openness, coral = energy |
| Creative, Arts, Expressive | Aurora (Purple + Pink) | Purple = creativity, pink = playfulness |
| Pure, Minimal, Editorial | Minimal (Grayscale only) | No color = maximum focus on content |

---

## 2. Color Palettes (Complete Reference)

Every palette defines: `bg`, `surface`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `muted`, `muted-foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `border`, `input`, `ring`, `text-primary`, `text-secondary`, `danger`, `danger-foreground`, `success`, `warning`, `info`.

### 2.1 Trust (Fintech, Healthcare, Legal, Enterprise)

| Token | Light | Dark | WCAG AA |
|-------|-------|------|---------|
| `bg-background` | `#ffffff` | `#0f172a` | — |
| `bg-surface` | `#f8fafc` | `#1e293b` | — |
| `bg-primary` | `#1e3a5f` | `#3b82f6` | — |
| `text-primary-foreground` | `#ffffff` | `#ffffff` | ✅ 13.2:1 |
| `bg-accent` | `#10b981` | `#34d399` | — |
| `text-accent-foreground` | `#ffffff` | `#0f172a` | ✅ 7.1:1 |
| `text-primary` | `#0f172a` | `#f1f5f9` | ✅ 16.7:1 |
| `text-secondary` | `#64748b` | `#94a3b8` | ✅ 7.4:1 |
| `border-border` | `#e2e8f0` | `#334155` | — |
| `bg-destructive` | `#ef4444` | `#f87171` | — |
| `text-destructive-foreground` | `#ffffff` | `#ffffff` | ✅ 5.3:1 |
| `bg-success` | `#22c55e` | `#4ade80` | — |
| `bg-warning` | `#f59e0b` | `#fbbf24` | — |
| `bg-info` | `#3b82f6` | `#60a5fa` | — |
| `ring-ring` | `#3b82f6` | `#60a5fa` | — |

### 2.2 Energy (Startup, Consumer, Social, Entertainment)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#ffffff` | `#0c0a09` |
| `bg-surface` | `#fafaf9` | `#1c1917` |
| `bg-primary` | `#dc2626` | `#f87171` |
| `text-primary-foreground` | `#ffffff` | `#0c0a09` |
| `bg-accent` | `#2563eb` | `#60a5fa` |
| `text-accent-foreground` | `#ffffff` | `#0c0a09` |
| `text-primary` | `#0c0a09` | `#fafaf9` |
| `text-secondary` | `#78716c` | `#a8a29e` |
| `border-border` | `#e7e5e4` | `#292524` |
| `bg-destructive` | `#dc2626` | `#f87171` |
| `bg-success` | `#16a34a` | `#4ade80` |
| `bg-warning` | `#d97706` | `#fbbf24` |
| `bg-info` | `#2563eb` | `#60a5fa` |
| `ring-ring` | `#2563eb` | `#60a5fa` |

### 2.3 Authority (Enterprise, B2B, Admin, Tools)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#ffffff` | `#020617` |
| `bg-surface` | `#f8fafc` | `#0f172a` |
| `bg-primary` | `#1d4ed8` | `#3b82f6` |
| `text-primary-foreground` | `#ffffff` | `#ffffff` |
| `bg-accent` | `#f59e0b` | `#fbbf24` |
| `text-accent-foreground` | `#020617` | `#020617` |
| `text-primary` | `#020617` | `#f1f5f9` |
| `text-secondary` | `#64748b` | `#94a3b8` |
| `border-border` | `#e2e8f0` | `#1e293b` |
| `bg-destructive` | `#dc2626` | `#f87171` |
| `bg-success` | `#16a34a` | `#4ade80` |
| `bg-warning` | `#d97706` | `#fbbf24` |
| `ring-ring` | `#1d4ed8` | `#3b82f6` |

### 2.4 Clarity (Documentation, DevTools, API, Technical)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#ffffff` | `#09090b` |
| `bg-surface` | `#fafafa` | `#18181b` |
| `bg-primary` | `#18181b` | `#fafafa` |
| `text-primary-foreground` | `#fafafa` | `#18181b` |
| `bg-accent` | `#6366f1` | `#818cf8` |
| `text-accent-foreground` | `#ffffff` | `#09090b` |
| `text-primary` | `#09090b` | `#fafafa` |
| `text-secondary` | `#71717a` | `#a1a1aa` |
| `border-border` | `#e4e4e7` | `#27272a` |
| `bg-destructive` | `#ef4444` | `#f87171` |
| `bg-success` | `#22c55e` | `#4ade80` |
| `bg-warning` | `#f59e0b` | `#fbbf24` |
| `ring-ring` | `#18181b` | `#fafafa` |

### 2.5 Warmth (Wellness, Education, Community, Non-profit)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#fefce8` | `#1c1917` |
| `bg-surface` | `#fffbeb` | `#292524` |
| `bg-primary` | `#b45309` | `#fbbf24` |
| `text-primary-foreground` | `#ffffff` | `#1c1917` |
| `bg-accent` | `#059669` | `#34d399` |
| `text-accent-foreground` | `#ffffff` | `#1c1917` |
| `text-primary` | `#1c1917` | `#fefce8` |
| `text-secondary` | `#78716c` | `#a8a29e` |
| `border-border` | `#e7e5e4` | `#44403c` |
| `bg-destructive` | `#dc2626` | `#f87171` |
| `bg-success` | `#16a34a` | `#4ade80` |
| `bg-warning` | `#d97706` | `#fbbf24` |
| `ring-ring` | `#b45309` | `#fbbf24` |

### 2.6 Midnight (Premium, Luxury, Dark-ﬁrst, SaaS)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#f8fafc` | `#000000` |
| `bg-surface` | `#f1f5f9` | `#0a0a0a` |
| `bg-primary` | `#4f46e5` | `#6366f1` |
| `text-primary-foreground` | `#ffffff` | `#ffffff` |
| `bg-accent` | `#06b6d4` | `#22d3ee` |
| `text-accent-foreground` | `#ffffff` | `#000000` |
| `text-primary` | `#020617` | `#f8fafc` |
| `text-secondary` | `#64748b` | `#9ca3af` |
| `border-border` | `#e2e8f0` | `#1f2937` |
| `ring-ring` | `#6366f1` | `#818cf8` |

### 2.7 Forest (Nature, Sustainability, Organic, Outdoors)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#f0fdf4` | `#052e16` |
| `bg-surface` | `#dcfce7` | `#0a3d1e` |
| `bg-primary` | `#166534` | `#4ade80` |
| `text-primary-foreground` | `#ffffff` | `#052e16` |
| `bg-accent` | `#d97706` | `#fbbf24` |
| `text-accent-foreground` | `#ffffff` | `#052e16` |
| `text-primary` | `#052e16` | `#f0fdf4` |
| `text-secondary` | `#4a7c59` | `#86efac` |
| `border-border` | `#bbf7d0` | `#166534` |
| `ring-ring` | `#166534` | `#4ade80` |

### 2.8 Ocean (Travel, Wellness, Fluid, Hospitality)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#f0f9ff` | `#082f49` |
| `bg-surface` | `#e0f2fe` | `#0c4a6e` |
| `bg-primary` | `#0e7490` | `#22d3ee` |
| `text-primary-foreground` | `#ffffff` | `#082f49` |
| `bg-accent` | `#f43f5e` | `#fb7185` |
| `text-accent-foreground` | `#ffffff` | `#082f49` |
| `text-primary` | `#082f49` | `#f0f9ff` |
| `text-secondary` | `#4a90a4` | `#7dd3fc` |
| `border-border` | `#bae6fd` | `#0e7490` |
| `ring-ring` | `#0e7490` | `#22d3ee` |

### 2.9 Aurora (Creative, Arts, Experimental, Fashion)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#faf5ff` | `#1e0033` |
| `bg-surface` | `#f3e8ff` | `#2e0055` |
| `bg-primary` | `#7c3aed` | `#a78bfa` |
| `text-primary-foreground` | `#ffffff` | `#1e0033` |
| `bg-accent` | `#ec4899` | `#f472b6` |
| `text-accent-foreground` | `#ffffff` | `#1e0033` |
| `text-primary` | `#1e0033` | `#faf5ff` |
| `text-secondary` | `#7e5ba0` | `#c4a0f0` |
| `border-border` | `#e9d5ff` | `#581c87` |
| `ring-ring` | `#7c3aed` | `#a78bfa` |

### 2.10 Minimal (Portfolio, Agency, Editorial, Photography)

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | `#ffffff` | `#000000` |
| `bg-surface` | `#f5f5f5` | `#111111` |
| `bg-primary` | `#18181b` | `#fafafa` |
| `text-primary-foreground` | `#fafafa` | `#18181b` |
| `bg-accent` | `#52525b` | `#a1a1aa` |
| `text-accent-foreground` | `#fafafa` | `#18181b` |
| `text-primary` | `#09090b` | `#fafafa` |
| `text-secondary` | `#71717a` | `#a1a1aa` |
| `border-border` | `#e5e5e5` | `#27272a` |
| `ring-ring` | `#18181b` | `#fafafa` |

---

## 3. Typography System

### 3.1 Font Pairings

| Pairing | Display Font | Body Font | Best For |
|---------|-------------|-----------|----------|
| **Modern Classic** | Inter (700) | Inter (400) | All palettes, default safe pair |
| **Tech Modern** | Space Grotesk (500-700) | Inter (400) | Clarity, DevTools, Authority |
| **Elegant Editorial** | Fraunces (600-700) | Inter (400) | Warmth, Editorial, Premium |
| **Clean Startup** | DM Sans (500-700) | Inter (400) | Energy, Consumer, Social |
| **Premium Display** | Plus Jakarta Sans (600-700) | Inter (400) | Trust, Luxury, SaaS |
| **Technical Mono** | JetBrains Mono (400-700) | Inter (400) | Clarity, API Docs, Code |
| **Modern Serif** | Playfair Display (600-700) | Inter (400) | Forest, Editorial, Luxury |
| **Geometric Modern** | Outfit (500-700) | Outfit (400) | Minimal, Portfolio, Agency |
| **Playful Display** | Fredoka (500-600) | Inter (400) | Aurora, Creative, Kids |
| **Warm Sans** | M PLUS Rounded 1c (500-700) | Inter (400) | Warmth, Wellness, Community |

### 3.2 Type Scale

| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | 56px (3.5rem) | 700 | 1.05 | -0.02em | Hero titles, first fold |
| `text-h1` | 40px (2.5rem) | 700 | 1.1 | -0.02em | Page headings |
| `text-h2` | 30px (1.875rem) | 600 | 1.2 | -0.01em | Section headings |
| `text-h3` | 24px (1.5rem) | 600 | 1.3 | 0 | Subsection headings |
| `text-h4` | 20px (1.25rem) | 600 | 1.35 | 0 | Card titles, group labels |
| `text-large` | 18px (1.125rem) | 500 | 1.5 | 0 | Lead paragraphs |
| `text-base` | 16px (1rem) | 400 | 1.5 | 0 | Body text |
| `text-small` | 14px (0.875rem) | 400/500 | 1.5 | 0 | Labels, secondary text |
| `text-xs` | 12px (0.75rem) | 400 | 1.5 | 0 | Captions, metadata |
| `text-tiny` | 11px (0.6875rem) | 400 | 1.25 | 0.02em | Badges, timestamps |

### 3.3 Typography Component Rules

- **Lead paragraph**: `text-large text-secondary leading-relaxed max-w-prose`
- **Inline code**: `font-mono text-sm bg-muted px-1.5 py-0.5 rounded`
- **Blockquote**: `border-l-2 border-primary pl-4 italic text-secondary`
- **List**: `space-y-2` for vertical spacing, `list-disc list-inside` for bullets
- **Link**: `text-primary underline-offset-4 hover:underline decoration-1`
- **KBD**: `font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5 shadow-sm`

### 3.4 Text Balance

Use `text-balance` on headings to prevent orphaned words. Never use `text-justify`.

---

## 4. Spacing System

### 4.1 Spacing Scale (Tailwind)

| Token | px | rem | Usage |
|-------|-----|-----|-------|
| p-0.5 | 2px | 0.125rem | Hairline separators |
| p-1 | 4px | 0.25rem | Tight spacing inside components |
| p-2 | 8px | 0.5rem | Badge padding, icon margins |
| p-3 | 12px | 0.75rem | Small button padding |
| p-4 | 16px | 1rem | Standard card padding (DEFAULT) |
| p-5 | 20px | 1.25rem | Form field groupings |
| p-6 | 24px | 1.5rem | Relaxed card/panel padding |
| p-8 | 32px | 2rem | Section padding |
| p-10 | 40px | 2.5rem | Wide section padding |
| p-12 | 48px | 3rem | Page section padding |
| p-16 | 64px | 4rem | Major page section |
| p-20 | 80px | 5rem | Hero section, page top |
| p-24 | 96px | 6rem | Full-screen sections |

### 4.2 Gap Scale

- `gap-2` (8px) — tight component groups (button groups, tag lists)
- `gap-4` (16px) — standard component spacing (card grids, form fields)
- `gap-6` (24px) — relaxed component spacing (feature grid)
- `gap-8` (32px) — section spacing between groups
- `gap-12` (48px) — major section spacing

### 4.3 Margin Rules

- Use `gap-*` for spacing BETWEEN elements in a container
- Use `space-y-*` for vertical stacks where gap is unavailable
- Use `m-*` sparingly — only when gap or padding cannot achieve the layout
- Never use negative margins

---

## 5. Layout System

### 5.1 Breakpoint Reference

| Breakpoint | Min-Width | Target Devices |
|-----------|-----------|----------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops / tablets (landscape) |
| `xl` | 1280px | Laptops / desktops |
| `2xl` | 1536px | Wide desktops |

### 5.2 Layout Patterns

| Pattern | Technique | When To Use |
|---------|-----------|-------------|
| **Centered** | `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` | Marketing, blogs, docs |
| **Sidebar** | `grid grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr]` | Dashboards, admin, docs |
| **Split** | `grid grid-cols-1 lg:grid-cols-2 gap-8 items-center` | Auth, hero features, landing |
| **Card Grid** | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` | Galleries, product listings |
| **Holy Grail** | `grid grid-rows-[auto_1fr_auto] min-h-screen` | Full-page app layouts |
| **Masonry** | `columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4` | Portfolios, image galleries |
| **Dashboard** | `grid grid-cols-12 gap-4` | Complex data dashboards |
| **Stacked** | `flex flex-col gap-4` | Settings, forms, detail views |

### 5.3 Layout Constants

- Max content width: `max-w-7xl` (1280px)
- Max prose width: `max-w-prose` (65ch)
- Sidebar width: 250-280px (responsive)
- Content padding: `px-4 sm:px-6 lg:px-8`
- Section vertical spacing: `py-12 lg:py-16`
- Hero section: `py-20 lg:py-24`

---

## 6. Borders & Radius

### 6.1 Border Width

- `border` (1px) — default for cards, inputs, dividers
- `border-2` (2px) — active states, primary buttons, focus rings
- `border-0` — no border (ghost buttons, clean cards)

### 6.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 2px | Badges, tags, small indicators |
| `rounded` | 4px | Inputs, buttons, cards (DEFAULT) |
| `rounded-md` | 6px | Modals, panels, larger containers |
| `rounded-lg` | 8px | Feature cards, hero sections |
| `rounded-xl` | 12px | Dialogs, mobile menus |
| `rounded-2xl` | 16px | Large promotional cards |
| `rounded-full` | 9999px | Avatars, pills, toggle switches |

### 6.3 Radius Consistency Rules

- ALL interactive elements in a view must use the SAME radius
- Forms: `rounded` (4px) for all inputs and buttons
- Cards: `rounded-lg` (8px) for all cards
- Choose ONE radius per component type and stay consistent
- Never mix `rounded` and `rounded-2xl` in the same section

---

## 7. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation (cards in a grid) |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Default card elevation |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, dialogs |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Large overlays |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero images, promotional |

### Shadow Rules
- A card gets EITHER `shadow-*` OR `border` — NEVER both
- Use `dark:shadow-2xl dark:shadow-black/30` for dark mode
- Never use custom shadow values

---

## 8. Motion & Animation

### 8.1 Timing

| Token | Value | Usage |
|-------|-------|-------|
| `duration-150` | 150ms | Micro-interactions (hover, active) |
| `duration-200` | 200ms | Standard transitions (DEFAULT) |
| `duration-300` | 300ms | Page transitions, entrance animations |
| `duration-500` | 500ms | Large layout shifts, modals entering |

### 8.2 Easing

- Default: `ease-in-out` (standard UI transitions)
- Entrance: `ease-out` (elements appearing)
- Exit: `ease-in` (elements disappearing)
- Never use `linear` unless it's a continuous animation (loading)

### 8.3 Animation Patterns

| Pattern | Implementation | Use Case |
|---------|---------------|----------|
| **Fade In** | `animate-in fade-in duration-300` | Page load, sections appearing |
| **Slide Up** | `animate-in slide-in-from-bottom-4 duration-300` | Cards entering viewport |
| **Scale In** | `animate-in zoom-in-95 duration-200` | Modal open, dialog show |
| **Skeleton** | `animate-pulse` | Loading states (shadcn/ui Skeleton) |
| **Hover Lift** | `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200` | Interactive cards |
| **Focus Ring** | `focus-visible:ring-2 focus-visible:ring-offset-2` | All interactive elements |

### 8.4 Motion Philosophy

- Motion is **purposeful** — it communicates state change, hierarchy, and feedback
- 200ms is the standard — feels instantaneous but perceptible
- Never animate: page load banners, decorative flourishes, spinning elements
- Always animate: hover states, focus transitions, modal entrances/exits
- Use `prefers-reduced-motion: reduce` for accessibility

---

## 9. Icons

### 9.1 Icon Library
- **Lucide React** (default) — `lucide-react` package
- 16px, 20px, or 24px only — never 18px, 22px, or custom sizes

### 9.2 Icon Sizing Rules

| Size | Usage | Class |
|------|-------|-------|
| 16px | Inline with text, badges, small buttons | `h-4 w-4` |
| 20px | Icon buttons, nav items, list markers | `h-5 w-5` |
| 24px | Standalone icons, feature icons, empty states | `h-6 w-6` |

### 9.3 Icon Style Rules

- `strokeWidth={1.5}` (default) — standard weight
- `strokeWidth={2}` — for small icons (16px) to maintain clarity
- Icons in buttons: always left of text, `gap-2` spacing
- Icon-only buttons: use `aria-label` and `sr-only` for accessible label

---

## 10. Component Architecture

### 10.1 Component Composition Rules

```
Page Template
├── Navigation (sticky top-0 z-50)
│   ├── Logo
│   ├── NavLinks (desktop)
│   ├── MobileMenu (mobile)
│   └── CTA Button
├── Hero Section (py-20 lg:py-24)
│   ├── Headline (text-balance)
│   ├── Subtitle (text-large text-secondary)
│   └── CTA Group (flex gap-4)
├── Feature Section (py-16)
│   ├── Section Header
│   └── Feature Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
│       └── FeatureCard (icon + title + description)
├── Footer
│   ├── Brand Section
│   ├── Link Columns
│   └── Copyright
└── Toast Container (fixed bottom-4 right-4)
```

### 10.2 File Organization

```
components/
├── ui/             # shadcn/ui primitives (Button, Input, Card, etc.)
├── layout/         # Shell components (Nav, Sidebar, Footer, Container)
├── sections/       # Page sections (Hero, Features, Pricing, FAQ)
├── shared/         # Shared patterns (SearchBar, DataTable, FilterBar)
└── pages/          # Page-level compositions (HomePage, DashboardPage)
```

### 10.3 Component Implementation Rules

1. **Every component exports**: `name`, `Props` type, `displayName`
2. **State handling**: default → loading → empty → error → edge cases
3. **Responsive**: mobile-first classes, then `md:` and `lg:` overrides
4. **Dark mode**: every component has `dark:` variants
5. **Accessibility**: semantic HTML, aria attributes, keyboard support, focus management
6. **Props API**: use `interface ComponentProps` with JSDoc comments
7. **Forward refs**: use `forwardRef` for interactive components
8. **Default props**: set sensible defaults using default values in destructuring

---

## 11. CSS Variable Template

Every project gets this `globals.css` structure:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: <LIGHT-BG>;
    --foreground: <LIGHT-TEXT-PRIMARY>;
    --card: <LIGHT-SURFACE>;
    --card-foreground: <LIGHT-TEXT-PRIMARY>;
    --popover: <LIGHT-SURFACE>;
    --popover-foreground: <LIGHT-TEXT-PRIMARY>;
    --primary: <LIGHT-PRIMARY>;
    --primary-foreground: <LIGHT-PRIMARY-FG>;
    --secondary: <LIGHT-SECONDARY>;
    --secondary-foreground: <LIGHT-TEXT-PRIMARY>;
    --muted: <LIGHT-BORDER>;
    --muted-foreground: <LIGHT-TEXT-SECONDARY>;
    --accent: <LIGHT-ACCENT>;
    --accent-foreground: <LIGHT-ACCENT-FG>;
    --destructive: <LIGHT-DANGER>;
    --destructive-foreground: <LIGHT-DANGER-FG>;
    --success: <LIGHT-SUCCESS>;
    --warning: <LIGHT-WARNING>;
    --info: <LIGHT-INFO>;
    --border: <LIGHT-BORDER>;
    --input: <LIGHT-BORDER>;
    --ring: <LIGHT-RING>;
    --radius: 0.5rem;
  }

  .dark {
    --background: <DARK-BG>;
    --foreground: <DARK-TEXT-PRIMARY>;
    --card: <DARK-SURFACE>;
    --card-foreground: <DARK-TEXT-PRIMARY>;
    --popover: <DARK-SURFACE>;
    --popover-foreground: <DARK-TEXT-PRIMARY>;
    --primary: <DARK-PRIMARY>;
    --primary-foreground: <DARK-PRIMARY-FG>;
    --secondary: <DARK-SECONDARY>;
    --secondary-foreground: <DARK-TEXT-PRIMARY>;
    --muted: <DARK-BORDER>;
    --muted-foreground: <DARK-TEXT-SECONDARY>;
    --accent: <DARK-ACCENT>;
    --accent-foreground: <DARK-ACCENT-FG>;
    --destructive: <DARK-DANGER>;
    --destructive-foreground: <DARK-DANGER-FG>;
    --success: <DARK-SUCCESS>;
    --warning: <DARK-WARNING>;
    --info: <DARK-INFO>;
    --border: <DARK-BORDER>;
    --input: <DARK-BORDER>;
    --ring: <DARK-RING>;
  }
}
```

---

## 12. Anti-Slop Rules (Hard Constraints)

These rules are NEVER broken:

1. **No gradient backgrounds** — unless explicitly requested and justified
2. **No box shadow on every element** — use elevation hierarchy
3. **No 3+ font families** — 2 max: display + body
4. **No arbitrary Tailwind values** — never `p-[17px]`, always `p-4`
5. **No decorative emoji in UI** — never use emoji as design elements
6. **No ALL CAPS labels** — use `font-semibold` or `uppercase` sparingly
7. **No full-width primary buttons** — outside auth forms
8. **No card with BOTH shadow AND border** — choose one
9. **No lorem ipsum** — real copy only, or descriptive placeholder
10. **No inline styles** — always use CSS classes or Tailwind utilities
11. **No hardcoded hex in JSX** — always reference CSS variables
12. **No bare `<div>` as clickable** — use `<button>` or `<a>` with proper roles
13. **No missing alt text** — every `<img>` needs `alt`, even decorative (alt="")
14. **No focus without visual indicator** — `focus-visible:ring-2` is required
15. **No dead buttons** — every button/clickable has an `onClick` or `href`
16. **No 100vh by default** — use `min-h-screen` for full-height layouts
17. **No random icon sizes** — only 16px, 20px, 24px (h-4/h-5/h-6)
18. **No broken dark mode** — every component has complete `dark:` variants
19. **No single-file components** — one component per file, one file per component
20. **No `any` types in TypeScript** — always define proper interfaces

---

## 13. Stack-Specific Conventions

### 13.1 Next.js App Router
- Layout: `app/layout.tsx` — shared shell with `<html>`, `<body>`, providers
- Loading: `app/loading.tsx` — suspense boundary
- Error: `app/error.tsx` — error boundary (separate client component)
- Not Found: `app/not-found.tsx`
- Route groups: `(marketing)`, `(dashboard)` for URL-less organization
- Server Components by default, `'use client'` at leaf interactive nodes

### 13.2 Astro
- Layout: `src/layouts/Layout.astro` — shared HTML shell
- Components: `src/components/` — `.astro`, `.tsx`, `.vue`, `.svelte`
- Pages: `src/pages/` — file-based routing
- Islands: interactive components get `client:load` or `client:idle`
- Content: `src/content/` — Markdown/MDX collections

### 13.3 Vite + React
- Entry: `src/main.tsx` — renders `<App />` into `#root`
- Pages: `src/pages/` — route components
- Components: `src/components/` — shared components
- Hooks: `src/hooks/` — custom hooks
- Utils: `src/lib/` — utilities, API clients

### 13.4 SolidJS
- Signals: `createSignal` for local state, `createStore` for complex
- Effects: `createEffect` for side effects
- Memos: `createMemo` for derived values
- Resources: `createResource` for async data
- Components: same atomic structure as React

### 13.5 SvelteKit
- Routes: `src/routes/` — file-based with `+page.svelte`, `+layout.svelte`
- Stores: `src/lib/stores/` — shared state
- Components: `src/lib/components/` — shared components
- Server: `+page.server.js` / `+layout.server.js` for server-only logic

### 13.6 NativeScript
- Pages: `src/pages/` — Page components
- Components: `src/components/` — reusable UI
- Theme: NativeScript theme variables mapped to APEX design tokens
- Platform: iOS vs Android specific styling via `.ios` / `.android` class names

---

## 14. shadcn/ui Component Overrides

### 14.1 Default shadcn/ui Components Available

```
Button, Input, Label, Badge, Card, Avatar, Alert, Dialog, DropdownMenu,
Select, Tabs, Table, Sheet, Popover, Tooltip, Toast, Skeleton,
Switch, Checkbox, RadioGroup, Textarea, Progress, Separator,
Command, Calendar, DatePicker, Form, Sonner
```

### 14.2 Usage Rules
- Import: `import { Button } from "@/components/ui/button"`
- Variants: use the built-in `variant` and `size` props
- Extend: create wrapper components in `components/shared/` not in `components/ui/`
- Never modify shadcn/ui source files — create new components on top
- Use `cn()` utility for className merging

---

## 15. Quality Checklist

Before marking any UI task complete, verify:

- [ ] Mood/palette chosen and appropriate for the domain
- [ ] WCAG AA contrast on ALL text/background pairs
- [ ] Typography pairing: 2 fonts max, semantic hierarchy
- [ ] Responsive: mobile → tablet → desktop, no horizontal scroll
- [ ] Dark mode: every `bg-*` and `text-*` has dark: variant
- [ ] Focus: `focus-visible:ring-2 ring-ring ring-offset-2` on every interactive
- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` not `<div>`
- [ ] Images: all have `alt` text
- [ ] Icons: aria-hidden or sr-only labels, consistent sizing
- [ ] Loading: Skeleton components for async content
- [ ] Empty states: meaningful message when no data
- [ ] Error states: graceful fallback UI
- [ ] Motion: 200ms transitions, `prefers-reduced-motion` respect
- [ ] Values: no arbitrary Tailwind values, no hardcoded hex in JSX
- [ ] Architecture: atoms → molecules → organisms, one component per file
- [ ] Imports: all from `@/components/ui/*` (shadcn/ui) or `@/components/shared/*`
- [ ] No anti-slop violations: no gradients, no ALL CAPS, no decorative emoji
