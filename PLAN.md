# Aperture — Product & Engineering Plan

**Status:** planning · **Version:** 0.1 · **Date:** November 2026

> Building blocks for researchers. A copy-paste UI system — elements, instruments,
> and workbenches — so research teams can spend their time on the science.

**Contents**

1. [Executive summary](#1-executive-summary) · [Why now](#why-now) · [Sequencing logic](#sequencing-logic)
2. [The problem](#2-the-problem)
3. [Product thesis](#3-product-thesis)
4. [Who it is for](#4-who-it-is-for)
5. [Foundation and stack](#5-foundation-and-stack)
6. [Architecture](#6-architecture)
7. [Design system](#7-design-system)
8. [What we build](#8-what-we-build)
9. [Landing page and brand](#9-landing-page-and-brand)
10. [Documentation and developer experience](#10-documentation-and-developer-experience)
11. [Quality, testing, and accessibility](#11-quality-testing-and-accessibility)
12. [Community, licensing, and governance](#12-community-licensing-and-governance)
13. [Roadmap](#13-roadmap)
14. [First 30 days](#14-first-30-days)
15. [Metrics](#15-metrics)
16. [Risks and mitigations](#16-risks-and-mitigations)
17. [Open decisions](#17-open-decisions)
18. [Non-goals](#18-non-goals)
19. [Definition of done for v1](#19-definition-of-done-for-v1)
20. [Appendix: core data contracts](#20-appendix-core-data-contracts)
21. [Appendix: naming conventions](#21-appendix-naming-conventions)
22. [Appendix: design-partner brief](#22-appendix-the-first-design-partner-brief)

---

## 1. Executive summary

Researchers rebuild the same software in every lab: file intake, data tables,
plots, run logs, sample trackers, protocol checklists, metadata forms, and
collaboration. General UI kits give them buttons; demo frameworks give them a
single-page prototype. Neither gives them a **workbench**.

Aperture is three layers:

1. **Elements** — accessible primitives with a precise, instrument-like design
   language, derived from [coss/ui](https://coss.com/ui).
2. **Instruments** — research-native components that solve real problems:
   quantity inputs, uncertainty, data tables, log viewers, protocol steps,
   spectra, sequences, maps, timelines.
3. **Workbenches** — complete layouts and application shells: data explorer,
   lab dashboard, notebook, sample registry, field console, figure composer.

The distribution model is copy-paste (shadcn registry), so users own the code.
Heavy logic ships as small npm packages (`@aperture/quantities`, `@aperture/data`,
`@aperture/stats`, `@aperture/plots`). React + TypeScript is the reference
implementation; the design system and a server-driven UI protocol make later
ports to Python, Vue, Svelte, R, and Julia feasible without forking the visual
language.

**Wedge:** the 12 instruments every research app needs, done better than anyone
else. **Moat:** the design contract plus domain breadth. **Long-term:** the
default UI layer for scientific software, in every stack researchers use.

### Why now

- **Research software is having a moment.** Labs are replacing spreadsheets and
  one-off scripts with real internal tools, and every one of them needs the same
  UI. The demand is no longer limited to industry ML teams.
- **AI has made code cheap; taste and correctness are the bottleneck.** A model
  can generate a table in seconds. It cannot decide that units belong in the
  header, that missing data is not zero, or that a colorblind-safe palette is
  required. A design system is how that judgment scales.
- **The React ecosystem is finally good enough.** Base UI, Tailwind 4, and the
  shadcn registry model make a copy-paste, accessible, own-your-code library
  viable without a heavy runtime.
- **The Python ecosystem is not going away, but its UI layer is.** Gradio and
  Streamlit proved the demand; they did not solve the application. A React
  reference implementation plus a Python bridge can serve both worlds.
- **No one owns "research UI" as a category.** There are beautiful generic
  libraries and there are domain-specific tools. There is no design system that
  spans the lab, the field, the clinic, the archive, and the cluster.

### Sequencing logic

1. **Universal instruments first.** They are used by every discipline and prove
   the quality bar.
2. **One complete workbench second.** A data explorer is the shortest path from
   "components" to "an app someone can use."
3. **Domain packs third.** They are the breadth story, but only after the core is
   trustworthy.
4. **Python fourth.** It is the biggest adjacent audience, but it depends on a
   stable component contract.
5. **Other frameworks last.** They are ports, not redesigns, and only make sense
   once the design system has stopped moving.

---

## 2. The problem

### 2.1 What researchers actually build

A research tool is rarely one screen. It is a pipeline of small interfaces:

- ingest files in a dozen formats and validate them,
- inspect a table with units and missing values,
- configure a run with parameters, ranges, and units,
- watch a job, read logs, handle failure,
- compare results across runs and samples,
- annotate a figure, export it at publication quality,
- share a dataset with metadata, provenance, and a citation,
- keep a protocol, a sample inventory, and a consent record.

Each of these is a design problem with domain constraints. Most labs solve them
with a spreadsheet, a Jupyter notebook, a Gradio demo, or a graduate student's
first React app. The result works just well enough to become load-bearing, then
becomes impossible to maintain.

### 2.2 Why existing tools fall short

| Tool | Strength | Gap for research |
| --- | --- | --- |
| **Gradio** | Instant Python UI for demos | Demo-shaped, generic components, limited layout control, hard to make a real multi-screen app |
| **Streamlit** | Fast data scripts | Rerun model, limited composition, weak dense-table and workflow UX |
| **Dash** | Custom analytics apps | Heavy, callback-oriented, design system is on you |
| **marimo / Panel / Reflex** | Reactive Python apps | Python-only, generic components, limited design coherence |
| **Retool / Appsmith** | Internal tools fast | Generic business UI, no research semantics, hosted dependency |
| **shadcn/ui** | Beautiful primitives you own | Generic; no research semantics, no layouts, no domain components |
| **MUI / Chakra** | Complete component sets | Generic visual language; dependency-owned; research patterns still missing |
| **Jupyter** | Exploratory computing | Not an application surface; UI is an afterthought |

The gap is not "more components." It is **research-native components plus
layouts, in a system that stays coherent as it grows.** That is what Aperture is.

### 2.3 Design debt is research debt

Every week a lab spends on a file uploader is a week not spent on the experiment.
Every inconsistent table is a place where a unit can be misread. Every unlabeled
axis is a figure that cannot be published. Better defaults are not cosmetic; they
are reproducibility infrastructure.

---

## 3. Product thesis

### 3.1 Thesis

> Researchers should not have to become frontend engineers to build the tools
> their research needs. Give them excellent, domain-aware building blocks and
> complete workbenches, in code they own, and they will build tools that
> currently never get built.

### 3.2 Principles

1. **Copy, don't depend.** The source is yours. The design system is the contract.
2. **Chrome is achromatic; color belongs to data.** Quiet UI, legible data.
3. **Dense by default.** Researchers read tables and logs professionally.
4. **Show the state.** Units, uncertainty, missing values, provenance, run status.
5. **Layouts are first-class.** A component library without screens is incomplete.
6. **Every discipline.** Life sciences, physics, astronomy, chemistry, earth
   science, social science, economics, humanities, clinical, ML, engineering.
7. **Accessible is table stakes.** Keyboard, screen reader, colorblind-safe, RTL.
8. **AI-readable.** Clear code, manifests, docs, and an MCP server so assistants
   can compose the library correctly.

### 3.3 What "like Gradio, but for researchers" means

Not a Python-only auto-UI generator. The initial product is a **React design
system** for people building research applications, because that is where serious
research UIs are being built today. The Gradio audience is reached in Phase 4
with a Python SDK that renders the same Aperture components through a
server-driven UI protocol — Python ergonomics, Aperture quality, no duplicate
component implementations.

### 3.4 What we will not do

- Build a backend, database, auth provider, or compute platform.
- Build a charting engine from scratch. Compose proven renderers.
- Ship a no-code app builder in v1.
- Port every component to every framework at once.
- Chase generic dashboard/admin templates.
- Put components behind a paywall. The library is MIT.

---

## 4. Who it is for

### 4.1 Primary personas

| Persona | What they build | What they need from Aperture |
| --- | --- | --- |
| **The lab software engineer** | Internal LIMS, sample trackers, instrument dashboards | Layouts, tables, forms, run status, auth/settings scaffolds |
| **The computational scientist** | Analysis pipelines, parameter sweeps, notebooks | Quantity inputs, job queues, logs, charts, data tables |
| **The PI / lab lead** | Dashboards, reports, sharing | Dashboard shell, stat cards, publication export, public pages |
| **The field researcher** | Mobile data capture, maps, observation logs | Offline-aware forms, geospatial inputs, timeline, media capture |
| **The social scientist** | Surveys, coding, transcripts, regression output | Survey builder, Likert/matrix, coding, regression tables, CONSORT/PRISMA |
| **The clinician / epidemiologist** | Registries, visit schedules, cohorts | Participant timelines, consent, DICOM, REDCap-like forms, privacy patterns |
| **The digital humanist** | Archives, annotations, exhibits | Deep-zoom viewers, TEI, text annotation, timelines, catalog records |
| **The ML researcher** | Experiment tracking, evals, demos | Metric charts, leaderboards, confusion matrices, prompt/eval grids |
| **The educator / student** | Course tools, visualizations | Simple workbenches, accessible defaults, copy-paste examples |

### 4.2 Design partners

Recruit 6–10 design partners across at least four disciplines before public beta.
Each partner commits to:

- one real tool built with Aperture,
- a 30-minute monthly feedback call,
- permission to publish a case study (if comfortable),
- testing one domain pack in exchange for early influence on its API.

Ideal mix: a wet lab, a computational physics/astro group, a social science lab,
a digital humanities center, a clinical research group, and an ML team.

---

## 5. Foundation and stack

### 5.1 Starting language: TypeScript + React

**Decision:** React 19 + TypeScript 5.9 for the reference implementation.

Why:

- coss/ui is React; staying on it preserves the design system and avoids a
  rewrite before we have a product.
- The research tools that need custom UI are increasingly web apps built with
  React/Next.js/Vite.
- The shadcn registry model is React-first and gives us copy-paste distribution
  with almost no infrastructure.
- A single reference implementation is the cheapest way to keep quality high
  while the catalog grows.
- TypeScript gives us a machine-readable component contract, which powers docs,
  registry metadata, and AI tooling.

### 5.2 Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript 5.9 | Strict mode |
| UI | React 19 | Server components where useful; client components for interaction |
| Framework (docs/landing) | Next.js 16 App Router | Same as coss; good docs ecosystem |
| Styling | Tailwind CSS 4 | CSS-first tokens |
| Primitives | Base UI 1.9 | Via coss/ui; accessible, unstyled |
| Variants | `class-variance-authority` | Consistent with coss |
| Class merge | `clsx` + `tailwind-merge` | `cn()` |
| Icons | Lucide | Default; custom domain icons later |
| Docs | Fumadocs | MDX, search, API tables |
| Registry | shadcn registry schema | Namespace `@aperture` |
| Monorepo | Bun workspaces + Turborepo | Fast, simple |
| Lint/format | Biome + custom ESLint rules | Design lint |
| Unit tests | Vitest + Testing Library | Logic and components |
| E2E / visual | Playwright + axe | Light/dark, RTL, reduced motion, 3 viewports |
| Charts | uPlot, Vega-Lite, D3 | Performance, declarative, bespoke |
| Tables | TanStack Table + TanStack Virtual | Headless, virtualized |
| Math | KaTeX + MathLive | Render + input |
| Code editor | CodeMirror 6 | Lighter than Monaco, mobile-capable |
| Maps | MapLibre GL | Open source, vector tiles |
| Molecules | Mol* | Optional peer dependency |
| File formats | PapaParse, hyparquet, apache-arrow, h5wasm, fitsjs, dicom-parser | Optional adapters |
| Units/uncertainty | `@aperture/quantities` | Own package; tested against NIST |
| State | React state + URL state (`nuqs`) | No global store requirement |
| Animation | CSS + Motion (marketing only) | Product motion is CSS |

### 5.3 Why not start in Python

Python is the language researchers *think* in, but the UI layer they need is
increasingly React. Starting in Python would mean either:

- reimplementing the design system in a Python UI framework with weaker layout
  and accessibility, or
- building a React renderer anyway, but with a Python-only API from day one.

We choose the reverse: build the best React implementation first, then expose it
to Python through a server-driven protocol. This keeps one visual source of truth
and reaches the Gradio audience without doubling the component work. The design
tokens and `design.md` are framework-neutral from day one, so ports do not
redesign; they reimplement against a fixed contract.

---

## 6. Architecture

### 6.1 Repository layout

```
Aperture/
├─ apps/
│  └─ web/                       # landing + docs + registry + playground
│     ├─ app/
│     ├─ content/docs/
│     ├─ components/
│     └─ public/r/               # generated registry JSON
├─ registry/
│  └─ default/
│     ├─ ui/                     # elements (vendored coss/ui + our additions)
│     ├─ instruments/            # research components
│     ├─ workbenches/            # multi-file layouts
│     ├─ examples/               # docs fixtures
│     ├─ hooks/
│     └─ lib/
├─ packages/
│  ├─ tokens/                    # globals.css, theme presets
│  ├─ quantities/                # units, uncertainty, formatting
│  ├─ data/                      # schema, column types, parsers
│  ├─ stats/                     # descriptive stats, tests, regression helpers
│  ├─ plots/                     # chart shells and renderers
│  ├─ icons/                     # domain icons
│  ├─ cli/                       # init + add workbench
│  ├─ lint/                      # eslint config + design rules
│  └─ tsconfig/
├─ design.md
├─ PLAN.md
├─ README.md
├─ THIRD_PARTY_NOTICES.md
└─ UPSTREAM.md
```

### 6.2 Source of truth

- **Registry-first.** Every distributable component is authored in
  `registry/default/…` and imported by the docs app. There is one copy of the
  source. The registry build reads those files and emits JSON.
- **Logic packages.** Anything with meaningful algorithms (units, stats, parsing,
  plotting) lives in `packages/*` and is a normal npm dependency. Visual
  components remain copy-paste.
- **Docs are the test fixture.** Every component's docs example is also its
  visual regression fixture. If the example is not good enough to be a demo, it
  is not good enough to ship.
- **Workbenches are compositions.** They depend on registry items, not on a
  hidden runtime. Installing a workbench installs its elements and instruments
  and writes route files.

### 6.3 Registry pipeline

```
registry/default/**/*.tsx
        │
        ├─ registry.json (items, metadata, categories)
        ├─ registry-item.json (per item)
        ▼
scripts/build-registry.ts
        │
        ▼
apps/web/public/r/*.json  +  registry index
        │
        ▼
npx shadcn@latest add @aperture/<item>
```

Validation gates:

- every item builds,
- every `registryDependencies` entry resolves,
- every import path is valid after alias rewriting,
- every item has a title, description, category, and stability,
- every item renders in the docs app,
- no item exceeds its bundle budget.

### 6.4 The install experience

```bash
# 1. Initialize tokens, fonts, utils, Tailwind, and base layout
npx @aperture/cli init

# 2. Add an element or instrument
npx shadcn@latest add @aperture/data-table

# 3. Add a complete workbench (route + components + mock adapter)
npx @aperture/cli add workbench data-explorer

# 4. Optional: verify the install
npx @aperture/cli doctor
```

`init` writes:

- `app/globals.css` (or merges the token block),
- `lib/utils.ts`,
- font setup,
- a base `app/layout.tsx` if absent,
- `components.json` aliases if absent,
- a `README` section with the theme contract.

`doctor` checks: Tailwind version, tokens present, fonts resolvable, aliases
correct, duplicate components, and Base UI version compatibility.

**Workbench installs are different from component installs.** A workbench is a
multi-file scaffold:

- it detects the framework (Next.js App Router first, then Vite/React Router);
- it writes a route, the composed instruments, and a mock data adapter;
- it never overwrites an existing file without `--force`; it prints a diff and
  asks first;
- it installs the instrument dependencies and reports anything missing;
- it leaves a `WORKBENCH.md` with the data contract, the mock adapter, and the
  three places to connect a real backend.

The first release targets Next.js App Router. Vite support is a documented
recipe until the CLI can write a router-agnostic shell.

### 6.5 The component protocol

Every item has a machine-readable manifest:

```json
{
  "name": "quantity-input",
  "layer": "instrument",
  "stability": "beta",
  "domain": ["physics", "chemistry", "engineering"],
  "props": { "...": "generated from TypeScript" },
  "states": ["default", "focus", "invalid", "disabled", "loading"],
  "a11y": { "role": "spinbutton", "keyboard": ["ArrowUp", "ArrowDown"] },
  "examples": ["basic", "with-uncertainty", "unit-conversion"],
  "dependencies": ["@aperture/quantities"],
  "bundle": { "gzip": "6.2kb" }
}
```

This manifest powers docs, the MCP server, AI code generation, and the future
Python/Vue/Svelte renderers. It is the closest thing to a cross-language
interface we can have without freezing implementation details.

### 6.6 Python bridge (Phase 4)

```
Python                          Browser
┌────────────────────┐         ┌──────────────────────────┐
│ @workbench decorator│  JSON  │ Aperture React renderer  │
│ inputs / outputs    │ ──────▶ │ elements + instruments   │
│ actions / state     │ ◀────── │ events / values          │
└────────────────────┘         └──────────────────────────┘
```

- A Python function or class describes a workbench.
- The server serializes the component tree and state.
- The React renderer renders Aperture components and sends events back.
- Start with the 12 founding instruments and a FastAPI adapter.
- Add Jupyter `anywidget` wrappers for the data table, plot, and file intake.

This is the Gradio-shaped product, but with a real design system underneath.

### 6.7 Multi-framework plan

| Phase | Target | Approach |
| --- | --- | --- |
| 1 | React/TS | Reference implementation |
| 2 | Python | Server-driven UI + anywidgets |
| 3 | Vue/Nuxt | Port elements/instruments against the manifest and tokens |
| 4 | Svelte/SvelteKit | Same; share CSS tokens |
| 5 | R/Shiny, Julia | Server-driven protocol or htmlwidgets |

The contract (`design.md` + tokens + manifests + a11y requirements) is what makes
this a port rather than a redesign. We do not start a port until the React
implementation has a stable 1.0 and a visual regression suite it can be compared
against.

---

## 7. Design system

The full system is in [`design.md`](./design.md). The load-bearing decisions:

- **Achromatic chrome; color belongs to data.** Neutral ink, hairline borders,
  semantic status colors, Okabe–Ito chart palette.
- **Cal Sans + Paper Mono** (Cal Sans is OFL; verify Paper Mono's license, with
  JetBrains Mono as the fallback).
- **Responsive inversion:** 16 px body on mobile, 14 px on desktop; controls are
  one step taller on touch.
- **10 px base radius**, 16 px cards/dialogs, 6 px badges/menu items.
- **Inset highlight + 5% shadow** as the elevation signature.
- **1 px borders and alpha surfaces**, no gradients or glows.
- **`data-slot` + `useRender` + `cn()` + CVA** as the component contract.
- **Copy-paste source**, registry metadata, and a review checklist for every item.

The design system is versioned with the library. A new pattern enters `design.md`
before it appears in three components.

---

## 8. What we build

The complete inventory is in [`docs/catalog.md`](./docs/catalog.md). The shape:

### 8.1 Elements (56, inherited and adapted)

Accordion, Alert, Alert Dialog, Autocomplete, Avatar, Badge, Breadcrumb, Button,
Calendar, Card, Checkbox, Checkbox Group, Collapsible, Combobox, Command,
Composer, Context Menu, Date Picker, Dialog, Drawer, Empty, Field, Fieldset, Form,
Frame, Group, Input, Input Group, Kbd, Label, Menu, Meter, Number Field, OTP
Field, Pagination, Popover, Preview Card, Progress, Radio Group, Scroll Area,
Segmented Control, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner,
Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Toolbar, Tooltip.

These are vendored from coss/ui, kept in sync, and extended only when the research
layer needs a new variant.

### 8.2 Instruments (the product)

Organized by job, not by discipline:

- **Data intake & structure:** file dropzone, upload queue, schema preview,
  dataset card, data dictionary, metadata editor, data table, filters, saved
  views, row detail, export.
- **Measurement & quantities:** quantity input, unit select/converter,
  uncertainty input, scientific number, significant figures, range, coordinates,
  time zone, duration, detection limit, stat, stat grid, sparkline, gauge,
  threshold bar, signal quality.
- **Scientific text:** math, equation editor, citation, reference list, BibTeX,
  DOI/ORCID badges, code block, terminal/log viewer, diff viewer, markdown editor.
- **Time, runs & scheduling:** timeline, track timeline, run timeline, calendar
  heatmap, event log, schedule picker, recurrence editor, stopwatch, countdown.
- **Workflow & collaboration:** job card/queue, step tracker, pipeline DAG,
  resource meters, cluster nodes, activity feed, comment thread, annotation pin,
  presence, review checklist, approval bar, share dialog, permission matrix,
  contributor roles, audit log.
- **Experiment & samples:** protocol steps, run sheet, experiment card, sample
  card/table/map, well plate, specimen chain, instrument card/status, calibration
  log, reagent inventory, measurement log, ELN entry, attachments, labels.
- **Forms & participants:** survey builder, question card, Likert, matrix,
  consent tracker, participant table, form renderer, repeatable group, conditional
  logic, validation summary, signature.
- **Search & navigation:** command palette, global search, faceted filters,
  workspace/project switchers, quick open, shortcut sheet.
- **Export & publishing:** export dialog, figure export, data export, share link,
  embed snippet, license picker, DOI minter, citation block, authorship editor,
  data availability editor.

### 8.3 Domain packs

Each pack is 8–15 instruments plus one or two workbenches, reviewed by a domain
advisor. The first wave:

- **Life sciences & lab:** sequence viewer/editor, alignment, variants, genome
  track, protein/plasmid viewer, flow gating, plate curves, dose–response,
  survival, microscopy, PCR, gel, phylogeny, clinical timeline.
- **Physics, astronomy & chemistry:** FITS viewer, sky map, observation log,
  telescope scheduler, spectrum/peaks, XRD, phase diagram, periodic table,
  molecule/crystal viewer, detector layout, ROI, oscilloscope, Bode/Nyquist,
  constants, uncertainty calculator.
- **Social science, economics & policy:** regression table, coefficient/forest
  plots, survey weights, panel data, DiD setup, power calculator, descriptive
  stats, codebook, de-identification, transcript coding, codebook manager, memo,
  consent, CONSORT/PRISMA flows.

Second wave: earth/environment/GIS, humanities, clinical, ML/CS, engineering.

### 8.4 Workbenches

The launch set:

1. **Workspace Shell** — nav, canvas, inspector, status bar, command palette.
2. **Data Explorer** — filter rail, virtualized table, row detail, chart.
3. **Lab Dashboard** — instruments, samples, alerts, schedule.
4. **Notebook** — file tree, cells, variables, plots, kernel status.
5. **Run Detail** — parameters, logs, metrics, artifacts, provenance.
6. **Public Dataset Page** — metadata, files, citation, license, provenance.
7. **Sample Registry** — index, filters, detail, chain of custody.
8. **Experiment Planner** — protocol, parameters, schedule, approvals.
9. **Field Console** — map, observation entry, offline status, media.
10. **Survey Studio** — builder, preview, participants, exports.
11. **Coding Room** — transcript, codebook, coding, memos, agreement.
12. **Figure Composer** — canvas, layers, plot library, export.
13. **Literature Room** — outline, PDFs, references, notes, citations.
14. **Admin & Settings** — lab, members, roles, integrations, storage, policy.
15. **Auth & Onboarding** — sign in, SSO, invites, first-run setup.
16. **Print Pack** — protocol sheet, run sheet, labels, poster.

---

## 9. Landing page and brand

The full brief is in [`docs/landing-page.md`](./docs/landing-page.md).

### 9.1 Brand

- **Name:** Aperture. The opening through which light passes; the instrument
  control that governs it. Precise, calm, scientific, not cute.
- **Tagline:** *Building blocks for researchers.*
- **Visual identity:** Paper & Graphite surfaces, fully monochrome across
  product, docs, and marketing. No brand hue. Identity comes from the aperture
  mark, typographic hierarchy, thin technical rules, generous whitespace, and
  real UI — not abstract illustrations. Color appears only in data
  visualization.
- **Voice:** direct, specific, calm. No "revolutionize", no "AI-powered", no
  exclamation marks.

### 9.2 Narrative

1. Researchers spend months rebuilding the same UI.
2. Aperture gives them the pieces and the screens.
3. Elements → Instruments → Workbenches.
4. Built for every discipline, not just ML demos.
5. Copy-paste, own the code, keep the design coherent.
6. Open source, credited to coss/ui, built in the open.

### 9.3 Hero

**Headline:** Building blocks for researchers.

**Subhead:** A copy-paste UI system for scientific software. Elements,
instruments, and whole workbenches — so you can spend your time on the science.

**Visual:** a live, interactive data-explorer workbench composed from real
Aperture components. Not a screenshot. A quiet technical grid behind it, an
ink aperture-blade mark in the corner, and an ink-filled primary CTA.

**CTAs:** `Browse workbenches` · `Read the design system` · GitHub.

### 9.4 Sections

1. Hero with live workbench.
2. Proof strip: open source, MIT, React + Tailwind, copy-paste, accessible.
3. "You shouldn't build another file uploader." Three pain points, each with a
   before/after mini UI.
4. The layer ladder: Elements → Instruments → Workbenches, interactive.
5. Domain rail: eight disciplines, three components each.
6. Workbench gallery: six full-page previews with install commands.
7. "Own the code" — registry, CLI, `design.md`.
8. Design principles: four cards.
9. Accessibility and theming strip.
10. Open source + credits + footer.

Performance budget: LCP < 1.5 s, CLS < 0.05, no layout shift from theme or fonts,
JS for the hero workbench lazy-loaded after first paint.

---

## 10. Documentation and developer experience

### 10.1 Information architecture

```
/docs
  Getting started
    Introduction
    Installation
    CLI
    Registry
    Theming
    Migration from shadcn/ui
  Foundations
    Color
    Typography
    Spacing
    Motion
    Accessibility
    Content
  Elements        (56 pages)
  Instruments     (by job family)
  Workbenches     (by archetype)
  Recipes
    Next.js + FastAPI
    Data tables with DuckDB
    Units and uncertainty
    Plots and figure export
    Jupyter anywidget
    Gradio migration
  Design system   (renders design.md)
  Changelog
  Roadmap
  Contributing
```

### 10.2 Every component page

- Live preview (light/dark toggle, viewport toggle, RTL toggle).
- Code tab with copy.
- Install command (CLI + manual).
- Anatomy diagram.
- Props table generated from TypeScript.
- Usage guidelines and anti-patterns.
- Research recipe (a real domain example).
- Accessibility notes.
- Related components.
- Changelog.

### 10.3 AI and tooling

- `llms.txt` with a curated index.
- Registry JSON readable by shadcn MCP and other agents.
- An Aperture skill/prompt pack for coding assistants.
- An MCP server exposing search, docs, and install commands.
- Component manifests with props, states, and examples.
- "Open in v0" for every example.
- A `doctor` command that catches the most common install mistakes.

### 10.4 Docs quality gates

- Every code block compiles.
- Every example renders in CI.
- No dead links.
- Search returns a result for every component name.
- Lighthouse ≥ 95 on docs pages.
- The docs site itself uses Aperture. It is the first customer.

### 10.5 Content and launch

Documentation is the product; the launch is a series of useful artifacts, not a
single announcement.

- **Essays:** "Anatomy of a research table", "Units are a UI problem",
  "Missing data is not zero", "The case against dashboard gradients", "How we
  designed the quantity input".
- **Case studies:** one per design partner, focused on what they shipped and how
  long it took.
- **Changelog:** every release, with screenshots and migration notes.
- **Component of the week:** a short post per instrument with a real domain
  example.
- **Talks/workshops:** research software engineering meetups, lab meetings,
  PyData, SciPy, RSE events.
- **Launch sequence:** private alpha → design-partner demos → public alpha with
  three workbenches → beta with domain packs → 1.0.
- **No launch before the install works.** A beautiful landing page with a broken
  `init` is worse than no page.

### 10.6 Integration recipes

Aperture is UI only, but research tools live in an ecosystem. Ship recipes and
typed adapters, not a backend.

| Category | Targets | What the recipe covers |
| --- | --- | --- |
| Data sources | PostgreSQL, DuckDB, BigQuery, Snowflake, S3, local files | Query → column types → Data Table |
| Research infrastructure | ORCID, ROR, DataCite, Zenodo, OSF, Figshare, Dataverse, arXiv | Metadata, identifiers, citation, DOI |
| Lab systems | ELN/LIMS APIs, REDCap, instrument exports | Mapping, validation, sample/participant records |
| Compute | SLURM, Kubernetes, cloud batch | Job submission, queue, logs, resource meters |
| Auth | Institutional SSO/SAML, ORCID OAuth, magic link | Sign-in, roles, permissions, invites |
| Notebooks | Jupyter, marimo | Embed instruments as anywidgets |
| Storage | S3-compatible, local, browser File System Access | Upload queue, checksums, large files |

The recipes are documentation and example code. The host app owns credentials,
data storage, compliance, and business logic.

---

## 11. Quality, testing, and accessibility

### 11.1 The quality bar

A component is not "done" when it renders. It is done when:

- it works in light, dark, and high-contrast themes,
- it works at 375, 768, and 1280 px,
- it works with keyboard only,
- it works with a screen reader,
- it works in RTL,
- it works with reduced motion,
- it works at 200% zoom,
- it has no layout shift on load or error,
- its docs example is good enough to copy,
- its bundle stays within budget,
- its scientific semantics are correct.

### 11.2 Test pyramid

| Layer | Tool | Scope |
| --- | --- | --- |
| Unit | Vitest | quantities, stats, parsers, formatters |
| Component | Testing Library | props, states, keyboard, ARIA |
| Visual | Playwright screenshots | 3 viewports × 3 themes × RTL × reduced motion |
| Accessibility | axe + manual | zero critical/serious; keyboard walkthrough |
| Registry | custom script | build, resolve, alias rewrite, bundle size |
| E2E | Playwright | install a workbench in a fixture app and run it |
| Performance | Lighthouse + custom | docs LCP/CLS; table 100k rows; chart 1M points |

### 11.3 Research correctness review

Domain advisors review instruments for:

- units, conversions, and significant figures,
- statistical labels and defaults,
- time zone and date handling,
- terminology (gene vs. protein, subject vs. participant vs. patient),
- privacy and consent patterns,
- export formats expected by the field.

Tests cite their reference values (NIST, published constants, domain standards).

**Standards we align with**

| Area | Standard |
| --- | --- |
| Units and constants | SI, NIST CODATA |
| Time | ISO 8601, IANA time zones |
| Metadata | DataCite, Dublin Core, schema.org |
| Authorship | CRediT |
| Identifiers | DOI, ORCID, ROR, RRID |
| Licenses | SPDX |
| Life sciences | FASTA/GenBank, BIDS, DICOM |
| Astronomy | FITS, WCS |
| Humanities | TEI, IIIF |
| Accessibility | WCAG 2.2 AA |
| Privacy | HIPAA/GDPR are host-app responsibilities; components document the patterns |

### 11.4 Accessibility

- WCAG 2.2 AA, with a stated path to AAA for body text.
- Keyboard maps documented per component.
- Focus management tested for every overlay.
- Charts have a table fallback and a text summary.
- Color is never the only encoder.
- The Contrast theme is tested with forced-colors mode.
- A public accessibility statement and a issue template for a11y bugs.

### 11.5 Performance budgets

| Item | Budget (gzip) |
| --- | --- |
| Element | ≤ 8 KB |
| Instrument (visual) | ≤ 25 KB |
| Logic package | ≤ 30 KB |
| Workbench demo (lazy) | ≤ 120 KB |
| Docs page JS | ≤ 180 KB |

Heavy domain viewers (FITS, DICOM, Mol*, MapLibre) are optional peer
dependencies, lazy-loaded, and never imported by the base install.

---

## 12. Community, licensing, and governance

### 12.1 License

MIT for the library and docs. Vendored coss/ui code retains its MIT notice.
`THIRD_PARTY_NOTICES.md` lists every dependency and font license.

### 12.2 Credit

The README, docs footer, and every upstream-derived file credit coss/ui and
Cal.com. The project explicitly states it is not affiliated with or endorsed by
Cal.com. coss/ui gets a permanent "Built on" link and a sponsor-style thank-you.

### 12.3 Governance

- **RFC process** for new instruments, domain packs, and breaking API changes.
- **Design review** against `design.md` and the checklist.
- **Domain maintainers** for each pack, with review authority over terminology
  and correctness.
- **Stability labels** on every item: experimental, beta, stable, deprecated.
- **Deprecation policy:** at least one minor cycle, codemod when feasible.
- **Code of conduct** and a clear contribution guide.
- **Monthly upstream sync** with coss/ui.

### 12.4 Sustainability

- Sponsorships and grants (research software foundations, lab budgets).
- Optional hosted services later: a registry dashboard, a workbench builder,
  private registries for institutions. The components stay free.
- No open-core rug-pull. The MIT license is a promise.

### 12.5 Naming and trademark

"Aperture" is used by several products. Before public launch:

- run a trademark search in the software/UI class,
- secure the domain and GitHub org,
- consider a descriptor lockup ("Aperture UI" / "Aperture Research UI") if needed,
- never use Cal.com's marks or imply endorsement.

---

## 13. Roadmap

Assumes a small team: 1 design engineer, 1–2 frontend engineers, a part-time
designer, and 3–5 domain advisors. Phases overlap where the team allows; a solo
path is included below. Dates are elapsed weeks from the start, not calendar
weeks.

### Phase 0 — Foundation (weeks 1–3)

- Monorepo, Biome, TypeScript strict. Verification is local; no CI workflows.
- Vendor coss/ui elements; record upstream commit and patch log.
- Tokens, fonts, theme presets, Contrast theme.
- Registry pipeline and validation.
- Docs shell with three example pages.
- `design.md` v1 and the review checklist.
- `@aperture/quantities` core: dimensions, units, prefixes, formatting,
  uncertainty propagation, NIST test vectors.

**Exit:** a component can be added, documented, tested, and installed from the
local registry in under 10 minutes.

### Phase 1 — Founding instruments (weeks 4–10)

Ship 12 instruments, each with docs, tests, and a recipe:

1. Quantity Input
2. Scientific Number
3. Uncertainty Input
4. Stat + Stat Grid
5. Sparkline
6. Status Badge / Status Dot
7. Metadata Editor
8. File Dropzone + Upload Queue
9. Data Table (virtualized, typed columns)
10. Log Viewer
11. Timeline
12. Protocol Steps

Plus the supporting composition: table toolbar, filter chips, column visibility,
saved views, row detail, export menu, chart frame, math block, command palette.

**Exit:** a real data-explorer page can be built from the registry in under an
hour.

**Months 4–6:** complete the remaining P0 instruments from the catalog (schema
preview, dataset card/data dictionary, unit select/converter, range, value with
error, delta stat, chart empty/tooltip, code block/terminal, relative time/time
zone, job status, step tracker, protocol checklist, sample/instrument cards,
export dialog). These are mostly compositions of the founding set, not new
primitives.

### Phase 1.5 — The research-act layer (weeks 11–16, parallel with Phase 2)

The founding instruments are mostly display and input. The next layer records
what happens to data between acquisition and publication. See
[`docs/research/instruments-2026.md`](./docs/research/instruments-2026.md) for
the evidence, the scoring test, and the 20 candidates.

First pack, in build order:

1. **Measurement Table** — typed columns with units, precision, missing codes,
   detection limits, and uncertainty.
2. **Exclusion & Transformation Ledger** — append-only record of every filter,
   exclusion, and derivation, with reconciled counts.
3. **Calibration & QC Panel** — standards, blanks, LOD/LOQ, Levey–Jennings
   chart, Westgard rules, acceptance, certificate.
4. **Run Comparison** — parameters, metrics, artifacts, unit-aware deltas.
5. **Import Mapper** — detect, map, validate, preview, commit, retaining the
   original file and checksum.
6. **Dataset Card** — identity, version, license, DOI, citation, provenance
   link.

**Status (November 2026).** Five of the six listed above are built — the
Measurement Table, Exclusion & Transformation Ledger, Run Comparison, and
Dataset Card as Ready; Calibration & QC as Preview pending a laboratory-advisor
review. Import Mapper is not built. Three additional instruments from the memo
were pulled forward because they complete the same story: the Statistical Result
Block, Missingness & Censoring Map, and Reproducibility Manifest. Each has a
docs page, a demo, a registry entry, pure helpers, and tests.

**Exit:** a workbench can take an instrument export to a documented, comparable
dataset without a spreadsheet, and every number in it traces to a recorded
decision.

### Phase 2 — Workbenches v1 (weeks 8–14)

- Workspace Shell
- Data Explorer
- Lab Dashboard
- Run Detail
- Sample Registry
- Public Dataset Page
- Auth + Settings scaffolds

Landing page v1, built with the library. Docs IA complete for elements and the
founding instruments. Design-partner alpha (3–5 teams).

**Exit:** three external teams have a working internal tool built on Aperture.

### Phase 3 — Domain packs, wave 1 (weeks 12–24)

- Life sciences & lab (12 instruments)
- Physics, astronomy & chemistry (12)
- Social science, economics & policy (12)
- One workbench per pack

Run the three packs in parallel only if there are two engineers and three
advisors. Otherwise, ship one pack every four to six weeks. Public alpha. First
case studies. Registry directory listing. Monthly release cadence.

**Exit:** 50+ instruments, 10+ workbenches, 5 design partners, 1,000 registry
installs.

### Phase 4 — Beta and the Python bridge (weeks 22–34)

- Remaining launch workbenches: Notebook, Field Console, Survey Studio, Coding
  Room, Figure Composer, Literature Room.
- Python SDK alpha: FastAPI adapter + Jupyter anywidgets for the table, plot, and
  file intake.
- Second wave of domain packs: Earth/GIS, humanities, clinical, ML/CS,
  engineering.
- Public beta, docs search, MCP server, `llms.txt`, theme builder.
- Community launch: RFC repo, Discord/Discussions, contributor guide.

**Exit:** 5,000 registry installs, 10 case studies, 20 contributors, Python bridge
used by 3 labs.

### Phase 5 — 1.0 and multi-framework (months 9–15)

- API freeze for elements and founding instruments.
- Vue/Nuxt port of elements + 20 instruments.
- Svelte port scoped.
- R/Shiny and Julia feasibility via the server-driven protocol.
- Accessibility audit by an external firm.
- Aperture 1.0.

### Solo-founder path

If the team is one person, cut to:

- Phase 0 + Phase 1: 8 weeks.
- Data Explorer + Lab Dashboard: 4 weeks.
- One domain pack (pick based on design partners): 6 weeks.
- Landing + docs: 3 weeks.
- Public alpha at month 5, beta at month 8, 1.0 at month 12.

Do not start a second domain pack until the first has three external users.

---

## 14. First 30 days

This is the small-team plan. A solo builder should stretch it to 8–10 weeks and
keep the same order; the order matters more than the dates.

### Week 1 — Ground truth

- [ ] Initialize the monorepo and local verification scripts.
- [ ] Vendor coss/ui elements at `b2336c4`; add `LICENSE`, `NOTICE`,
      `UPSTREAM.md`.
- [ ] Port the token block, fonts, and theme presets.
- [ ] Stand up the docs app with one live element page.
- [ ] Build the registry pipeline and validate all 56 elements.
- [ ] Freeze `design.md` v1 and the review checklist.

### Week 2 — Measurement

- [ ] `@aperture/quantities`: dimensions, units, prefixes, conversion,
      uncertainty, formatting; NIST vectors.
- [ ] Quantity Input, Scientific Number, Uncertainty Input.
- [ ] Stat, Stat Grid, Sparkline, Status Badge.
- [ ] Metadata Editor, Key Value List.
- [ ] Docs pages + visual fixtures for all of the above.

### Week 3 — Data

- [ ] Data Table with typed columns, virtualization, selection, column
      visibility, density.
- [ ] Filter Bar, Filter Chips, Saved Views, Row Detail, Export Menu.
- [ ] File Dropzone, Upload Queue, Schema Preview.
- [ ] Log Viewer.
- [ ] Table performance test at 100k rows.

### Week 4 — One real screen

- [ ] Workspace Shell.
- [ ] Data Explorer workbench using only registry items.
- [ ] Timeline + Protocol Steps.
- [ ] Landing page hero and layer ladder.
- [ ] Internal demo: import a CSV, filter, inspect a row, export.
- [ ] Write the first design-partner brief.

**Output:** a demo a researcher can use, a docs site that proves the system, and a
registry that installs cleanly into a fresh Next.js app.

---

## 15. Metrics

### North star

**Time from `npx @aperture/cli init` to a working research screen: under 10
minutes.**

### Adoption

- registry installs per week (unique projects),
- components copied per project,
- workbench installs,
- GitHub stars and forks,
- docs unique visitors and search success rate,
- Python bridge installs (Phase 4+).

### Quality

- zero critical/serious axe issues across the catalog,
- visual regression pass rate ≥ 99%,
- component bundle budgets met,
- docs Lighthouse ≥ 95,
- install success rate ≥ 98% (via `doctor` telemetry, opt-in),
- issue response < 48 h.

### Community

- external contributors per quarter,
- domain advisors per pack,
- RFCs opened and resolved,
- case studies published.

### Outcome

- teams shipping tools they would not have built otherwise,
- measured time saved (self-reported, then case studies),
- publications/tools that cite Aperture,
- teaching use in courses.

---

## 16. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Scope explosion across disciplines | High | High | Fixed launch set; domain packs gated by design partners; RFC before new pack |
| Design drift as contributors add components | High | High | `design.md`, review checklist, visual regression, design lint |
| Scientific incorrectness (units, stats) | Medium | High | Domain advisors, reference-value tests, citations, conservative defaults |
| Upstream coss/ui drift or abandonment | Medium | Medium | Vendored fork, MIT license, monthly sync, patch log, upstream fixes first |
| Aperture reads as a Cal.com/coss clone | Medium | Medium | Distinct brand, editorial voice, research-native components, own layouts; credit without copying identity |
| Copy-paste maintenance burden | High | Medium | Registry validation, codemods, deprecation policy, small dependency surface |
| Python-first audience ignores a React library | High | High | FastAPI/Jupyter recipes early; Python bridge in Phase 4; docs for Python users |
| Heavy domain viewers bloat installs | Medium | Medium | Optional peer deps, lazy loading, separate items, bundle budgets |
| Accessibility of complex tables/charts | Medium | High | Table fallback, keyboard inspection, external audit, a11y issue template |
| Trademark conflict ("Aperture") | Medium | Medium | Trademark search before launch; descriptor lockup; domain/org secured |
| License/font misuse | Low | High | `THIRD_PARTY_NOTICES`, font license verification, no Cal.com branding |
| Maintainer burnout | Medium | High | Narrow launch, sponsorships, domain maintainers, public roadmap |
| AI-generated contributions lower quality | Medium | Medium | Review checklist, tests required, design review, no drive-by merges |

---

## 17. Decisions and open questions

### Decided (November 2026)

| Decision | Outcome |
| --- | --- |
| Name | Keep **Aperture** as the working name. Run a trademark search and secure the domain/org before public launch. |
| Brand | **Fully monochrome.** No accent hue in product, docs, or marketing. |
| First domain pack | **Life sciences and lab**, sequenced before the second pack. |
| Baseline team | **3–4 people** with 3–5 domain advisors. The solo path remains a fallback. |
| Launch language | TypeScript + React reference implementation. |

### Still open

1. **Python bridge timing.** Phase 4 as planned, or pull a narrow anywidget
   version into Phase 2 to reach Python users sooner?
2. **Charts.** Confirm uPlot + Vega-Lite + D3, or standardize on one for v1?
3. **Docs platform.** Fumadocs vs. a custom Next.js docs app. Fumadocs is the
   default.
4. **Font.** Keep Cal Sans (consistent with coss) or adopt a distinct face?
   Recommendation: keep Cal Sans for v1; swap via one token later.
5. **Hosting.** Static registry on Vercel/Cloudflare vs. a dynamic registry with
   versioning. Start static.
6. **License header policy.** Keep upstream headers on derived files; add a
   short Aperture header to new files?
7. **Wordmark and domain.** Lock the final lockup and TLD before the landing
   page ships.

---

## 18. Non-goals

- A backend, database, auth provider, or compute platform.
- A charting engine from scratch.
- A no-code builder in v1.
- Native mobile apps.
- Every framework at launch.
- Generic admin templates.
- Replacing Jupyter for exploration. Aperture is for the tool around the
  exploration.
- Storing or processing sensitive data. Components are UI; the host app owns
  compliance.

---

## 19. Definition of done for v1

Aperture v1 exists when:

- [ ] 56 elements are vendored, documented, and installable.
- [ ] 50+ instruments are shipped with docs, tests, and recipes.
- [ ] 10+ workbenches install into a fresh app and run.
- [ ] 3 domain packs are reviewed by advisors.
- [ ] The design system is complete and enforced in CI.
- [ ] The landing page and docs are live and built with Aperture.
- [ ] A fresh Next.js app can go from init to a working data explorer in under
      10 minutes.
- [ ] Zero critical accessibility issues; external audit passed.
- [ ] MIT license, upstream credit, and contributor guide are in place.
- [ ] Five external teams have shipped a tool with it.

---

## 20. Appendix: core data contracts

These types are the shared vocabulary between instruments. They live in
`@aperture/quantities`, `@aperture/data`, and `@aperture/stats`. They are
intentionally small; domain packs extend them rather than fork them.

```ts
// @aperture/quantities

export type Dimension =
  | "dimensionless"
  | "length"
  | "mass"
  | "time"
  | "temperature"
  | "amount"
  | "current"
  | "luminous-intensity"
  | "derived";

export type Unit = {
  symbol: string;          // "mg/L", "kHz", "µL"
  dimension: Dimension;
  factor: number;          // to SI base
  offset?: number;         // temperature scales
  label?: string;
};

export type Uncertainty = {
  value: number;           // absolute, in the same unit
  kind: "sd" | "sem" | "ci95" | "range" | "unknown";
};

export type Quantity = {
  value: number;
  unit: Unit;
  uncertainty?: Uncertainty;
};

export type MissingReason =
  | "not-collected"
  | "not-applicable"
  | "below-detection"
  | "redacted"
  | "pending";

export type CellValue<T> = T | null;

export type Measurement = {
  id: string;
  quantity: Quantity;
  timestamp: string;       // ISO 8601 UTC
  timezone?: string;       // IANA, if the source is not UTC
  instrumentId?: string;
  operatorId?: string;
  missing?: MissingReason; // when value is null
};
```

```ts
// @aperture/data

export type ColumnType =
  | "text"
  | "number"
  | "quantity"
  | "date"
  | "boolean"
  | "enum"
  | "id"
  | "json"
  | "array"
  | "file";

export type DataColumn<T = unknown> = {
  id: string;
  header: string;
  type: ColumnType;
  unit?: Unit;             // included in the header: "Mass (kg)"
  precision?: number;
  missingCode?: MissingReason;
  description?: string;
  options?: string[];      // enum
  accessor: (row: T) => CellValue<unknown>;
};

export type DataView = {
  id: string;
  name: string;
  sort: { columnId: string; direction: "asc" | "desc" }[];
  filters: Filter[];
  visibleColumns: string[];
  density: "compact" | "default" | "comfortable";
};
```

```ts
// provenance and runs

export type Actor = {
  id: string;
  name: string;
  kind: "person" | "service" | "instrument";
};

export type SourceRef = {
  kind: "dataset" | "file" | "run" | "sample" | "external";
  id: string;
  version?: string;
  uri?: string;
};

export type Provenance = {
  sources: SourceRef[];
  method: string;
  version: string;
  createdAt: string;
  createdBy: Actor;
  parameters?: Record<string, unknown>;
  hash?: string;
};

export type RunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled"
  | "timed-out";

export type Run = {
  id: string;
  status: RunStatus;
  startedAt?: string;
  endedAt?: string;
  parameters: Record<string, unknown>;
  outputs: SourceRef[];
  provenance: Provenance;
};
```

```ts
// metadata

export type MetadataField = {
  key: string;
  label: string;
  type: "text" | "number" | "quantity" | "date" | "boolean" | "enum" | "url";
  value: CellValue<unknown>;
  unit?: Unit;
  required?: boolean;
  description?: string;
  vocabulary?: string;     // e.g. "ROR", "ORCID", "SPDX"
};
```

**Rules**

- Missing data is `null`, never `0`, `""`, or `NaN`. The UI renders `—`.
- Store a canonical unit (SI where practical); convert at the edge. The unit the
  user chose is presentation state.
- Timestamps are ISO 8601 UTC. Display includes the zone when it matters.
- Provenance is required for any derived artifact. A missing provenance is a
  visible warning, not an empty section.
- Domain packs add fields; they do not create parallel quantity or metadata types.

### Component API sketches

```tsx
<QuantityInput
  value={concentration}
  unit="mg/L"
  units={["mg/L", "µg/mL", "mol/L"]}
  precision={3}
  allowConversion
  onValueChange={setConcentration}
/>

<DataTable
  data={samples}
  columns={columns}
  getRowId={(row) => row.id}
  density="compact"
  selection="multiple"
  savedViews={views}
  onRowClick={(row) => setSelected(row)}
  emptyState={<Empty … />}
/>

<WorkbenchShell
  nav={<ProjectNav />}
  inspector={<SampleInspector sample={selected} />}
  status={<RunStatus run={run} />}
  command={<CommandPalette actions={actions} />}
>
  <SampleTable … />
</WorkbenchShell>
```

The APIs favor explicit data over configuration. A component may be opinionated
about layout, but it must expose the parts a researcher will need to change.

---

## 21. Appendix: naming conventions

### Registry items

```
element:     @aperture/button
instrument:  @aperture/quantity-input
workbench:   @aperture/workbench-data-explorer
logic:       @aperture/quantities (npm)
```

### Files

```
registry/default/ui/button.tsx
registry/default/instruments/quantity-input.tsx
registry/default/workbenches/data-explorer/page.tsx
registry/default/workbenches/data-explorer/data-table-view.tsx
registry/default/examples/quantity-input-basic.tsx
```

### Data attributes

```
data-slot="quantity-input"
data-size="sm"
data-state="invalid"
data-density="compact"
data-stability="beta"
```

### Categories

```
layer: element | instrument | workbench
family: data | measurement | text | time | workflow | experiment | forms | search | export
domain: life-sciences | physics | astronomy | chemistry | earth | social-science | economics | humanities | clinical | ml | engineering
```

---

## 22. Appendix: the first design-partner brief

> We are building Aperture, an open-source UI system for research software. We
> are looking for 6–10 labs and research software teams to build one real
> internal tool with it in exchange for early access and influence over the
> roadmap.
>
> **What we ask:** one tool, one monthly 30-minute call, honest feedback, and
> permission to use the result as an anonymized case study if you are comfortable.
>
> **What you get:** early access, direct help from the maintainers, your domain
> pack prioritized, and a permanent credit in the project.
>
> **What we will not do:** store your data, access your systems, or require you to
> move off your existing backend. Aperture is UI only.

---

*This plan is a starting point, not a contract. The constants are: copy-paste
ownership, research-native components, complete workbenches, and a design system
that stays coherent as the library grows.*
