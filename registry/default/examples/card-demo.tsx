import { Badge } from "@/registry/default/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/registry/default/ui/card";

export function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Magnetic susceptibility</CardTitle>
        <CardDescription>Run 12 · 24 samples</CardDescription>
      </CardHeader>
      <CardPanel>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Mean χ</dt>
            <dd className="mt-0.5 tabular-nums">3.42 × 10⁻⁶ m³/kg</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Std. dev.</dt>
            <dd className="mt-0.5 tabular-nums">0.18 × 10⁻⁶ m³/kg</dd>
          </div>
        </dl>
      </CardPanel>
      <CardFooter>
        <Badge variant="success">Complete</Badge>
      </CardFooter>
    </Card>
  );
}
