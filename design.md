# Aperture Design System

**Version 0.1** · Extracted from [coss/ui](https://github.com/cosscom/ui) at commit
`b2336c4` (17 Nov 2026) · MIT © coss.com and Origin UI.

This document is the contract for every Aperture element, instrument, and
workbench. If a component disagrees with this document, the component is wrong.
If the document is silent, prefer the closest existing pattern in the library
before inventing a new one.

**Source material studied:** 56 primitives, 530 composed particles, the token
stylesheet (`packages/ui/src/styles/globals.css`), the button/card/input/table/
dialog/sidebar implementations, the font guide, and the docs shell.

---

## 0. How to use this document

| You are… | Read |
| --- | --- |
| Designing a new component | §1–§5, §9, §12 |
| Implementing a component | §2–§5, §10, §12 |
| Building a workbench/layout | §2, §5, §6, §8 |
| Reviewing a pull request | §9, §12 |
| Porting to another framework | §1–§2, §5, §10, §11 |

Three rules override everything else:

1. **Use the tokens.** No raw hex, `rgb()`, or `hsl()` in a component. Only
   semantic tokens or `color-mix()` / `--alpha()` derived from them.
2. **Use the contract.** Every exported component has `data-slot`, `cn()`,
   `className` passthrough, and a `render` prop when it renders an element that
   users may want to swap.
3. **Design for the data.** Research UI is judged by whether a researcher can
   trust what they see, not by whether it looks good in a screenshot.

---

## 1. Philosophy

### 1.1 Chrome is achromatic; color belongs to data

The interface is built from neutral ink, hairlines, and layered whites. Color is
reserved for three jobs:

- **Status**: destructive, info, success, warning.
- **Data**: chart series, heatmaps, scales, selection.
- **Brand**: marketing surfaces only, never inside an instrument.

A screen full of colored buttons is a screen where the chart has to compete. It
should not.

### 1.2 Calm surfaces, precise edges

Aperture should feel like a well-machined instrument, not a toy dashboard. That
means:

- 1 px borders, not heavy shadows.
- Subtle inner highlights, not glossy gradients.
- Rounded corners that are consistent, not expressive.
- Motion that confirms an action, never decorates it.

### 1.3 Dense by default, legible at a glance

Research software shows a lot of numbers. Density is not a failure; unstructured
density is. Use compact row heights, tabular numerals, aligned decimals, and
grouping. Give the eye a path: label → value → unit → status.

### 1.4 Show the state

The UI must make these visible, never implicit:

- units and significant figures
- uncertainty and detection limits
- missing data vs. zero
- provenance and version
- run status, progress, and failure reason
- time zone and timestamp source

### 1.5 Copy, don't depend

Components are copied into the user's repository. They must be readable,
self-contained, and free of hidden magic. Avoid internal context providers unless
the composition truly needs them. Prefer explicit props and composition.

### 1.6 Every screen is a workbench

A collection of inputs is not an application. Layouts — navigation, canvas,
inspector, status, empty states — are part of the product, not an afterthought.

### 1.7 Accessible is not optional

Keyboard-first, screen-reader-aware, colorblind-safe, reduced-motion-safe,
RTL-ready, and usable at 200% zoom. These are acceptance criteria, not polish.

---

## 2. Foundations

### 2.1 Token architecture

Aperture uses a three-tier token model:

```
primitive (Tailwind palette)  →  semantic (--background, --border)  →  component (--card-pad)
```

Components may only consume **semantic** tokens. A component that needs a new
value gets a new semantic token, documented in §10, not an inline color.

Tokens are CSS custom properties defined on `:root` and overridden on `.dark`.
Tailwind maps them through `@theme inline` so utilities such as `bg-background`
and `text-muted-foreground` resolve to the variables.

The `--radius` variable is the single source of truth for corner geometry:

```css
--radius: 0.625rem; /* 10px */
--radius-sm: calc(var(--radius) - 4px); /* 6px */
--radius-md: calc(var(--radius) - 2px); /* 8px */
--radius-lg: var(--radius);             /* 10px */
--radius-xl: calc(var(--radius) + 4px); /* 14px */
/* --radius-2xl remains 16px, --radius-3xl 24px from Tailwind */
```

### 2.2 Color

#### Core palette

Aperture inherits coss/ui's neutral-first palette. The exact light and dark
definitions are in §10. The semantic intent:

| Token | Job |
| --- | --- |
| `--background` | Page canvas |
| `--foreground` | Primary text and icons |
| `--card` | Raised content surface |
| `--popover` | Floating surface (menus, dialogs, popovers) |
| `--muted` | Recessive surface (tabs track, skeletons, frames) |
| `--muted-foreground` | Secondary text, captions, placeholders |
| `--accent` | Hover/pressed wash on neutral controls |
| `--primary` | Highest-emphasis action and selected state |
| `--secondary` | Low-emphasis filled control |
| `--border` | Hairline separators and card edges |
| `--input` | Form control edge |
| `--ring` | Focus ring |
| `--destructive` | Destructive action and error |
| `--info` | Informational status |
| `--success` | Success status |
| `--warning` | Warning status |
| `--sidebar-*` | Navigation surface family |

#### Alpha, not opacity

Borders, muted surfaces, and washes use alpha over the current background:

```css
--secondary: --alpha(var(--color-black) / 4%);
--border: --alpha(var(--color-black) / 8%);
--input: --alpha(var(--color-black) / 10%);
```

This keeps layering predictable when a card sits on a frame, or a menu sits on a
popover. Do not use `opacity` on a container to create a recessive surface; it
fades the content too. Use the alpha token.

#### Contrast floors

| Pair | Minimum |
| --- | --- |
| Body text on background/card | 4.5:1 |
| Large text (≥ 18.66px bold or ≥ 24px) | 3:1 |
| Icons and control edges | 3:1 |
| Focus ring against adjacent surface | 3:1 |
| Data series against adjacent series | 3:1, plus a non-color differentiator |

`muted-foreground` is intentionally low-contrast for captions. Never use it for
body copy or for a value a researcher must read.

#### Color rules

- No gradients in product UI. (Marketing surfaces may use a single subtle wash.)
- No glassmorphism, glows, or colored drop shadows.
- No more than one semantic status color in a single compact region unless the
  region is explicitly a status summary.
- Never encode meaning with color alone. Pair with an icon, label, pattern, or
  position.
- Selection uses `--primary` or `--info`, never a new accent.

#### Brand color

The brand is **fully monochrome**. There is no brand hue, accent color, or
marketing-only tint. Identity comes from the aperture mark, the typographic
hierarchy, hairline rules, and the technical grid. The same neutral tokens power
the product, the docs, and the landing page.

- The primary CTA is `--primary` (ink) with `--primary-foreground`.
- The mark is ink on Paper, paper on Graphite. It does not use a highlight.
- Data visualization is the only place color is allowed, and only to encode
  data.
- Do not add a brand color later without a design RFC and a token migration.

### 2.3 Data visualization color

The chart palette is separate from the UI palette. Aperture replaces coss/ui's
five default chart tokens with an eight-color categorical palette adapted from
**Okabe–Ito**, which is designed for color-vision deficiency:

| Index | Light | Dark | Name |
| --- | --- | --- | --- |
| `--chart-1` | `#E69F00` | `#F2B44C` | orange |
| `--chart-2` | `#56B4E9` | `#7CC7F0` | sky |
| `--chart-3` | `#009E73` | `#35C79B` | green |
| `--chart-4` | `#F0E442` | `#F5EC72` | yellow |
| `--chart-5` | `#0072B2` | `#4C9FD6` | blue |
| `--chart-6` | `#D55E00` | `#EB7F2E` | vermillion |
| `--chart-7` | `#CC79A7` | `#DF9CC1` | purple |
| `--chart-8` | `#4D4D4D` | `#B8B8B8` | ink |

Rules:

- **Categorical**: use the palette in order. Never cycle past eight without
  switching to a grouped "Other" series.
- **Sequential**: use **cividis** (colorblind-safe, perceptually uniform).
- **Diverging**: use a blue–white–red or purple–white–green scale with a neutral
  midpoint; never a rainbow.
- **Small multiples**: same scale across panels. Annotate the scale once.
- **Direct labeling** beats a legend when there are ≤ 4 series.
- **Uncertainty** is shown as a band, whisker, or envelope, not a second line.
- **Missing data** is a gap, not zero. Never interpolate silently.
- **Dark mode**: reduce saturation slightly and raise minimum lightness so thin
  lines remain visible.

Every chart ships with:

- an accessible table fallback (visually hidden or toggleable),
- a text summary for screen readers,
- keyboard inspection of data points,
- an export action (SVG/PDF/CSV),
- axis labels with units.

### 2.4 Typography

#### Families

| Role | Family | Fallback |
| --- | --- | --- |
| UI + headings | **Cal Sans** v2 (SIL OFL 1.1) | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Code, IDs, values | **JetBrains Mono** (SIL OFL 1.1) | `"IBM Plex Mono", ui-monospace, monospace` |

Paper Mono is not bundled until its license is verified. Treat it as an optional,
user-supplied display face; never as the default mono family.

`--font-heading` is an alias of `--font-sans`. A single swap of `--font-sans`
must rebrand the entire library; no component may hardcode a family.

**Do not mix a second sans family for small text.** Cal Sans is designed to work
from 8 px to display sizes. If a future brand needs a different face, replace the
token, not individual components.

#### Scale

Mobile is intentionally one step larger than desktop for body text, matching
coss/ui. Controls use the same inversion.

| Token | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| `display` | 48 / 1.05 | 700 | Landing hero only |
| `h1` | 32 / 1.1 | 600 | Page title |
| `h2` | 24 / 1.2 | 600 | Section title |
| `h3` | 20 / 1.25 | 600 | Panel title |
| `h4` | 18 / 1.3 | 600 | Card title |
| `body` | 16 / 1.5 → 14 / 1.5 | 400 | Default text |
| `body-sm` | 14 / 1.5 → 13 / 1.5 | 400 | Dense descriptions |
| `label` | 16 / 1.125 → 14 / 1.125 | 500 | Field and control labels |
| `caption` | 12 / 1.4 | 400 | Helper text, metadata |
| `micro` | 10 / 1.2 | 500 | Badge counts, axis ticks |
| `code` | 13 / 1.5 | 400 | Code, IDs, hashes |
| `data` | 13 / 1.4 | 400 | Table values, tabular |

Rules:

- No letter-spacing anywhere, including all-caps labels. (Cal Sans is drawn for
  this; adding tracking breaks it.)
- No all-caps UI labels. Use sentence case.
- Headings use `font-heading` and `font-semibold` (or `font-bold` for display).
- Body copy never below 14 px on desktop or 16 px on mobile.
- Line length: 45–75 characters for prose; tables may exceed.
- Use `text-balance` for headings and `text-pretty` for short descriptions.
- Numerals in data contexts use `tabular-nums`. IDs and hashes use `font-mono`.
- Scientific names use italic (`<i>E. coli</i>`), genes use italic, proteins use
  roman. Provide a `<Taxon>` helper rather than ad-hoc markup.

#### Numbers, units, and notation

- Align numeric table columns right; headers right-aligned too.
- Use a consistent number of decimals per column. Put the precision in the
  column header or a footnote, not repeated in every cell.
- Use the locale decimal separator in display, but `.` in code and export.
- Use thin spaces for thousands separators in prose; use the locale format in
  tables if the app is localized.
- Scientific notation: `1.24 × 10⁻⁶`, not `1.24e-6`, in display. Keep `e`
  notation in code, CSV, and logs.
- Units: a non-breaking space between value and unit (`12.4 mm`), except `%` and
  `°` which attach directly (`42%`, `37.5°`).
- Ranges: an en dash with the unit once when unambiguous (`10–20 mm`); repeat the
  unit when the range crosses units (`10 mm–2 m`). Never leave a dangling number
  (`10 mm–20` is wrong).
- Uncertainty: `12.34 ± 0.05 mm`; if the error is asymmetric, use
  `12.34 (+0.05 / −0.07) mm`.
- Detection limits: `< 0.01 ng/mL`, never `0`.
- Never round a value in a way that changes the scientific conclusion without a
  visible indicator.

### 2.5 Spacing and sizing

Base unit: **4 px**. Use the Tailwind spacing scale; do not invent odd values.

| Step | px | Typical use |
| --- | --- | --- |
| `0.5` | 2 | Hairline gaps |
| `1` | 4 | Icon-to-text tight |
| `1.5` | 6 | Badge padding |
| `2` | 8 | Control inner gap |
| `2.5` | 10 | Table cell padding |
| `3` | 12 | Input padding, card gap |
| `4` | 16 | Section inner gap |
| `5` | 20 | Frame panel padding |
| `6` | 24 | Card padding, page gutter (desktop) |
| `8` | 32 | Section gap |
| `10` | 40 | Large section gap |
| `12` | 48 | Page section |
| `16` | 64 | Hero spacing |

#### Control heights

Mobile / desktop (mobile is taller for touch):

| Control | Height |
| --- | --- |
| Button xs | 28 / 24 |
| Button sm | 32 / 28 |
| Button default | 36 / 32 |
| Button lg | 40 / 36 |
| Button xl | 44 / 40 |
| Icon button | same as button, square |
| Input sm | 30 / 26 |
| Input default | 34 / 30 |
| Input lg | 38 / 34 |
| Select trigger sm | 32 / 28 |
| Select trigger default | 36 / 32 |
| Select trigger lg | 40 / 36 |
| Menu item | 32 / 28 |
| Badge default | 22 / 18 |
| Badge sm | 20 / 16 |
| Tab | 34 / 30 |
| Table header | 40 |
| Table row (default) | 40 |
| Table row (compact) | 32 |
| Table row (comfortable) | 48 |

Every interactive target gets a `pointer-coarse` pseudo-element of at least
44 × 44 px, even when the visual control is smaller.

#### Icon sizes

| Context | Size |
| --- | --- |
| Inline with 14 px text | 16 px |
| Default button | 18 px mobile / 16 px desktop |
| Large button | 20 / 18 |
| Empty state | 24 |
| Navigation | 16 |
| Status dot | 6–8 |

Icons are `aria-hidden` unless they are the only content; icon-only buttons
require an `aria-label`. Default icon opacity is 80%, not 100%, to keep text
dominant.

### 2.6 Radius

| Token | px | Use |
| --- | --- | --- |
| `rounded-sm` | 6 | Badges, menu items, small chips |
| `rounded-md` | 8 | Icon buttons xs, inner controls |
| `rounded-lg` | 10 | Buttons, inputs, popovers, tab tracks |
| `rounded-xl` | 14 | Frame panels, inner cards |
| `rounded-2xl` | 16 | Cards, dialogs, sheets |
| `rounded-full` | — | Pills, avatars, progress |

Nested surfaces use `calc(radius - 1px)` for their inner highlight so the 1 px
border remains visually continuous.

### 2.7 Elevation, borders, and surfaces

Aperture has **four surface levels**:

| Level | Token | Use |
| --- | --- | --- |
| 0 | `--background` | Page canvas |
| 1 | `--card` | Cards, panels |
| 2 | `--popover` | Menus, dialogs, popovers, dropdowns |
| 3 | `--muted` | Recessive wells: tab tracks, frames, skeletons |

Borders are the primary elevation device. Shadows are almost invisible:

- Card: `shadow-xs/5` + an inset highlight (`0 1px black/4%` light,
  `0 -1px white/6%` dark).
- Popover: `shadow-lg/5` + the same inset highlight.
- Dialog: `shadow-lg/5` + backdrop `black/32` with `backdrop-blur-sm`.
- Primary button: `shadow-xs` with `primary/24` tint, plus an inset
  `white/16` top highlight.
- Never exceed 5% shadow opacity for neutral surfaces. The instrument look comes
  from edges, not from floating.

The **inset highlight** is a signature of the system. It is implemented with a
`::before` pseudo-element covering the element, rounded one pixel less than the
parent, and a 1 px inner shadow. New components with a bordered surface should
reuse it.

### 2.8 Motion

| Motion | Duration | Easing |
| --- | --- | --- |
| Hover / color | 120–150 ms | `ease-out` |
| Popover / dialog | 200 ms | `ease-in-out` |
| Tab indicator | 200 ms | `ease-in-out` |
| Panel resize | 200–300 ms | `ease-in-out` |
| Progress/meter fill | 500 ms | `ease-out` |
| Skeleton shimmer | 2 s | `linear`, infinite |
| Toast success | 320 ms | `cubic-bezier(0.5, 1, 0.89, 1)` |
| Toast error | 280 ms | `cubic-bezier(0.5, 1, 0.89, 1)` |

Rules:

- Animate `transform` and `opacity`, not layout properties. Use explicit
  `transition-[width,height,translate]` only where the size change is the point
  (tab indicator, panel).
- No bounce, spring, or parallax in product UI. (Marketing may use a single
  eased reveal.)
- No animation on data updates that could be mistaken for new data. A number
  that counts up is a lie about precision.
- Always implement `prefers-reduced-motion: reduce`: remove transforms and
  looping animations; keep opacity transitions under 100 ms.
- Loading states must not shift layout. Reserve space.

### 2.9 Iconography

- **Lucide** is the default set. Stroke width 2 (default), currentColor.
- 16 px inline, 18–20 px in prominent actions, 24 px in empty states.
- Use the same metaphor consistently: `Play` for run, `Square` for stop,
  `CircleDot` for record, `FlaskConical` for experiment, `Dna` for sequences.
- Do not use emoji as UI icons. Do not mix icon families.
- Status icons pair with text: `CheckCircle2` + "Complete", not a lone green dot.
- Domain icons (aperture, telescope, microscope, DNA, globe) live in
  `@aperture/icons` only when Lucide has no adequate equivalent.

### 2.10 States

| State | Treatment |
| --- | --- |
| Default | 1 px `--input` border (controls) or transparent (ghost) |
| Hover | `--accent` wash, 4% ink; no border change unless the control is a card |
| Pressed | `--accent` at full strength; inset shadow removed |
| Focus-visible | 2 px `--ring` ring, 1 px offset; inputs use a 3 px ring at 24% |
| Invalid | `--destructive` border at 36%, ring at 16%; message below the field |
| Disabled | 64% opacity, no pointer events, no shadow |
| Loading | Spinner replaces the label but preserves width; `aria-disabled` |
| Selected | `--primary` fill for high emphasis; `--accent` wash for rows |
| Read-only | Normal contrast, no border, `aria-readonly`; not the same as disabled |

Never use opacity alone for disabled if the control is a primary action; pair
with `aria-disabled` and a tooltip explaining why.

### 2.11 Density

Aperture exposes density only where it matters: tables, lists, and workbenches.

| Density | Row height | Cell padding | Body size |
| --- | --- | --- | --- |
| `compact` | 32 | 6 px | 12 px |
| `default` | 40 | 10 px | 13 px |
| `comfortable` | 48 | 12 px | 14 px |

Density is set on a container via `data-density` and inherited by children. It
does **not** change control heights in forms; those have their own size prop.
The default for research tables is `compact`; the default for marketing/docs is
`comfortable`.

### 2.12 Breakpoints and containers

| Token | Width |
| --- | --- |
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |
| `3xl` | 1600 |
| `4xl` | 2000 |

- Global container: `max-width: 1416px`, padding 16 px mobile / 24 px desktop.
- Data workbenches are full-bleed; do not constrain them to the prose container.
- Prose max width: 72ch.
- Forms max width: 480 px (single column); 720 px (two column).
- Settings pages: 720 px content, 240 px section nav.

### 2.13 Z-index

| Layer | Value |
| --- | --- |
| Content | 0 |
| Sticky table header / toolbar | 10 |
| Workbench header | 20 |
| Sidebar / rail | 30 |
| Dropdown, select, popover, menu | 40 |
| Dialog, drawer, sheet | 50 |
| Toast | 60 |
| Tooltip | 70 |

Use the smallest value that works. Do not create a new layer for a component
that can live inside an existing one.

---

## 3. Component contract

Every Aperture component must satisfy this contract. It is derived from the coss/ui
component conventions.

### 3.1 Anatomy of a component

```tsx
"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/registry/default/lib/utils";

const panelVariants = cva(
  "relative flex flex-col rounded-2xl border bg-card text-card-foreground",
  {
    defaultVariants: { tone: "default" },
    variants: {
      tone: {
        default: "",
        muted: "bg-muted/64",
      },
    },
  },
);

export interface PanelProps extends useRender.ComponentProps<"div"> {
  tone?: VariantProps<typeof panelVariants>["tone"];
}

export function Panel({
  className,
  tone,
  render,
  ...props
}: PanelProps): React.ReactElement {
  const defaultProps = {
    className: cn(panelVariants({ tone }), className),
    "data-slot": "panel",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}
```

Rules:

- `"use client"` only when the component uses state, effects, refs, or a Base UI
  client primitive.
- Export a named function, not a default export (except registry examples).
- Extend `useRender.ComponentProps<T>` when the component renders a DOM element
  that users may want to swap (`render={<Link />}`).
- Spread `...props` last through `mergeProps`, so user props win.
- Apply `className` through `cn()` and allow it to override defaults.
- Add `data-slot="<component>"` to every exported part. This is the styling and
  testing contract.
- Use `data-*` state attributes (`data-active`, `data-loading`, `data-size`)
  rather than class names for state.
- No `style` props except for CSS variables or measured geometry.
- No hardcoded colors, fonts, or radii.

### 3.2 Composition over configuration

Prefer parts:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Run 42</CardTitle>
    <CardDescription>Spectrum acquisition</CardDescription>
    <CardAction><Badge variant="success">Complete</Badge></CardAction>
  </CardHeader>
  <CardPanel>…</CardPanel>
  <CardFooter>…</CardFooter>
</Card>
```

over a single component with 20 boolean props. A component may be opinionated
about layout, but it must expose the parts a researcher will need to change.

### 3.3 Controlled and uncontrolled

- Form controls accept `value` + `onValueChange` and `defaultValue`.
- A component must work uncontrolled first; controlled mode is an upgrade.
- Never keep two sources of truth. If a prop is controlled, internal state is
  only a mirror for rendering.
- Async controls expose `loading`, `disabled`, and `error` explicitly.
- Never swallow an error. Surface it in the field, the toast, or the status bar.

### 3.4 Logical properties and RTL

Use logical properties everywhere:

- `ps-*` / `pe-*` instead of `pl-*` / `pr-*`
- `ms-*` / `me-*` instead of `ml-*` / `mr-*`
- `start-*` / `end-*` instead of `left-*` / `right-*`
- `text-start` / `text-end` instead of `text-left` / `text-right`
- `rounded-s-*` / `rounded-e-*` where a corner is directional

Icons that imply direction (arrows, chevrons) must flip in RTL unless they
represent a physical direction (e.g., a compass). Charts and axes do not flip
their data domain; only their labels and layout do.

### 3.5 File and export conventions

```
registry/default/ui/button.tsx          # element
registry/default/instruments/quantity-input.tsx
registry/default/workbenches/data-explorer/…
```

- One component family per file, named in kebab-case.
- Sub-components are exported from the same file.
- A registry item may include hooks and lib files under `files`.
- Every instrument has a `registry-item.json` with title, description,
  categories, dependencies, `meta.stability`, and `meta.domain`.
- Examples live in `registry/default/examples/<name>.tsx` and are not part of
  the installed item.

### 3.6 Registry metadata

```json
{
  "name": "quantity-input",
  "type": "registry:ui",
  "title": "Quantity Input",
  "description": "A numeric input with units, conversion, precision, and uncertainty.",
  "dependencies": ["@aperture/quantities"],
  "registryDependencies": ["@aperture/input-group", "@aperture/select"],
  "categories": ["instrument", "measurement"],
  "meta": {
    "stability": "beta",
    "domain": ["physics", "chemistry", "engineering"],
    "a11y": "Label is required. Announces unit and value on change."
  }
}
```

Stability values: `experimental` → `beta` → `stable` → `deprecated`.
Deprecated items keep working for at least one minor cycle and link to a
replacement.

### 3.7 Testing contract

Every component ships with:

- a render test in light and dark mode,
- a keyboard interaction test,
- an axe accessibility check,
- a visual snapshot at 375 px, 768 px, and 1280 px,
- an RTL snapshot,
- a reduced-motion snapshot,
- a docs example that is also the visual test fixture.

Instruments with logic (units, statistics, parsing) ship unit tests with
reference values and citations in the test comments.

---

## 4. Element usage guide

Use the lowest layer that solves the problem. Do not build a custom control when
an element exists.

| Need | Element | Notes |
| --- | --- | --- |
| Primary/secondary action | `Button` | Variants: default, outline, secondary, ghost, destructive, link |
| Grouped actions | `Group` | Attached buttons/inputs with shared borders |
| Text input | `Input` / `InputGroup` | Use `InputGroup` for units, prefixes, suffixes |
| Long text | `Textarea` | Auto-grow only in composers, not forms |
| Numeric input | `NumberField` | Scrub area for exploratory values |
| Selection from a list | `Select` / `Combobox` / `Autocomplete` | Select for < 15 known items; Combobox for search |
| Toggle | `Switch` / `Checkbox` / `Toggle` | Switch for immediate effect; Checkbox for form submit |
| Choice set | `RadioGroup` / `SegmentedControl` / `Tabs` | Segmented for view switching, Tabs for content |
| Date | `Calendar` / `DatePicker` | Time zone is a separate control |
| Status label | `Badge` | Use semantic variants; don't invent colors |
| Callout | `Alert` | 4 variants; keep copy short |
| Data grid | `Table` | Compose with Data Table instrument for real data |
| Page section | `Card` / `Frame` | Card for independent units; Frame for grouped panels |
| Empty state | `Empty` | Always include a primary action |
| Progress | `Progress` / `Meter` | Progress for known duration; Meter for a value in a range |
| Navigation | `Sidebar` / `Breadcrumb` / `Pagination` | Sidebar for workbenches; breadcrumb for hierarchy |
| Overlay | `Dialog` / `Sheet` / `Drawer` | Dialog for focus; Sheet for side panels; Drawer for mobile |
| Menu | `Menu` / `ContextMenu` | Keyboard navigation is built in |
| Command | `Command` | Global actions and navigation |
| Feedback | `Toast` | Transient confirmation; never the only error surface |
| Keyboard hint | `Kbd` | Use the platform modifier (`⌘` vs `Ctrl`) |

Do not use `AlertDialog` for destructive actions that can be undone. Use a toast
with Undo instead.

---

## 5. Research UI rules

These rules extend the base system for scientific and scholarly software. They
are requirements for instruments and workbenches.

### 5.1 Numbers and units

- A value without a unit is a bug unless the quantity is genuinely dimensionless.
- Store values in a canonical unit (SI where practical); convert at the edge.
  Display in the unit the researcher chose, and remember that choice per
  column/field.
- Unit strings are case-sensitive and standardized (`kHz`, `µL`, `m/z`, `°C`).
  Use the micro sign `µ`, not the Greek mu `μ`, in display.
- Use `QuantityInput` for any numeric field that has a unit. Do not append a unit
  as static text next to a plain input unless the unit is fixed and obvious.
- Conversion must be explicit: show the converted value, the unit, and a way to
  revert. Never silently change the underlying value.
- Precision: store full precision; display the precision the user asked for.
  Provide a "copy full precision" action.
- Significant figures: a `ScientificNumber` component handles notation,
  sig-figs, and locale. Do not format numbers ad hoc in table cells.

### 5.2 Uncertainty and detection limits

- Uncertainty is a first-class value, not a tooltip.
- Display `value ± uncertainty unit`; if uncertainty is unavailable, show the
  value with a "no uncertainty reported" affordance, not a fake zero.
- Detection limits use `<` / `>` and the limit value. Never coerce to zero.
- Error bars, bands, and confidence intervals must state their meaning (SD, SEM,
  95% CI) in the axis label or caption.
- Never imply more precision than the source provides.

### 5.3 Missing data

- Missing is `null`, not `0`, `""`, or `NaN` in the UI.
- Render missing as an em dash `—` with a tooltip explaining why if known.
- Distinguish: not collected, not applicable, below detection, redacted,
  pending. Use a typed missing-reason enum in data models.
- Charts show gaps. Tables show `—` with a muted style.
- Exports include an empty cell or a documented sentinel; never silently impute.

### 5.4 Time

- Store UTC ISO 8601. Display in the user's time zone with an explicit zone
  label when the data crosses zones.
- Show relative time only for recent activity ("2 min ago"); show absolute time
  on hover or in detail views.
- Never show a date without a year in a research record unless the context is
  unambiguous.
- Durations use `h m s` with units, not `01:23:45` alone, unless it is a
  stopwatch/timer where the format is the point.
- Timelines show time zone and source (instrument clock vs. server clock).

### 5.5 Identifiers

- IDs, accession numbers, DOIs, ORCIDs, sample codes, and hashes are monospace.
- IDs are copyable with one click and do not wrap mid-token.
- Show the full ID in detail views; truncate only in dense tables, with a tooltip
  and copy action.
- Never use an ID as a display name. Show the human label first, ID second.
- Prefix IDs with their namespace when ambiguity is possible (`SAMPLE-1042`,
  `DOI:10.1234/…`).

### 5.6 Provenance

Any derived artifact (a plot, a filtered table, a model, an export) must be able
to answer:

- What is the source?
- What transformation produced it?
- When, and by whom (or which process)?
- Which version of the code/parameters?
- Is it reproducible?

Provide a `ProvenanceTrail` instrument with a compact summary and a detail view.
A "Reproducible" badge is earned by having a complete trail, not decorative.

### 5.7 Tables

- Sticky header; sticky first column for wide tables.
- Virtualize above 100 rows. Do not paginate a research table by default;
  researchers scan.
- Column types: text, number, quantity, date, boolean, enum, ID, file, JSON,
  array. Each has a cell renderer and an editor.
- Numeric columns right-aligned with tabular numerals and fixed decimals.
- Column headers include units, e.g., `Mass (kg)`.
- Filters are visible chips, not hidden in a menu. A filter that is active must
  be obvious.
- Saved views persist sort, filter, column visibility, and density.
- Row selection supports shift-click ranges and a header select-all.
- Copy as TSV/CSV/JSON; export the current view, not the raw dataset, unless the
  user chooses otherwise.
- Empty states distinguish "no data" from "no results for this filter".
- Row detail opens in a side panel, not a modal, so the table stays visible.

### 5.8 Charts

- Axis labels include units. Every axis. Always.
- Use a zero baseline for bar charts; do not truncate the axis without a visible
  break marker.
- Log scales must be labeled and must handle zero explicitly.
- Legends are optional; direct labels are preferred.
- Tooltips show the full precision and the series identity.
- Brush/selection is keyboard-accessible and shows the selected range numerically.
- Small multiples share scales; annotate once.
- Provide a "view as table" toggle for every chart.
- Export at the size and DPI the user asks for; preserve vector when possible.
- Never animate a line chart on load in a way that suggests data arriving.

### 5.9 Logs and terminals

- Monospace, 12–13 px, 1.5 line height.
- Virtualize; logs can be millions of lines.
- Severity is shown with a colored label/icon, not only text color.
- Timestamps are toggleable (absolute/relative) and aligned.
- Search highlights matches and shows a count.
- Follow-tail is a toggle, clearly on/off; scrolling up pauses it.
- Copy selection and download the full log.
- Never strip ANSI blindly; render a safe subset or show raw mode.
- Errors include a stable error code and a link to docs when available.

### 5.10 Jobs, runs, and long operations

- Every job has a state: queued, running, succeeded, failed, canceled, timed out.
- Show elapsed time and, when estimateable, ETA with a range.
- Logs are one click away; the failure reason is visible without opening logs.
- Cancel is available while running and confirms only if work would be lost.
- Partial results are labeled as partial.
- A run is addressable by URL and survives refresh.
- Notify on completion only if the user opted in; in-app status is always present.
- Never block the whole app for a background job.

### 5.11 Forms

- One column by default; two columns only for short, related fields.
- Label above the control; description below; error replaces description.
- Required fields are marked, but the mark is explained once at the top.
- Units are part of the field, not the label only.
- Validate on blur and on submit, not on every keystroke (except format hints).
- Preserve input on error. Never clear a form because submission failed.
- Use a summary of errors at the top for long forms, with links to fields.
- Autosave drafts for long research forms and show "Saved 2 min ago".
- Destructive actions are explicit and reversible where possible.

### 5.12 File intake

- Accept drag-and-drop and a file picker.
- Show file name, size, type, and checksum when available.
- Preview the schema (columns, types, row count) before import.
- Validate and show errors per row/column; allow download of the error report.
- Large files upload in chunks with progress, pause/resume, and cancel.
- Never freeze the UI while parsing; show progress and allow navigation.
- Preserve the original file; derived data is separate and labeled.
- Support the formats the domain actually uses (CSV, TSV, XLSX, JSON, Parquet,
  Arrow, HDF5, NetCDF, FITS, DICOM, FASTQ, BIDS) via optional adapters.

### 5.13 Collaboration and review

- Comments attach to a record, cell, figure, or range, not to a vague page.
- Threads show author, timestamp, and resolved state.
- Review checklists are explicit and block "Approve" until complete.
- Presence is quiet: avatars, not cursors, unless co-editing is real.
- Permissions are visible where the action is; do not fail silently.
- Activity feeds are append-only and link to the changed object.
- Contributor roles follow CRediT taxonomy in authorship contexts.

### 5.14 Clinical, human-subject, and sensitive data

- Never ship real PHI/PII in examples or fixtures.
- Components are UI only; the host app is responsible for HIPAA/GDPR/IRB
  compliance, encryption, audit logs, and retention.
- Show consent status and withdrawal state prominently.
- Redact by default in screenshots and exports; require an explicit action to
  reveal identifiers.
- Use participant codes, not names, in analytical views.
- Destructive actions on records require a reason and are audit-logged.

---

## 6. Layout system

### 6.1 The workbench shell

The canonical research application shell:

```
┌──────────────────────────────────────────────────────────────────┐
│ Top bar 48px: workspace, breadcrumb, command, actions, avatar     │
├────────────┬─────────────────────────────────────┬───────────────┤
│ Nav rail   │ Canvas                              │ Inspector     │
│ 240–280px  │ minmax(0, 1fr)                      │ 300–360px     │
│ collapsible│ scrollable, full-bleed for data     │ collapsible   │
├────────────┴─────────────────────────────────────┴───────────────┤
│ Status bar 28px: job status, sync, selection count, coordinates   │
└──────────────────────────────────────────────────────────────────┘
```

Rules:

- The canvas is the only region that scrolls vertically by default.
- Nav and inspector collapse independently; state persists per user.
- The inspector is for the selected object, not global settings.
- The status bar is always present in workbenches; it is the home for
  asynchronous state, counts, and coordinates.
- The command palette is `⌘K` / `Ctrl+K` and includes domain actions ("New
  sample", "Run pipeline", "Export figure").
- Panels are resizable with a keyboard-accessible separator (arrow keys, Home,
  End). Double-click resets to default width.
- On mobile: nav becomes a sheet, inspector becomes a bottom sheet, status bar
  becomes a compact strip. The canvas remains primary.

### 6.2 Page archetypes

| Archetype | Structure | Example |
| --- | --- | --- |
| **Workbench** | Shell + canvas + inspector | Data Explorer, Notebook |
| **Dashboard** | Shell + grid of instrument cards | Lab Dashboard |
| **Record** | Header + tabs + detail panels | Sample, Run, Participant |
| **Index** | Toolbar + table/list + detail drawer | Samples, Datasets |
| **Wizard** | Stepper + form + summary | Import, Calibration |
| **Canvas** | Full-bleed tool + floating toolbar | Figure Composer, Map |
| **Reading** | Prose column + margin notes/TOC | Paper, Protocol, Docs |
| **Public** | Marketing header + hero + metadata + files | Dataset page |
| **Print** | Fixed A4/Letter layout | Run sheet, labels, poster |

### 6.3 Grid and spacing

- 12-column grid, 24 px gutter, 24 px page padding on desktop.
- Cards align to the grid; do not use masonry for data.
- Dashboard cards have a minimum height of 160 px and a consistent header.
- Section spacing: 32 px inside a panel, 48 px between page sections.
- Use `Frame` for grouped panels with a shared muted background; use `Card` for
  independent units.

### 6.4 Responsive behavior

| Breakpoint | Behavior |
| --- | --- |
| `< 640` | Single column; nav in sheet; inspector in bottom sheet; tables horizontally scroll or switch to record cards |
| `640–1023` | Two columns; inspector overlays; charts stack |
| `1024–1279` | Nav + canvas; inspector toggle |
| `≥ 1280` | Nav + canvas + inspector |
| `≥ 1600` | Wider canvas; optional secondary inspector |

Tables never become cards automatically. A table with 8 columns is still a table
on mobile; it scrolls horizontally with a sticky first column. A record list may
switch to cards if the primary use is browsing, not comparison.

### 6.5 Print and export

Research output ends up on paper and in PDFs. Provide print styles for:

- protocol sheets and run sheets,
- sample labels (with barcodes/QR),
- figure pages with captions,
- posters (A0/A1) composed from the Figure Composer.

Print rules: black text on white, no shadows, hairline rules, page-break
avoidance inside cards, repeated table headers, and a footer with page number,
project, and timestamp. Charts must be vector and legible in grayscale.

### 6.6 Theming

Aperture ships three themes:

| Theme | Intent |
| --- | --- |
| **Paper** | Default light; warm-neutral white, ink text |
| **Graphite** | Default dark; near-black canvas, soft white text |
| **Contrast** | High-contrast light/dark for low-vision users |

Themes are token overrides, not component variants. A component that looks wrong
in a theme is a token bug, not a reason to add a theme-specific class.

---

## 7. Content and voice

Aperture speaks like a competent colleague: direct, specific, calm.

### 7.1 Principles

- **Sentence case.** "New experiment", not "New Experiment".
- **Verbs for actions.** "Run analysis", "Add sample", "Export CSV".
- **Specific over generic.** "Export as CSV" beats "Submit".
- **No exclamation marks.** No "Oops!", "Whoops!", "Awesome!".
- **No anthropomorphism.** The app does not "think", "love", or "want".
- **No jargon in chrome.** Use the domain term in the domain area, plain language
  in navigation and settings.
- **Explain the consequence.** "This will delete 12 runs. This cannot be undone."

### 7.2 Standard labels

| Instead of | Use |
| --- | --- |
| Submit | Save / Run / Create / Send (be specific) |
| OK | the action ("Delete run") |
| Cancel | Cancel |
| Yes / No | the action and its opposite |
| Error occurred | "Upload failed: file exceeds 2 GB" |
| No data | "No samples yet" + action |
| Loading… | "Loading samples…" |
| Are you sure? | "Delete 3 samples? This cannot be undone." |

### 7.3 Error messages

Structure: **what happened** + **why** + **what to do**.

> **Import failed.** Row 42 has 3 columns; the header defines 4. Fix the row or
> download the error report.

Include an error code for support (`AP-1042`) when the failure is not actionable
by the user.

### 7.4 Empty states

- Explain what will appear here.
- Give one primary action.
- Link to docs or an example.
- Do not use illustrations that imply data exists.

### 7.5 Dates, numbers, and localization

- Use the user's locale for dates and numbers, but keep scientific notation and
  units standardized.
- Show the time zone abbreviation in any timestamp that crosses zones.
- Use 24-hour time in scientific contexts; respect the user's preference in
  scheduling contexts.
- Never localize identifiers, units, gene names, or formulas.

---

## 8. Accessibility

### 8.1 Requirements

- WCAG 2.2 AA minimum; AAA for body text where feasible.
- Full keyboard operation, including tables, charts, trees, and drag-and-drop
  alternatives.
- Visible focus at all times; never `outline: none` without a replacement.
- Screen-reader labels for every control; `aria-describedby` for help and errors.
- Live regions for async status, job completion, and validation summaries.
- 200% zoom and 320 px reflow without loss of function.
- `prefers-reduced-motion` respected.
- `prefers-contrast: more` supported by the Contrast theme.
- Touch targets ≥ 44 × 44 px on coarse pointers.
- No color-only meaning; no shape-only meaning without a label.
- Captions/transcripts for any audio or video.
- Charts: a text summary, a data table, and keyboard point inspection.

### 8.2 Keyboard map

| Context | Keys |
| --- | --- |
| Global | `⌘K` command, `?` shortcuts, `Esc` close |
| Dialog | `Tab` cycle, `Esc` close, focus trap, restore focus |
| Menu | arrows, `Home`/`End`, type-ahead, `Esc` |
| Table | arrows move cell, `Enter` edit, `Space` select, `Shift` range, `⌘A` all |
| Tabs | arrows, `Home`/`End` |
| Chart | arrows inspect points, `Esc` clear |
| Panel separator | arrows resize, `Home`/`End` min/max, double-click reset |

### 8.3 Screen reader notes

- Announce units with the value: "12.4 milligrams".
- Announce table sort and filter changes.
- Announce job state transitions, not every log line.
- Provide `aria-rowcount`/`aria-colcount` for virtualized tables.
- Use `<table>` semantics for data tables, not a grid of divs, unless the grid
  role is fully implemented.

---

## 9. Anti-patterns

Reject these in review:

1. **Purple/blue gradients**, glows, glass, and "AI" sparkles.
2. **Emoji as icons** or emoji in button labels.
3. **Gradient text**, especially for headings.
4. **Oversized marketing cards** inside a data application.
5. **Color-only status** (a lone green dot, a red row without a label).
6. **Charts without units**, unlabeled axes, or truncated axes without a break.
7. **Pie charts** with more than five slices; use a bar chart.
8. **3D charts**, drop shadows on data, or decorative gridlines.
9. **Fake precision**: `0.30000000000000004`, or a counter that animates.
10. **Missing data as zero**, or an empty cell with no explanation.
11. **Silent auto-refresh** that reorders a table under the user's cursor.
12. **Modals for everything**, especially row details that should be a panel.
13. **Hiding the primary action** in an overflow menu.
14. **Disabled buttons without a reason**; use a tooltip or inline explanation.
15. **All-caps labels with letter-spacing**; not in this type system.
16. **More than one accent color** in a single view.
17. **Animating numbers** or charts in a way that implies new data.
18. **Toast-only errors** for failures the user must act on.
19. **Custom scrollbars** that hide scrollability.
20. **Unlabeled icon-only buttons**.

---

## 10. Token reference

The following is the canonical token block. It mirrors coss/ui and adds Aperture's
chart, brand, and density tokens. Keep it in `packages/tokens/globals.css`.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
@custom-variant fixed (&:is(.layout-fixed *));

@theme inline {
  --breakpoint-3xl: 1600px;
  --breakpoint-4xl: 2000px;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-chart-7: var(--chart-7);
  --color-chart-8: var(--chart-8);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-code: var(--code);
  --color-code-foreground: var(--code-foreground);
  --color-code-highlight: var(--code-highlight);

  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
  --font-mono: var(--font-mono);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;

  /* The brand is monochrome: no brand hue, in product or marketing. */

  --background: var(--color-white);
  --foreground: var(--color-neutral-800);
  --card: var(--color-white);
  --card-foreground: var(--color-neutral-800);
  --popover: var(--color-white);
  --popover-foreground: var(--color-neutral-800);
  --primary: var(--color-neutral-800);
  --primary-foreground: var(--color-neutral-50);
  --secondary: --alpha(var(--color-black) / 4%);
  --secondary-foreground: var(--color-neutral-800);
  --muted: --alpha(var(--color-black) / 4%);
  --muted-foreground: color-mix(in srgb, var(--color-neutral-500) 90%, var(--color-black));
  --accent: --alpha(var(--color-black) / 4%);
  --accent-foreground: var(--color-neutral-800);
  --destructive: var(--color-red-500);
  --destructive-foreground: var(--color-red-700);
  --info: var(--color-blue-500);
  --info-foreground: var(--color-blue-700);
  --success: var(--color-emerald-500);
  --success-foreground: var(--color-emerald-700);
  --warning: var(--color-amber-500);
  --warning-foreground: var(--color-amber-700);
  --border: --alpha(var(--color-black) / 8%);
  --input: --alpha(var(--color-black) / 10%);
  --ring: var(--color-neutral-400);

  /* Categorical data palette — Okabe–Ito */
  --chart-1: #e69f00;
  --chart-2: #56b4e9;
  --chart-3: #009e73;
  --chart-4: #f0e442;
  --chart-5: #0072b2;
  --chart-6: #d55e00;
  --chart-7: #cc79a7;
  --chart-8: #4d4d4d;

  --sidebar: var(--color-neutral-50);
  --sidebar-foreground: color-mix(in srgb, var(--color-neutral-800) 64%, var(--sidebar));
  --sidebar-primary: var(--color-neutral-800);
  --sidebar-primary-foreground: var(--color-neutral-50);
  --sidebar-accent: --alpha(var(--color-black) / 4%);
  --sidebar-accent-foreground: var(--color-neutral-800);
  --sidebar-border: --alpha(var(--color-black) / 6%);
  --sidebar-ring: var(--color-neutral-400);

  --code: var(--color-white);
  --code-foreground: var(--foreground);
  --code-highlight: --alpha(var(--color-black) / 4%);
}

.dark {
  --background: color-mix(in srgb, var(--color-neutral-950) 96%, var(--color-white));
  --foreground: var(--color-neutral-100);
  --card: color-mix(in srgb, var(--background) 98%, var(--color-white));
  --card-foreground: var(--color-neutral-100);
  --popover: color-mix(in srgb, var(--background) 96%, var(--color-white));
  --popover-foreground: var(--color-neutral-100);
  --primary: var(--color-neutral-100);
  --primary-foreground: var(--color-neutral-800);
  --secondary: --alpha(var(--color-white) / 4%);
  --secondary-foreground: var(--color-neutral-100);
  --muted: --alpha(var(--color-white) / 4%);
  --muted-foreground: color-mix(in srgb, var(--color-neutral-500) 90%, var(--color-white));
  --accent: --alpha(var(--color-white) / 4%);
  --accent-foreground: var(--color-neutral-100);
  --destructive: color-mix(in srgb, var(--color-red-500) 90%, var(--color-white));
  --destructive-foreground: var(--color-red-400);
  --info: var(--color-blue-500);
  --info-foreground: var(--color-blue-400);
  --success: var(--color-emerald-500);
  --success-foreground: var(--color-emerald-400);
  --warning: var(--color-amber-500);
  --warning-foreground: var(--color-amber-400);
  --border: --alpha(var(--color-white) / 6%);
  --input: --alpha(var(--color-white) / 8%);
  --ring: var(--color-neutral-500);

  --chart-1: #f2b44c;
  --chart-2: #7cc7f0;
  --chart-3: #35c79b;
  --chart-4: #f5ec72;
  --chart-5: #4c9fd6;
  --chart-6: #eb7f2e;
  --chart-7: #df9cc1;
  --chart-8: #b8b8b8;

  --sidebar: color-mix(in srgb, var(--color-neutral-950) 97%, var(--color-white));
  --sidebar-foreground: color-mix(in srgb, var(--color-neutral-100) 64%, var(--sidebar));
  --sidebar-primary: var(--color-neutral-100);
  --sidebar-primary-foreground: var(--color-neutral-800);
  --sidebar-accent: --alpha(var(--color-white) / 4%);
  --sidebar-accent-foreground: var(--color-neutral-100);
  --sidebar-border: --alpha(var(--color-white) / 5%);
  --sidebar-ring: var(--color-neutral-400);

  --code: color-mix(in srgb, var(--background) 98%, var(--color-white));
  --code-foreground: var(--foreground);
  --code-highlight: --alpha(var(--color-white) / 4%);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  code, kbd, samp, pre {
    font-family: var(--font-mono);
  }
}

@utility container {
  @apply mx-auto max-w-[1416px] px-4 lg:px-6;
}
```

**Notes**

- `--font-sans` and `--font-mono` are supplied by the font loader (next/font or a
  local `@font-face`). The `@theme inline` mapping is intentionally a reference;
  it resolves at build time.
- Motion keyframes from coss/ui (`skeleton`, `caret-blink`, toast success/error)
  are retained in the implementation and omitted here for brevity.
- `--radius-2xl` (16 px) and `--radius-3xl` (24 px) come from Tailwind's default
  scale; only `sm`–`xl` are derived from `--radius`.

### Density tokens

```css
[data-density="compact"] {
  --row-height: 2rem;
  --cell-pad: 0.375rem;
  --table-text: 0.75rem;
}

[data-density="default"] {
  --row-height: 2.5rem;
  --cell-pad: 0.625rem;
  --table-text: 0.8125rem;
}

[data-density="comfortable"] {
  --row-height: 3rem;
  --cell-pad: 0.75rem;
  --table-text: 0.875rem;
}
```

---

## 11. Upstream governance

Aperture's element layer is a **vendored fork** of coss/ui.

- Keep `LICENSE` and `THIRD_PARTY_NOTICES.md` at the repository root.
- Record the upstream commit in `UPSTREAM.md`.
- Keep a patch log: every local change to an upstream file is listed with a
  reason and a link to the upstream issue/PR when one exists.
- Prefer upstreaming fixes to coss/ui. A local patch is technical debt.
- Do not rename upstream components without a compatibility alias.
- Re-sync on a schedule (monthly), not ad hoc. Run the visual regression suite
  after every sync.
- Never remove the upstream copyright notice from a file that originated there.

---

## 12. Component review checklist

A component is not ready until every box is true.

**Design**

- [ ] Uses semantic tokens only; no raw colors.
- [ ] Matches the type scale, radii, and control heights.
- [ ] Has light, dark, and Contrast behavior.
- [ ] Has hover, focus, pressed, disabled, invalid, loading, and empty states.
- [ ] Uses the inset-highlight technique where the surface is bordered.
- [ ] Density behavior is defined if it contains rows/lists.

**Engineering**

- [ ] `data-slot` on every exported part.
- [ ] `className` passthrough via `cn()`.
- [ ] `render` prop where element substitution makes sense.
- [ ] Controlled and uncontrolled usage both work.
- [ ] No layout shift on load, error, or async update.
- [ ] No hardcoded strings that should be props.
- [ ] Server/client boundary is correct; `"use client"` only when needed.
- [ ] Registry item metadata is complete.

**Research fit**

- [ ] Units are explicit.
- [ ] Missing data is `null` and renders as em dash.
- [ ] Precision/uncertainty is not lost silently.
- [ ] Time zone is explicit where relevant.
- [ ] IDs are monospace and copyable.
- [ ] Every data view has an export and an accessible fallback.
- [ ] Destructive actions are explicit and, where possible, reversible.

**Accessibility**

- [ ] Keyboard operation is complete.
- [ ] Focus is visible and restored after overlays.
- [ ] Screen-reader names, descriptions, and live regions are correct.
- [ ] Color is not the only encoding.
- [ ] Reduced motion is respected.
- [ ] Works at 200% zoom and 320 px width.
- [ ] RTL snapshot passes.
- [ ] Axe reports zero critical/serious issues.

**Docs**

- [ ] A live example exists and is the visual test fixture.
- [ ] Props table is generated or hand-checked.
- [ ] Anatomy and composition are documented.
- [ ] At least one research-specific recipe is shown.
- [ ] Accessibility notes are written.
- [ ] Changelog entry is added.

---

## Appendix A. Element anatomy reference

This appendix records the exact shape of the elements Aperture inherits, so a new
instrument can be assembled from known parts instead of re-deriving the look.
Values are desktop/mobile unless noted.

### A.1 Button

**Anatomy:** `<button>` (or `render` target) → label + optional leading/trailing
icon + optional loading spinner.

| Variant | Surface | Border | Text |
| --- | --- | --- | --- |
| `default` | `bg-primary` | `border-primary` | `text-primary-foreground` |
| `secondary` | `bg-secondary` | transparent | `text-secondary-foreground` |
| `outline` | `bg-popover` (dark: `bg-input/32`) | `border-input` | `text-foreground` |
| `ghost` | transparent | transparent | `text-foreground` |
| `destructive` | `bg-destructive` | `border-destructive` | white |
| `destructive-outline` | `bg-popover` | `border-input` | `text-destructive-foreground` |
| `link` | transparent | transparent | `text-foreground`, underline on hover |

**Sizes (height, mobile/desktop):** xs 28/24 · sm 32/28 · default 36/32 · lg 40/36 ·
xl 44/40. Icon sizes are square: icon-xs 28/24 · icon-sm 32/28 · icon 36/32 ·
icon-lg 40/36 · icon-xl 44/40.

**Geometry:** `rounded-lg` (10 px); xs and icon-xs use `rounded-md` (8 px).
Padding: default `px-[calc(--spacing(3)-1px)]`, sm `2.5-1px`, lg `3.5-1px`,
xl `4-1px`. Gap 8 px, 6 px for xs/sm.

**Type:** 16 px mobile / 14 px desktop, medium. Icons 18/16 px, 80% opacity,
`-mx-0.5` optical alignment.

**States:** hover `bg-primary/90` (or accent for outline/ghost); pressed removes
the inset highlight; disabled 64% opacity; loading preserves width, hides label,
shows an absolute spinner, sets `aria-disabled` and native `disabled`.

**Focus:** 2 px ring, 1 px offset.

### A.2 Badge

**Variants:** default, secondary, outline, destructive, error, info, success,
warning. Error/info/success/warning use a 8% tint (16% dark) of the semantic color
with the darker foreground token.

**Sizes:** default 22/18 · lg 26/22 · sm 20/16. Radius `rounded-sm` (6 px); the sm
size uses 4 px.

**Type:** 14/12 px medium (lg 16/14, sm 12/10). Icons 14/12 px, 80% opacity.

**Behavior:** a badge can render as a link or button with `render`; it gets a
pointer-coarse target and a hover state only when interactive.

### A.3 Input

**Anatomy:** outer `<span data-slot="input-control">` → inner `<input data-slot="input">`.
The wrapper owns the border, radius, shadow, and focus ring; the inner input is
transparent and owns the text.

**Sizes:** default 34/30 · sm 30/26 · lg 38/34. Radius `rounded-lg` (10 px).

**Geometry:** padding 12-1px (sm 10-1px), text 16/14, leading equals height.
Placeholder `muted-foreground/72`.

**States:** `border-input`; focus `border-ring` + 3 px ring at 24%; invalid
`border-destructive/36` + `ring-destructive/16`; disabled 64% opacity; autofill
`bg-foreground/4`.

**Variants:** `unstyled` (no wrapper chrome), `nativeInput` (plain `<input>`),
`type="search"` (native cancel hidden), `type="file"` (file button styled).

### A.4 Input Group

**Anatomy:** `InputGroup` → `InputGroupAddon` (inline-start, inline-end,
block-start, block-end) + `InputGroupInput` / `Textarea`.

**Geometry:** same surface as Input; addons are 12-1px padding (sm 10-1px).
Inline addons are click-to-focus except when they contain an interactive element.
Block addons span the full width and stack above/below.

**Composition:** supports Button, Select, Badge, Kbd, and text addons. Focus ring
is owned by the group, not the inner input.

### A.5 Field

**Anatomy:** `Field` (flex column, gap 8) → `FieldLabel` → control →
`FieldDescription` → `FieldError`.

**Type:** label 16/14 medium with 4.5/4 line-height; description 12 px muted;
error 12 px destructive.

**Behavior:** `FieldControl` registers a custom control for labelling and
validation. `FieldValidity` exposes the validity state. `FieldItem` is a flex
row for checkbox/radio groups.

### A.6 Card

**Anatomy:** `Card` → `CardHeader` (`CardTitle`, `CardDescription`,
`CardAction`) → `CardPanel` → `CardFooter`.

**Surface:** `rounded-2xl` (16 px), `border`, `bg-card`, `shadow-xs/5`, inset
highlight. Card is a column flex container.

**Spacing:** header/panel/footer `p-6` (24 px). Header is a two-row grid; an
action occupies column 2 across both rows. When a panel follows a header without
a divider, the panel's top padding collapses to 16 px. When a footer follows a
panel without a divider, the footer's top padding is 16 px.

**Type:** title 18 px semibold, heading family, leading-none; description 14 px
muted.

**CardFrame:** a stacked variant with a `muted/72` backdrop, clipped inner cards,
and compact header/footer (`px-6 py-4`). Use it for settings pages and grouped
panels, not for a single card.

### A.7 Frame

**Anatomy:** `Frame` (muted wrapper, `p-1`, `rounded-2xl`) → one or more
`FramePanel` (`rounded-xl`, `border`, `bg-background`, `p-5`) → optional
`FrameHeader` (`px-5 py-4`), `FrameTitle` (14 px semibold),
`FrameDescription` (14 px muted), `FrameFooter` (`px-5 py-4`).

**Use:** group related panels in a shared well. Do not nest a Frame inside a
Card unless the card is acting as a page shell.

### A.8 Table

**Variants:** `default` (row borders, simple) and `card` (separated cells with
rounded outer corners and card surfaces).

**Anatomy:** scroll container (`table-container`) → `table` → `TableHeader` /
`TableBody` / `TableFooter` / `TableCaption`.

**Geometry:** header height 40; cell padding 10 px; text 14 px; header text muted,
medium, left aligned. Numeric cells should be right aligned by the consumer.

**States:** row hover `background + 2% ink`; selected `+4%`; card variant uses
`card + 2%/4%`. Last row loses its border. Checkbox columns collapse to 1 px.

**Card variant:** rounded 14 px, separate borders, clipped by the container; pairs
with Frame or CardFrame.

### A.9 Tabs

**Variants:** `default` (muted track + moving surface) and `underline`.

**Anatomy:** `Tabs` → `TabsList` → `TabsTab` + `TabsPanel`; the indicator is
absolutely positioned and measured.

**Geometry:** track `rounded-lg`, `bg-muted`, `p-0.5`; tab `rounded-md`, height
34/30 (default), 30/26 (sm), 38/34 (lg); gap 2 px; text 16/14 medium.

**States:** active text foreground; inactive muted/72 with hover accent; disabled
64%. The indicator transitions width/translate over 200 ms. Vertical orientation
left-aligns labels and uses a 2 px inline indicator.

### A.10 Segmented Control

**Anatomy:** root (`bg-muted`, `p-0.5`, `rounded-lg`, `gap-0.5`) → items +
measured indicator (`rounded-md`, `bg-background`, shadow-xs/5; dark `bg-input`).

**States:** `data-checked`, `aria-current="page"`, and `data-pressed` all select
the item. Items are buttons by default; use `render` for links.

**Geometry:** same heights as Tabs (default 34/30, sm 30/26, lg 38/34). Indicator
moves over 200 ms; respects reduced motion.

### A.11 Sidebar

**Anatomy:** `SidebarProvider` → `Sidebar` (`header`, `content`, `footer`,
`group`, `menu`, `inset`, `rail`) → `SidebarTrigger`.

**Widths:** expanded 256 px, icon 48 px, mobile 288 px. State persists in a
7-day cookie. `⌘B` / `Ctrl+B` toggles.

**Behavior:** collapsible modes (icon, offcanvas, none); mobile uses a Sheet;
menu items support active, hover, disabled, badges, sub-items, and tooltips when
collapsed. Menu item heights: default 32, sm 28, lg 48.

### A.12 Dialog

**Anatomy:** `Dialog` → `DialogTrigger` + `DialogPopup` (`DialogBackdrop`,
`DialogViewport`, popup → `DialogHeader`, `DialogPanel`, `DialogFooter`).

**Surface:** `rounded-2xl` (16 px), `bg-popover`, `border`, `shadow-lg/5`, inset
highlight, max width `lg` (32 rem) by default. Backdrop `black/32` +
`backdrop-blur-sm`.

**Motion:** 200 ms scale 98→100 + opacity. Nested dialogs scale by
`1 - 0.1 × depth`.

**Mobile:** bottom-stick mode removes side borders, rounds only the top, and
slides up 4 px; header/footer remain fixed while the panel scrolls.

**Header/footer:** `p-6`, gap 8; footer actions right-aligned on desktop, stacked
on mobile. Close button is a ghost icon at top-right.

### A.13 Sheet and Drawer

- **Sheet:** side panel (`start`/`end`/`top`/`bottom`), backdrop, viewport, header,
  footer, close. Use for inspectors, filters, and mobile navigation.
- **Drawer:** bottom sheet with swipe gestures, snap points, nested drawers, and
  menu-style rows. Use on touch-first surfaces; do not use a Drawer for a
  desktop inspector.

### A.14 Menu, Select, and Popover

**Shared popup surface:** `rounded-lg` (10 px), `border`, `bg-popover`,
`shadow-lg/5`, inset highlight, `sideOffset` 4, transform-origin animation.

**Menu item:** min-height 32/28, padding `px-2 py-1`, radius 6, text 16/14, icon
18/16, gap 8. Highlighted = accent; destructive = destructive foreground;
disabled = 64%.

**Select:** trigger is 36/32 (sm 32/28, lg 40/36), `rounded-lg`,
`border-input`, chevrons icon on the end. Popup items match menu items. Supports
groups, labels, separators, scroll arrows, and type-ahead.

**Popover:** default padding 16; tooltip-style padding 8 and text 12; max height is
the available viewport; scrolls when content exceeds it.

### A.15 Alert

**Anatomy:** `Alert` (grid, `rounded-xl`, `border`, `px-3.5 py-3`) → optional
icon → `AlertTitle` → `AlertDescription` → optional `AlertAction`.

**Variants:** default (transparent; dark `bg-input/32`), error, info, success,
warning. Semantic variants use a 4% tint and a 32% border of the status color.

**Grid:** 4 px icon column, 1fr content, auto action; action moves below the
description on mobile.

### A.16 Empty

**Anatomy:** `Empty` (centered, `px-6 py-12`, `md:py-20`) → `EmptyHeader` →
`EmptyMedia` → `EmptyTitle` → `EmptyDescription` → `EmptyContent`.

**Media:** `variant="icon"` renders a 36 px card with two rotated, scaled copies
behind it. This is the signature empty-state illustration; use it instead of
custom artwork.

**Type:** title 20 px bold heading; description 14 px muted; content max width
`sm` (24 rem).

### A.17 Meter and Progress

- **Meter:** label 14 medium; track h-2, `bg-input`; indicator `bg-primary`,
  500 ms; value 14 tabular.
- **Progress:** track h-1.5, `rounded-full`; indicator `bg-primary`, 500 ms;
  value 14 tabular.
- Use Meter for "value in a range" (CPU, storage, signal); Progress for "task
  completion". Do not use a spinner when progress is known.

### A.18 Toast

**Anatomy:** viewport → positioner → popup → icon + (`ToastTitle`,
`ToastDescription`) + optional action.

**Types:** default, success, error, warning, info, loading. Icons use the
corresponding status color; loading spins.

**Motion:** success scales 1 → 1.025 → 0.99 → 1 over 320 ms; error shakes ±3 px
over 280 ms. Both are disabled under reduced motion.

**Rules:** toasts are transient confirmation, never the only surface for an error
the user must act on. Errors that need action belong in the form or a persistent
alert.

### A.19 Kbd

Height 20, min-width 20, padding 4, radius 4, `bg-muted`, 12 px medium,
muted-foreground. Use the platform modifier; use `KbdGroup` for sequences.

### A.20 Number Field

**Anatomy:** root → group (`rounded-lg`, `border-input`, h 34/30) →
decrement/input/increment; optional scrub area.

**Behavior:** input is centered, tabular, transparent; increment/decrement have
44 px coarse targets; scrub area changes the value on horizontal drag with a
visible pointer. Invalid and disabled states match Input.

## Appendix B. Extraction notes

The system above was extracted from the following coss/ui sources. This list is
the map for future syncs: if upstream changes one of these files, check the
corresponding section here.

| Source | What it established |
| --- | --- |
| `packages/ui/src/styles/globals.css` | Token architecture, light/dark values, semantic colors, chart tokens, radius, container width, code styling |
| `registry/default/ui/button.tsx` | CVA variants, `useRender`, loading behavior, size scale, inset highlight |
| `registry/default/ui/card.tsx` | Card/CardFrame parts, padding, title/description type, action grid |
| `registry/default/ui/frame.tsx` | Muted well + panel composition |
| `registry/default/ui/input.tsx` | Wrapper/inner split, sizes, focus/invalid/autofill states |
| `registry/default/ui/input-group.tsx` | Addon alignment, attached controls, group focus |
| `registry/default/ui/field.tsx` | Label/description/error anatomy and type |
| `registry/default/ui/table.tsx` | Default and card variants, row states, header/cell geometry |
| `registry/default/ui/tabs.tsx` | Default and underline variants, measured indicator, sizes |
| `registry/default/ui/segmented-control.tsx` | Indicator measurement, item states, shared size tokens |
| `registry/default/ui/dialog.tsx` | Viewport/backdrop/popup anatomy, mobile bottom-stick, nested scaling |
| `registry/default/ui/sidebar.tsx` | Widths, provider, collapse modes, mobile sheet, shortcut |
| `registry/default/ui/menu.tsx` | Item geometry, highlighted/disabled/destructive states |
| `registry/default/ui/select.tsx` | Trigger sizes, popup anatomy, icon treatment |
| `registry/default/ui/popover.tsx` | Popup surface, padding, tooltip style, transform origin |
| `registry/default/ui/alert.tsx` | Grid anatomy, semantic variants |
| `registry/default/ui/empty.tsx` | Empty anatomy and the stacked icon media |
| `registry/default/ui/number-field.tsx` | Group anatomy, scrub area, tabular numerals |
| `registry/default/ui/meter.tsx`, `progress.tsx` | Track/indicator geometry and 500 ms transition |
| `registry/default/ui/toast.tsx` | Types, icon colors, success/error motion |
| `packages/ui/src/fonts/font-guide.md` | Type philosophy: Cal Sans at all sizes, no tracking, one family |
| `apps/ui/app/docs/layout.tsx` | Docs shell and sidebar container behavior |
| `registry/default/particles/*` (530) | Composition patterns: cards, frames, tables, forms, navigation, empty states |

**Things deliberately not copied:**

- Marketing copy and product-specific particles.
- The Cal.com brand marks and wordmark.
- Paper Mono until its license is verified.
- Any component that assumes Cal.com's data model or scheduling domain.

**Things to re-check on every upstream sync:**

1. Token names and values in `globals.css`.
2. Control heights and radius in button/input/select.
3. `data-slot` names used by our instruments.
4. Base UI major version and primitive API changes.
5. Font files and licenses.

---

*This document is living. When a new pattern is accepted, add it here before it
appears in three components. Consistency is cheaper than correction.*
