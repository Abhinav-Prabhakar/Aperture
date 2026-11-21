<div align="center">

<img src="./docs/assets/hero-light.webp" alt="Aperture — Building blocks for researchers" width="100%" />

<br />
<br />

[![Status](https://img.shields.io/badge/status-pre--alpha-000?style=flat-square)](./PLAN.md)
[![License](https://img.shields.io/badge/license-MIT-000?style=flat-square)](./LICENSE)
[![Elements](https://img.shields.io/badge/elements-56-000?style=flat-square)](./registry/default/ui)
[![Tests](https://img.shields.io/badge/tests-37_passing-000?style=flat-square)](./packages/quantities/test)
[![React](https://img.shields.io/badge/React-19-000?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-000?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-000?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

**A copy-paste UI system for scientific software.**<br />
Elements, instruments, and whole workbenches — so you spend your time on the science.

[**Live site**](https://abhinav-prabhakar.github.io/Aperture/) · [**Elements**](https://abhinav-prabhakar.github.io/Aperture/docs/elements/) · [**Design contract**](./design.md) · [**Catalog**](./docs/catalog.md)

</div>

---

## A workbench, not a widget demo

<img src="./docs/assets/explorer-light.webp" alt="Data Explorer workbench with sample table, inspector, status badges, and a concentration trend" width="100%" />

A table with units. An inspector with provenance. Missing values that read as missing, not zero. This is the whole idea: researchers should not rebuild the same instrument panel in every lab.

## Three layers. One system.

<img src="./docs/assets/layers.webp" alt="The Aperture layers: elements, instruments, workbenches" width="100%" />

| | | |
| :-- | :-- | :-- |
| **Elements** | **Instruments** | **Workbenches** |
| 56 accessible primitives, vendored from coss/ui. | Research-native components: quantities, uncertainty, logs, protocols. | Complete screens with navigation, canvas, inspector, and status. |

## Details researchers notice

<p align="center">
  <img src="./docs/assets/card-basic.webp" alt="Card with values, units, and provenance" width="49%" />
  <img src="./docs/assets/button-variants.webp" alt="Button variants" width="49%" />
</p>

<p align="center">
  <img src="./docs/assets/tokens-surfaces.webp" alt="Achromatic surface tokens" width="49%" />
  <img src="./docs/assets/tokens-palette.webp" alt="Eight-color colorblind-safe data palette" width="49%" />
</p>

Units live with the value. Uncertainty is a first-class input. The chrome is achromatic, so color is reserved for data and status. Tabular numerals, true minus signs, explicit missing values.

## Built for the bench and the field

<p align="center">
  <img src="./docs/assets/instruments.webp" alt="The founding set of research instruments" width="49%" />
  <img src="./docs/assets/elements-detail.webp" alt="A detail of the 56-element index" width="49%" />
</p>

Life sciences first — sample tables, plate readers, growth curves, dose–response, PCR programs, reagent inventory. The same grammar extends to physics, astronomy, chemistry, earth science, social science, economics, and the humanities.

## Light. Dark. High contrast.

<p align="center">
  <img src="./docs/assets/hero-dark.webp" alt="Aperture in the dark theme" width="72%" />
  <img src="./docs/assets/mobile-hero.webp" alt="Aperture on a phone" width="24%" />
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

Phase 0: elements, tokens, registry, docs shell, and `@aperture/quantities` are in place. Instruments and workbenches are next. Counts and commands on the site describe the target, not a finished release.

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
