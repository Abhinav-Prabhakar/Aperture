<div align="center">

# Aperture

**Building blocks for researchers.**

A copy-paste UI system for scientific software — elements, instruments, and whole
workbenches — so researchers can spend their time on the science, not the interface.

`Pre-alpha` · `TypeScript` · `React` · `Tailwind CSS` · `MIT`

</div>

---

## Status

Phase 0 scaffold. The monorepo, 56 vendored elements, the token system, the
registry pipeline, the docs shell, and `@aperture/quantities` are in place and
verified. The founding instruments need a domain review before they are marked
beta; the workbenches and the CLI come next. See [`PLAN.md`](./PLAN.md) for the
roadmap.

## Repository layout

```
apps/web/                    Next.js docs and landing page
registry/default/ui/         56 vendored coss/ui elements
registry/default/examples/   Docs fixtures, also visual test fixtures
registry/default/lib/        Shared registry utilities
registry/default/hooks/      Shared registry hooks
packages/quantities/         Units, uncertainty, and formatting (logic only)
registry.json                Registry manifest (shadcn schema)
design.md                    The design contract
docs/catalog.md              Instrument and workbench inventory
```

## Local development

```bash
bun install
bun run dev        # http://localhost:4000

bun run lint       # Biome
bun run typecheck  # tsc, both workspaces
bun run test       # Vitest

bun run registry:build   # writes apps/web/public/r
bun run build            # production build
```

---

## Why Aperture exists

Every research group rebuilds the same interface: a file uploader that chokes on a
4 GB CSV, a table with no units, a plot with an unlabeled axis, a job queue that
loses its state on refresh, a sample tracker held together by spreadsheets.

General-purpose UI kits give you buttons. Gradio gives you a demo. Neither gives a
researcher a **workbench**.

Aperture is a library of research-native building blocks that you copy into your
project and own. It is designed to feel like a scientific instrument: quiet,
precise, dense when it needs to be, and honest about what the data says.

## Three layers

| Layer | What it is | Example |
| --- | --- | --- |
| **Elements** | Accessible primitives with the Aperture design language. | Button, Input, Field, Table, Dialog, Sidebar |
| **Instruments** | Focused research components that solve one real problem well. | Quantity Input, Data Table, Log Viewer, Protocol Steps, FITS Viewer |
| **Workbenches** | Complete page layouts and application shells. | Data Explorer, Lab Dashboard, Notebook, Figure Composer |

Elements come from [coss/ui](https://coss.com/ui), the open-source design system
built by Cal.com. Instruments and Workbenches are built on top of them, using the
same tokens, conventions, and visual grammar.

## What the system gives you

- **Copy-paste ownership.** Add a component with the shadcn CLI. The source lands
  in your repo. No wrapper library, no black box.
- **Research-native inputs.** Units, uncertainty, scientific notation, coordinates,
  time zones, sample IDs, protocols, metadata, provenance.
- **Data-dense displays.** Virtualized tables, column types, saved views, logs,
  timelines, run status, sparklines, uncertainty bands.
- **Whole screens, not just atoms.** Workspace shells, explorers, dashboards,
  notebooks, field consoles, review flows, settings, auth, and print layouts.
- **A real design system.** One `design.md` governs every future component, so the
  library stays coherent as it grows across disciplines.
- **Built for every researcher.** Life sciences, physics, astronomy, chemistry,
  earth science, social science, economics, humanities, clinical research, ML, and
  engineering — not only the lab-coat version of science.

## Planned quick start

```bash
# Add the design tokens and base styles
npx @aperture/cli init

# Add an instrument
npx shadcn@latest add @aperture/quantity-input

# Add a complete workbench
npx @aperture/cli add workbench data-explorer
```

> The CLI and registry are part of the build plan. Until then, see
> [`PLAN.md`](./PLAN.md) for the architecture and rollout.

## Design principles

1. **Chrome is achromatic; color belongs to data.** The interface stays quiet so
   the measurement, image, or map can speak.
2. **Dense by default, legible at a glance.** Researchers read tables and logs for
   a living. Density is a feature when it is structured.
3. **Show the state.** Units, uncertainty, missing values, provenance, and run
   status are never hidden.
4. **Copy, don't depend.** You own the code. The design system is the contract.
5. **Every screen is a workbench.** Layouts are first-class, because a pile of
   components is not an application.
6. **Accessible is not optional.** Keyboard-first, screen-reader-aware,
   colorblind-safe, reduced-motion-safe, RTL-ready.

## Documentation

- [`PLAN.md`](./PLAN.md) — vision, architecture, roadmap, and launch plan
- [`design.md`](./design.md) — the complete design system extracted from coss/ui
- [`docs/catalog.md`](./docs/catalog.md) — the full inventory of instruments and workbenches
- [`docs/landing-page.md`](./docs/landing-page.md) — the landing page brief and wireframe

## Credits

Aperture would not exist without the work of the open-source community.

- **[coss/ui](https://github.com/cosscom/ui)** — the design system Aperture is
  derived from. MIT © coss.com and Origin UI. Built by the team at
  [Cal.com](https://cal.com). The tokens, component conventions, and much of the
  element layer originate there. Please star their repository.
- **[Base UI](https://base-ui.com)** — accessible, unstyled React primitives.
- **[Tailwind CSS](https://tailwindcss.com)** — the styling engine.
- **[shadcn/ui](https://ui.shadcn.com)** — the copy-paste registry model that
  inspired the distribution approach.
- **[Lucide](https://lucide.dev)** — the icon set.
- **[Cal Sans](https://github.com/calcom/sans)** — SIL Open Font License 1.1.
- **Paper Mono** — see the upstream font license before redistribution; a
  fallback mono stack is documented in `design.md`.

Aperture is an independent project. It is **not affiliated with or endorsed by
Cal.com, coss.com, or the coss/ui team.** See
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for license details.

## License

MIT. See [`LICENSE`](./LICENSE).

If you build something with Aperture, tell us. The best outcome is that a lab ships
a tool it would never have had the time to build otherwise.
