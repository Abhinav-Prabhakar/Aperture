import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { ScientificNumberDemo } from "@/registry/default/examples/scientific-number-demo";
import { Badge } from "@/registry/default/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export const metadata: Metadata = {
  title: "Scientific Number",
  description:
    "Display measured values with significant figures, uncertainty, units, and full-precision copy.",
};

export default function ScientificNumberPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Measurement</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Scientific Number
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A measured value is not just a number. It carries precision, a unit, and
        often an uncertainty. This component keeps all three together — and
        keeps the full value within reach.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Display
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <ScientificNumberDemo />
      </div>
      <CodeBlock
        code={`<ScientificNumber value={3.42e-6} unit="m³/kg" />

<ScientificNumber
  value={3.42e-6}
  uncertainty={1.8e-7}
  unit="m³/kg"
/>

<ScientificNumber value={12.4} unit="mm" precision={2} />

<ScientificNumber value={299792458} unit="m/s" copyable />`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Formatting rules
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Situation</TableHead>
              <TableHead>Display</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["0.00000342 with 3 s.f.", "3.42 × 10⁻⁶"],
              ["12.4 ± 0.2", "12.40 ± 0.20 (aligned)"],
              ["−0.01234", "−0.0123 (true minus sign)"],
              ["12 with 3 s.f.", "12.0 (trailing zero kept)"],
              ["1234 with 3 s.f.", "1230"],
              ["No reading", "— (not 0)"],
            ].map(([situation, display]) => (
              <TableRow key={situation}>
                <TableCell className="text-muted-foreground">
                  {situation}
                </TableCell>
                <TableCell className="font-mono text-xs">{display}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Significant figures are a property of the measurement. Do not round
          them away for visual consistency.
        </li>
        <li>
          Put the unit after the value, in muted text. Never bury it in a
          tooltip.
        </li>
        <li>
          Use a true minus sign (−) and a multiplication sign (×), not a hyphen
          and an x.
        </li>
        <li>
          <code className="font-mono">copyable</code> copies the unrounded
          value, its uncertainty, and the unit — enough to reproduce the
          analysis.
        </li>
        <li>
          For tables, right-align values and units; for prose, let the number
          flow inline.
        </li>
      </ul>
    </article>
  );
}
