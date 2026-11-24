import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { MeasurementTableDemo } from "@/registry/default/examples/measurement-table-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Measurement Table",
  description:
    "A table whose columns carry type, unit, precision, missing codes, detection limits, and uncertainty — and whose export keeps them.",
};

export default function MeasurementTablePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Measurement Table
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A data table is type-agnostic. A measurement table is not. Every column
        declares what it holds, what unit it is in, how precisely it was
        measured, which tokens mean missing, and what the detection limit was.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <MeasurementTableDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A synthetic serum panel. Glucose carries a method uncertainty,
        creatinine has two missing codes, troponin is censored below 0.01 ng/L,
        and one glucose value arrived as the string{" "}
        <span className="font-mono text-xs">"pending"</span>. Switch to{" "}
        <strong className="font-medium">Needs review</strong> to see only the
        rows that carry a gap or a flag, or export the CSV and inspect the
        header and qualifier columns.
      </p>

      <CodeBlock
        code={`import { MeasurementTable } from "@/components/instruments/measurement-table";

<MeasurementTable
  title="Serum chemistry, cohort 12"
  columns={[
    { id: "glucose", label: "Glucose", unit: "mmol/L", precision: 1,
      uncertainty: { value: 0.15 } },
    { id: "creatinine", label: "Creatinine", unit: "µmol/L", precision: 0,
      missingCodes: [
        { code: "ND", label: "Not determined" },
        { code: "HEM", label: "Haemolysed sample" },
      ] },
    { id: "troponin", label: "Troponin I", unit: "ng/L", precision: 2,
      detectionLimit: { value: 0.01, label: "LoD" } },
    { id: "sampleType", label: "Sample", type: "category" },
  ]}
  rows={[
    { id: "S-1042", values: { glucose: 5.2, creatinine: 78,
      troponin: 0.02, sampleType: "Serum" } },
    { id: "S-1043", values: { glucose: { value: 6.8, uncertainty: 0.4 },
      creatinine: { missing: "HEM" },
      troponin: { censored: { limit: 0.01 } }, sampleType: "Serum" } },
  ]}
  onExport={(csv) => archive("serum.csv", csv)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">A quantity without a unit is flagged.</strong>{" "}
          The rule is not a style preference. A number whose unit is only in the
          column title, the methods paragraph, or the reader's memory is not a
          measurement. The header says <em>unit not set</em> and the summary
          counts it.
        </li>
        <li>
          <strong className="font-medium">Missing codes are declared, not guessed.</strong>{" "}
          <span className="font-mono text-xs">ND</span>,{" "}
          <span className="font-mono text-xs">HEM</span>, and{" "}
          <span className="font-mono text-xs">QNS</span> each carry a label and a
          kind. The cell shows the token, the legend explains it, and a screen
          reader hears the meaning.
        </li>
        <li>
          <strong className="font-medium">Censored is not zero.</strong> A
          below-limit value renders as{" "}
          <span className="font-mono text-xs">&lt; 0.01</span> and exports as a
          qualified string. It never becomes a zero that later statistics will
          happily average.
        </li>
        <li>
          <strong className="font-medium">Strings are not silently coerced.</strong>{" "}
          A non-numeric value in a numeric column is marked{" "}
          <em>unparsed</em>, tinted, and counted. The table does not turn{" "}
          <span className="font-mono text-xs">"pending"</span> into{" "}
          <span className="font-mono text-xs">NaN</span> and move on.
        </li>
        <li>
          <strong className="font-medium">Uncertainty stays attached.</strong>{" "}
          Column-level and cell-level uncertainty render as{" "}
          <span className="font-mono text-xs">±</span> beside the value and
          become their own CSV column. A measurement without its error is
          incomplete, not clean.
        </li>
        <li>
          <strong className="font-medium">The footer reconciles the columns.</strong>{" "}
          Each column reports <span className="font-mono text-xs">n</span> and
          how many cells need review, so nobody has to count gaps by eye before
          writing the methods.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How values are read
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        A cell accepts a number, a string, <span className="font-mono text-xs">null</span>,
        or an object with <span className="font-mono text-xs">value</span>,{" "}
        <span className="font-mono text-xs">uncertainty</span>,{" "}
        <span className="font-mono text-xs">censored</span>,{" "}
        <span className="font-mono text-xs">missing</span>,{" "}
        <span className="font-mono text-xs">note</span>, and{" "}
        <span className="font-mono text-xs">flag</span>. The rules are
        deterministic and exported as pure helpers.
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Column type.</strong>{" "}
          <span className="font-mono text-xs">quantity</span> and{" "}
          <span className="font-mono text-xs">number</span> are numeric;{" "}
          <span className="font-mono text-xs">category</span>,{" "}
          <span className="font-mono text-xs">datetime</span>, and{" "}
          <span className="font-mono text-xs">text</span> are not. A unit implies{" "}
          <span className="font-mono text-xs">quantity</span> when no type is
          given.
        </li>
        <li>
          <strong className="font-medium">Precision.</strong> Set{" "}
          <span className="font-mono text-xs">precision</span> to fix the decimal
          places. Without it, values render up to four decimals and switch to
          exponential outside{" "}
          <span className="font-mono text-xs">10⁻³–10⁶</span>. Display rounding
          never changes the export, which carries full precision.
        </li>
        <li>
          <strong className="font-medium">Uncertainty.</strong> A column
          uncertainty can be absolute or relative; a cell uncertainty overrides
          it. Hide the whole thing with{" "}
          <span className="font-mono text-xs">showUncertainty: false</span> when
          the table is a lookup rather than a report.
        </li>
        <li>
          <strong className="font-medium">Censoring.</strong> Give a cell{" "}
          <span className="font-mono text-xs">{"{ censored: { limit } }"}</span>{" "}
          and it renders as a limit. A column detection limit supplies the
          default for cells that only declare censoring.
        </li>
        <li>
          <strong className="font-medium">Flags.</strong>{" "}
          <span className="font-mono text-xs">ok</span>,{" "}
          <span className="font-mono text-xs">warning</span>, and{" "}
          <span className="font-mono text-xs">fail</span> add a glyph, a tint, a
          tooltip, and an accessible label. The glyph carries the meaning; the
          color is a second cue.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Input.</strong>{" "}
          <span className="font-mono text-xs">columns</span> and{" "}
          <span className="font-mono text-xs">rows</span> are required. A row has
          an <span className="font-mono text-xs">id</span>, an optional{" "}
          <span className="font-mono text-xs">label</span>, and a{" "}
          <span className="font-mono text-xs">values</span> record keyed by
          column id. Missing keys are empty cells.
        </li>
        <li>
          <strong className="font-medium">Columns.</strong>{" "}
          <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">label</span>, optional{" "}
          <span className="font-mono text-xs">type</span>,{" "}
          <span className="font-mono text-xs">unit</span>,{" "}
          <span className="font-mono text-xs">precision</span>,{" "}
          <span className="font-mono text-xs">missingCodes</span>,{" "}
          <span className="font-mono text-xs">detectionLimit</span>,{" "}
          <span className="font-mono text-xs">uncertainty</span>, and{" "}
          <span className="font-mono text-xs">showUncertainty</span>.
        </li>
        <li>
          <strong className="font-medium">Export.</strong>{" "}
          <span className="font-mono text-xs">onExport(csv)</span> fires before
          the download. The header appends{" "}
          <span className="font-mono text-xs">[unit]</span>, uncertainty becomes
          a companion column, and flags become a trailing{" "}
          <span className="font-mono text-xs">Flags</span> column. Notes are
          display-only.
        </li>
        <li>
          <strong className="font-medium">Filtering.</strong> The row filter
          changes what is on screen, never what is exported. The whole table is
          the record.
        </li>
        <li>
          <strong className="font-medium">Pure helpers.</strong>{" "}
          <span className="font-mono text-xs">normalizeMeasurementCell</span>,{" "}
          <span className="font-mono text-xs">summarizeMeasurementColumns</span>,{" "}
          <span className="font-mono text-xs">formatMeasurementCell</span>, and{" "}
          <span className="font-mono text-xs">measurementTableCsv</span> are
          exported for validation and tests.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          A real <span className="font-mono text-xs">table</span> with a caption,
          column headers, and row headers. Numeric columns are end-aligned and
          use tabular numerals.
        </li>
        <li>
          Missing codes, censored limits, and flags each carry an{" "}
          <span className="font-mono text-xs">aria-label</span> or screen-reader
          text; the glyph is never the only carrier.
        </li>
        <li>
          The row filter is a labelled button group with{" "}
          <span className="font-mono text-xs">aria-pressed</span>, not a custom
          dropdown.
        </li>
        <li>
          At 320 px the table scrolls inside its own container while the page
          keeps its width. The page does not move sideways.
        </li>
        <li>
          No entrance animation, no counting numbers. Reduced-motion users see
          the same table.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. The semantics, export, and keyboard path are complete and tested.
        It is a display instrument: it does not parse files, infer units, or
        edit values. Pair it with Quantity Input for entry and with Import Mapper
        (planned) for intake.
      </p>
    </article>
  );
}
