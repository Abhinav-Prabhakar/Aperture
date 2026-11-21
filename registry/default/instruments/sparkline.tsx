import type * as React from "react";
import { cn } from "@/registry/default/lib/utils";

export type SparklineProps = Omit<
  React.ComponentProps<"svg">,
  "children" | "values"
> & {
  /** Values in x order. Non-finite values are skipped. */
  values: readonly number[];
  /** Fixed y domain. Defaults to the observed range, padded when flat. */
  domain?: readonly [number, number];
  /** Screen-reader label for the series. */
  label?: string;
  /** Formats values in the accessible summary and tooltip. */
  formatValue?: (value: number) => string;
  /** Stroke width in screen pixels. */
  strokeWidth?: number;
  /** Draw a dot at the last value. */
  showLast?: boolean;
};

function defaultFormat(value: number): string {
  return Number(value.toPrecision(4)).toString();
}

export function Sparkline({
  values,
  domain,
  label = "Trend",
  formatValue = defaultFormat,
  strokeWidth = 1.25,
  showLast = true,
  className,
  ...props
}: SparklineProps): React.ReactElement {
  const points = values.filter((value) => Number.isFinite(value));
  const width = 132;
  const height = 32;

  if (points.length === 0) {
    return (
      <span
        aria-label={`${label}: no data`}
        className={cn(
          "inline-flex h-8 items-center text-muted-foreground text-xs",
          className,
        )}
        data-slot="sparkline-empty"
        role="img"
      >
        —
      </span>
    );
  }

  const observedMin = Math.min(...points);
  const observedMax = Math.max(...points);
  const observedSpan = observedMax - observedMin;

  const [min, max] = domain ?? [
    observedSpan === 0 ? observedMin - 1 : observedMin,
    observedSpan === 0 ? observedMax + 1 : observedMax,
  ];
  const span = max - min || 1;

  const coordinates = points.map((value, index) => {
    const x =
      points.length === 1
        ? width / 2
        : (index / (points.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((value - min) / span) * (height - 4);
    return { x, y };
  });

  const path = coordinates
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
    )
    .join(" ");

  const last = coordinates.at(-1);
  const firstValue = points[0];
  const lastValue = points[points.length - 1];
  const summary = `${label}: ${formatValue(firstValue)} to ${formatValue(
    lastValue,
  )}, low ${formatValue(observedMin)}, high ${formatValue(
    observedMax,
  )}, ${points.length} points`;

  return (
    <svg
      aria-label={summary}
      className={cn("h-8 w-33 overflow-visible text-foreground", className)}
      data-slot="sparkline"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      {...props}
    >
      <title>{summary}</title>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      {showLast && last ? (
        <circle
          cx={last.x}
          cy={last.y}
          fill="currentColor"
          r="1.75"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}
