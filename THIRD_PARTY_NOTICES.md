# Third-Party Notices

Aperture is MIT-licensed. It is derived from, depends on, or redistributes work
from the projects below. Their licenses apply to their respective code, fonts, and
assets.

## Design system and element layer

### coss/ui

- **Project:** https://github.com/cosscom/ui
- **License:** MIT
- **Copyright:** Copyright (c) 2025 coss.com and Origin UI
- **Use:** The Aperture element layer, design tokens, component conventions, and
  substantial portions of the component source are derived from coss/ui.
- **Note:** Aperture is an independent project and is not affiliated with or
  endorsed by Cal.com or coss.com.

The MIT license text is reproduced at the end of this file.

### Origin UI

- **Project:** https://github.com/origin-space/originui
- **License:** MIT
- **Use:** coss/ui incorporates legacy Origin UI components, and therefore so
  does Aperture.

## Primitives and tooling

| Project | License | Use |
| --- | --- | --- |
| [Base UI](https://base-ui.com) | MIT | Accessible unstyled primitives |
| [Tailwind CSS](https://tailwindcss.com) | MIT | Styling engine |
| [shadcn/ui](https://ui.shadcn.com) | MIT | Registry schema and copy-paste model |
| [Radix UI](https://radix-ui.com) | MIT | Some upstream primitives (via dependencies) |
| [Lucide](https://lucide.dev) | ISC | Icons |
| [class-variance-authority](https://github.com/joe-bell/cva) | Apache-2.0 | Variant API |
| [clsx](https://github.com/lukeed/clsx) | MIT | Class composition |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | MIT | Class conflict resolution |
| [TanStack Table](https://tanstack.com/table) | MIT | Headless table logic |
| [TanStack Virtual](https://tanstack.com/virtual) | MIT | Virtualization |
| [uPlot](https://github.com/leeoniya/uPlot) | MIT | Time-series charts |
| [Vega-Lite](https://vega.github.io/vega-lite/) | BSD-3-Clause | Declarative charts |
| [D3](https://d3js.org) | ISC | Bespoke visualizations |
| [KaTeX](https://katex.org) | MIT | Math rendering |
| [CodeMirror](https://codemirror.net) | MIT | Code editing |
| [MapLibre GL JS](https://maplibre.org) | BSD-3-Clause | Maps |
| [Mol*](https://molstar.org) | MIT | Molecular visualization |
| [PapaParse](https://www.papaparse.com) | MIT | CSV parsing |
| [Apache Arrow](https://arrow.apache.org) | Apache-2.0 | Columnar data |
| [hyparquet](https://github.com/hyparam/hyparquet) | MIT | Parquet parsing |
| [h5wasm](https://github.com/usnistgov/h5wasm) | MIT | HDF5 parsing |
| [fitsjs](https://github.com/astrojs/fitsjs) | MIT | FITS parsing |
| [dicom-parser](https://github.com/cornerstonejs/dicomParser) | MIT | DICOM parsing |

Optional domain viewers and parsers are peer dependencies and are not bundled in
the base install.

## Fonts

### Cal Sans

- **Project:** https://github.com/calcom/sans
- **License:** SIL Open Font License 1.1
- **Copyright:** Copyright (c) 2026, Mark Davis, with typefaces "Cal Sans,"
  "Cal Sans UI," "Cal Sans A11y," and "Cal Sans Geo." Commissioned by Peer
  Richelsen for Cal.com.
- **Use:** Default UI and heading family.
- **Bundling:** If the font files are redistributed, include the upstream
  `OFL.txt` in the font package and keep the reserved font name rules intact.

### Paper Mono

- **Source:** coss/ui repository (`packages/ui/src/fonts/PaperMono-Regular.woff2`)
- **License:** **Verify before redistribution.** The coss/ui repository is MIT,
  but font files may carry a separate license. Until verified, Aperture should
  use JetBrains Mono (SIL OFL 1.1) or IBM Plex Mono (SIL OFL 1.1) as the default
  mono family and treat Paper Mono as an optional, user-supplied asset.
- **Fallback stack:** `"JetBrains Mono", "IBM Plex Mono", ui-monospace,
  monospace`.

## Documentation and inspiration

- **Fumadocs** — MIT — docs framework.
- **Next.js** — MIT — application framework.
- **React** — MIT — UI runtime.
- **Vercel** — hosting (if used) under their terms.

## MIT license text

```
MIT License

Copyright (c) 2025 coss.com and Origin UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

If you believe a notice is missing or incorrect, open an issue. We will fix it.
