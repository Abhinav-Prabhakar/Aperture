import { Sparkline } from "@/registry/default/instruments/sparkline";

const CONCENTRATION = [8.1, 9.4, 10.2, 9.8, 11.6, 12.4, 12.1, 12.9, 12.4];

export function SparklineDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="grid gap-2">
        <span className="text-muted-foreground text-xs">Concentration</span>
        <Sparkline
          label="Concentration over nine runs"
          values={CONCENTRATION}
        />
      </div>
      <div className="grid gap-2">
        <span className="text-muted-foreground text-xs">Empty</span>
        <Sparkline label="No readings" values={[]} />
      </div>
      <div className="grid gap-2">
        <span className="text-muted-foreground text-xs">Flat</span>
        <Sparkline label="Stable baseline" values={[3, 3, 3, 3]} />
      </div>
    </div>
  );
}
