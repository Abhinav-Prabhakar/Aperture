# Landing Page Brief — Building Blocks for Researchers

**Route:** `/` · **Built with:** Aperture itself · **Status:** spec

---

## 1. Objective

Make a researcher — or the engineer supporting a lab — think:

> "I can build the tool I actually need with this, and it will look like it came
> from a company that understands science."

The page must do three jobs in order:

1. **Recognition.** "That is my problem." (file uploads, tables, plots, logs)
2. **Belief.** "These people understand research UI, not just buttons."
3. **Action.** "I can install something right now."

It should not read like a generic developer-tools landing page. No abstract
gradients, no "supercharge your workflow", no AI sparkles. It should read like a
precision instrument catalog, written by someone who has used one.

---

## 2. Audience and message

### Primary

- A research software engineer or computationally inclined scientist building an
  internal tool.
- A PI who needs a dashboard or sample tracker and has a postdoc who can code.
- A lab that has outgrown spreadsheets and Gradio demos.

### Secondary

- Designers/engineers who work with research teams.
- Open-source contributors looking for a meaningful design system.
- Educators teaching scientific software.

### Core message

> Aperture is a copy-paste UI system for scientific software. It gives you the
> elements, the research instruments, and the whole workbenches — so you can
> spend your time on the science.

### Supporting messages

- Built on coss/ui, so the design is production-grade, not a side project.
- Every discipline, not just ML demos.
- You own the code.
- Units, uncertainty, missing data, provenance, and accessibility are built in.

---

## 3. Visual direction

### 3.1 Identity

**Aperture** — an opening that controls light. The visual language should feel
like a well-made instrument:

- **Paper** (`#FFFFFF` / warm-neutral ink) as the default surface.
- **Graphite** (near-black) for the dark theme.
- **No brand hue.** The identity is fully monochrome: ink, paper, and the mark.
  The primary CTA is an ink fill, not a colored button. Color appears only in
  data visualization inside the real UI.
- **Hairlines**, not cards-on-cards. 1 px rules, subtle grids, generous negative
  space.
- **Real UI**, not illustrations. The product is the visual.
- **Technical typography**: Cal Sans for display, Paper Mono (or JetBrains Mono)
  for labels, commands, measurements, and captions.
- **Photography**: none in v1. If added later, use real lab/instrument imagery,
  desaturated, never stock "scientists pointing at a screen".

### 3.2 The aperture mark

A simple geometric mark: a circle divided into six blades, with one blade
offset/open. Ink on paper, paper on ink — no highlight, no gradient. It should
work at 16 px and as a large watermark. Do not animate it continuously; a single
slow open on page load is enough.

### 3.3 Background

A very faint 1 px technical grid (4% ink) behind the hero only, fading out at the
edges. It should feel like graph paper, not a cyberpunk grid.

### 3.4 Motion

- One hero reveal: the workbench panel eases up 8 px and fades in over 500 ms.
- Layer ladder: 200 ms crossfade between layers.
- Domain tabs: 150 ms underline/indicator move.
- No parallax, no scroll-jacking, no marquee, no auto-rotating carousel.
- Respect `prefers-reduced-motion`.

---

## 4. Page structure

```
┌────────────────────────────────────────────────────────────────────┐
│ Nav: mark + Aperture | Elements Instruments Workbenches Design Docs │
│                                    GitHub  Theme  [Get started]     │
├────────────────────────────────────────────────────────────────────┤
│ HERO                                                               │
│  eyebrow: OPEN SOURCE · REACT · TAILWIND                            │
│  H1: Building blocks for researchers.                               │
│  Sub: A copy-paste UI system for scientific software...             │
│  CTAs: [Browse workbenches] [Read the design system]                │
│  Command: npx @aperture/cli init                                    │
│                                                  ┌───────────────┐  │
│                                                  │ live workbench │  │
│                                                  │ table + chart  │  │
│                                                  │ + inspector    │  │
│                                                  └───────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│ PROOF STRIP: MIT · 60+ elements · 50+ instruments · 10 workbenches │
│              accessible · copy-paste · React + Tailwind             │
├────────────────────────────────────────────────────────────────────┤
│ PROBLEM: "You shouldn't build another file uploader."               │
│  three before/after mini-UIs                                       │
├────────────────────────────────────────────────────────────────────┤
│ LAYERS: Elements → Instruments → Workbenches (interactive)          │
├────────────────────────────────────────────────────────────────────┤
│ DOMAINS: Life sciences · Physics · Earth · Social · Humanities ...  │
│          three components per tab                                   │
├────────────────────────────────────────────────────────────────────┤
│ WORKBENCH GALLERY: six full-page previews + install commands        │
├────────────────────────────────────────────────────────────────────┤
│ OWN THE CODE: registry + CLI + design.md + code panel               │
├────────────────────────────────────────────────────────────────────┤
│ PRINCIPLES: four cards                                             │
├────────────────────────────────────────────────────────────────────┤
│ ACCESSIBILITY + THEMING                                             │
├────────────────────────────────────────────────────────────────────┤
│ OPEN SOURCE + CREDITS + CTA                                         │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Section-by-section

### 5.1 Navigation

- Left: aperture mark + `Aperture` wordmark.
- Center/left links: `Elements`, `Instruments`, `Workbenches`, `Design`, `Docs`.
- Right: GitHub stars, theme toggle, `Get started` (primary).
- Sticky, 56 px, background blur only after scroll, border-bottom hairline.
- Mobile: mark + menu button; sheet with links and CTA.

### 5.2 Hero

**Eyebrow** (mono, 12 px, muted):
`OPEN SOURCE · REACT · TAILWIND · MIT`

**H1** (Cal Sans, 56–72 px, max 12 words):
`Building blocks for researchers.`

**Sub** (18–20 px, muted, max 2 lines):
`A copy-paste UI system for scientific software. Elements, instruments, and whole
workbenches — so you can spend your time on the science.`

**CTAs:**
- Primary: `Browse workbenches` (ink fill, `--primary`).
- Secondary: `Read the design system` (outline).
- Tertiary: `Star on GitHub` (ghost, with star count).

**Install line** (mono, with copy button):
`npx @aperture/cli init`

**Hero visual:** a live Data Explorer workbench, scaled to fit, with:

- a small dataset ("Magnetic susceptibility, run 12"),
- a table with units in headers and a `—` missing value,
- a sparkline and a small spectrum plot,
- a status chip ("Analysis complete"),
- a right inspector with metadata and provenance,
- a command palette hint (`⌘K`).

It must be interactive: clicking a row updates the inspector; the theme toggle
changes the workbench; the table filter works. Do not autoplay a video. Do not
use a static screenshot.

**Layout:** 7/5 split on desktop; visual below copy on mobile. The hero visual
gets a 1 px border, 16 px radius, and the signature inset highlight. No browser
chrome mockup; it is the app, not a screenshot of a browser.

### 5.3 Proof strip

A single hairline-bounded row of facts:

`60+ elements` · `50+ instruments` · `10 workbenches` · `8 disciplines` ·
`WCAG 2.2 AA` · `MIT`

Use mono labels, no icons. On mobile, horizontally scrollable with a fade edge.

### 5.4 Problem section

**Heading:** `You shouldn't build another file uploader.`

**Sub:** `Research software is a stack of small, hard interfaces. Aperture gives
you the ones you keep rebuilding — and the screens that hold them together.`

Three columns, each a before/after mini-UI:

1. **"4 GB CSV, no schema preview."**
   Before: a bare file input and a spinner. After: File Dropzone + Schema Preview.
2. **"A table with no units."**
   Before: `12.4 | 0 | 3.2e-6`. After: `12.4 mm | — | 3.2 × 10⁻⁶ m`.
3. **"A run that fails silently."**
   Before: a spinner that never ends. After: Job Card with state, logs, and a
   failure reason.

Each card is a real component composition, not an illustration. The "after" side
is interactive on hover/focus.

### 5.5 Layer ladder

**Heading:** `Three layers. One system.`

**Sub:** `Start with an element. Compose an instrument. Ship a workbench.`

An interactive segmented control:

- **Elements** — show a Button/Input/Field composition with code.
- **Instruments** — show a Quantity Input or Data Table with code.
- **Workbenches** — show a full Data Explorer preview with install command.

Switching layers crossfades the preview and updates the code. Underneath, a
one-line definition of each layer.

### 5.6 Domain rail

**Heading:** `For every kind of researcher.`

**Sub:** `Not just ML demos. Aperture ships domain packs for the way your field
actually works.`

Tabs: `Life sciences` · `Physics & astronomy` · `Earth & environment` ·
`Social science` · `Humanities` · `Clinical` · `ML & CS` · `Engineering`.

Each tab shows three instrument cards (name, one-line description, a small live
preview) and a link to the pack. Use a horizontal tab list with an animated
indicator. On mobile, a select.

Include one honest line: `Domain packs are reviewed with researchers from the
field.` Link to the advisor program.

### 5.7 Workbench gallery

**Heading:** `Steal a whole screen.`

**Sub:** `Workbenches are complete layouts: navigation, canvas, inspector, empty
states, and the details that take another month.`

Six cards in a 3×2 grid:

1. Data Explorer
2. Lab Dashboard
3. Notebook
4. Sample Registry
5. Figure Composer
6. Public Dataset Page

Each card: a miniature preview, name, one-line description, and a mono install
command on hover/focus. Click opens a full-page preview in a new tab.

### 5.8 Own the code

**Heading:** `Your code. Your design system.`

**Sub:** `No wrapper library. No version lock. The source lands in your repo, and
design.md keeps every new component consistent.`

Two-column:

- Left: a code panel showing `npx shadcn@latest add @aperture/data-table` and the
  resulting file tree.
- Right: three bullets — copy-paste, typed props, one design contract — and a
  link to `design.md`.

### 5.9 Principles

Four cards, each with a number and a short statement:

1. **Chrome is achromatic.** Color belongs to the data.
2. **Dense by default.** Researchers read tables for a living.
3. **Show the state.** Units, uncertainty, missing values, provenance.
4. **Accessible is not optional.** Keyboard, screen reader, colorblind-safe.

No icons. Use a thin rule and a mono number. This is the editorial moment.

### 5.10 Accessibility and theming

**Heading:** `Quiet by default. Legible in every condition.`

Show three theme swatches (Paper, Graphite, Contrast) and a short list:

- WCAG 2.2 AA, keyboard-first, screen-reader-aware.
- Colorblind-safe data palette.
- RTL-ready logical properties.
- Reduced-motion support.
- 200% zoom and 320 px reflow.

Include a "View accessibility statement" link.

### 5.11 Open source and credits

**Heading:** `Built in the open. Standing on good work.`

Copy:

> Aperture is MIT-licensed and built on [coss/ui](https://coss.com/ui), the design
> system from Cal.com. We are grateful for their work, and we are not affiliated
> with or endorsed by Cal.com.

Links: GitHub, coss/ui, Base UI, Tailwind, shadcn/ui, Cal Sans.

### 5.12 Final CTA

**Heading:** `Build the tool your research needs.`

**Sub:** `Start with an element. Ship a workbench this week.`

CTAs: `Get started` (primary), `Browse the catalog` (secondary).

### 5.13 Footer

Four columns:

- Product: Elements, Instruments, Workbenches, Design system, Changelog.
- Resources: Docs, Recipes, Registry, CLI, MCP.
- Community: GitHub, Discussions, Contributing, Advisors, Code of conduct.
- Legal: MIT license, Third-party notices, Privacy, Trademark.

Bottom line: `© 2026 Aperture contributors. Built on coss/ui.`

---

## 6. Copy deck

### Hero

- **H1:** Building blocks for researchers.
- **Sub:** A copy-paste UI system for scientific software. Elements, instruments,
  and whole workbenches — so you can spend your time on the science.
- **Primary CTA:** Browse workbenches
- **Secondary CTA:** Read the design system
- **Install:** `npx @aperture/cli init`

### Problem

- **H2:** You shouldn't build another file uploader.
- **Sub:** Research software is a stack of small, hard interfaces. Aperture gives
  you the ones you keep rebuilding — and the screens that hold them together.

### Layers

- **H2:** Three layers. One system.
- **Sub:** Start with an element. Compose an instrument. Ship a workbench.
- **Elements:** Accessible primitives with the Aperture design language.
- **Instruments:** Focused research components that solve one real problem well.
- **Workbenches:** Complete screens with navigation, state, and empty states.

### Domains

- **H2:** For every kind of researcher.
- **Sub:** Not just ML demos. Aperture ships domain packs for the way your field
  actually works.

### Workbenches

- **H2:** Steal a whole screen.
- **Sub:** Workbenches are complete layouts: navigation, canvas, inspector, empty
  states, and the details that take another month.

### Own the code

- **H2:** Your code. Your design system.
- **Sub:** No wrapper library. No version lock. The source lands in your repo, and
  `design.md` keeps every new component consistent.

### Principles

- **H2:** Designed like an instrument.
- **Sub:** Quiet surfaces, precise edges, and defaults that respect the data.

### Accessibility

- **H2:** Quiet by default. Legible in every condition.
- **Sub:** Research software has to work for every researcher, in every lab, on
  every screen.

### Final CTA

- **H2:** Build the tool your research needs.
- **Sub:** Start with an element. Ship a workbench this week.

---

## 7. Technical implementation

### 7.1 Rendering

- Next.js App Router, server-rendered page shell.
- Hero workbench is a client component, lazy-loaded after first paint with
  `next/dynamic` and a static skeleton.
- Code panels use the same `CodeBlock` element as the docs.
- No video, no heavy 3D, no canvas for the hero.
- Theme is set before paint with a blocking script to avoid a flash.

### 7.2 Performance budget

| Metric | Target |
| --- | --- |
| LCP | < 1.5 s |
| CLS | < 0.05 |
| INP | < 200 ms |
| Total JS (initial) | < 150 KB gzip |
| Hero workbench JS | < 80 KB gzip, lazy |
| Fonts | 2 families, `woff2`, `font-display: swap`, preload Cal Sans |
| Images | AVIF/WebP, explicit dimensions, no hero image |

### 7.3 Accessibility

- One `h1`; sections use `h2`.
- The hero workbench is a real application region with a label; provide a
  "Skip the demo" link.
- Tabs use the `Tabs` element with proper roles; the domain rail is a tablist.
- Theme toggle announces the new theme.
- All motion respects `prefers-reduced-motion`.
- Every marketing surface uses the same neutral tokens as the product. No
  color-dependent meaning; the ink CTA meets 4.5:1 against Paper.
- No autoplay.

### 7.4 SEO and metadata

- Title: `Aperture — Building blocks for researchers`
- Description: `A copy-paste UI system for scientific software. Elements,
  instruments, and workbenches for labs, field teams, clinicians, and
  computational researchers.`
- Open Graph image: the hero workbench on Paper, with the aperture mark and the
  headline.
- JSON-LD: `SoftwareApplication`, `Organization`, `WebSite`.
- `llms.txt` at the root for AI crawlers.
- Canonical URL and sitemap.

### 7.5 Analytics

Privacy-preserving, aggregate only:

- hero CTA clicks,
- install command copies,
- workbench preview opens,
- domain tab views,
- docs outbound clicks.

No fingerprinting, no session replay, no third-party ad pixels. Document it in
the privacy page.

---

## 8. What to build first

If the page ships in stages:

1. **Hero + proof strip + final CTA** — enough to validate the message.
2. **Layer ladder + workbench gallery** — enough to show depth.
3. **Problem section + domains** — enough to show breadth.
4. **Principles + accessibility + credits + footer** — enough to build trust.

Do not launch with lorem ipsum or placeholder component screenshots. Every visual
on the page must be a real, working composition from the library.

---

## 9. Open questions

1. Final domain and wordmark lockup.
2. Whether the hero demo uses a CSV import (interactive) or a preloaded dataset
   (faster). Recommendation: preloaded, with a "try your own CSV" secondary.
3. Whether to show GitHub stars in the nav (yes, if the count is credible).
4. Whether the domain rail is tabs or a scrolling gallery on desktop. Tabs are
   clearer; the gallery may show more.
5. Whether to include a short founder letter. If yes, keep it under 150 words and
   put it after the principles, not in the hero.
