import type { Metadata } from "next";
import { Badge } from "@/registry/default/ui/badge";
import { CodeBlock } from "@/components/code-block";
import {
  AsymmetricUncertaintyDemo,
  UncertaintyInputDemo,
} from "@/registry/default/examples/uncertainty-input-demo";

export const metadata: Metadata = {
  title: "Uncertainty Input",
  description:
    "A measurement input that keeps its error term: symmetric or asymmetric uncertainty, with the reported form shown before it is saved.",
};

export default function UncertaintyInputPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Measurement</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Uncertainty Input
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A number without an error is not a measurement. This input keeps the
        value and its uncertainty together, and shows the exact form that will be
        saved.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Symmetric
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <UncertaintyInputDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        The reported form follows the uncertainty, not the typed text: 12.47 with
        an error of 0.32 is displayed as 12.5 ± 0.3. Pass{" "}
        <code className="font-mono">precision</code> only when the protocol fixes
        the number of decimal places.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Asymmetric
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <AsymmetricUncertaintyDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Pass{" "}
        <code className="font-mono">
          {"{ lower: 1.5, upper: 1.8 }"}
        </code>{" "}
        for half-widths, not interval endpoints. Both must be non-negative, and
        the pair is entered or cleared together.
      </p>

      <CodeBlock
        code={`const [value, setValue] = useState<number | null>(12.47);
const [uncertainty, setUncertainty] =
  useState<UncertaintyValue | null>(0.32);

<UncertaintyInput
  label="Concentration"
  unit="µg/mL"
  value={value}
  uncertainty={uncertainty}
  onValueChange={setValue}
  onUncertaintyChange={setUncertainty}
  hint="Standard deviation of three technical replicates."
/>

// Asymmetric: lower and upper half-widths.
<UncertaintyInput
  label="Half-life"
  unit="h"
  value={14.2}
  uncertainty={{ lower: 1.5, upper: 1.8 }}
  onValueChange={() => {}}
  onUncertaintyChange={() => {}}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Store value and uncertainty as numbers in the same unit. Formatting is
          a view; it must never be parsed back into the saved record.
        </li>
        <li>
          One or two significant digits on the uncertainty is the convention
          here. Do not report more precision in the value than the error
          supports.
        </li>
        <li>
          An asymmetric error is a pair of half-widths. If your source reports
          interval endpoints, convert once at the boundary and test it.
        </li>
        <li>
          Zero uncertainty and unknown uncertainty are different states. Zero
          means exact — an integer count, a defined constant — and is displayed
          without a ± term. Unknown is <code className="font-mono">null</code>.
        </li>
        <li>
          The preview is the contract. If the reported form would lose a
          trailing zero or change the order of magnitude, fix the formatting
          before saving.
        </li>
        <li>
          Validation appears on blur, not on every keystroke. Typing “-” is not
          an error until the field is left.
        </li>
      </ul>
    </article>
  );
}
