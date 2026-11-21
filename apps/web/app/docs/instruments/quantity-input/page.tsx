import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { QuantityInputDemo } from "@/registry/default/examples/quantity-input-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Quantity Input",
  description:
    "An input for measured values: number, unit, conversion, uncertainty, and validation.",
};

export default function QuantityInputPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Measurement</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Quantity Input
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A value, its unit, and its uncertainty entered together. Changing the
        unit converts the number instead of relabeling it.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <QuantityInputDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Try <code className="font-mono">mg/L</code> →{" "}
        <code className="font-mono">µg/mL</code>. The value and its uncertainty
        convert; the number is never silently relabeled.
      </p>

      <CodeBlock
        code={`const [value, setValue] = useState<number | null>(12.4);
const [unit, setUnit] = useState("mg/L");
const [uncertainty, setUncertainty] = useState<number | null>(0.2);

<QuantityInput
  label="Concentration"
  value={value}
  unit={unit}
  units={["mg/L", "µg/mL", "g/L"]}
  uncertainty={uncertainty}
  onValueChange={setValue}
  onUnitChange={setUnit}
  onUncertaintyChange={setUncertainty}
  hint="Reported as mean ± standard deviation."
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Anatomy
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Part
              </th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Behavior
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Numeric field",
                "Accepts decimals and exponent notation; keeps intermediate text while typing.",
              ],
              [
                "Unit menu",
                "Converts the value and uncertainty on change. Incompatible units are rejected.",
              ],
              [
                "Uncertainty field",
                "Optional. Absolute, in the same unit. Negative values are rejected.",
              ],
              [
                "Hint",
                "Names the uncertainty kind: SD, SEM, 95% CI, or range.",
              ],
              [
                "Error",
                "Empty, non-numeric, out of range, or external. Never silently clamps.",
              ],
            ].map(([part, behavior]) => (
              <tr className="border-b last:border-0" key={part}>
                <td className="px-3 py-3 font-mono text-xs">{part}</td>
                <td className="px-3 py-3 text-muted-foreground">{behavior}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>Missing is not zero. Empty stays empty and is reported as null.</li>
        <li>Name the uncertainty kind. “± 0.2” alone is ambiguous.</li>
        <li>
          Precision is a display choice. Keep the underlying value at full
          precision.
        </li>
        <li>
          Do not clamp silently. If a value is out of range, show the error and
          let the researcher decide.
        </li>
        <li>
          A unit menu is a promise: every option must be dimensionally
          compatible.
        </li>
      </ul>
    </article>
  );
}
