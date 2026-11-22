import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DoseResponseDemo } from "@/registry/default/examples/dose-response-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Dose–Response Curve",
  description:
    "A 4PL dose–response curve with replicates, SD bars, a confidence band, IC50/EC50, keyboard inspection, a data table, and CSV export.",
};

export default function DoseResponsePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Life sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Dose–Response Curve
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A half-max is a summary of a shape. Keep the replicate reads, the
        low- and high-dose plateaus, and the confidence band in view — then
        decide whether the number is worth reporting.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <DoseResponseDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A synthetic ten-point viability series for a fictional compound,
        <span className="font-mono text-xs"> AP-17</span>, in HeLa cells. Three
        replicates per dose, one missed read, and a fitted IC50 of{" "}
        <span className="font-mono text-xs">0.405 µM</span>. Switch between log
        and linear, hide the replicate points, hover the chart or focus it and
        use the arrow keys, open the data table, or export the CSV.
      </p>

      <CodeBlock
        code={`import { DoseResponseCurve } from "@/components/instruments/dose-response-curve";

<DoseResponseCurve
  data={{
    id: "AP17-HELA-72H",
    name: "Compound AP-17 viability",
    compound: "AP-17",
    cellLine: "HeLa",
    doseUnit: "µM",
    responseLabel: "Viability",
    responseUnit: "%",
    replicates: [
      { id: "a1", label: "A1" },
      { id: "a2", label: "A2" },
      { id: "a3", label: "A3" },
    ],
    points: [
      { dose: 0.001, values: [99.52, 98.79, 100.57] },
      { dose: 0.003, values: [97.49, 97.4, 99.65] },
      // …
    ],
  }}
  onExport={(csv) => track("dose-response-export", csv.length)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Replicates stay visible.</strong> Each
          dose shows the individual reads, the mean, and a ±1 sample SD bar. The
          table reports the reads, mean, SD, and{" "}
          <span className="font-mono text-xs">n</span> per dose. A dose with one
          read has no SD.
        </li>
        <li>
          <strong className="font-medium">A missed read is a gap.</strong>{" "}
          <span className="font-mono text-xs">null</span> is never filled with
          zero, the mean, or an interpolated value. It appears as{" "}
          <span className="font-mono">—</span> in the table and as an empty cell
          in the CSV.
        </li>
        <li>
          <strong className="font-medium">The fit reports its shape.</strong>{" "}
          The instrument fits a four-parameter logistic curve to the dose means
          and reports the low-dose plateau, high-dose plateau, Hill slope,
          half-maximal concentration, R², and the number of points used.
        </li>
        <li>
          <strong className="font-medium">The direction changes the name.</strong>{" "}
          A falling curve is inhibition and reports an{" "}
          <span className="font-mono text-xs">IC50</span>. A rising curve is
          stimulation and reports an{" "}
          <span className="font-mono text-xs">EC50</span>. The Hill slope stays
          positive; the plateaus carry the orientation.
        </li>
        <li>
          <strong className="font-medium">The band is a fit band.</strong> The
          shaded 95% band is a confidence band for the fitted mean response, not
          a prediction interval for a new well. It is asymmetric in dose because
          the fit is done in log space.
        </li>
        <li>
          <strong className="font-medium">The export is the data.</strong> CSV
          columns carry every raw read, the mean, SD, count, and the fitted
          response — not the plotted coordinates. Labels containing commas or
          quotes are escaped correctly.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How the fit works
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The model is a four-parameter logistic on the mean response at each
        positive dose:
      </p>
      <CodeBlock
        code={`R(d) = R_high + (R_low − R_high) / (1 + 10^(h·(log10(d) − log10(D_half))))

R_low    response as dose → 0
R_high   response as dose → ∞
D_half   half-maximal concentration (IC50 or EC50)
h        positive Hill slope magnitude`}
      />
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The fit needs at least four positive doses with a mean. A vehicle or
          other non-positive dose is kept in the table but excluded from the
          fit and hidden on the log axis.
        </li>
        <li>
          Starting plateaus are the low-dose and high-dose means; the starting
          half-max comes from the first crossing of the midpoint. A
          Levenberg–Marquardt least-squares loop refines the four parameters.
        </li>
        <li>
          The fit must reach R² <span className="font-mono text-xs">0.50</span>{" "}
          to be reported. Below <span className="font-mono text-xs">0.90</span>{" "}
          the instrument says “Check fit” and asks you to inspect the points
          before using the half-max.
        </li>
        <li>
          The 95% interval for the half-max is computed on the{" "}
          <span className="font-mono text-xs">log10</span> scale from the
          covariance of the four parameters, then exponentiated. The band uses
          the delta method at each plotted dose.
        </li>
        <li>
          The fit is unweighted and uses one mean per dose. It does not model
          plate effects, drift, or unequal variance between doses.
        </li>
      </ul>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        A tight interval does not make a curve correct. Check the design,
        background correction, normalization, and the fit residuals before
        reporting a half-max — especially when the top or bottom plateau is not
        reached.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Data in.</strong>{" "}
          <span className="font-mono text-xs">data</span> is null or an object
          with an <span className="font-mono text-xs">id</span>, a name,{" "}
          <span className="font-mono text-xs">replicates</span>, and{" "}
          <span className="font-mono text-xs">points</span>. Optional fields add
          compound, cell line, duration, instrument, units, and source. Null or
          all-missing data renders the empty state.
        </li>
        <li>
          <strong className="font-medium">One array per replicate.</strong> Each
          dose carries <span className="font-mono text-xs">values</span> in the
          same order as <span className="font-mono text-xs">replicates</span>. A
          null or non-finite reading is a missed read. Points are sorted by
          dose; non-finite doses are ignored.
        </li>
        <li>
          <strong className="font-medium">Units are explicit.</strong>{" "}
          <span className="font-mono text-xs">doseUnit</span> defaults to{" "}
          <span className="font-mono text-xs">µM</span>;{" "}
          <span className="font-mono text-xs">responseLabel</span> defaults to{" "}
          <span className="font-mono text-xs">Viability</span> and{" "}
          <span className="font-mono text-xs">responseUnit</span> to{" "}
          <span className="font-mono text-xs">%</span>. They appear on the axes,
          in the statistics, and in the CSV header.
        </li>
        <li>
          <strong className="font-medium">Fit thresholds are adjustable.</strong>{" "}
          Pass{" "}
          <span className="font-mono text-xs">
            fitOptions=&#123;&#123; minPoints: 6, minRSquared: 0.9 &#125;&#125;
          </span>{" "}
          to tighten or relax the analysis. Pass{" "}
          <span className="font-mono text-xs">showFit=&#123;false&#125;</span>{" "}
          to hide the fit and show only the reads.
        </li>
        <li>
          <strong className="font-medium">Display controls are local.</strong>{" "}
          <span className="font-mono text-xs">defaultScale</span> and{" "}
          <span className="font-mono text-xs">defaultShowReplicates</span> set
          the initial view. The scale, replicate toggle, and table state are
          owned by the component; the data is never mutated.
        </li>
        <li>
          <strong className="font-medium">Export is observable.</strong>{" "}
          <span className="font-mono text-xs">onExport(csv)</span> fires before
          the browser download, so a host can log, validate, or replace the
          file. The component does not upload anything.
        </li>
        <li>
          <strong className="font-medium">Pure helpers are exported.</strong>{" "}
          <span className="font-mono text-xs">summarizeDoseResponse</span>,{" "}
          <span className="font-mono text-xs">fitDoseResponse</span>,{" "}
          <span className="font-mono text-xs">predictDoseResponse</span>,{" "}
          <span className="font-mono text-xs">doseResponseBand</span>, and{" "}
          <span className="font-mono text-xs">doseResponseCsv</span>. Use them
          in a notebook, a validation script, or your own pipeline.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The chart exposes a slider role with the current dose, mean, SD, count,
          and fitted response as its value text. Arrow keys, Home, and End work
          without a pointer.
        </li>
        <li>
          On a log axis the cursor skips non-positive doses, so every focused
          value is visible on the chart. The table still contains every row.
        </li>
        <li>
          A screen-reader summary states the replicate count, dose range,
          half-max and interval, fit direction and R², and missed reads.
        </li>
        <li>
          The data table is a real table with column headers and an explicit{" "}
          <span className="font-mono">—</span> for missing values. It is
          toggleable on screen and shown in print.
        </li>
        <li>
          Status is never color alone: the fit label says “Good fit”, “Check
          fit”, “No fit”, or “Hidden”, and the missing-read count is text.
        </li>
        <li>
          Layout uses logical properties and container queries. At 320 px the
          analysis moves below the chart without a page-level horizontal
          scroll.
        </li>
        <li>
          There are no entrance animations or counting numbers. Reduced-motion
          users see the same chart immediately.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The rendering, helpers, keyboard path, and export are complete and
        tested. The defaults still need a domain-advisor review: blank
        correction, normalization to vehicle, whether to fit means or all
        replicate points, weighting, shared or fixed Hill slopes, the R²
        threshold, and the confidence-interval convention. Treat this
        instrument as usable, not final. The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/growth-curve"
        >
          Growth Curve
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/sequence-viewer"
        >
          Sequence Viewer
        </Link>{" "}
        carry the same preview status.
      </p>
    </article>
  );
}
