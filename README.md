<div align="center">

<img src="./docs/assets/hero-light.webp" alt="Aperture — Building blocks for researchers" width="100%" />

<br />
<br />

[![Status](https://img.shields.io/badge/status-pre--alpha-000?style=flat-square)](./PLAN.md)
[![License](https://img.shields.io/badge/license-MIT-000?style=flat-square)](./LICENSE)
[![Elements](https://img.shields.io/badge/elements-56-000?style=flat-square)](./registry/default/ui)
[![Tests](https://img.shields.io/badge/tests-182_passing-000?style=flat-square)](./apps/web/test)
[![React](https://img.shields.io/badge/React-19-000?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-000?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-000?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

**A copy-paste UI system for scientific software.**<br />
Elements, instruments, and whole workbenches — so you spend your time on the science.

[**Live site**](https://abhinav-prabhakar.github.io/Aperture/) · [**Elements**](https://abhinav-prabhakar.github.io/Aperture/docs/elements/) · [**Design contract**](./design.md) · [**Catalog**](./docs/catalog.md)

</div>

---

## A workbench, not a widget demo

<img src="./docs/assets/workbench-data-explorer.webp" alt="Data Explorer workbench with summary stats, filter rail, sample table, inspector, and chain of custody" width="100%" />

Filters, a sortable table, an inspector with provenance, and a real CSV export. Missing values read as missing, not zero. This is the whole idea: researchers should not rebuild the same instrument panel in every lab. [Open the workbench →](https://abhinav-prabhakar.github.io/Aperture/workbenches/data-explorer/)

## The lab, at a glance

<img src="./docs/assets/workbench-lab-dashboard.webp" alt="Lab Dashboard with instrument health, alerts, samples in flight, today's schedule, and recent activity" width="100%" />

Instrument health, acknowledgeable alerts, samples in flight, the day's schedule, and a filterable activity log. Every state is designed, including offline. [Open the dashboard →](https://abhinav-prabhakar.github.io/Aperture/workbenches/lab-dashboard/)

## The record, after the run

<img src="./docs/assets/workbench-run-detail.webp" alt="Run Detail with parameters, QC metrics, provenance, artifacts, and checksums" width="100%" />

Parameters as recorded, QC metrics against their acceptance rules, six artifacts with full checksums, and the provenance timeline behind the result. Printing keeps the report and drops the chrome. [Open run detail →](https://abhinav-prabhakar.github.io/Aperture/workbenches/run-detail/)

## The sample, wherever it is

<img src="./docs/assets/workbench-sample-registry.webp" alt="Sample Registry with filters, inventory table, storage detail, aliquots, and chain of custody" width="100%" />

Twelve samples across four studies, with freezer coordinates, remaining volume, aliquots, chain of custody, and the runs that used them. Missing volume is an em dash. Quarantined and destroyed records stay visible. [Open the registry →](https://abhinav-prabhakar.github.io/Aperture/workbenches/sample-registry/)

## The frame around all four

<img src="./docs/assets/workbench-workspace-shell.webp" alt="Workspace Shell with grouped navigation, breadcrumbs, command palette, lab overview, and status bar" width="100%" />

A quiet sidebar, breadcrumb, ⌘K command palette, inspector, status bar, and mobile drawers. The four workbenches above run inside it, and your workbenches can too. [Open the workspace →](https://abhinav-prabhakar.github.io/Aperture/workbenches/)

## Three layers. One system.

<img src="./docs/assets/layers.webp" alt="The Aperture layers: elements, instruments, workbenches" width="100%" />

**56 elements** · **15 instruments** · **5 workbenches** — one design contract from the first button to the finished screen.

## Details researchers notice

<p align="center">
  <img src="./docs/assets/card-basic.webp" alt="Card with values, units, and provenance" width="49%" />
  <img src="./docs/assets/tokens-surfaces.webp" alt="Achromatic surface tokens" width="49%" />
</p>

<p align="center">
  <img src="./docs/assets/button-variants.webp" alt="Button variants" width="49%" />
  <img src="./docs/assets/tokens-palette.webp" alt="Eight-color colorblind-safe data palette" width="49%" />
</p>

Units live with the value. Uncertainty is a first-class input. The chrome is achromatic, so color is reserved for data and status. Tabular numerals, true minus signs, explicit missing values.

## Built for the bench and the field

<p align="center">
  <img src="./docs/assets/instruments.webp" alt="The founding set of research instruments" width="49%" />
  <img src="./docs/assets/elements-detail.webp" alt="A detail of the 56-element index" width="49%" />
</p>

Life sciences first — a sequence viewer, sample tables, plate readers, growth curves, dose–response, PCR programs, reagent inventory. The same grammar extends to physics, astronomy, chemistry, earth science, social science, economics, and the humanities.

## The founding twelve

<p align="center">
  <img src="./docs/assets/instrument-quantity-input-doc.webp" alt="Quantity Input: a concentration value with unit and uncertainty" width="32%" />
  <img src="./docs/assets/instrument-scientific-number-doc.webp" alt="Scientific Number: precision, uncertainty, and full-precision copy" width="32%" />
  <img src="./docs/assets/instrument-uncertainty-input-doc.webp" alt="Uncertainty Input: symmetric and asymmetric errors with a reported form" width="32%" />
</p>

<p align="center">
  <img src="./docs/assets/instrument-stat-doc.webp" alt="Stat and Stat Grid: a four-column run summary" width="32%" />
  <img src="./docs/assets/instrument-sparkline-doc.webp" alt="Sparkline: a series, an empty state, and a flat baseline" width="32%" />
  <img src="./docs/assets/instrument-status-badge-doc.webp" alt="Status Badge and Status Dot: text plus shape, never color alone" width="32%" />
</p>

<p align="center">
  <img src="./docs/assets/instrument-data-table-doc.webp" alt="Data Table: sortable samples with units, QC flags, and selection" width="32%" />
  <img src="./docs/assets/instrument-metadata-editor-doc.webp" alt="Metadata Editor: fixed schema keys and addable provenance fields" width="32%" />
  <img src="./docs/assets/instrument-file-dropzone-doc.webp" alt="File Dropzone and Upload Queue: validated drops and live progress" width="32%" />
</p>

<p align="center">
  <img src="./docs/assets/instrument-log-viewer-doc.webp" alt="Log Viewer: levels, filters, timestamps, and follow-tail" width="32%" />
  <img src="./docs/assets/instrument-timeline-doc.webp" alt="Timeline: an event history with actors and details" width="32%" />
  <img src="./docs/assets/instrument-protocol-steps-doc.webp" alt="Protocol Steps: ordered, checkable steps with timing and notes" width="32%" />
</p>

Every instrument ships with a docs page, tests, accessible names, and a registry entry. Copy one in:

```bash
npx shadcn@latest add @aperture/uncertainty-input
```

## Into the first domain pack

<img src="./docs/assets/instrument-sequence-viewer.webp" alt="Sequence Viewer: a 1,200 bp construct with feature tracks, a selected CDS, translation, GC content, and motif search" width="100%" />

A 1,200 bp synthetic construct with feature tracks, a strand-aware CDS, start/stop/frame checks, motif search, GC content, and copy. It is the first life-sciences instrument, and it stays in preview until a domain advisor reviews the vocabulary and defaults. [Open the docs →](https://abhinav-prabhakar.github.io/Aperture/docs/instruments/sequence-viewer/)

## The exponential phase, with the reads intact

<img src="./docs/assets/instrument-growth-curve.webp" alt="Growth Curve: three E. coli replicates on a log axis with a mean and SD band, an auto-detected log phase, doubling time, and 25 time points" width="100%" />

Three wells, a ±1 SD band, an auto-detected exponential window, doubling time, and a 25-row data table behind the chart. Missing reads stay gaps, non-positive reads are called out, and the CSV carries every replicate. The second life-sciences instrument, also in preview. [Open the docs →](https://abhinav-prabhakar.github.io/Aperture/docs/instruments/growth-curve/)

## The half-max, with the curve attached

<img src="./docs/assets/instrument-dose-response.webp" alt="Dose–Response Curve: ten AP-17 doses with three replicates, a 4PL fit, a 95% confidence band, and an IC50 of 0.405 µM" width="100%" />

Ten doses, three replicates, one missed read, and a 4PL fit with a 95% confidence band. The IC50 is 0.405 µM with an interval of 0.378–0.434 µM; the low- and high-dose plateaus and the Hill slope stay visible. The third life-sciences instrument, also in preview. [Open the docs →](https://abhinav-prabhakar.github.io/Aperture/docs/instruments/dose-response/)

## Light. Dark. Every screen.

<img src="./docs/assets/hero-dark.webp" alt="Aperture in the dark theme" width="100%" />

<p align="center">
  <img src="./docs/assets/mobile-hero.webp" alt="Aperture on a phone" width="30%" />
</p>

One token contract across three themes and every screen size. Keyboard-first, screen-reader-aware, reduced-motion-safe, RTL-ready.

## Install

Point shadcn at the hosted registry:

```json
{
  "registries": {
    "@aperture": "https://abhinav-prabhakar.github.io/Aperture/r/{name}.json"
  }
}
```

Add the token sheet, then any element:

```bash
curl -o app/aperture.css https://abhinav-prabhakar.github.io/Aperture/aperture.css
npx shadcn@latest add @aperture/button
```

Every component lands in your repository. You own the code.

## Status

Phase 1: elements, tokens, registry, docs, `@aperture/quantities`, all twelve founding instruments, all five workbenches, and the first three life-sciences instruments are in place. The rest of the domain pack is next. Counts and commands on the site describe what exists, not a finished release.

---

<div align="center">
<sub>

Built on [coss/ui](https://coss.com/ui) by the team at Cal.com, with [Base UI](https://base-ui.com), [Tailwind CSS](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com).<br />
Cal Sans and JetBrains Mono are used under the SIL Open Font License. MIT licensed.

**[Aperture is not affiliated with or endorsed by Cal.com or coss.com.](./THIRD_PARTY_NOTICES.md)**

</sub>
</div>

<details>
<summary><sub>See the whole page</sub></summary>
<br />
<img src="./docs/assets/full-light.webp" alt="The complete Aperture landing page" width="100%" />
</details>

<details>
<summary><sub>All 56 elements</sub></summary>
<br />
<p align="center">
  <img src="./docs/assets/elements.webp" alt="The complete element index" width="58%" />
</p>
</details>
