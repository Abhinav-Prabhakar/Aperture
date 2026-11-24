# Changelog

All notable changes to Aperture. The format follows Keep a Changelog; versions
are pre-1.0 and the public API should be treated as unstable.

## Unreleased

### Added

- **Research records**, the first pack from the 2026 research memo:
  - Measurement Table
  - Exclusion & Transformation Ledger
  - Statistical Result Block
  - Missingness & Censoring Map
  - Dataset Card
  - Run Comparison
  - Calibration & QC Panel (preview)
  - Reproducibility Manifest
- Docs pages for each instrument with live demos, checks, data contracts,
  accessibility notes, and status.
- A research page at `/docs/research/instruments-2026` and a `Research records`
  group in the docs navigation.
- Pure, exported helpers for every instrument, plus 57 tests covering parsing,
  formatting, reconciliation, warnings, export, rendering, and axe.
- `CHANGELOG.md`.

### Changed

- The instruments index now separates the founding set from the research-record
  layer and reports 19 ready / 7 preview.
- README counts: 56 elements, 26 instruments, 5 workbenches, 248 tests.
- `docs/catalog.md` marks the research records as built and lists the twelve
  remaining memo candidates.
- `PLAN.md` Phase 1.5 records what shipped and what remains.

### Fixed

- The Missingness & Censoring Map uses a plain container instead of a nested
  `aside`, removing a landmark-complementary violation.

## 0.1.0 — 2026-11-20

### Added

- 56 elements, 12 founding instruments, 5 workbenches, and the first three
  instruments in each domain pack.
- Static documentation site and hosted registry.
- Design contract, catalog, and research memo.
