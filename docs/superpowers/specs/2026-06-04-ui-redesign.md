# WC2026 Bracket Simulator — UI Redesign Spec

**Date:** 2026-06-04

## Goal

Replace the flat gray color system with a premium sports broadcast aesthetic: deep navy base, gold accents, moderate glow effects. Feels like ESPN or an official FIFA app.

---

## Semantic Color Tokens

Defined in `src/app.css` via Tailwind v4 `@theme`. No hex values in component files.

```css
@import "tailwindcss";

@theme {
  --color-pitch:          #050d1a;
  --color-pitch-end:      #0a1628;
  --color-surface:        #0d1f3c;
  --color-surface-raised: #112447;
  --color-surface-hover:  #1a3560;
  --color-border-subtle:  #1e3a5f;
}
```

| Token | Tailwind class | Used for |
|---|---|---|
| `--color-pitch` | `bg-pitch` | Page background start |
| `--color-pitch-end` | `bg-pitch-end` | Page background end |
| `--color-surface` | `bg-surface` | Cards, header, bracket columns |
| `--color-surface-raised` | `bg-surface-raised` | Team rows, modal inner |
| `--color-surface-hover` | `bg-surface-hover` | Hover states |
| `--color-border-subtle` | `border-border-subtle` | Card outlines, dividers |
| `amber-400` (built-in) | `text-amber-400 border-amber-400` | Gold accents, winner text |
| `amber-900` (built-in) | `border-amber-900` | Inactive interactive borders |
| `slate-100` (built-in) | `text-slate-100` | Primary text |
| `slate-500` (built-in) | `text-slate-500` | Muted labels, locked slots |
| `green-900/40` (built-in) | `bg-green-900/40` | Done match background |
| `green-700` (built-in) | `border-green-700` | Done match border |
| `green-300` (built-in) | `text-green-300` | Done match text |
| `red-700` (built-in) | `bg-red-700` | Reset button |

---

## Typography

- Section/round labels: `uppercase tracking-widest text-xs`
- Group letter: `text-amber-400 font-bold uppercase tracking-widest text-xs`
- Team name: `font-semibold`
- Modal title: `text-amber-400 uppercase tracking-widest text-xs`
- No decorative fonts — weight and letter-spacing only.

---

## Components

### App (root)
- Page background: `min-h-screen bg-gradient-to-br from-pitch to-pitch-end text-slate-100`

### Header
- Background: `bg-surface`
- Bottom border: `border-b-2 border-amber-400`
- Title text: `text-slate-100 font-bold tracking-wide`
- Reset button: `bg-red-700 hover:bg-red-600`

### GroupCard
- Container: `bg-surface border border-border-subtle rounded-lg border-t-2 border-t-amber-400`
- Group label: `text-amber-400 font-bold uppercase tracking-widest text-xs`
- Team rows: `bg-surface-raised hover:bg-surface-hover rounded`
- Drag handle: `text-amber-900`
- Rank badge ①②: `text-amber-400`
- Rank badge ③④: `text-slate-500`

### BracketMatch

| State | Classes |
|---|---|
| Locked | `bg-surface border border-border-subtle text-slate-500 cursor-default` |
| Pickable | `bg-surface border border-amber-900 hover:border-amber-400 hover:shadow-[0_0_12px_theme(colors.amber.400/20%)] cursor-pointer transition-all` |
| 3rd-place | Same as Pickable + `text-amber-400` for slot key label |
| Done (regular) | `bg-green-900/40 border border-green-700 text-green-300 cursor-default` |
| Done (Final) | `bg-surface border border-amber-400 shadow-[0_0_16px_theme(colors.amber.400/35%)] text-amber-300 cursor-default` |

`BracketMatch` receives an `isFinal` boolean prop. When `isFinal` is true and a winner is picked, the gold glow done state is applied instead of green.

### TeamPicker Modal
- Backdrop: `bg-black/70`
- Panel: `bg-surface border border-border-subtle rounded-xl shadow-2xl`
- Title: `text-amber-400 uppercase tracking-widest text-xs`
- Team button default: `bg-surface-raised text-slate-100`
- Team button hover: `bg-amber-400 text-pitch` (gold fill, near-black text)

### Bracket Section
- Background: inherits page gradient
- Round labels above columns: `text-amber-400/60 uppercase tracking-widest text-xs`
- Final column label: `text-amber-400` (full opacity)
- Column dividers: `border-border-subtle`

---

## Out of Scope

- Animations beyond CSS `transition-all`
- Custom fonts
- Dark/light mode toggle
- Any logic or data changes
