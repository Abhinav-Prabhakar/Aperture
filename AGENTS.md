# Agent Guide

This repository is a design system for research software. Read this before
creating or editing any component. If a rule here conflicts with `design.md`,
`design.md` wins.

## Read first

1. [`design.md`](./design.md) — the design contract.
2. [`PLAN.md`](./PLAN.md) — architecture and roadmap.
3. [`docs/catalog.md`](./docs/catalog.md) — what exists and what is planned.
4. [`UPSTREAM.md`](./UPSTREAM.md) — coss/ui provenance and sync rules.

## Non-negotiables

- **Never edit `.reference/coss-ui`.** It is a read-only upstream checkout.
- **No raw colors.** Use semantic tokens (`bg-background`, `text-muted-foreground`,
  `border-border`) or `color-mix()` / `--alpha()` derived from them.
- **Use the component contract.** `data-slot`, `cn()`, `className` passthrough,
  `useRender` where element substitution makes sense.
- **Use logical properties.** `ps/pe`, `ms/me`, `start/end`, `text-start`.
- **No gradients, glows, glassmorphism, or emoji icons.**
- **Achromatic chrome.** Color is for status, data, or the marketing brand. Never
  add a decorative accent to product UI.
- **Numbers are data.** Use tabular numerals, explicit units, explicit missing
  values (`—`), and explicit precision.
- **Accessibility is acceptance criteria.** Keyboard, screen reader, colorblind,
  reduced motion, RTL, 200% zoom.
- **Copy-paste source.** Components must be readable and self-contained. Avoid
  hidden providers and runtime magic.

## Where things live

```
registry/default/ui/             # elements (vendored coss/ui + additions)
registry/default/instruments/    # research components
registry/default/workbenches/    # multi-file layouts
registry/default/examples/       # docs fixtures; also visual test fixtures
registry/default/hooks/
registry/default/lib/
packages/                        # logic-only npm packages
apps/web/                        # landing + docs + registry
docs/                            # published static site, plus catalog/assets
```

`docs/` is the GitHub Pages root. Build it with `bun run deploy:pages`, which
exports the site, syncs it into `docs/`, commits that folder on `main`, and
pushes. Pages serves `main` / `docs`; there is no `gh-pages` branch.

## Adding a component

1. Check the catalog and coss/ui. Do not duplicate an existing element.
2. Write the component in `registry/default/…` using the template in
   `design.md` §3.1.
3. Add `data-slot` to every exported part.
4. Add a docs example in `registry/default/examples/`.
5. Add a `registry-item.json` with title, description, categories, stability,
   domain, dependencies, and a11y notes.
6. Add tests: render (light/dark), keyboard, axe, RTL, reduced motion.
7. Run the registry build, typecheck, lint, and visual tests.
8. Add a changelog entry.
9. If it is a research instrument, get a domain review before marking it beta.

## Adding a workbench

1. Compose only from registry items. Do not introduce a private component that
   belongs in the registry.
2. Provide all states: loading, empty, error, permission denied, offline.
3. Make filters, tabs, selection, and the selected record URL-addressable.
4. Provide a mock adapter with realistic, non-sensitive data.
5. Include a mobile layout and a print layout where relevant.
6. Add a full-page preview and an install command to the docs.

## Review checklist

Use `design.md` §12. A component is not done until every box is true.

## Commit style

- Imperative, sentence case: `Add quantity input`, `Fix table empty state`.
- One logical change per commit.
- Reference the registry item or issue when relevant.
- Do not commit `.reference/`, secrets, or generated build output other than
  the published `docs/` export.

## When in doubt

Prefer the quietest, most legible option. If a design decision would make a
screenshot look better but a table harder to read, choose the table.
