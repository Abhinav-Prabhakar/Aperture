import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { ConstantsReferenceDemo } from "@/registry/default/examples/constants-reference-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Constants Reference",
  description:
    "The CODATA 2022 fundamental physical constants with search, curated and SI-defining subsets, exact and uncertain values, unit typesetting, copy actions, and CSV export.",
};

export default function ConstantsReferencePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Physical sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Constants Reference
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A constant is a value, a unit, an uncertainty, a year, and a source.
        Keep all five together, make exactness visible, and let someone copy a
        number without retyping it from a PDF.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <ConstantsReferenceDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        The complete CODATA 2022 listing: 355 constants, 20 featured values,
        and the seven defining constants of the SI. The fine-structure constant
        is selected to show a measured value with a one-sigma uncertainty.
        Search across names, symbols, values, and units; switch subsets; move
        through the list with the arrow keys; copy the value or the value with
        its uncertainty; export the visible set as CSV.
      </p>

      <CodeBlock
        code={`import { ConstantsReference } from "@/components/instruments/constants-reference";

<ConstantsReference
  defaultFilter="featured"
  defaultConstantId="fine-structure-constant"
  onConstantSelect={(constant) => {
    console.log(constant.id, constant.value, constant.uncertainty);
  }}
  onExport={(csv) => track("constants-export", csv.length)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The full listing is present.</strong>{" "}
          All 355 constants from the CODATA 2022 complete listing are bundled,
          not just the famous twenty. Brand-new constants in a future CODATA
          release arrive through the same data contract.
        </li>
        <li>
          <strong className="font-medium">Exactness is a first-class state.</strong>{" "}
          The 81 exact constants carry no uncertainty and are marked “Exact” in
          the list and the detail panel. Measured constants show an explicit
          plus-or-minus value with the same unit and prefix as the value.
        </li>
        <li>
          <strong className="font-medium">Three curated views.</strong> Featured
          (20 hand-picked constants), SI defining (the seven constants that
          define the base units), and All (355). The search applies within the
          active view, so “Planck” in Featured and “Planck” in All answer
          different questions.
        </li>
        <li>
          <strong className="font-medium">Search is broad on purpose.</strong>{" "}
          Names, symbols, ids, values, and units match. Searching{" "}
          <span className="font-mono text-xs">299792458</span> finds the speed
          of light; searching <span className="font-mono text-xs">J Hz^-1</span>{" "}
          finds the constants with that unit.
        </li>
        <li>
          <strong className="font-medium">Copy is unambiguous.</strong> “Copy
          value” writes the NIST value with group separators removed and the
          exponent intact, for example{" "}
          <span className="font-mono text-xs">6.62607015e-34</span>. “Copy ±”
          writes the value, uncertainty, and unit together for prose. Exact
          constants copy with an explicit “(exact)”.
        </li>
        <li>
          <strong className="font-medium">Units are typeset, not retyped.</strong>{" "}
          NIST shorthands such as{" "}
          <span className="font-mono text-xs">m^3 kg^-1 s^-2</span> render as
          m³ kg⁻¹ s⁻², and <span className="font-mono text-xs">ohm</span>{" "}
          renders as Ω. The CSV keeps the raw NIST strings.
        </li>
        <li>
          <strong className="font-medium">Every selection is inspectable.</strong>{" "}
          The detail panel reports the symbol, unit, uncertainty, source year,
          and identifier. The list uses a roving tab index; Arrow Up and Arrow
          Down move selection and focus, Home and End jump to the ends.
        </li>
        <li>
          <strong className="font-medium">The export is the visible set.</strong>{" "}
          CSV columns carry id, name, symbol, value, uncertainty, unit, exact
          flag, featured flag, and SI-defining flag. Filtering to the seven SI
          constants and exporting produces a seven-row file.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Reading the values
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">NIST notation is preserved.</strong>{" "}
          Values are stored exactly as the complete listing prints them,
          including space-grouped digits and the trailing{" "}
          <span className="font-mono text-xs">e</span> exponent. The screen
          rewrites the exponent as a power of ten; the CSV does not.
        </li>
        <li>
          <strong className="font-medium">Uncertainty is absolute.</strong> The
          reported uncertainty is the standard uncertainty in the same unit as
          the value, not a relative percentage. Some values repeat the exponent
          in the uncertainty, as NIST publishes them; the component does not
          combine them into a single decimal.
        </li>
        <li>
          <strong className="font-medium">Dimensionless means dimensionless.</strong>{" "}
          An empty NIST unit renders as “dimensionless,” not as a dash and not
          as an invented unit.
        </li>
        <li>
          <strong className="font-medium">Truncation is disclosed.</strong> Some
          exact constants are abbreviated by NIST with an ellipsis, for example{" "}
          <span className="font-mono text-xs">1.054 571 817... e-34</span>. The
          component keeps the ellipsis and shows a warning. It does not invent
          the missing digits.
        </li>
        <li>
          <strong className="font-medium">The year is part of the value.</strong>{" "}
          These are CODATA 2022 recommended values. A future adjustment is a new
          dataset, not an in-place edit of the bundled one.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Data in.</strong>{" "}
          <span className="font-mono text-xs">constants</span> is an array of
          objects with an id, name, value, uncertainty, unit, exact flag,
          featured flag, and SI-defining flag. A symbol is optional. A missing
          or empty array renders the empty state.
        </li>
        <li>
          <strong className="font-medium">Initial view.</strong>{" "}
          <span className="font-mono text-xs">defaultFilter</span> selects
          featured, SI defining, or all. If{" "}
          <span className="font-mono text-xs">defaultConstantId</span> names a
          constant outside that filter, the component opens All so the requested
          constant is visible.
        </li>
        <li>
          <strong className="font-medium">Selection is observable.</strong>{" "}
          <span className="font-mono text-xs">onConstantSelect(constant)</span>{" "}
          fires on click and keyboard navigation. The component owns the
          selection and the filter; the data is never mutated.
        </li>
        <li>
          <strong className="font-medium">Pure helpers are exported.</strong>{" "}
          <span className="font-mono text-xs">formatConstantValue</span>,{" "}
          <span className="font-mono text-xs">formatConstantUnit</span>,{" "}
          <span className="font-mono text-xs">constantPlainValue</span>,{" "}
          <span className="font-mono text-xs">formatConstantUncertainty</span>,{" "}
          <span className="font-mono text-xs">filterConstants</span>,{" "}
          <span className="font-mono text-xs">searchConstants</span>, and{" "}
          <span className="font-mono text-xs">constantCsv</span>.
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
        Values are parsed from the{" "}
        <a
          className="underline underline-offset-4"
          href="https://physics.nist.gov/cuu/Constants/"
          rel="noreferrer"
          target="_blank"
        >
          NIST Fundamental Physical Constants
        </a>{" "}
        complete listing of CODATA 2022 recommended values. NIST does not
        endorse this component. The featured and SI-defining subsets are
        editorial selections over that data; the identifiers are Aperture’s
        slugs, not NIST identifiers. Verify before publication, and cite the
        CODATA report rather than this component.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The search field has a label, an Escape shortcut, and a live result
          count. Filter buttons expose their pressed state; the list uses a
          roving tab index so it is one stop, not 355.
        </li>
        <li>
          Each list item is a button with a complete accessible name: symbol,
          name, formatted value, and unit. Selection uses{" "}
          <span className="font-mono text-xs">aria-pressed</span>.
        </li>
        <li>
          The detail panel is a labeled region with a heading-led definition
          list. Value and uncertainty are in semantic text, not an image.
        </li>
        <li>
          Copy actions report “Copied” in the button label. The CSV is available
          even when the clipboard API is unavailable.
        </li>
        <li>
          Layout uses logical properties and container queries. At 320 px the
          detail panel moves below the list without a page-level horizontal
          scroll.
        </li>
        <li>
          There are no entrance animations or counting numbers. Reduced-motion
          users see the same list immediately.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The full listing, search, filters, detail panel, copy actions, and CSV
        are complete and tested. The defaults still need a domain-advisor
        review: the featured selection, the dimensionless wording, unit
        typesetting for compound expressions, uncertainty presentation, and
        whether the truncated exact decimals should be completed from the
        CODATA report. Treat this instrument as usable, not final. The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/spectrum-plot"
        >
          Spectrum Plot
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/periodic-table"
        >
          Periodic Table
        </Link>{" "}
        carry the same preview status.
      </p>
    </article>
  );
}
