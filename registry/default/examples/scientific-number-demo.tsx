import { ScientificNumber } from "@/registry/default/instruments/scientific-number";

export function ScientificNumberDemo() {
  return (
    <div className="grid gap-3 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">Default</span>
        <ScientificNumber unit="m³/kg" value={0.00000342} />
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">With uncertainty</span>
        <ScientificNumber
          uncertainty={0.00000018}
          unit="m³/kg"
          value={0.00000342}
        />
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">Fixed precision</span>
        <ScientificNumber precision={2} unit="mm" value={12.4} />
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">Copyable</span>
        <ScientificNumber copyable unit="m/s" value={299792458} />
      </div>
    </div>
  );
}
