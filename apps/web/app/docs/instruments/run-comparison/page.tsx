import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { RunComparisonDemo } from "@/registry/default/examples/run-comparison-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Run Comparison",
  description:
    "A unit-aware side-by-side diff of run parameters and metrics, with deltas, tolerances, missing values, and an explicit refusal to subtract across units.",
};

export default function RunComparisonPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Run Comparison
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        "Which run was better?" is usually answered from memory. A text diff
        cannot help: it does not know that 6100 psi and 420 bar are the same kind
        of quantity in different clothes, or that a 0.02 mL/min change is noise
        while a 2 min gradient change is not.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <RunComparisonDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Two AU5800 runs. Column temperature, injection volume, and wavelength
        match. Flow rate and gradient moved, so retention, resolution, and plate
        count moved with them. Carryover exists in one run only. Pressure is
        recorded in bar and psi, so no delta is computed — the row says{" "}
        <em>unit mismatch</em> instead of inventing a number.
      </p>

      <CodeBlock
        code={`import { RunComparison } from "@/components/instruments/run-comparison";

<RunComparison
  title="Method transfer check"
  runs={[
    {
      id: "RUN-118", label: "Run 118", startedAt: "2026-11-02 08:14",
      parameters: {
        "flow rate": { value: 0.30, unit: "mL/min" },
        "gradient length": { value: 12, unit: "min" },
        "system pressure": { value: 420, unit: "bar" },
      },
      metrics: {
        "retention time": { value: 6.42, unit: "min" },
        "resolution (2:1)": { value: 1.8 },
      },
    },
    {
      id: "RUN-119", label: "Run 119", startedAt: "2026-11-09 08:11",
      parameters: {
        "flow rate": { value: 0.32, unit: "mL/min" },
        "gradient length": { value: 14, unit: "min" },
        "system pressure": { value: 6100, unit: "psi" },
      },
      metrics: {
        "retention time": { value: 6.51, unit: "min" },
        "resolution (2:1)": { value: 1.6 },
      },
    },
  ]}
  options={{ relativeTolerance: 0.001 }}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Never subtract across units.</strong>{" "}
          A bar-to-psi comparison is a unit mismatch, not a delta. The row is
          flagged and the export records the status.
        </li>
        <li>
          <strong className="font-medium">Tolerance is explicit.</strong> A
          change counts when it exceeds the absolute tolerance for that key or
          the relative tolerance for the comparison. The default is 0.1%, shown
          in the toolbar so nobody has to guess.
        </li>
        <li>
          <strong className="font-medium">Missing is its own status.</strong> A
          metric recorded in one run and absent from the other is not "no
          change". It is missing, counted, and visible in the diff.
        </li>
        <li>
          <strong className="font-medium">Only differences, on request.</strong>{" "}
          The toggle hides unchanged keys while the summary keeps the total
          count, so a long parameter list stays reviewable.
        </li>
        <li>
          <strong className="font-medium">More than two runs compare to the first.</strong>{" "}
          The table shows every run and computes the delta between the baseline
          and the latest. The footer names both.
        </li>
        <li>
          <strong className="font-medium">The export is the diff, not the table.</strong>{" "}
          JSON carries the runs and the summary. CSV carries one row per key with
          values, delta, relative change, and status.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it does not claim
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        A changed value is not a regression. The instrument reports differences
        against a tolerance; whether a 0.2 min shift in retention time matters is
        a method question. Set <span className="font-mono text-xs">absoluteTolerance</span>{" "}
        per key when the method defines one, and leave it unset when the
        difference is worth seeing.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Run.</strong>{" "}
          <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">label</span>, optional{" "}
          <span className="font-mono text-xs">startedAt</span> and{" "}
          <span className="font-mono text-xs">instrument</span>, plus{" "}
          <span className="font-mono text-xs">parameters</span> and{" "}
          <span className="font-mono text-xs">metrics</span> records.
        </li>
        <li>
          <strong className="font-medium">Value.</strong> A number with an
          optional unit and uncertainty, or a string, boolean, or null. A null
          value is present-but-empty; an absent key is missing.
        </li>
        <li>
          <strong className="font-medium">Options.</strong>{" "}
          <span className="font-mono text-xs">relativeTolerance</span> (default
          0.001) and{" "}
          <span className="font-mono text-xs">absoluteTolerance</span> keyed by
          parameter or metric name.
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">compareValue</span>,{" "}
          <span className="font-mono text-xs">compareRuns</span>,{" "}
          <span className="font-mono text-xs">comparisonCsv</span>, and{" "}
          <span className="font-mono text-xs">comparisonJson</span> are exported.
        </li>
        <li>
          <strong className="font-medium">Status vocabulary.</strong> Same,
          changed, missing, unit mismatch, and not comparable. The last covers
          values that are neither numeric nor equal, such as a string versus a
          number.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Each section is a table with a caption, row headers for keys, and
          end-aligned tabular numerals.
        </li>
        <li>
          Status is a word with a border and a tone. The unit-mismatch banner
          repeats the count in a sentence.
        </li>
        <li>
          The differences toggle is a pressed button, not a switch with hidden
          state.
        </li>
        <li>
          The table collapses the delta column below 640 px and keeps the status
          visible; missing values stay as an em dash with a title.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. The comparison is deterministic and pure; use{" "}
        <span className="font-mono text-xs">compareRuns</span> in a job summary
        without rendering the table.
      </p>
    </article>
  );
}
