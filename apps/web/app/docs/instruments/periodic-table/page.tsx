import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { PeriodicTableDemo } from "@/registry/default/examples/periodic-table-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Periodic Table",
  description:
    "All 118 elements in an 18-column grid with f-block strips, roving keyboard navigation, search, a detail panel, a period or series trend, a full data table, and CSV export.",
};

export default function PeriodicTablePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Physical sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Periodic Table
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A periodic table is a lookup surface and a small multiples chart at the
        same time. Select an element, read its properties, and see where it sits
        in a period or series — without losing the shape of the table.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <PeriodicTableDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        All 118 elements, with iron selected by default. Color marks the block
        (s, p, d, f), not the chemical family. Hover or focus a cell and use the
        arrow keys to move through the grid; search by name, symbol, or atomic
        number; switch the trend between electronegativity, atomic radius, and
        first ionization energy; open the full table or export the CSV.
      </p>

      <CodeBlock
        code={`import { PeriodicTable } from "@/components/instruments/periodic-table";

<PeriodicTable
  defaultElement={26}
  onElementSelect={(element) => {
    console.log(element.symbol, element.mass);
  }}
  onExport={(csv) => track("periodic-table-export", csv.length)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The layout is conventional.</strong>{" "}
          Eighteen columns, seven main periods, and two f-block strips below the
          table. Lanthanum through lutetium and actinium through lawrencium sit
          in the strips at columns 3–17. Group 3 in periods 6 and 7 is left as a gap
          rather than asserting a disputed placement.
        </li>
        <li>
          <strong className="font-medium">One tab stop, many cells.</strong> The
          grid uses a roving tab index, so Tab enters the selected element and
          the arrow keys move through occupied neighbors. Home and End jump to
          the ends of the current row. Focus follows selection, and the detail
          panel updates with it.
        </li>
        <li>
          <strong className="font-medium">Search is a shortcut, not a filter.</strong>{" "}
          Names, symbols, atomic numbers, categories, and blocks match. The
          matching elements appear in a result strip; Enter selects the first
          match and moves focus to its cell. The grid stays whole so the shape
          of the table is never lost.
        </li>
        <li>
          <strong className="font-medium">The detail panel is complete.</strong>{" "}
          Atomic number, symbol, name, category, block, period, group or series,
          atomic weight, electron configuration, Pauling electronegativity,
          radius, first ionization energy, electron affinity, oxidation states,
          standard state, melting and boiling points in kelvin and Celsius,
          density with its unit, and year discovered.
        </li>
        <li>
          <strong className="font-medium">A missing standard weight is marked.</strong>{" "}
          Elements without an IUPAC standard atomic weight show their mass with
          an asterisk and a note. The mass is a representative isotope mass, not
          a bracketed mass number presented as an atomic weight.
        </li>
        <li>
          <strong className="font-medium">Trends are per period or series.</strong>{" "}
          The sparkline reads the selected element's row in the table. It is a
          shape check, not a regression; every value is also visible in the
          detail panel and the full table.
        </li>
        <li>
          <strong className="font-medium">The export is the data.</strong> The
          CSV carries all 118 elements with atomic number, symbol, name,
          category, block, period, group, mass, standard-weight flag,
          electronegativity, radius, ionization energy, electron affinity,
          oxidation states, standard state, melting and boiling points, density,
          density unit, and discovery year.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Reading the table
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Block is the only color.</strong> The
          four tints mark s-, p-, d-, and f-block. Chemical family is written in
          the detail panel and in the table; it is not inferred from hue.
        </li>
        <li>
          <strong className="font-medium">Mass units are unified.</strong>{" "}
          Atomic weights are in unified atomic mass units (u). Density is
          g/cm³ for condensed phases and g/L for gases; the unit is always
          shown.
        </li>
        <li>
          <strong className="font-medium">Temperatures are dual.</strong>{" "}
          Melting and boiling points are stored in kelvin and displayed in
          kelvin with a rounded Celsius value. A missing point is an explicit{" "}
          <span className="font-mono">—</span>, not a zero.
        </li>
        <li>
          <strong className="font-medium">Discovery is text.</strong> Years are
          strings because some entries are “Ancient” or otherwise not a single
          year. The table does not sort discovery dates numerically.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Bundled data.</strong> The default
          dataset is all 118 elements in{" "}
          <span className="font-mono text-xs">periodic-table-data</span>. Pass{" "}
          <span className="font-mono text-xs">elements</span> to replace it with
          a subset or your own reviewed values.
        </li>
        <li>
          <strong className="font-medium">Required per element.</strong> Atomic
          number, symbol, name, mass, category, block, period, and group. The
          group is null for f-block strips. Optional numeric properties are null
          when unavailable.
        </li>
        <li>
          <strong className="font-medium">Selection is observable.</strong>{" "}
          <span className="font-mono text-xs">onElementSelect(element)</span>{" "}
          fires on click, keyboard navigation, and search selection. The
          component owns the selected number; the data is never mutated.
        </li>
        <li>
          <strong className="font-medium">Pure helpers are exported.</strong>{" "}
          <span className="font-mono text-xs">PERIODIC_LAYOUT</span>,{" "}
          <span className="font-mono text-xs">findElementNeighbor</span>,{" "}
          <span className="font-mono text-xs">searchElements</span>,{" "}
          <span className="font-mono text-xs">formatAtomicMass</span>,{" "}
          <span className="font-mono text-xs">formatDensity</span>,{" "}
          <span className="font-mono text-xs">formatKelvin</span>, and{" "}
          <span className="font-mono text-xs">elementCsv</span>.
        </li>
        <li>
          <strong className="font-medium">Export is observable.</strong>{" "}
          <span className="font-mono text-xs">onExport(csv)</span> fires before
          the browser download. The component does not upload anything.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Provenance
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Values are compiled from PubChem periodic-table records through{" "}
        <a
          className="underline underline-offset-4"
          href="https://github.com/sjf8203/periodic-table-data"
          rel="noreferrer"
          target="_blank"
        >
          periodic-table-data 1.1.1
        </a>{" "}
        (MIT). Group, period, and block are derived from the conventional
        18-column layout. Atomic weights and bulk properties are reference
        values, not a validation source. Verify against IUPAC/CIAAW and NIST
        before publication. The component does not include isotope abundances,
        decay data, or a full electron-shell diagram.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The grid is a group of real buttons with atomic number, symbol, name,
          category, and block in each accessible name. Selection uses{" "}
          <span className="font-mono text-xs">aria-pressed</span>.
        </li>
        <li>
          Roving tab index keeps the grid to one tab stop. Arrow keys, Home, and
          End move selection and focus without wrapping across empty cells.
        </li>
        <li>
          The search box has a visible label path, an Escape shortcut, and a
          live result count. Enter moves focus to the first match.
        </li>
        <li>
          The detail panel is a heading-led definition list. The trend is an
          image with a full text alternative, and the full table is a real
          table with column headers.
        </li>
        <li>
          At 320 px the grid scrolls inside its own region, with the page-level
          layout intact. Block tints have text labels in the legend.
        </li>
        <li>
          There are no entrance animations or counting numbers. Reduced-motion
          users see the same table immediately.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The layout, navigation, search, detail panel, trend, table, and export
        are complete and tested. The defaults still need a domain-advisor
        review: the La/Lu and Ac/Lr placement convention, the category labels,
        the atomic-weight precision, the gas-density conversion, the trend
        properties, and the discovery-year strings. Treat this instrument as
        usable, not final. The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/spectrum-plot"
        >
          Spectrum Plot
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/constants-reference"
        >
          Constants Reference
        </Link>{" "}
        carry the same preview status.
      </p>
    </article>
  );
}
