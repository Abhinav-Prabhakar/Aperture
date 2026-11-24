import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CalibrationQcDemo } from "@/registry/default/examples/calibration-qc-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Calibration & QC Panel",
  description:
    "Standards, blanks, a linear calibration fit, LOD and LOQ, a Levey–Jennings chart, Westgard rules, and an explicit release verdict.",
};

export default function CalibrationQcPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Calibration &amp; QC Panel
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A calibration line is a claim that the instrument still measures what it
        says it measures. This panel puts the standards, the blanks, the limits,
        and the control chart next to a verdict, so a failed run cannot be
        released by accident.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <CalibrationQcDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Six standards, five blanks, ten weekly controls. The curve is excellent
        — r² rounds to 1.0000 — but the 19 October control sits 4 SD above the
        mean, so
        the 1-3s rule fires and the verdict is <strong>Reject</strong>. That is
        the point: a good line does not rescue a drifting control.
      </p>

      <CodeBlock
        code={`import { CalibrationQcPanel } from "@/components/instruments/calibration-qc";

<CalibrationQcPanel
  data={{
    id: "CAL-2026-11-04-AU5800",
    name: "Cortisol calibration and QC",
    analyte: "Cortisol",
    unit: "ng/mL",
    responseUnit: "mAU·s",
    standards: [
      { level: 0, response: 118, uncertainty: 8 },
      { level: 0.5, response: 612, uncertainty: 9 },
      { level: 10, response: 10120, uncertainty: 18 },
    ],
    blanks: [112, 118, 105, 109, 114],
    controls: [
      { at: "2026-10-12", value: 1004 },
      { at: "2026-10-19", value: 1120, runId: "RUN-117" },
      { at: "2026-10-26", value: 1006 },
    ],
    controlMean: 1000,
    controlSd: 30,
  }}
  options={{ minRSquared: 0.995, maxCv: 5, maxBias: 5 }}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The fit is reported, not hidden.</strong>{" "}
          Slope, intercept, r², predicted values, and residuals for every
          standard. The acceptance threshold is printed next to the verdict.
        </li>
        <li>
          <strong className="font-medium">LOD and LOQ come from the blanks.</strong>{" "}
          <span className="font-mono text-xs">3.3 × SD / |slope|</span> and{" "}
          <span className="font-mono text-xs">10 × SD / |slope|</span>, with the
          blank count and SD shown. Without blanks, the limits are marked
          unestablished rather than guessed.
        </li>
        <li>
          <strong className="font-medium">Control rules are named.</strong>{" "}
          1-3s, 2-2s, R-4s, 4-1s, and 10-x. Each violation lists the rule, the
          date, the value, and a plain-language reason.
        </li>
        <li>
          <strong className="font-medium">The verdict combines curve and controls.</strong>{" "}
          A failed r² or any Westgard rejection rejects the run. A CV or bias
          above the limit, or missing blanks, moves it to review.
        </li>
        <li>
          <strong className="font-medium">The chart marks the failures.</strong>{" "}
          Control points that violate a rule are ringed and crossed. The rest of
          the series stays visible; hiding outliers is how drift gets missed.
        </li>
        <li>
          <strong className="font-medium">The CSV carries the evidence.</strong>{" "}
          Standards with predicted values and residuals, blanks, and controls,
          one row each.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How the fit works
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Ordinary least squares</strong> on
          level versus response. No weighting, no forced zero, no outlier
          removal. If the method needs 1/x weighting, it needs a different fit
          and a domain review.
        </li>
        <li>
          <strong className="font-medium">r² is computed from the residuals</strong>{" "}
          against the mean response. A flat response gives r² 0 rather than a
          division by zero.
        </li>
        <li>
          <strong className="font-medium">Controls use the target mean and SD</strong>{" "}
          when provided. Without them, the observed mean and sample SD of the
          plotted points are used, which is a demo convenience, not a validated
          control limit.
        </li>
        <li>
          <strong className="font-medium">Bias needs a target.</strong> Without{" "}
          <span className="font-mono text-xs">controlMean</span>, the panel does
          not invent a bias.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Standards.</strong> Level, response, and
          optional one-sigma response uncertainty. Fewer than two usable
          standards renders the empty state.
        </li>
        <li>
          <strong className="font-medium">Blanks and controls.</strong> Blanks are
          response values. Controls are{" "}
          <span className="font-mono text-xs">{"{ at, value, runId? }"}</span>, in
          chronological order.
        </li>
        <li>
          <strong className="font-medium">Options.</strong>{" "}
          <span className="font-mono text-xs">minRSquared</span> (0.995),{" "}
          <span className="font-mono text-xs">maxCv</span> (5%), and{" "}
          <span className="font-mono text-xs">maxBias</span> (5%).
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">fitLinearCalibration</span>,{" "}
          <span className="font-mono text-xs">calibrationLimits</span>,{" "}
          <span className="font-mono text-xs">evaluateWestgard</span>,{" "}
          <span className="font-mono text-xs">summarizeCalibrationQc</span>, and{" "}
          <span className="font-mono text-xs">calibrationCsv</span> are exported.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Both charts are <span className="font-mono text-xs">role="img"</span>{" "}
          with an accessible label that states the fit, the limits, and the
          violation count. The same numbers are in the definition list and the
          standards table.
        </li>
        <li>
          The verdict is a word and an icon, not a colored bar. The reasons are a
          sentence.
        </li>
        <li>
          Violations are text rows, not only marks on the chart.
        </li>
        <li>
          The layout stacks the chart, statistics, and standards table at 320 px
          inside the component; the page does not scroll sideways.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The fit, the limits, the rules, and the export are complete and tested
        against reference series. The defaults still need a domain-advisor
        review: linear versus weighted fit, blank replicates versus a pooled SD,
        the acceptance thresholds, and the exact Westgard rule set used by a
        given laboratory. Treat this instrument as usable, not final. The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/measurement-table"
        >
          Measurement Table
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/reproducibility-manifest"
        >
          Reproducibility Manifest
        </Link>{" "}
        carry Ready status.
      </p>
    </article>
  );
}
