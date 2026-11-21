import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { SparklineDemo } from "@/registry/default/examples/sparkline-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Sparkline",
  description:
    "An inline time series with a precise screen-reader summary and an honest empty state.",
};

export default function SparklinePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Measurement</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Sparkline
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A shape, not a chart. Use it to show the direction of a short series
        beside a value; use a real plot when the reader needs to read a number
        off an axis.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Display
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <SparklineDemo />
      </div>
      <CodeBlock
        code={`<Sparkline
  label="Concentration over nine runs"
  values={[8.1, 9.4, 10.2, 9.8, 11.6, 12.4, 12.1, 12.9, 12.4]}
/>

<Sparkline label="No readings" values={[]} />`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        The SVG exposes a summary with the first value, last value, minimum,
        maximum, and point count. The empty state announces “no data” instead of
        drawing a misleading flat line.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>No axes, labels, or gridlines. If those are needed, use a plot.</li>
        <li>
          A flat series is not an empty series. The domain is padded so a
          constant value still reads as a line.
        </li>
        <li>Missing readings are skipped; do not interpolate them silently.</li>
        <li>
          Color is inherited from{" "}
          <code className="font-mono">currentColor</code>, so status can be
          encoded around the sparkline without breaking the token contract.
        </li>
        <li>
          Always pass a <code className="font-mono">label</code> that names the
          quantity and the time span.
        </li>
      </ul>
    </article>
  );
}
