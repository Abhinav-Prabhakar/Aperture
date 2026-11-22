import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { GrowthCurveDemo } from "@/registry/default/examples/growth-curve-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Growth Curve",
  description:
    "OD/time with replicates, a mean and SD band, log-phase detection, keyboard inspection, a data table, and CSV export.",
};

export default function GrowthCurvePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Life sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Growth Curve
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A growth curve is replicates, time, and uncertainty — not a single
        line. Keep the reads together on log or linear axes, see where the
        exponential phase actually is, and export the numbers behind the
        picture.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <GrowthCurveDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A synthetic <span className="font-mono text-xs">E. coli</span> curve with
        a lag, exponential phase, and stationary phase across three wells. Two
        reads are missing. Switch between log and linear, hide the replicate
        traces, hover the chart or focus it and use the arrow keys, open the
        data table, or export the CSV.
      </p>

      <CodeBlock
        code={`import { GrowthCurve } from "@/components/instruments/growth-curve";

<GrowthCurve
  data={{
    id: "EC-BW-LB-37",
    name: "E. coli BW25113 growth",
    strain: "BW25113",
    medium: "LB",
    temperatureC: 37,
    replicates: [
      { id: "a1", label: "A1" },
      { id: "a2", label: "A2" },
      { id: "a3", label: "A3" },
    ],
    timepoints: [
      { time: 0, values: [0.019, 0.02, 0.019] },
      { time: 0.5, values: [0.02, null, 0.021] },
      { time: 1, values: [0.022, 0.023, 0.021] },
      // …
    ],
  }}
  onExport={(csv) => track("growth-curve-export", csv.length)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Replicates stay visible.</strong> The
          mean is the solid line, the band is ±1 sample standard deviation, and
          each well keeps its own trace. The table reports the mean, SD, and{" "}
          <span className="font-mono text-xs">n</span> at every time point. A
          single read has no SD and no band.
        </li>
        <li>
          <strong className="font-medium">A missed read is a gap.</strong>{" "}
          <span className="font-mono text-xs">null</span> breaks the trace and
          appears as <span className="font-mono">—</span> in the table and an
          empty cell in the CSV. It is never filled with zero or interpolated
          silently.
        </li>
        <li>
          <strong className="font-medium">Log phase is a fit, not a label.</strong>{" "}
          The instrument fits{" "}
          <span className="font-mono text-xs">ln(mean)</span> against time over
          a candidate window and reports the doubling time, growth rate, R²,
          and the number of points used. The shaded window is a starting point
          for review, not a conclusion.
        </li>
        <li>
          <strong className="font-medium">The scale changes the view, not the
          data.</strong>{" "}
          Log is the default because exponential growth is a straight line
          there. Linear is one click away. Non-positive reads cannot be drawn
          on a log axis; they are counted, hidden with a warning, and kept in
          the table.
        </li>
        <li>
          <strong className="font-medium">Every point is inspectable.</strong>{" "}
          The chart behaves as a slider over time points. Arrow keys, Home, and
          End move the cursor; the readout and the accessible value report the
          time, mean ± SD, and <span className="font-mono text-xs">n</span>.
        </li>
        <li>
          <strong className="font-medium">The export is the data.</strong> CSV
          columns carry the raw replicate readings, mean, SD, and count — not
          the plotted coordinates. Labels containing commas or quotes are
          escaped correctly.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How log phase is detected
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The fit is ordinary least squares on{" "}
        <span className="font-mono text-xs">ln(mean OD)</span> against time:
      </p>
      <CodeBlock
        code={`ln(OD) = ln(OD₀) + μ·t
doubling time = ln(2) / μ`}
      />
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Candidate windows need at least four consecutive positive means and
          an R² of at least <span className="font-mono text-xs">0.97</span>.
        </li>
        <li>
          A window may not begin or end in a phase whose local growth rate is
          less than half the fitted rate. This keeps a flat lag point from
          widening the window just because it raises R².
        </li>
        <li>
          Among the windows close to the best R², the longest one wins. The
          default tolerance is <span className="font-mono text-xs">0.003</span>.
        </li>
        <li>
          Override the heuristic with an explicit window when you know the
          experiment:{" "}
          <span className="font-mono text-xs">
            logPhase=&#123;&#123; start: 2, end: 7 &#125;&#125;
          </span>
          . Pass{" "}
          <span className="font-mono text-xs">showLogPhase=&#123;false&#125;</span>{" "}
          to hide the analysis entirely.
        </li>
      </ul>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        A high R² does not make a window biologically correct. Check the
        boundaries against the design of the experiment before reporting a
        doubling time — especially when the lag and exponential phases are not
        sharply separated.
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
          <span className="font-mono text-xs">timepoints</span>. Optional fields
          add strain, medium, temperature, instrument, units, and source. Null
          or all-missing data renders the empty state.
        </li>
        <li>
          <strong className="font-medium">One array per replicate.</strong>{" "}
          Each time point carries{" "}
          <span className="font-mono text-xs">values</span> in the same order as{" "}
          <span className="font-mono text-xs">replicates</span>. A null or
          non-finite reading is a missed read. Time points are sorted by time;
          non-finite times are ignored.
        </li>
        <li>
          <strong className="font-medium">Units are explicit.</strong>{" "}
          <span className="font-mono text-xs">timeUnit</span> defaults to{" "}
          <span className="font-mono text-xs">h</span>;{" "}
          <span className="font-mono text-xs">valueLabel</span> defaults to{" "}
          <span className="font-mono text-xs">OD600</span>. Both appear on the
          axes, in the statistics, and in the CSV header.
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
          <span className="font-mono text-xs">summarizeGrowthCurve</span>,{" "}
          <span className="font-mono text-xs">fitLogPhase</span>,{" "}
          <span className="font-mono text-xs">detectLogPhase</span>, and{" "}
          <span className="font-mono text-xs">growthCurveCsv</span>. Use them in
          a notebook, a validation script, or your own pipeline.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The chart exposes a slider role with the current time, mean, SD, and
          count as its value text. Arrow keys, Home, and End work without a
          pointer.
        </li>
        <li>
          A screen-reader summary states the replicate count, time range, fitted
          window, doubling time, R², and missed reads.
        </li>
        <li>
          The data table is a real table with column headers and an explicit{" "}
          <span className="font-mono">—</span> for missing values. It is
          toggleable on screen and shown in print.
        </li>
        <li>
          Status is never color alone: the missing-read count and the
          non-positive warning are text, and the log-phase badge says
          “Detected” or “Not detected.”
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
        correction, the R² threshold, the lag-phase boundary, and the
        doubling-time convention. Treat this instrument as usable, not final.
        The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/sequence-viewer"
        >
          Sequence Viewer
        </Link>{" "}
        carries the same preview status.
      </p>
    </article>
  );
}
