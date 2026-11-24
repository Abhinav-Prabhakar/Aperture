import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { StatisticalResultDemo } from "@/registry/default/examples/statistical-result-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Statistical Result Block",
  description:
    "An estimate with its interval, n, test, degrees of freedom, exact p-value, effect size, assumptions, and a plain-language sentence.",
};

export default function StatisticalResultPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Statistical Result Block
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        <span className="font-mono">p &lt; 0.05</span> is a claim with the
        uncertainty removed. This block renders a result the way a statistician
        would insist on: estimate, interval, n, test, effect size, assumptions,
        and the exact p-value.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <StatisticalResultDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        An adjusted mean difference of 0.62 mmol/L with a 95% interval of 0.34
        to 0.90, n = 48, Welch's t-test, and an effect size. The interval strip
        marks the estimate and the null value, so non-overlap is a fact on the
        screen rather than an inference in the reader's head. Use{" "}
        <strong className="font-medium">Copy result</strong> for a sentence that
        can go straight into a draft.
      </p>

      <CodeBlock
        code={`import { StatisticalResultBlock } from "@/components/instruments/statistical-result";

<StatisticalResultBlock
  estimateLabel="Mean difference"
  title="Treatment vs control, week 12"
  result={{
    estimate: 0.62,
    unit: "mmol/L",
    precision: 2,
    interval: { level: 95, lower: 0.34, upper: 0.90 },
    n: 48,
    test: "Welch two-sample t-test",
    statistic: { label: "t", value: 4.31, df: "36.4" },
    p: 0.00011,
    alpha: 0.05,
    effectSize: { label: "Cohen's d", value: 0.71 },
    correction: "Holm–Bonferroni, 4 comparisons",
    assumptions: [
      { name: "Residual normality", status: "met",
        detail: "Shapiro–Wilk p = 0.18" },
      { name: "No unmeasured confounding", status: "notChecked" },
    ],
    method: "Linear model with batch as a fixed effect; HC3 errors.",
    warning: "Observational contrast. The estimate is adjusted, not causal.",
  }}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">A p-value never rounds to zero.</strong>{" "}
          Values below 0.001 render as{" "}
          <span className="font-mono text-xs">p &lt; 0.001</span>. The computed
          value is not replaced by a bold claim.
        </li>
        <li>
          <strong className="font-medium">The interval contains the estimate.</strong>{" "}
          If it does not, the block says so instead of drawing an impossible
          strip. An estimate without an interval is labelled as hiding its
          uncertainty.
        </li>
        <li>
          <strong className="font-medium">The interval and the p-value agree.</strong>{" "}
          An interval that includes the null while{" "}
          <span className="font-mono text-xs">p &lt; α</span> — or excludes it
          while <span className="font-mono text-xs">p ≥ α</span> — is flagged.
          Both are common copy-paste failures.
        </li>
        <li>
          <strong className="font-medium">n is not optional.</strong> A result
          with zero or missing n is called out. So is a p-value outside{" "}
          <span className="font-mono text-xs">[0, 1]</span>.
        </li>
        <li>
          <strong className="font-medium">Assumptions carry a status.</strong>{" "}
          Met, violated, or not checked — each with the test or diagnostic that
          supports it. "Not checked" is a legitimate, visible state; pretending
          otherwise is not.
        </li>
        <li>
          <strong className="font-medium">Everything copies as a sentence.</strong>{" "}
          The copy action produces the estimate, interval, n, test, p, effect
          size, assumptions, and method in plain text, ready for a manuscript or
          a lab meeting note.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        The interval strip
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The small graphic under the estimate is a scale, not a chart. It spans
        the interval with 12% padding, marks the null value with a dashed rule,
        and places the estimate on the line. It exists because "the interval
        excludes zero" is easier to verify than to read. It is hidden from
        assistive technology; the same fact is in the sentence.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Result.</strong>{" "}
          <span className="font-mono text-xs">estimate</span>,{" "}
          <span className="font-mono text-xs">n</span>,{" "}
          <span className="font-mono text-xs">test</span>, and{" "}
          <span className="font-mono text-xs">p</span> are required.{" "}
          <span className="font-mono text-xs">unit</span>,{" "}
          <span className="font-mono text-xs">precision</span>,{" "}
          <span className="font-mono text-xs">interval</span>,{" "}
          <span className="font-mono text-xs">nullValue</span>,{" "}
          <span className="font-mono text-xs">alpha</span>,{" "}
          <span className="font-mono text-xs">effectSize</span>,{" "}
          <span className="font-mono text-xs">correction</span>,{" "}
          <span className="font-mono text-xs">tails</span>,{" "}
          <span className="font-mono text-xs">assumptions</span>,{" "}
          <span className="font-mono text-xs">method</span>, and{" "}
          <span className="font-mono text-xs">warning</span> are optional.
        </li>
        <li>
          <strong className="font-medium">Interval.</strong> Level, lower, upper,
          and kind — confidence, credible, or prediction. The kind is displayed
          verbatim, so a prediction interval is never presented as a confidence
          interval.
        </li>
        <li>
          <strong className="font-medium">Test.</strong> A human-readable name,
          not an enum. The component does not compute the test; it refuses to
          display an unnamed one.
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">formatPValue</span>,{" "}
          <span className="font-mono text-xs">describeStatisticalResult</span>,{" "}
          <span className="font-mono text-xs">resultToText</span>, and{" "}
          <span className="font-mono text-xs">resultWarnings</span> are exported
          and tested against reference values.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The estimate, interval, and p-value are text first. The interval strip
          is decorative and marked{" "}
          <span className="font-mono text-xs">aria-hidden</span>.
        </li>
        <li>
          Assumption status uses a glyph plus a word: ✓ met, × violated, ? not
          checked. Color is the second cue.
        </li>
        <li>
          The copy button reports "Copied" as visible text and does not move
          focus.
        </li>
        <li>
          Units and intervals wrap at narrow widths; the 320 px layout stacks the
          hero and the definition list without a horizontal scroll.
        </li>
        <li>
          No animated number counting. A result should not flicker into place.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. It renders a result; it does not compute one. That boundary is
        deliberate: the statistics belong to the analysis package, and the
        reporting contract belongs here.
      </p>
    </article>
  );
}
