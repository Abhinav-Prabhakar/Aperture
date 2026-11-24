import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { MissingnessMapDemo } from "@/registry/default/examples/missingness-map-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Missingness & Censoring Map",
  description:
    "Column and row completeness with explicit codes for missing, censored, not applicable, and not collected — plus co-missing patterns.",
};

export default function MissingnessMapPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Missingness &amp; Censoring Map
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A heatmap of missing values treats every gap the same. This map does not:
        a sample that was never collected, an assay that was not applicable, a
        value below the detection limit, and a lost aliquot are four different
        facts with four different consequences.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <MissingnessMapDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Twelve samples across nine assays. Haemolysis removes creatinine and
        urea together; IL-6 was never collected at this site; troponin is
        censored rather than missing. The right rail ranks the columns by
        completeness and names the pairs that fail together. Toggle{" "}
        <strong className="font-medium">Incomplete only</strong> to review the
        gaps, or export the coded matrix.
      </p>

      <CodeBlock
        code={`import { MissingnessMap } from "@/components/instruments/missingness-map";

<MissingnessMap
  title="Cohort 12 panel completeness"
  columns={[
    { id: "glucose", label: "Glucose" },
    { id: "creatinine", label: "Creatinine" },
    { id: "il6", label: "IL-6" },
    { id: "troponin", label: "Troponin I" },
  ]}
  codes={[
    { code: "ND", label: "Not determined", kind: "missing" },
    { code: "HEM", label: "Haemolysed sample", kind: "missing" },
    { code: "<LOD", label: "Below detection limit", kind: "censored" },
    { code: "N/A", label: "Visit not applicable", kind: "notApplicable" },
    { code: "NOT_COLLECTED", label: "Assay not collected", kind: "notCollected" },
  ]}
  rows={[
    { id: "S-01", values: { glucose: 5.2, creatinine: 78,
      il6: "NOT_COLLECTED", troponin: { kind: "censored" } } },
    { id: "S-02", values: { glucose: "HEM", creatinine: "HEM",
      il6: 1.8, troponin: { kind: "censored" } } },
  ]}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Censored is a state, not a gap.</strong>{" "}
          A below-limit value is present in the data and absent from the
          numbers. It gets its own glyph, its own count, and its own code on
          export.
        </li>
        <li>
          <strong className="font-medium">Structural gaps are separated.</strong>{" "}
          "Not applicable" and "not collected" are not missing-at-random. The
          map keeps them distinct from a lost measurement so an imputation
          model cannot silently treat them the same.
        </li>
        <li>
          <strong className="font-medium">Codes are declared once.</strong> The
          source vocabulary — <span className="font-mono text-xs">ND</span>,{" "}
          <span className="font-mono text-xs">HEM</span>,{" "}
          <span className="font-mono text-xs">QNS</span> — maps to a kind and a
          label. A string that is not a declared code is a data value, not a
          missing value.
        </li>
        <li>
          <strong className="font-medium">Columns report completeness.</strong>{" "}
          Each assay shows its percentage present, so the weakest column is
          visible before a model is fitted.
        </li>
        <li>
          <strong className="font-medium">Co-missingness is ranked.</strong> The
          three most frequent column pairs missing in the same rows are listed.
          That is how a haemolysis pattern or a site-level omission shows up.
        </li>
        <li>
          <strong className="font-medium">The export carries codes, not values.</strong>{" "}
          A completeness matrix can be shared with a reviewer or a statistician
          without disclosing a single measurement.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How cells are resolved
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          A number is present. A string that matches a declared code takes that
          code's kind; any other string is present.
        </li>
        <li>
          <span className="font-mono text-xs">null</span>,{" "}
          <span className="font-mono text-xs">undefined</span>, and{" "}
          <span className="font-mono text-xs">""</span> resolve to the declared
          missing code, or to a generic missing state when none is declared.
        </li>
        <li>
          An object <span className="font-mono text-xs">{"{ kind, code?, note? }"}</span>{" "}
          overrides inference. Use it when the same token means different things
          in different columns.
        </li>
        <li>
          Censoring detection is opt-in: a value is censored when the cell says
          so or matches a censored code. The map does not infer a limit from a
          number.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Columns and rows.</strong> Columns need
          an id and a label. Rows need an id and a values record. A missing key
          is treated as missing, not as an error.
        </li>
        <li>
          <strong className="font-medium">Codes.</strong> Each code has{" "}
          <span className="font-mono text-xs">code</span>,{" "}
          <span className="font-mono text-xs">label</span>, and{" "}
          <span className="font-mono text-xs">kind</span>. Kind is one of{" "}
          <span className="font-mono text-xs">missing</span>,{" "}
          <span className="font-mono text-xs">censored</span>,{" "}
          <span className="font-mono text-xs">notApplicable</span>, or{" "}
          <span className="font-mono text-xs">notCollected</span>;{" "}
          <span className="font-mono text-xs">present</span> is inferred.
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">summarizeMissingness</span> and{" "}
          <span className="font-mono text-xs">missingnessCsv</span> are exported,
          along with the default codes and glyph map, so a validator and the UI
          agree.
        </li>
        <li>
          <strong className="font-medium">Co-missingness</strong> counts{" "}
          <span className="font-mono text-xs">missing</span> and{" "}
          <span className="font-mono text-xs">notCollected</span> together.{" "}
          Censored values are excluded: they were measured, just not above the
          limit.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The matrix is a table with column headers, row headers, and a caption.
          Every cell has an accessible label naming the record, the column, the
          state, and any note.
        </li>
        <li>
          State is carried by a glyph and a border style before it is carried by
          color. The legend repeats both.
        </li>
        <li>
          The compact 1.25 rem cells are below the 24 px target size, so the
          table is a review surface rather than a touch control surface; there
          are no clickable cells to miss.
        </li>
        <li>
          Vertical column labels are marked up as ordinary header text; only the
          visual rendering is rotated. Screen readers announce the label
          normally.
        </li>
        <li>
          The map scrolls inside its own container at narrow widths; the page
          does not.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. It deliberately does not impute, test missingness mechanisms, or
        draw a correlation matrix. Those are analysis decisions; this instrument
        makes the pattern visible and the vocabulary explicit.
      </p>
    </article>
  );
}
