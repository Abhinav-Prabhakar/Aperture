"use client";

import {
  DownloadIcon,
  FlaskConicalIcon,
  Table2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export type GrowthCurveReplicate = {
  id: string;
  label: string;
};

export type GrowthCurveTimepoint = {
  /** Elapsed time in `data.timeUnit`. */
  time: number;
  /** One reading per replicate, in `data.replicates` order. Null is a missed read. */
  values: readonly (number | null)[];
};

export type GrowthCurveData = {
  id: string;
  name: string;
  description?: string;
  strain?: string;
  medium?: string;
  temperatureC?: number;
  instrument?: string;
  /** Measured quantity. Default "OD600". */
  valueLabel?: string;
  /** Elapsed-time unit. Default "h". */
  timeUnit?: string;
  replicates: readonly GrowthCurveReplicate[];
  timepoints: readonly GrowthCurveTimepoint[];
  source?: string;
};

export type GrowthCurveSummary = {
  time: number;
  /** Readings in replicate order; non-finite values become null. */
  values: readonly (number | null)[];
  mean: number | null;
  /** Sample standard deviation. Null when fewer than two reads. */
  sd: number | null;
  n: number;
  min: number | null;
  max: number | null;
};

export type LogPhaseFit = {
  /** Requested window, in time units. */
  start: number;
  end: number;
  intercept: number;
  /** Natural-log growth rate per time unit. */
  slope: number;
  doublingTime: number;
  rSquared: number;
  /** Number of time points used in the fit. */
  points: number;
};

export type LogPhaseOptions = {
  /** Minimum time points in a candidate window. Default 4. */
  minPoints?: number;
  /** Minimum coefficient of determination. Default 0.97. */
  minRSquared?: number;
  /** How far below the best R² a longer window may sit. Default 0.003. */
  tolerance?: number;
};

export type GrowthCurveProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  data: GrowthCurveData | null;
  /** Explicit log-phase window. Auto-detected when omitted. */
  logPhase?: { start: number; end: number };
  /** Disable log-phase shading, fit, and statistics. Default true. */
  showLogPhase?: boolean;
  /** Draw each replicate trace. Default true. */
  defaultShowReplicates?: boolean;
  /** Initial y-axis scale. Default "log". */
  defaultScale?: "log" | "linear";
  emptyLabel?: React.ReactNode;
  /** Called with the CSV before the browser download starts. */
  onExport?: (csv: string) => void;
};

const TIME_FALLBACK = "h";
const VALUE_FALLBACK = "OD600";
const CHART_HEIGHT = 272;
const LOG_TICK_FACTORS = [1, 2, 5] as const;
const NUMBER = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 3,
});
const SERIES_COLOR = "var(--color-chart-5)";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatValue(value: number): string {
  return NUMBER.format(value);
}

function formatRange(start: number, end: number, unit: string): string {
  return start === end
    ? `${formatValue(start)} ${unit}`
    : `${formatValue(start)}–${formatValue(end)} ${unit}`;
}

function sampleSd(values: readonly number[], mean: number): number | null {
  if (values.length < 2) {
    return null;
  }
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

export function summarizeGrowthCurve(
  data: GrowthCurveData,
): GrowthCurveSummary[] {
  return [...data.timepoints]
    .filter((point) => isFiniteNumber(point.time))
    .sort((left, right) => left.time - right.time)
    .map((point) => {
      const values = data.replicates.map((_, index) => {
        const value = point.values[index];
        return isFiniteNumber(value) ? value : null;
      });
      const present = values.filter(isFiniteNumber);
      const n = present.length;
      const mean =
        n === 0
          ? null
          : present.reduce((sum, value) => sum + value, 0) / present.length;

      return {
        max: n === 0 ? null : Math.max(...present),
        mean,
        min: n === 0 ? null : Math.min(...present),
        n,
        sd: mean === null ? null : sampleSd(present, mean),
        time: point.time,
        values,
      };
    });
}

export function fitLogPhase(
  summaries: readonly GrowthCurveSummary[],
  start: number,
  end: number,
): LogPhaseFit | null {
  const points = summaries
    .filter(
      (point) =>
        point.time >= start &&
        point.time <= end &&
        point.mean !== null &&
        point.mean > 0,
    )
    .sort((left, right) => left.time - right.time);

  if (points.length < 2) {
    return null;
  }

  const xs = points.map((point) => point.time);
  const ys = points.map((point) => Math.log(point.mean as number));
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let covariance = 0;
  let varianceX = 0;
  let totalY = 0;

  for (let index = 0; index < xs.length; index += 1) {
    covariance += (xs[index] - meanX) * (ys[index] - meanY);
    varianceX += (xs[index] - meanX) ** 2;
    totalY += (ys[index] - meanY) ** 2;
  }

  if (varianceX === 0) {
    return null;
  }

  const slope = covariance / varianceX;
  if (!Number.isFinite(slope) || slope <= 0) {
    return null;
  }

  const intercept = meanY - slope * meanX;
  let residual = 0;
  for (let index = 0; index < xs.length; index += 1) {
    residual += (ys[index] - (intercept + slope * xs[index])) ** 2;
  }

  const rSquared = totalY === 0 ? 0 : 1 - residual / totalY;

  return {
    doublingTime: Math.LN2 / slope,
    end,
    intercept,
    points: points.length,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    slope,
    start,
  };
}

export function detectLogPhase(
  summaries: readonly GrowthCurveSummary[],
  options: LogPhaseOptions = {},
): LogPhaseFit | null {
  const minPoints = Math.max(3, Math.floor(options.minPoints ?? 4));
  const minRSquared = options.minRSquared ?? 0.97;
  const tolerance = options.tolerance ?? 0.003;
  const points = [...summaries]
    .filter((point) => point.mean !== null && point.mean > 0)
    .sort((left, right) => left.time - right.time);

  if (points.length < minPoints) {
    return null;
  }

  const candidates: LogPhaseFit[] = [];
  for (let start = 0; start <= points.length - minPoints; start += 1) {
    for (let end = start + minPoints - 1; end < points.length; end += 1) {
      const fit = fitLogPhase(points, points[start].time, points[end].time);
      if (!fit || fit.rSquared < minRSquared) {
        continue;
      }

      // Reject a window that begins or ends in a phase whose local growth is
      // less than half the fitted rate. A flat lag point can otherwise raise R²
      // by widening the time range without belonging to the exponential phase.
      const previous = points[start - 1];
      if (previous && previous.mean !== null) {
        const localSlope =
          (Math.log(points[start].mean as number) - Math.log(previous.mean)) /
          (points[start].time - previous.time);
        if (localSlope < fit.slope * 0.5) {
          continue;
        }
      }
      const next = points[end + 1];
      if (next && next.mean !== null) {
        const localSlope =
          (Math.log(next.mean) - Math.log(points[end].mean as number)) /
          (next.time - points[end].time);
        if (localSlope < fit.slope * 0.5) {
          continue;
        }
      }

      candidates.push(fit);
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const best = Math.max(...candidates.map((fit) => fit.rSquared));
  const eligible = candidates
    .filter((fit) => fit.rSquared >= Math.max(minRSquared, best - tolerance))
    .sort(
      (left, right) =>
        right.points - left.points ||
        right.rSquared - left.rSquared ||
        left.start - right.start,
    );

  return eligible[0] ?? null;
}

function exportNumber(value: number): string {
  return Number(value.toPrecision(6)).toString();
}

function csvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function growthCurveCsv(
  data: GrowthCurveData,
  summaries: readonly GrowthCurveSummary[] = summarizeGrowthCurve(data),
): string {
  const timeUnit = data.timeUnit ?? TIME_FALLBACK;
  const valueLabel = data.valueLabel ?? VALUE_FALLBACK;
  const header = [
    `time_${timeUnit}`,
    ...data.replicates.map((replicate) => `${valueLabel}_${replicate.label}`),
    `mean_${valueLabel}`,
    `sd_${valueLabel}`,
    "n",
  ];
  const rows = summaries.map((summary) => [
    exportNumber(summary.time),
    ...summary.values.map((value) =>
      value === null ? "" : exportNumber(value),
    ),
    summary.mean === null ? "" : exportNumber(summary.mean),
    summary.sd === null ? "" : exportNumber(summary.sd),
    String(summary.n),
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function niceLogFloor(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const factor of [5, 2, 1] as const) {
    const candidate = factor * base;
    if (candidate <= value) {
      return candidate;
    }
  }
  return base;
}

function niceLogCeil(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const factor of LOG_TICK_FACTORS) {
    const candidate = factor * base;
    if (candidate >= value) {
      return candidate;
    }
  }
  return 10 * base;
}

function logTicks(lower: number, upper: number): number[] {
  const ticks: number[] = [];
  const first = Math.floor(Math.log10(lower));
  const last = Math.ceil(Math.log10(upper));

  for (let exponent = first; exponent <= last; exponent += 1) {
    for (const factor of LOG_TICK_FACTORS) {
      const value = factor * 10 ** exponent;
      if (value >= lower * 0.999 && value <= upper * 1.001) {
        ticks.push(value);
      }
    }
  }

  return ticks;
}

function niceStep(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const niceFraction =
    fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

function linearTicks(lower: number, upper: number, target = 5): number[] {
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || upper <= lower) {
    return [lower];
  }
  const step = niceStep((upper - lower) / target);
  const first = Math.ceil(lower / step) * step;
  const ticks: number[] = [];
  for (let value = first; value <= upper + step * 1e-9; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }
  return ticks;
}

type ChartPoint = { x: number; y: number };

function linePath(points: readonly (ChartPoint | null)[]): string {
  let drawing = false;
  let path = "";

  for (const point of points) {
    if (!point) {
      drawing = false;
      continue;
    }
    path += drawing
      ? ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      : ` M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    drawing = true;
  }

  return path.trim();
}

function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(640);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => {
      const next = element.getBoundingClientRect().width;
      if (next > 0) {
        setWidth(Math.max(180, Math.round(next)));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

function EmptyState({ label }: { label: React.ReactNode }): React.ReactElement {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-16 text-center">
      <FlaskConicalIcon
        aria-hidden="true"
        className="size-5 text-muted-foreground"
      />
      <p className="font-medium text-sm">{label}</p>
      <p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
        Pass timepoints with one reading per replicate. A null reading is a
        missed read and stays a gap in the curve.
      </p>
    </div>
  );
}

export function GrowthCurve({
  data,
  logPhase,
  showLogPhase = true,
  defaultShowReplicates = true,
  defaultScale = "log",
  emptyLabel = "No growth data loaded.",
  onExport,
  className,
  ...props
}: GrowthCurveProps): React.ReactElement {
  const [chartRef, width] = useWidth();
  const [scale, setScale] = React.useState<"log" | "linear">(defaultScale);
  const [showReplicates, setShowReplicates] = React.useState(
    defaultShowReplicates,
  );
  const [tableOpen, setTableOpen] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
  const baseId = React.useId().replaceAll(":", "");
  const titleId = `growth-curve-title-${baseId}`;
  const summaryId = `growth-curve-summary-${baseId}`;
  const tableId = `growth-curve-table-${baseId}`;
  const clipId = `growth-curve-clip-${baseId}`;

  const summaries = React.useMemo(
    () => (data ? summarizeGrowthCurve(data) : []),
    [data],
  );

  React.useEffect(() => {
    setFocusIndex(null);
    setTableOpen(false);
  }, [data?.id]);

  const fit = React.useMemo(() => {
    if (!showLogPhase || summaries.length === 0) {
      return null;
    }
    if (logPhase) {
      return fitLogPhase(summaries, logPhase.start, logPhase.end);
    }
    return detectLogPhase(summaries);
  }, [logPhase, showLogPhase, summaries]);

  if (
    !data ||
    summaries.length === 0 ||
    summaries.every((row) => row.n === 0)
  ) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
        data-slot="growth-curve"
        {...props}
      >
        <EmptyState label={emptyLabel} />
      </section>
    );
  }

  const timeUnit = data.timeUnit ?? TIME_FALLBACK;
  const valueLabel = data.valueLabel ?? VALUE_FALLBACK;
  const firstTime = summaries[0].time;
  const lastTime = summaries.at(-1)?.time ?? firstTime;
  const totalReads = summaries.length * data.replicates.length;
  const presentReads = summaries.reduce((sum, row) => sum + row.n, 0);
  const missingReads = Math.max(0, totalReads - presentReads);
  const nonPositiveReads = summaries.reduce(
    (sum, row) =>
      sum +
      row.values.filter(
        (value) => value !== null && Number.isFinite(value) && value <= 0,
      ).length,
    0,
  );

  const drawableValues =
    scale === "log"
      ? summaries
          .flatMap((row) => [row.mean, ...row.values])
          .filter(isFiniteNumber)
          .filter((value) => value > 0)
      : summaries
          .flatMap((row) => [row.mean, ...row.values])
          .filter(isFiniteNumber);

  const observedMin =
    drawableValues.length > 0 ? Math.min(...drawableValues) : 0;
  const observedMax =
    drawableValues.length > 0 ? Math.max(...drawableValues) : 1;

  let yLower: number;
  let yUpper: number;
  if (scale === "log") {
    const positiveMin = observedMin > 0 ? observedMin : 1e-6;
    const positiveMax = observedMax > 0 ? observedMax : 1;
    yLower = niceLogFloor(positiveMin);
    yUpper = niceLogCeil(positiveMax);
    if (yLower === yUpper) {
      yLower = yLower / 2;
      yUpper = yUpper * 2;
    }
  } else {
    yLower = Math.min(0, observedMin);
    yUpper = Math.max(yLower + 1, observedMax * 1.05);
  }

  const timeSpan = lastTime - firstTime;
  const timePad = timeSpan > 0 ? timeSpan * 0.015 : 0.5;
  const xLower = firstTime - timePad;
  const xUpper = lastTime + timePad;

  const compact = width < 420;
  const margin = compact
    ? { bottom: 34, left: 40, right: 12, top: 14 }
    : { bottom: 38, left: 48, right: 16, top: 14 };
  const plotWidth = Math.max(60, width - margin.left - margin.right);
  const plotHeight = CHART_HEIGHT - margin.top - margin.bottom;
  const plotLeft = margin.left;
  const plotRight = margin.left + plotWidth;
  const plotTop = margin.top;
  const plotBottom = margin.top + plotHeight;

  const xScale = (time: number) =>
    plotLeft + ((time - xLower) / (xUpper - xLower)) * plotWidth;
  const logLower = Math.log10(yLower);
  const logSpan = Math.log10(yUpper) - logLower;
  const yScale = (value: number) =>
    scale === "log"
      ? plotBottom - ((Math.log10(value) - logLower) / logSpan) * plotHeight
      : plotBottom -
        ((value - yLower) / Math.max(yUpper - yLower, Number.EPSILON)) *
          plotHeight;
  const drawable = (value: number | null): value is number =>
    value !== null &&
    Number.isFinite(value) &&
    (scale === "linear" || value > 0);

  const yTicksValues =
    scale === "log" ? logTicks(yLower, yUpper) : linearTicks(yLower, yUpper, 5);
  const yTickLabels =
    yTicksValues.length > 8
      ? new Set(
          yTicksValues.filter((value) => {
            const normalized = value / 10 ** Math.floor(Math.log10(value));
            return Math.abs(normalized - 1) < 1e-9;
          }),
        )
      : null;
  const xTicksValues = linearTicks(xLower, xUpper, compact ? 4 : 6);

  const meanSegments = linePath(
    summaries.map((row) =>
      drawable(row.mean) ? { x: xScale(row.time), y: yScale(row.mean) } : null,
    ),
  );

  const replicatePaths = showReplicates
    ? data.replicates.map((replicate, index) => ({
        id: replicate.id,
        path: linePath(
          summaries.map((row) => {
            const value = row.values[index];
            return drawable(value)
              ? { x: xScale(row.time), y: yScale(value) }
              : null;
          }),
        ),
      }))
    : [];

  const bandSegments: string[] = [];
  let bandRun: Array<{ x: number; upper: number; lower: number }> = [];
  const flushBand = () => {
    if (bandRun.length < 2) {
      bandRun = [];
      return;
    }
    const upper = bandRun
      .map((point) => `${point.x.toFixed(2)} ${point.upper.toFixed(2)}`)
      .join(" L ");
    const lower = [...bandRun]
      .reverse()
      .map((point) => `${point.x.toFixed(2)} ${point.lower.toFixed(2)}`)
      .join(" L ");
    bandSegments.push(`M ${upper} L ${lower} Z`);
    bandRun = [];
  };
  for (const row of summaries) {
    if (!drawable(row.mean) || row.sd === null || !Number.isFinite(row.sd)) {
      flushBand();
      continue;
    }
    const lower = row.mean - row.sd;
    const upper = row.mean + row.sd;
    if (!drawable(lower) || !drawable(upper)) {
      flushBand();
      continue;
    }
    bandRun.push({
      lower: yScale(lower),
      upper: yScale(upper),
      x: xScale(row.time),
    });
  }
  flushBand();

  const isolatedMeans = summaries.filter((row, index) => {
    if (!drawable(row.mean)) {
      return false;
    }
    const previous = summaries[index - 1];
    const next = summaries[index + 1];
    return (
      (!previous || !drawable(previous.mean)) && (!next || !drawable(next.mean))
    );
  });

  const showDots = summaries.length <= 40;
  const safeFocus =
    focusIndex === null
      ? null
      : Math.min(Math.max(focusIndex, 0), summaries.length - 1);
  const focusedRow = safeFocus === null ? null : summaries[safeFocus];

  const focusStartIndex = (() => {
    if (fit) {
      const midpoint = (fit.start + fit.end) / 2;
      let best = 0;
      let distance = Number.POSITIVE_INFINITY;
      for (const [index, row] of summaries.entries()) {
        const nextDistance = Math.abs(row.time - midpoint);
        if (nextDistance < distance) {
          best = index;
          distance = nextDistance;
        }
      }
      return best;
    }
    return 0;
  })();

  const focusLabel = focusedRow
    ? focusedRow.mean === null
      ? `${formatValue(focusedRow.time)} ${timeUnit} · no reads`
      : `${formatValue(focusedRow.time)} ${timeUnit} · mean ${formatValue(
          focusedRow.mean,
        )}${
          focusedRow.sd === null ? "" : ` ± ${formatValue(focusedRow.sd)}`
        } ${valueLabel} · n=${focusedRow.n}`
    : "Focus the chart and use the left and right arrow keys to inspect a time point.";

  const summaryText = `${data.name}. ${data.replicates.length} replicates, ${summaries.length} time points from ${formatRange(firstTime, lastTime, timeUnit)}. ${
    fit
      ? `${logPhase ? "Selected" : "Detected"} log phase ${formatRange(fit.start, fit.end, timeUnit)}, doubling time ${formatValue(fit.doublingTime)} ${timeUnit}, R squared ${fit.rSquared.toFixed(3)}.`
      : "No log phase was detected."
  } ${missingReads} missed read${missingReads === 1 ? "" : "s"}. Use the left and right arrow keys to inspect time points, or open the data table for exact values.`;

  const fitPath = (() => {
    if (!fit) {
      return "";
    }
    const steps = 32;
    const points: ChartPoint[] = [];
    for (let index = 0; index <= steps; index += 1) {
      const time = fit.start + ((fit.end - fit.start) * index) / steps;
      const value = Math.exp(fit.intercept + fit.slope * time);
      if (drawable(value)) {
        points.push({ x: xScale(time), y: yScale(value) });
      }
    }
    return linePath(points);
  })();

  function moveFocus(key: string): void {
    const current = safeFocus ?? focusStartIndex;
    let next = current;
    if (key === "ArrowLeft") {
      next = Math.max(0, current - 1);
    } else if (key === "ArrowRight") {
      next = Math.min(summaries.length - 1, current + 1);
    } else if (key === "Home") {
      next = 0;
    } else if (key === "End") {
      next = summaries.length - 1;
    } else {
      return;
    }
    setFocusIndex(next);
  }

  function handleExport(): void {
    if (!data) {
      return;
    }
    const csv = growthCurveCsv(data, summaries);
    onExport?.(csv);

    if (
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      return;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = `growth-curve-${data.id.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.csv`;
    anchor.href = href;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="growth-curve"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">
              {data.id}
              {data.strain ? ` · ${data.strain}` : ""}
              {data.medium ? ` · ${data.medium}` : ""}
              {data.temperatureC === undefined
                ? ""
                : ` · ${data.temperatureC} °C`}
            </span>
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {data.name}
          </h3>
          {data.description ? (
            <p className="max-w-prose text-muted-foreground text-xs leading-relaxed">
              {data.description}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span dir="ltr">
              {summaries.length} time point
              {summaries.length === 1 ? "" : "s"}
            </span>
            <span dir="ltr">
              {data.replicates.length} replicate
              {data.replicates.length === 1 ? "" : "s"}
            </span>
            <span dir="ltr">{formatRange(firstTime, lastTime, timeUnit)}</span>
            {missingReads > 0 ? (
              <span className="text-warning-foreground" dir="ltr">
                {missingReads} missed read{missingReads === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          className="print:hidden"
          onClick={handleExport}
          size="sm"
          type="button"
          variant="outline"
        >
          <DownloadIcon />
          Export CSV
        </Button>
      </header>

      <p className="sr-only" id={summaryId}>
        {summaryText}
      </p>

      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 border-b @2xl:border-e @2xl:border-b-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
            <div
              aria-label="Y-axis scale"
              className="flex items-center gap-0.5 rounded-lg border p-0.5"
              role="group"
            >
              <Button
                aria-pressed={scale === "log"}
                className="rounded-md"
                onClick={() => setScale("log")}
                size="xs"
                type="button"
                variant={scale === "log" ? "secondary" : "ghost"}
              >
                Log
              </Button>
              <Button
                aria-pressed={scale === "linear"}
                className="rounded-md"
                onClick={() => setScale("linear")}
                size="xs"
                type="button"
                variant={scale === "linear" ? "secondary" : "ghost"}
              >
                Linear
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-0.5">
              <Button
                aria-pressed={showReplicates}
                onClick={() => setShowReplicates((current) => !current)}
                size="xs"
                type="button"
                variant={showReplicates ? "secondary" : "ghost"}
              >
                Replicates
              </Button>
              <Button
                aria-controls={tableId}
                aria-expanded={tableOpen}
                onClick={() => setTableOpen((current) => !current)}
                size="xs"
                type="button"
                variant={tableOpen ? "secondary" : "ghost"}
              >
                <Table2Icon />
                Data
              </Button>
            </div>
          </div>

          <div className="px-3 pt-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: SERIES_COLOR }}
                />
                Mean
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-4 rounded-sm border border-chart-5/30"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-chart-5) 18%, transparent)",
                  }}
                />
                ±1 SD
              </span>
              {showReplicates ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="w-4 border-muted-foreground border-t border-dashed"
                  />
                  Replicates
                </span>
              ) : null}
              {fit ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="w-4 border-foreground border-t border-dashed"
                  />
                  Log-phase fit
                </span>
              ) : null}
            </div>
          </div>

          <div className="px-2 pt-1">
            <div ref={chartRef}>
              <div
                aria-describedby={summaryId}
                aria-label={`${data.name} growth curve time cursor`}
                aria-orientation="horizontal"
                aria-valuemax={lastTime}
                aria-valuemin={firstTime}
                aria-valuenow={
                  focusedRow?.time ?? summaries[focusStartIndex].time
                }
                aria-valuetext={focusLabel}
                className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onFocus={() => {
                  if (focusIndex === null) {
                    setFocusIndex(focusStartIndex);
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  ) {
                    event.preventDefault();
                    moveFocus(event.key);
                  }
                }}
                onPointerLeave={() => setFocusIndex(null)}
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  if (rect.width === 0) {
                    return;
                  }
                  const x = (event.clientX - rect.left) * (width / rect.width);
                  let nearest = 0;
                  let distance = Number.POSITIVE_INFINITY;
                  for (const [index, row] of summaries.entries()) {
                    const nextDistance = Math.abs(xScale(row.time) - x);
                    if (nextDistance < distance) {
                      nearest = index;
                      distance = nextDistance;
                    }
                  }
                  setFocusIndex(nearest);
                }}
                role="slider"
                tabIndex={0}
              >
                <svg
                  aria-hidden="true"
                  className="block h-auto w-full"
                  height={CHART_HEIGHT}
                  viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
                  width={width}
                >
                  <defs>
                    <clipPath id={clipId}>
                      <rect
                        height={plotHeight}
                        width={plotWidth}
                        x={plotLeft}
                        y={plotTop}
                      />
                    </clipPath>
                  </defs>

                  {fit ? (
                    <g clipPath={`url(#${clipId})`}>
                      <rect
                        fill="var(--color-muted)"
                        height={plotHeight}
                        opacity={0.52}
                        width={Math.max(1, xScale(fit.end) - xScale(fit.start))}
                        x={xScale(fit.start)}
                        y={plotTop}
                      />
                    </g>
                  ) : null}

                  <g>
                    {yTicksValues.map((value) => {
                      const y = yScale(value);
                      return (
                        <g key={`y-${value}`}>
                          <line
                            opacity={0.7}
                            stroke="var(--color-border)"
                            strokeDasharray="2 3"
                            x1={plotLeft}
                            x2={plotRight}
                            y1={y}
                            y2={y}
                          />
                          {yTickLabels === null || yTickLabels.has(value) ? (
                            <text
                              fill="var(--color-muted-foreground)"
                              fontFamily="var(--font-mono)"
                              fontSize={9}
                              textAnchor="end"
                              x={plotLeft - 6}
                              y={y + 3}
                            >
                              {formatValue(value)}
                            </text>
                          ) : null}
                        </g>
                      );
                    })}
                    {xTicksValues.map((value) => {
                      const x = xScale(value);
                      return (
                        <g key={`x-${value}`}>
                          <line
                            opacity={0.5}
                            stroke="var(--color-border)"
                            strokeDasharray="2 3"
                            x1={x}
                            x2={x}
                            y1={plotTop}
                            y2={plotBottom}
                          />
                          <text
                            fill="var(--color-muted-foreground)"
                            fontFamily="var(--font-mono)"
                            fontSize={9}
                            textAnchor="middle"
                            x={x}
                            y={plotBottom + 14}
                          >
                            {formatValue(value)}
                          </text>
                        </g>
                      );
                    })}
                    <line
                      stroke="var(--color-border)"
                      x1={plotLeft}
                      x2={plotRight}
                      y1={plotBottom}
                      y2={plotBottom}
                    />
                    <line
                      stroke="var(--color-border)"
                      x1={plotLeft}
                      x2={plotLeft}
                      y1={plotTop}
                      y2={plotBottom}
                    />
                    <text
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                      fontSize={9}
                      textAnchor="end"
                      x={plotRight}
                      y={CHART_HEIGHT - 4}
                    >
                      Time ({timeUnit})
                    </text>
                    <text
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                      fontSize={9}
                      textAnchor="middle"
                      transform={`translate(11 ${plotTop + plotHeight / 2}) rotate(-90)`}
                    >
                      {valueLabel}
                    </text>

                    {fit ? (
                      <text
                        fill="var(--color-muted-foreground)"
                        fontFamily="var(--font-mono)"
                        fontSize={9}
                        x={xScale(fit.start) + 4}
                        y={plotTop + 10}
                      >
                        Log phase
                      </text>
                    ) : null}
                  </g>

                  <g clipPath={`url(#${clipId})`}>
                    {bandSegments.map((path) => (
                      <path
                        d={path}
                        fill={SERIES_COLOR}
                        fillOpacity={0.16}
                        key={path}
                      />
                    ))}

                    {replicatePaths.map((replicate) => (
                      <path
                        d={replicate.path}
                        fill="none"
                        key={replicate.id}
                        opacity={0.55}
                        stroke="var(--color-muted-foreground)"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                    ))}

                    <path
                      d={meanSegments}
                      fill="none"
                      stroke={SERIES_COLOR}
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                    />

                    {fit && fitPath ? (
                      <path
                        d={fitPath}
                        fill="none"
                        stroke="var(--color-foreground)"
                        strokeDasharray="4 3"
                        strokeWidth={1.25}
                      />
                    ) : null}

                    {showDots
                      ? summaries.map((row) =>
                          drawable(row.mean) ? (
                            <circle
                              cx={xScale(row.time)}
                              cy={yScale(row.mean)}
                              fill={SERIES_COLOR}
                              key={`mean-${row.time}`}
                              r={1.4}
                            />
                          ) : null,
                        )
                      : null}

                    {isolatedMeans.map((row) =>
                      drawable(row.mean) ? (
                        <circle
                          cx={xScale(row.time)}
                          cy={yScale(row.mean)}
                          fill="none"
                          key={`isolated-${row.time}`}
                          r={2.25}
                          stroke={SERIES_COLOR}
                          strokeWidth={1.25}
                        />
                      ) : null,
                    )}

                    {focusedRow ? (
                      <g>
                        <line
                          stroke="var(--color-foreground)"
                          strokeOpacity={0.32}
                          x1={xScale(focusedRow.time)}
                          x2={xScale(focusedRow.time)}
                          y1={plotTop}
                          y2={plotBottom}
                        />
                        {showReplicates
                          ? data.replicates.map((replicate, index) => {
                              const value = focusedRow.values[index];
                              return drawable(value) ? (
                                <circle
                                  cx={xScale(focusedRow.time)}
                                  cy={yScale(value)}
                                  fill="var(--color-background)"
                                  key={`focus-${replicate.id}`}
                                  r={2}
                                  stroke="var(--color-muted-foreground)"
                                  strokeWidth={1}
                                />
                              ) : null;
                            })
                          : null}
                        {drawable(focusedRow.mean) ? (
                          <circle
                            cx={xScale(focusedRow.time)}
                            cy={yScale(focusedRow.mean)}
                            fill={SERIES_COLOR}
                            r={3.5}
                            stroke="var(--color-background)"
                            strokeWidth={1.5}
                          />
                        ) : null}
                      </g>
                    ) : null}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div
            className="border-t bg-muted/24 px-3 py-2 print:hidden"
            id={`growth-curve-readout-${baseId}`}
          >
            <p className="font-mono text-[11px] tabular-nums">
              <span className="text-muted-foreground" dir="ltr">
                {focusLabel}
              </span>
            </p>
          </div>

          <div className="border-t px-3 py-2">
            <Button
              aria-controls={tableId}
              aria-expanded={tableOpen}
              className="print:hidden"
              onClick={() => setTableOpen((current) => !current)}
              size="xs"
              type="button"
              variant="ghost"
            >
              <Table2Icon />
              {tableOpen ? "Hide data table" : "Show data table"}
            </Button>
            <div
              aria-hidden={!tableOpen}
              className={cn(
                "mt-2 overflow-hidden rounded-lg border print:block",
                !tableOpen && "hidden",
              )}
              id={tableId}
            >
              <Table aria-label={`${data.name} data table`}>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Time ({timeUnit})</TableHead>
                    {data.replicates.map((replicate) => (
                      <TableHead key={replicate.id} scope="col">
                        {replicate.label}
                      </TableHead>
                    ))}
                    <TableHead scope="col">Mean</TableHead>
                    <TableHead scope="col">SD</TableHead>
                    <TableHead className="text-end" scope="col">
                      n
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((row) => (
                    <TableRow key={row.time}>
                      <TableCell className="font-mono tabular-nums">
                        {formatValue(row.time)}
                      </TableCell>
                      {row.values.map((value, index) => (
                        <TableCell
                          className={cn(
                            "font-mono tabular-nums",
                            value === null && "text-muted-foreground",
                          )}
                          key={`${data.replicates[index]?.id ?? index}-${row.time}`}
                        >
                          {value === null ? "—" : formatValue(value)}
                        </TableCell>
                      ))}
                      <TableCell className="font-mono tabular-nums">
                        {row.mean === null ? "—" : formatValue(row.mean)}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {row.sd === null ? "—" : formatValue(row.sd)}
                      </TableCell>
                      <TableCell className="text-end font-mono tabular-nums">
                        {row.n}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <section
          aria-label="Growth analysis"
          className="grid content-start gap-4 p-3"
        >
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                Log phase
              </h4>
              <StatusBadge
                label={fit ? "Detected" : "Not detected"}
                size="sm"
                status={fit ? "success" : "idle"}
              />
            </div>
            {fit ? (
              <>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
                  <dt className="text-muted-foreground">Window</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatRange(fit.start, fit.end, timeUnit)}
                  </dd>
                  <dt className="text-muted-foreground">Doubling time</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatValue(fit.doublingTime)} {timeUnit}
                  </dd>
                  <dt className="text-muted-foreground">Growth rate</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatValue(fit.slope)} {timeUnit}⁻¹
                  </dd>
                  <dt className="text-muted-foreground">Fit</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    R² {fit.rSquared.toFixed(3)}
                  </dd>
                  <dt className="text-muted-foreground">Points</dt>
                  <dd className="font-mono tabular-nums">{fit.points}</dd>
                </dl>
                <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                  {logPhase ? "Selected" : "Detected"} by least squares on
                  ln(mean {valueLabel}) against time. Check the window before
                  reporting.
                </p>
              </>
            ) : (
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                No window met the linearity threshold. Fit needs at least four
                consecutive positive means.
              </p>
            )}
          </section>

          <section className="border-t pt-3">
            <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Reads
            </h4>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
              <dt className="text-muted-foreground">Replicates</dt>
              <dd className="font-mono">{data.replicates.length}</dd>
              <dt className="text-muted-foreground">Time points</dt>
              <dd className="font-mono">{summaries.length}</dd>
              <dt className="text-muted-foreground">Present</dt>
              <dd className="font-mono tabular-nums">
                {presentReads} / {totalReads}
              </dd>
              <dt className="text-muted-foreground">Missed</dt>
              <dd className="font-mono tabular-nums">{missingReads}</dd>
              {nonPositiveReads > 0 ? (
                <>
                  <dt className="text-muted-foreground">Non-positive</dt>
                  <dd className="font-mono tabular-nums">{nonPositiveReads}</dd>
                </>
              ) : null}
            </dl>
            {nonPositiveReads > 0 && scale === "log" ? (
              <p className="mt-2 flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="mt-0.5 size-3 shrink-0"
                />
                Non-positive reads are hidden on the log scale and stay in the
                table.
              </p>
            ) : null}
          </section>

          <section className="border-t pt-3">
            <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Source
            </h4>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground leading-relaxed">
              {data.instrument ? `${data.instrument} · ` : ""}
              {data.source ?? "Not recorded"}
            </p>
          </section>
        </section>
      </div>
    </section>
  );
}
