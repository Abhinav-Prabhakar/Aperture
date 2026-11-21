import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";

export function StatDemo() {
  return (
    <StatGrid columns={4}>
      <Stat
        hint="n = 24 samples"
        label="Mean χ"
        unit="m³/kg"
        value={<ScientificNumber value={0.00000342} />}
      />
      <Stat
        hint="Across four runs"
        label="Std. dev."
        unit="m³/kg"
        value={<ScientificNumber value={0.00000018} />}
      />
      <Stat
        delta="+2.1%"
        hint="Versus run 11"
        label="Recovery"
        trend="up"
        unit="%"
        value="96.4"
      />
      <Stat
        delta="−0.4%"
        hint="Versus run 11"
        label="Drift"
        trend="down"
        unit="%"
        value="0.8"
      />
    </StatGrid>
  );
}
