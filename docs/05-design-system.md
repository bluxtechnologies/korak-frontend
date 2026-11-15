# 05 — Design System

This document **supersedes** earlier design values (previous brand color, 10px radius, Google Sans, glow on CTAs, elevation tiers). Brand name: **Korak Digitals**.

## 1. Character
Fintech software: sleek, clean, classic, elegant, professional, spacious, consistent. This is an application dashboard, not a landing page. Borders define structure; shadows barely exist.

## 2. Tokens

### Typography
Plus Jakarta Sans (`next/font/google`), a single family. Weights limited to 400, 500, 600.

### Radius — Locked: 8px
One global value (`--radius: 8px`) for buttons, cards, inputs, tables, alerts, dropdowns, badges, modals. No second radius without a documented reason. No pill shapes.

### Color — burgundy theme — Locked
| Token | Light value | Use |
|-------|-------------|-----|
| `primary` | `#7A1F3D` | Active nav, primary buttons, key actions, charts, status highlights |
| `primary-foreground` | white | Text on primary |
| `background` | white | App background |
| `surface` | near-white neutral | Cards, panels |
| `border` | light neutral gray | All section definition |
| `muted-foreground` | mid gray | Secondary text |
| `foreground` | near-black neutral | Body text |

Status colors are separate from the brand and must stay clearly distinguishable from burgundy:
| Level | Hue |
|-------|-----|
| Info | blue |
| Success | green |
| Warning | amber |
| Error / destructive | bright red, plus an always-visible text label |

Rules:
- Primary color appears only on: active navigation, primary buttons, important actions, charts, status indicators.
- Everything else is white, gray, or neutral.
- Dark mode is in scope: every token has a dark value; contrast is verified in both modes. Information is never conveyed by color alone.
- Implement as semantic CSS variables in `globals.css` (Tailwind v4). Components never use raw palette classes such as `red-500`.

### Shadows
Effectively none. At most a very subtle shadow on floating layers that must separate from the page (dropdowns, popovers, modals). No floating-card layouts.

### Borders
Thin (1px), neutral. Sections are separated by borders and spacing.

## 3. Forbidden
Glassmorphism · neumorphism · gradients · animated backgrounds · large pills · **icons or dots inside badges/pills** · heavy shadows · glow effects · excessive transitions.

Transitions: short and functional (hover, focus, open/close) only; honor `prefers-reduced-motion`.

## 4. Components
Build once, reuse everywhere, keep simple:
Button · Card · Badge · Alert · Modal · Dropdown · Table · Search bar · Filter panel · Form controls · Pagination · Breadcrumb · Toast · Empty state · Loading state · Error state · Confirm dialog.

- **Badge:** text only, 5px radius, no icon, no dot.
- **Alert levels:** Information, Success, Warning, Error. Icon allowed in alerts (it aids recognition), always with text.
- **Toasts:** a React toast library, used for transient feedback only; persistent problems use an inline Alert.
- **Buttons:** one primary per view. While processing: disabled with a spinner icon (Lucide `Loader2`) and text.
- **Destructive actions:** always behind a confirm dialog naming the consequence.

## 5. Layout
- **Sidebar:** collapsible, nested navigation, clear active state, permission-aware.
- **Top bar:** notifications, user menu, profile, logout.
- **Page container:** consistent max width, padding, page header (title, breadcrumb, primary action).
- **Dashboard grid:** consistent gap and card structure.
- Desktop is the primary target; tablet and mobile are supported without degrading desktop (sidebar becomes a drawer; tables scroll or reflow).

## 6. Icons
Lucide only, and only where they improve usability. No decorative icons.

## 7. Accessibility
Keyboard navigation everywhere, visible focus rings, WCAG AA contrast, semantic HTML, ARIA only where semantics are insufficient, labels on every control, focus moved to the first error on failed submit, focus returned after closing modals.

## 8. Secure-by-design UI
Sensitive values hidden by default with an explicit reveal; clear permission indicators; distinct warning/error/critical styling; no implementation details in messages; no stack traces; never reveal backend validation logic.
