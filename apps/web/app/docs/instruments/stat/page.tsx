import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { StatDemo } from "@/registry/default/examples/stat-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Stat",
  description:
    "A compact label/value/unit readout for dashboards, run summaries, and inspectors.",
};

export default function StatPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Measurement</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Stat
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        One number that matters, with its unit and context. Use a grid for a run
        summary; use a table when the values need to be compared row by row.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Stat grid
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <StatDemo />
      </div>
      <CodeBlock
        code={`<StatGrid columns={4}>
  <Stat
    label="Mean χ"
    unit="m³/kg"
    value={<ScientificNumber value={3.42e-6} />}
    hint="n = 24 samples"
  />
  <Stat
    label="Recovery"
    value="96.4"
    unit="%"
    delta="+2.1%"
    trend="up"
    hint="Versus run 11"
  />
</StatGrid>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Put the unit in the value or beside it. A stat without a unit is a
          number, not a measurement.
        </li>
        <li>
          Use the hint for sample size, comparison, or method — not for a second
          value.
        </li>
        <li>
          Up is not good and down is not bad. The arrow shows direction only;
          color and valence are the author’s decision.
        </li>
        <li>
          More than about eight stats in a grid is a table. Switch before the
          reader has to hunt.
        </li>
        <li>
          Pass a <code className="font-mono">ScientificNumber</code> when
          precision matters; pass a string when the value is already formatted.
        </li>
      </ul>
    </article>
  );
}
