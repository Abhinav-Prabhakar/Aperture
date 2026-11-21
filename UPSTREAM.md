# Upstream: coss/ui

Aperture's element layer is a vendored fork of [coss/ui](https://github.com/cosscom/ui).

## Pinned version

| Field | Value |
| --- | --- |
| Repository | `https://github.com/cosscom/ui` |
| Commit | `b2336c45f2b7355c42678ce786b6f14d62b819be` |
| Commit date | 2026-11-17 |
| License | MIT © 2025 coss.com and Origin UI |
| Vendored on | 2026-11-21 |

The upstream checkout used for the initial extraction lives in `.reference/coss-ui`
(local only, gitignored). It is not part of the distributed project.

## What we vendored

- `registry/default/ui/*` — 56 primitives.
- `packages/ui/src/styles/globals.css` — token architecture and theme.
- Component conventions: `data-slot`, `useRender`, `mergeProps`, CVA variants,
  logical properties, pointer-coarse targets.
- Selected composed patterns (card frames, groups, tables, sidebar, tabs) where
  they define the visual grammar.

## What we changed

Every local change to an upstream file must be listed here. Add a row before
merging the change.

| File | Change | Reason | Upstream issue/PR |
| --- | --- | --- | --- |
| `globals.css` | Replaced the five chart tokens with an eight-color Okabe–Ito palette; added density variables; removed brand color tokens. | Research data needs a colorblind-safe categorical palette, denser tables, and a fully monochrome brand. | — |

New files that are not derived from coss/ui (including Aperture's `README.md`
and `design.md`) do not need an upstream entry, but they must follow
`design.md`.

## Sync policy

1. Sync monthly, not continuously, to avoid churn.
2. Create a branch `chore/upstream-YYYY-MM`.
3. Cherry-pick or merge upstream changes; resolve conflicts in favor of the
   upstream implementation unless the patch log says otherwise.
4. Run the full visual regression suite, the registry build, and the a11y suite.
5. Update the pinned commit and the patch log.
6. Open a PR with a short summary and screenshots of any visual diffs.

## Rules

- Keep the upstream MIT notice in every derived file.
- Do not rename an upstream component without a compatibility alias.
- Prefer upstreaming a fix to coss/ui over maintaining a local patch.
- A local patch is technical debt. It needs a reason and, where possible, a link
  to an upstream issue.
- Never remove the `LICENSE` or `THIRD_PARTY_NOTICES.md` files.

## Attribution

Aperture is independent. It is not affiliated with or endorsed by Cal.com,
coss.com, or the coss/ui team. The README, docs footer, and this file credit the
upstream project permanently.
