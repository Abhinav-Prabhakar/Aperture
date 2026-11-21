import type * as React from "react";
import { cn } from "@/registry/default/lib/utils";

const COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export type StatProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What is being measured. Include the unit in the value or a separate unit. */
  label: React.ReactNode;
  /** The value. Pass a ScientificNumber for controlled precision. */
  value: React.ReactNode;
  /** Unit symbol shown after the value. */
  unit?: string;
  /** A signed change, e.g. "+2.1%". */
  delta?: string;
  /** Optional direction for the arrow. Up and down are not inherently good. */
  trend?: "up" | "down" | "flat";
  /** Context: sample size, comparison period, or method. */
  hint?: React.ReactNode;
};

export function Stat({
  label,
  value,
  unit,
  delta,
  trend,
  hint,
  className,
  ...props
}: StatProps): React.ReactElement {
  return (
    <div className={cn("min-w-0", className)} data-slot="stat" {...props}>
      <dl className="grid gap-1">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="font-heading font-semibold text-xl tabular-nums tracking-tight">
            {value}
          </span>
          {unit ? (
            <span className="text-muted-foreground text-xs">{unit}</span>
          ) : null}
          {delta ? (
            <span className="ms-auto inline-flex items-center gap-1 font-mono text-muted-foreground text-xs tabular-nums">
              {trend === "up" ? (
                <span aria-hidden="true">↗</span>
              ) : trend === "down" ? (
                <span aria-hidden="true">↘</span>
              ) : null}
              {delta}
            </span>
          ) : null}
        </dd>
        {hint ? (
          <dd className="text-muted-foreground text-xs leading-relaxed">
            {hint}
          </dd>
        ) : null}
      </dl>
    </div>
  );
}

export type StatGridProps = React.ComponentProps<"div"> & {
  /** Column count at the small breakpoint and above. */
  columns?: keyof typeof COLUMNS;
};

export function StatGrid({
  columns = 4,
  className,
  children,
  ...props
}: StatGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border bg-border",
        "[&>[data-slot=stat]]:bg-background [&>[data-slot=stat]]:p-4",
        COLUMNS[columns],
        className,
      )}
      data-slot="stat-grid"
      {...props}
    >
      {children}
    </div>
  );
}
