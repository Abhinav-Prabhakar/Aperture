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

export type DoseResponseReplicate = {
  id: string;
  label: string;
};

export type DoseResponsePoint = {
  /** Concentration in `data.doseUnit`. Positive doses are required for the fit. */
  dose: number;
  /** One response per replicate, in `data.replicates` order. Null is a missed read. */
  values: readonly (number | null)[];
};

export type DoseResponseData = {
  id: string;
  name: string;
  description?: string;
  compound?: string;
  cellLine?: string;
  duration?: string;
  instrument?: string;
  /** Concentration unit. Default "µM". */
  doseUnit?: string;
  /** Response name. Default "Viability". */
  responseLabel?: string;
  /** Response unit. Default "%". */
  responseUnit?: string;
  replicates: readonly DoseResponseReplicate[];
  points: readonly DoseResponsePoint[];
  source?: string;
};

export type DoseResponseSummary = {
  dose: number;
  /** Readings in replicate order; non-finite values become null. */
  values: readonly (number | null)[];
  mean: number | null;
  /** Sample standard deviation. Null when fewer than two reads. */
  sd: number | null;
  n: number;
  min: number | null;
  max: number | null;
};

export type DoseResponseDirection = "inhibition" | "stimulation";

export type DoseResponseFit = {
  /** Fitted response as dose approaches zero. */
  plateauLow: number;
  /** Fitted response as dose approaches infinity. */
  plateauHigh: number;
  /** Base-10 logarithm of the half-maximal concentration. */
  logIC50: number;
  /** Half-maximal concentration in data units. */
  halfMax: number;
  halfMaxLabel: "IC50" | "EC50";
  /** Positive Hill slope magnitude. The plateaus carry the direction. */
  hill: number;
  direction: DoseResponseDirection;
  rSquared: number;
  /** Number of mean responses used in the fit. */
  points: number;
  /** Residual degrees of freedom, `points - 4`. */
  df: number;
  /** Residual variance used for the asymptotic intervals. */
  residualVariance: number | null;
  /** Covariance of [plateauLow, plateauHigh, logIC50, hill]. */
  covariance: readonly (readonly number[])[] | null;
  /** 95% confidence interval for the half-maximal concentration. */
  halfMaxCi: readonly [number, number] | null;
  /** Two-sided 95% t critical value for `df`. */
  tCritical: number | null;
};

export type DoseResponseFitOptions = {
  /** Minimum positive doses with a mean. Default 4. */
  minPoints?: number;
  /** Minimum coefficient of determination. Default 0.5. */
  minRSquared?: number;
};

export type DoseResponseCurveProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  data: DoseResponseData | null;
  /** Initial x-axis scale. Default "log". */
  defaultScale?: "log" | "linear";
  /** Draw each replicate point. Default true. */
  defaultShowReplicates?: boolean;
  /** Fit the 4PL and show half-maximal statistics. Default true. */
  showFit?: boolean;
  /** Minimum points and R-squared for the 4PL fit. */
  fitOptions?: DoseResponseFitOptions;
  emptyLabel?: React.ReactNode;
  /** Called with the CSV before the browser download starts. */
  onExport?: (csv: string) => void;
};

const DOSE_FALLBACK = "µM";
const RESPONSE_FALLBACK = "Viability";
const RESPONSE_UNIT_FALLBACK = "%";
const CHART_HEIGHT = 272;
const LOG_TICK_FACTORS = [1, 2, 5] as const;
const CURVE_STEPS = 96;
const NUMBER = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 3,
});
const SERIES_COLOR = "var(--color-chart-5)";
const REPLICATE_COLOR = "var(--color-chart-3)";
const T95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201,
  2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074,
  2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
] as const;

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

export function summarizeDoseResponse(
  data: DoseResponseData,
): DoseResponseSummary[] {
  return [...data.points]
    .filter((point) => isFiniteNumber(point.dose))
    .sort((left, right) => left.dose - right.dose)
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
        dose: point.dose,
        max: n === 0 ? null : Math.max(...present),
        mean,
        min: n === 0 ? null : Math.min(...present),
        n,
        sd: mean === null ? null : sampleSd(present, mean),
        values,
      };
    });
}

function model(dose: number, params: readonly number[]): number {
  const [top, bottom, logIC50, hill] = params;
  const exponent = hill * (Math.log10(dose) - logIC50);
  const clamped = Math.max(-300, Math.min(300, exponent));
  return bottom + (top - bottom) / (1 + 10 ** clamped);
}

function solveLinearSystem(
  matrix: readonly (readonly number[])[],
  vector: readonly number[],
): number[] | null {
  const size = matrix.length;
  const rows = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
        pivot = row;
      }
    }
    if (Math.abs(rows[pivot][column]) < 1e-14) {
      return null;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let index = column; index <= size; index += 1) {
      rows[column][index] /= divisor;
    }
    for (let row = 0; row < size; row += 1) {
      if (row === column) {
        continue;
      }
      const factor = rows[row][column];
      for (let index = column; index <= size; index += 1) {
        rows[row][index] -= factor * rows[column][index];
      }
    }
  }

  return rows.map((row) => row[size]);
}

function invertMatrix(
  matrix: readonly (readonly number[])[],
): number[][] | null {
  const size = matrix.length;
  const rows = matrix.map((row, rowIndex) => [
    ...row,
    ...Array.from({ length: size }, (_, columnIndex) =>
      rowIndex === columnIndex ? 1 : 0,
    ),
  ]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
        pivot = row;
      }
    }
    if (Math.abs(rows[pivot][column]) < 1e-14) {
      return null;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let index = 0; index < 2 * size; index += 1) {
      rows[column][index] /= divisor;
    }
    for (let row = 0; row < size; row += 1) {
      if (row === column) {
        continue;
      }
      const factor = rows[row][column];
      for (let index = 0; index < 2 * size; index += 1) {
        rows[row][index] -= factor * rows[column][index];
      }
    }
  }

  return rows.map((row) => row.slice(size));
}

function jacobian(
  points: readonly { dose: number; mean: number }[],
  params: readonly number[],
): number[][] {
  return points.map((point) => {
    const row = [0, 0, 0, 0];
    for (let index = 0; index < params.length; index += 1) {
      const step = Math.max(1e-7, Math.abs(params[index]) * 1e-7);
      const plus = [...params];
      const minus = [...params];
      plus[index] += step;
      minus[index] -= step;
      row[index] =
        (model(point.dose, plus) - model(point.dose, minus)) / (2 * step);
    }
    return row;
  });
}

function tCritical95(df: number): number | null {
  if (df <= 0) {
    return null;
  }
  if (df <= T95.length) {
    return T95[df - 1];
  }
  // Smooth tail approximation; the table stops at 30 degrees of freedom.
  return 1.96 + 2.5 / df;
}

export function fitDoseResponse(
  summaries: readonly DoseResponseSummary[],
  options: DoseResponseFitOptions = {},
): DoseResponseFit | null {
  const minPoints = Math.max(4, Math.floor(options.minPoints ?? 4));
  const minRSquared = options.minRSquared ?? 0.5;
  const points = summaries
    .filter(
      (point) =>
        point.dose > 0 && point.mean !== null && isFiniteNumber(point.mean),
    )
    .map((point) => ({ dose: point.dose, mean: point.mean as number }))
    .sort((left, right) => left.dose - right.dose);

  if (points.length < minPoints) {
    return null;
  }

  const responses = points.map((point) => point.mean);
  const observedMin = Math.min(...responses);
  const observedMax = Math.max(...responses);
  const span = Math.max(1, observedMax - observedMin);
  const lowPlateau =
    points
      .slice(0, Math.min(2, points.length))
      .reduce((sum, point) => sum + point.mean, 0) / Math.min(2, points.length);
  const highPlateau =
    points
      .slice(-Math.min(2, points.length))
      .reduce((sum, point) => sum + point.mean, 0) / Math.min(2, points.length);

  if (Math.abs(highPlateau - lowPlateau) < span * 0.01) {
    return null;
  }

  const midpoint = (lowPlateau + highPlateau) / 2;
  const logs = points.map((point) => Math.log10(point.dose));
  const minLog = Math.min(...logs);
  const maxLog = Math.max(...logs);
  let logIC50 = logs[Math.floor(logs.length / 2)];

  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index];
    const right = points[index + 1];
    if ((left.mean - midpoint) * (right.mean - midpoint) <= 0) {
      const fraction =
        (midpoint - left.mean) / (right.mean - left.mean || 1e-12);
      logIC50 =
        Math.log10(left.dose) +
        fraction * (Math.log10(right.dose) - Math.log10(left.dose));
      break;
    }
  }

  let params = [lowPlateau, highPlateau, logIC50, 1];
  const responsePad = span * 3;
  const clampParams = (candidate: number[]): number[] => [
    Math.max(
      observedMin - responsePad,
      Math.min(observedMax + responsePad, candidate[0]),
    ),
    Math.max(
      observedMin - responsePad,
      Math.min(observedMax + responsePad, candidate[1]),
    ),
    Math.max(minLog - 2, Math.min(maxLog + 2, candidate[2])),
    Math.max(0.05, Math.min(20, candidate[3])),
  ];
  const sumSquaredError = (candidate: readonly number[]): number =>
    points.reduce(
      (sum, point) => sum + (point.mean - model(point.dose, candidate)) ** 2,
      0,
    );

  let lambda = 1e-3;
  let currentSse = sumSquaredError(params);

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const derivatives = jacobian(points, params);
    const normal = Array.from({ length: 4 }, () => Array(4).fill(0));
    const gradient = Array(4).fill(0);

    for (const [rowIndex, row] of derivatives.entries()) {
      const residual =
        points[rowIndex].mean - model(points[rowIndex].dose, params);
      for (let column = 0; column < 4; column += 1) {
        gradient[column] += row[column] * residual;
        for (let other = 0; other < 4; other += 1) {
          normal[column][other] += row[column] * row[other];
        }
      }
    }

    const damped = normal.map((row, rowIndex) =>
      row.map((value, columnIndex) =>
        rowIndex === columnIndex
          ? value + lambda * Math.max(value, 1e-8)
          : value,
      ),
    );
    const delta = solveLinearSystem(damped, gradient);

    if (!delta) {
      lambda *= 10;
      if (lambda > 1e12) {
        break;
      }
      continue;
    }

    const candidate = clampParams(
      params.map((value, index) => value + delta[index]),
    );
    const candidateSse = sumSquaredError(candidate);

    if (candidateSse < currentSse) {
      const previous = currentSse;
      params = candidate;
      currentSse = candidateSse;
      lambda = Math.max(1e-12, lambda * 0.3);
      if (Math.abs(previous - currentSse) <= 1e-12 * (1 + currentSse)) {
        break;
      }
    } else {
      lambda *= 10;
      if (lambda > 1e12) {
        break;
      }
    }
  }

  if (
    params.some((value) => !Number.isFinite(value)) ||
    Math.abs(params[0] - params[1]) < span * 0.01
  ) {
    return null;
  }

  const meanResponse =
    responses.reduce((sum, value) => sum + value, 0) / responses.length;
  const totalSumSquares = responses.reduce(
    (sum, value) => sum + (value - meanResponse) ** 2,
    0,
  );
  if (totalSumSquares === 0) {
    return null;
  }
  const rSquared = 1 - currentSse / totalSumSquares;
  if (!Number.isFinite(rSquared) || rSquared < minRSquared) {
    return null;
  }

  const df = points.length - 4;
  let covariance: number[][] | null = null;
  let residualVariance: number | null = null;
  let halfMaxCi: readonly [number, number] | null = null;
  const tCritical = tCritical95(df);

  if (df > 0) {
    const finalJacobian = jacobian(points, params);
    const normal = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (const row of finalJacobian) {
      for (let column = 0; column < 4; column += 1) {
        for (let other = 0; other < 4; other += 1) {
          normal[column][other] += row[column] * row[other];
        }
      }
    }
    const inverse = invertMatrix(normal);
    if (inverse) {
      residualVariance = currentSse / df;
      covariance = inverse.map((row) =>
        row.map((value) => value * (residualVariance as number)),
      );
      for (let row = 0; row < 4; row += 1) {
        for (let column = row + 1; column < 4; column += 1) {
          const mean = (covariance[row][column] + covariance[column][row]) / 2;
          covariance[row][column] = mean;
          covariance[column][row] = mean;
        }
      }
      const logSe = Math.sqrt(Math.max(0, covariance[2][2]));
      if (
        tCritical !== null &&
        Number.isFinite(logSe) &&
        Number.isFinite(params[2] - tCritical * logSe) &&
        Number.isFinite(params[2] + tCritical * logSe)
      ) {
        halfMaxCi = [
          10 ** (params[2] - tCritical * logSe),
          10 ** (params[2] + tCritical * logSe),
        ];
      }
    }
  }

  const direction: DoseResponseDirection =
    params[0] > params[1] ? "inhibition" : "stimulation";

  return {
    covariance,
    df,
    direction,
    halfMax: 10 ** params[2],
    halfMaxCi,
    halfMaxLabel: direction === "inhibition" ? "IC50" : "EC50",
    hill: params[3],
    logIC50: params[2],
    plateauHigh: params[1],
    plateauLow: params[0],
    points: points.length,
    residualVariance,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    tCritical,
  };
}

export function predictDoseResponse(
  fit: DoseResponseFit,
  dose: number,
): number | null {
  if (!isFiniteNumber(dose) || dose <= 0) {
    return null;
  }
  const value = model(dose, [
    fit.plateauLow,
    fit.plateauHigh,
    fit.logIC50,
    fit.hill,
  ]);
  return Number.isFinite(value) ? value : null;
}

export function doseResponseBand(
  fit: DoseResponseFit,
  dose: number,
): readonly [number, number] | null {
  const predicted = predictDoseResponse(fit, dose);
  if (
    predicted === null ||
    !fit.covariance ||
    fit.tCritical === null ||
    !isFiniteNumber(dose) ||
    dose <= 0
  ) {
    return null;
  }

  const params = [fit.plateauLow, fit.plateauHigh, fit.logIC50, fit.hill];
  const gradient = params.map((value, index) => {
    const step = Math.max(1e-7, Math.abs(value) * 1e-7);
    const plus = [...params];
    const minus = [...params];
    plus[index] += step;
    minus[index] -= step;
    return (model(dose, plus) - model(dose, minus)) / (2 * step);
  });

  let variance = 0;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      variance +=
        gradient[row] * fit.covariance[row][column] * gradient[column];
    }
  }
  const standardError = Math.sqrt(Math.max(0, variance));
  if (!Number.isFinite(standardError)) {
    return null;
  }
  const margin = fit.tCritical * standardError;
  return [predicted - margin, predicted + margin];
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

export function doseResponseCsv(
  data: DoseResponseData,
  summaries: readonly DoseResponseSummary[] = summarizeDoseResponse(data),
  fit: DoseResponseFit | null = null,
): string {
  const doseUnit = data.doseUnit ?? DOSE_FALLBACK;
  const responseLabel = data.responseLabel ?? RESPONSE_FALLBACK;
  const header = [
    `dose_${doseUnit}`,
    ...data.replicates.map(
      (replicate) => `${responseLabel}_${replicate.label}`,
    ),
    `mean_${responseLabel}`,
    `sd_${responseLabel}`,
    "n",
    `fit_${responseLabel}`,
  ];
  const rows = summaries.map((summary) => {
    const fitted = fit ? predictDoseResponse(fit, summary.dose) : null;
    return [
      exportNumber(summary.dose),
      ...summary.values.map((value) =>
        value === null ? "" : exportNumber(value),
      ),
      summary.mean === null ? "" : exportNumber(summary.mean),
      summary.sd === null ? "" : exportNumber(summary.sd),
      String(summary.n),
      fitted === null ? "" : exportNumber(fitted),
    ];
  });

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
        Pass doses with one response per replicate. A null response is a missed
        read and stays a gap. Positive doses are required for a 4PL fit.
      </p>
    </div>
  );
}

export function DoseResponseCurve({
  data,
  defaultScale = "log",
  defaultShowReplicates = true,
  showFit = true,
  fitOptions,
  emptyLabel = "No dose-response data loaded.",
  onExport,
  className,
  ...props
}: DoseResponseCurveProps): React.ReactElement {
  const [chartRef, width] = useWidth();
  const [scale, setScale] = React.useState<"log" | "linear">(defaultScale);
  const [showReplicates, setShowReplicates] = React.useState(
    defaultShowReplicates,
  );
  const [tableOpen, setTableOpen] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
  const baseId = React.useId().replaceAll(":", "");
  const titleId = `dose-response-title-${baseId}`;
  const summaryId = `dose-response-summary-${baseId}`;
  const tableId = `dose-response-table-${baseId}`;
  const clipId = `dose-response-clip-${baseId}`;

  const summaries = React.useMemo(
    () => (data ? summarizeDoseResponse(data) : []),
    [data],
  );

  React.useEffect(() => {
    setFocusIndex(null);
    setTableOpen(false);
  }, [data?.id]);

  const fit = React.useMemo(() => {
    if (!showFit || summaries.length === 0) {
      return null;
    }
    return fitDoseResponse(summaries, fitOptions);
  }, [fitOptions, showFit, summaries]);
  const minFitPoints = Math.max(4, Math.floor(fitOptions?.minPoints ?? 4));
  const minFitRSquared = fitOptions?.minRSquared ?? 0.5;

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
        data-slot="dose-response-curve"
        {...props}
      >
        <EmptyState label={emptyLabel} />
      </section>
    );
  }

  const doseUnit = data.doseUnit ?? DOSE_FALLBACK;
  const responseLabel = data.responseLabel ?? RESPONSE_FALLBACK;
  const responseUnit = data.responseUnit ?? RESPONSE_UNIT_FALLBACK;
  const responseHeading = responseUnit
    ? `${responseLabel} (${responseUnit})`
    : responseLabel;
  const firstDose = summaries[0].dose;
  const lastDose = summaries.at(-1)?.dose ?? firstDose;
  const totalReads = summaries.length * data.replicates.length;
  const presentReads = summaries.reduce((sum, row) => sum + row.n, 0);
  const missingReads = Math.max(0, totalReads - presentReads);
  const nonPositiveDoses = summaries.filter((row) => row.dose <= 0).length;
  const positiveSummaries = summaries.filter((row) => row.dose > 0);
  const minPositive = positiveSummaries[0]?.dose ?? null;
  const maxPositive = positiveSummaries.at(-1)?.dose ?? null;

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

  const canPlotLog = minPositive !== null;
  const plotScale = scale === "log" && !canPlotLog ? "linear" : scale;
  const focusableRows = plotScale === "log" ? positiveSummaries : summaries;
  const xLower =
    plotScale === "log" && minPositive !== null && maxPositive !== null
      ? niceLogFloor(minPositive / 10 ** 0.12)
      : Math.min(0, firstDose);
  const xUpper =
    plotScale === "log" && maxPositive !== null
      ? niceLogCeil(maxPositive * 10 ** 0.12)
      : Math.max(lastDose * 1.05, xLower + 1);
  const xSpan = xUpper - xLower;
  const logLower = xLower > 0 ? Math.log10(xLower) : 0;
  const logSpan =
    plotScale === "log" && xUpper > 0 ? Math.log10(xUpper) - logLower : 1;

  const xScale = (dose: number) =>
    plotScale === "log"
      ? plotLeft +
        ((Math.log10(dose) - logLower) / Math.max(logSpan, 1e-9)) * plotWidth
      : plotLeft + ((dose - xLower) / Math.max(xSpan, 1e-9)) * plotWidth;

  const drawableDose = (dose: number): boolean =>
    Number.isFinite(dose) && (plotScale === "linear" || dose > 0);

  const curveLower =
    plotScale === "log"
      ? Math.max(xLower, minPositive ?? xLower)
      : Math.max(xLower, (minPositive ?? xUpper) * 0.01);
  const curveUpper = Math.max(curveLower * 1.001, xUpper);
  const curveDoses = fit
    ? Array.from({ length: CURVE_STEPS + 1 }, (_, index) => {
        const fraction = index / CURVE_STEPS;
        if (plotScale === "log") {
          return (
            10 **
            (Math.log10(curveLower) +
              fraction * Math.log10(curveUpper / curveLower))
          );
        }
        return curveLower + fraction * (curveUpper - curveLower);
      })
    : [];

  const observedValues = summaries
    .flatMap((row) => [row.mean, ...row.values])
    .filter(isFiniteNumber);
  const fittedValues = curveDoses
    .map((dose) => (fit ? predictDoseResponse(fit, dose) : null))
    .filter(isFiniteNumber);
  const domainValues = [...observedValues, ...fittedValues];
  const observedMin = domainValues.length > 0 ? Math.min(...domainValues) : 0;
  const observedMax = domainValues.length > 0 ? Math.max(...domainValues) : 1;
  const rawSpan = observedMax - observedMin;
  const yPad = rawSpan > 0 ? rawSpan * 0.08 : 1;
  const yLower =
    observedMin >= 0 ? Math.min(0, observedMin - yPad) : observedMin - yPad;
  const yUpper = observedMax + yPad;
  const yScale = (value: number) =>
    plotBottom -
    ((value - yLower) / Math.max(yUpper - yLower, Number.EPSILON)) * plotHeight;
  const drawableResponse = (value: number | null): value is number =>
    value !== null && Number.isFinite(value);

  const yTicksValues = linearTicks(yLower, yUpper, compact ? 4 : 5);
  const xTicksValues =
    plotScale === "log"
      ? logTicks(xLower, xUpper)
      : linearTicks(xLower, xUpper, compact ? 4 : 6);
  const xTickLabels =
    plotScale === "log" && xTicksValues.length > 8
      ? new Set(
          xTicksValues.filter((value) => {
            const normalized = value / 10 ** Math.floor(Math.log10(value));
            return Math.abs(normalized - 1) < 1e-9;
          }),
        )
      : null;

  const meanPoints = summaries
    .filter((row) => drawableDose(row.dose) && drawableResponse(row.mean))
    .map((row) => ({
      dose: row.dose,
      mean: row.mean as number,
      x: xScale(row.dose),
      y: yScale(row.mean as number),
    }));

  const fitCurve = fit
    ? linePath(
        curveDoses.map((dose) => {
          const value = predictDoseResponse(fit, dose);
          return value === null ? null : { x: xScale(dose), y: yScale(value) };
        }),
      )
    : "";

  const bandPoints = fit
    ? curveDoses
        .map((dose) => {
          const band = doseResponseBand(fit, dose);
          return band === null
            ? null
            : {
                dose,
                lower: yScale(band[0]),
                upper: yScale(band[1]),
              };
        })
        .filter((point): point is NonNullable<typeof point> => point !== null)
    : [];
  const bandPath =
    bandPoints.length > 1
      ? `M ${bandPoints
          .map(
            (point) =>
              `${xScale(point.dose).toFixed(2)} ${point.upper.toFixed(2)}`,
          )
          .join(" L ")} L ${[...bandPoints]
          .reverse()
          .map(
            (point) =>
              `${xScale(point.dose).toFixed(2)} ${point.lower.toFixed(2)}`,
          )
          .join(" L ")} Z`
      : "";

  const safeFocus =
    focusIndex === null
      ? null
      : Math.min(Math.max(focusIndex, 0), focusableRows.length - 1);
  const focusedRow = safeFocus === null ? null : focusableRows[safeFocus];
  const focusedFit =
    fit && focusedRow ? predictDoseResponse(fit, focusedRow.dose) : null;

  const focusStartIndex = (() => {
    if (fit && focusableRows.length > 0) {
      let best = 0;
      let distance = Number.POSITIVE_INFINITY;
      for (const [index, row] of focusableRows.entries()) {
        if (!drawableDose(row.dose)) {
          continue;
        }
        const nextDistance = Math.abs(
          Math.log10(row.dose) - Math.log10(fit.halfMax),
        );
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
      ? `${formatValue(focusedRow.dose)} ${doseUnit} · no reads`
      : `${formatValue(focusedRow.dose)} ${doseUnit} · mean ${formatValue(
          focusedRow.mean,
        )}${
          focusedRow.sd === null ? "" : ` ± ${formatValue(focusedRow.sd)}`
        } ${responseUnit} · n=${focusedRow.n}${
          focusedFit === null
            ? ""
            : ` · fit ${formatValue(focusedFit)} ${responseUnit}`
        }`
    : "Focus the chart and use the left and right arrow keys to inspect a dose.";

  const halfMaxCiText = fit?.halfMaxCi
    ? formatRange(fit.halfMaxCi[0], fit.halfMaxCi[1], doseUnit)
    : "—";

  const summaryText = `${data.name}. ${data.replicates.length} replicates, ${summaries.length} doses from ${formatRange(firstDose, lastDose, doseUnit)}. ${
    fit
      ? `${fit.halfMaxLabel} ${formatValue(fit.halfMax)} ${doseUnit}${
          fit.halfMaxCi
            ? `, 95% confidence interval ${formatRange(fit.halfMaxCi[0], fit.halfMaxCi[1], doseUnit)}`
            : ""
        }, ${fit.direction} 4PL fit, R squared ${fit.rSquared.toFixed(3)}.`
      : showFit
        ? "No 4PL fit was detected."
        : "4PL fit hidden."
  } ${missingReads} missed read${missingReads === 1 ? "" : "s"}. Use the left and right arrow keys to inspect doses, or open the data table for exact values.`;

  function moveFocus(key: string): void {
    const current = safeFocus ?? focusStartIndex;
    let next = current;
    if (key === "ArrowLeft") {
      next = Math.max(0, current - 1);
    } else if (key === "ArrowRight") {
      next = Math.min(focusableRows.length - 1, current + 1);
    } else if (key === "Home") {
      next = 0;
    } else if (key === "End") {
      next = focusableRows.length - 1;
    } else {
      return;
    }
    setFocusIndex(next);
  }

  function handleExport(): void {
    if (!data) {
      return;
    }
    const csv = doseResponseCsv(data, summaries, fit);
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
    anchor.download = `dose-response-${data.id.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.csv`;
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
      data-slot="dose-response-curve"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">
              {data.id}
              {data.compound ? ` · ${data.compound}` : ""}
              {data.cellLine ? ` · ${data.cellLine}` : ""}
              {data.duration ? ` · ${data.duration}` : ""}
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
              {summaries.length} dose{summaries.length === 1 ? "" : "s"}
            </span>
            <span dir="ltr">
              {data.replicates.length} replicate
              {data.replicates.length === 1 ? "" : "s"}
            </span>
            <span dir="ltr">{formatRange(firstDose, lastDose, doseUnit)}</span>
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
              aria-label="X-axis scale"
              className="flex items-center gap-0.5 rounded-lg border p-0.5"
              role="group"
            >
              <Button
                aria-pressed={scale === "log"}
                className="rounded-md"
                onClick={() => {
                  setScale("log");
                  setFocusIndex(null);
                }}
                size="xs"
                type="button"
                variant={scale === "log" ? "secondary" : "ghost"}
              >
                Log
              </Button>
              <Button
                aria-pressed={scale === "linear"}
                className="rounded-md"
                onClick={() => {
                  setScale("linear");
                  setFocusIndex(null);
                }}
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
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SERIES_COLOR }}
                />
                Mean
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-3 w-px"
                  style={{ backgroundColor: SERIES_COLOR }}
                />
                ±1 SD
              </span>
              {fit ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-0.5 w-4 rounded-full"
                      style={{ backgroundColor: SERIES_COLOR }}
                    />
                    4PL fit
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2 w-4 rounded-sm border"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-chart-5) 14%, transparent)",
                        borderColor:
                          "color-mix(in srgb, var(--color-chart-5) 35%, transparent)",
                      }}
                    />
                    95% CI
                  </span>
                </>
              ) : null}
              {showReplicates ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: REPLICATE_COLOR }}
                  />
                  Replicates
                </span>
              ) : null}
            </div>
          </div>

          <div className="px-2 pt-1">
            <div ref={chartRef}>
              <div
                aria-describedby={summaryId}
                aria-label={`${data.name} dose-response curve dose cursor`}
                aria-orientation="horizontal"
                aria-valuemax={focusableRows.at(-1)?.dose ?? lastDose}
                aria-valuemin={focusableRows[0]?.dose ?? firstDose}
                aria-valuenow={
                  focusedRow?.dose ??
                  focusableRows[focusStartIndex]?.dose ??
                  firstDose
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
                        </g>
                      );
                    })}
                    {xTicksValues.map((value) => {
                      if (!drawableDose(value)) {
                        return null;
                      }
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
                          {xTickLabels === null || xTickLabels.has(value) ? (
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
                          ) : null}
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
                      Dose ({doseUnit})
                    </text>
                    <text
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                      fontSize={9}
                      textAnchor="middle"
                      transform={`translate(11 ${plotTop + plotHeight / 2}) rotate(-90)`}
                    >
                      {responseHeading}
                    </text>
                  </g>

                  <g clipPath={`url(#${clipId})`}>
                    {bandPath ? (
                      <path
                        d={bandPath}
                        fill={SERIES_COLOR}
                        fillOpacity={0.12}
                      />
                    ) : null}

                    {fit && fit.halfMax >= xLower && fit.halfMax <= xUpper ? (
                      <line
                        stroke="var(--color-muted-foreground)"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        x1={xScale(fit.halfMax)}
                        x2={xScale(fit.halfMax)}
                        y1={plotTop}
                        y2={plotBottom}
                      />
                    ) : null}

                    {showReplicates
                      ? summaries.map((row) =>
                          drawableDose(row.dose)
                            ? data.replicates.map((replicate, index) => {
                                const value = row.values[index];
                                return drawableResponse(value) ? (
                                  <circle
                                    cx={xScale(row.dose)}
                                    cy={yScale(value)}
                                    fill={REPLICATE_COLOR}
                                    fillOpacity={0.55}
                                    key={`${replicate.id}-${row.dose}`}
                                    r={1.75}
                                  />
                                ) : null;
                              })
                            : null,
                        )
                      : null}

                    {summaries.map((row) => {
                      if (
                        !drawableDose(row.dose) ||
                        !drawableResponse(row.mean) ||
                        row.sd === null
                      ) {
                        return null;
                      }
                      const x = xScale(row.dose);
                      const lower = yScale(row.mean - row.sd);
                      const upper = yScale(row.mean + row.sd);
                      return (
                        <line
                          key={`sd-${row.dose}`}
                          stroke={SERIES_COLOR}
                          strokeOpacity={0.65}
                          strokeWidth={1}
                          x1={x}
                          x2={x}
                          y1={lower}
                          y2={upper}
                        />
                      );
                    })}

                    {fit && fitCurve ? (
                      <path
                        d={fitCurve}
                        fill="none"
                        stroke={SERIES_COLOR}
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                      />
                    ) : null}

                    {meanPoints.map((point) => (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        fill={SERIES_COLOR}
                        key={`mean-${point.dose}`}
                        r={3}
                        stroke="var(--color-background)"
                        strokeWidth={1}
                      />
                    ))}

                    {focusedRow &&
                    drawableDose(focusedRow.dose) &&
                    drawableResponse(focusedRow.mean) ? (
                      <g>
                        <line
                          stroke="var(--color-foreground)"
                          strokeOpacity={0.32}
                          x1={xScale(focusedRow.dose)}
                          x2={xScale(focusedRow.dose)}
                          y1={plotTop}
                          y2={plotBottom}
                        />
                        <circle
                          cx={xScale(focusedRow.dose)}
                          cy={yScale(focusedRow.mean)}
                          fill="none"
                          r={5}
                          stroke={SERIES_COLOR}
                          strokeWidth={1.5}
                        />
                      </g>
                    ) : null}
                  </g>

                  {fit && fit.halfMax >= xLower && fit.halfMax <= xUpper ? (
                    <text
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                      fontSize={9}
                      textAnchor={
                        xScale(fit.halfMax) > plotRight - 60 ? "end" : "start"
                      }
                      x={
                        xScale(fit.halfMax) +
                        (xScale(fit.halfMax) > plotRight - 60 ? -4 : 4)
                      }
                      y={plotTop + 10}
                    >
                      {fit.halfMaxLabel} {formatValue(fit.halfMax)}
                    </text>
                  ) : null}
                </svg>
              </div>
            </div>
          </div>

          <div
            className="border-t bg-muted/24 px-3 py-2 print:hidden"
            id={`dose-response-readout-${baseId}`}
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
                    <TableHead scope="col">Dose ({doseUnit})</TableHead>
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
                    <TableHead className="text-end" scope="col">
                      Fit
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((row) => {
                    const fitted = fit
                      ? predictDoseResponse(fit, row.dose)
                      : null;
                    return (
                      <TableRow key={row.dose}>
                        <TableCell className="font-mono tabular-nums">
                          {formatValue(row.dose)}
                        </TableCell>
                        {row.values.map((value, index) => (
                          <TableCell
                            className={cn(
                              "font-mono tabular-nums",
                              value === null && "text-muted-foreground",
                            )}
                            key={`${data.replicates[index]?.id ?? index}-${row.dose}`}
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
                        <TableCell className="text-end font-mono tabular-nums">
                          {fitted === null ? "—" : formatValue(fitted)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <section
          aria-label="Dose-response analysis"
          className="grid content-start gap-4 p-3"
        >
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                Half-max
              </h4>
              <StatusBadge
                label={
                  !showFit
                    ? "Hidden"
                    : fit
                      ? fit.rSquared >= 0.9
                        ? "Good fit"
                        : "Check fit"
                      : "No fit"
                }
                size="sm"
                status={
                  !showFit
                    ? "idle"
                    : fit
                      ? fit.rSquared >= 0.9
                        ? "success"
                        : "warning"
                      : "idle"
                }
              />
            </div>
            {!showFit ? (
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                The 4PL fit is hidden. Turn on{" "}
                <span className="font-mono">showFit</span> to report a half-max.
              </p>
            ) : fit ? (
              <>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
                  <dt className="text-muted-foreground">{fit.halfMaxLabel}</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatValue(fit.halfMax)} {doseUnit}
                  </dd>
                  <dt className="text-muted-foreground">95% CI</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {halfMaxCiText}
                  </dd>
                  <dt className="text-muted-foreground">Low dose</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatValue(fit.plateauLow)} {responseUnit}
                  </dd>
                  <dt className="text-muted-foreground">High dose</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    {formatValue(fit.plateauHigh)} {responseUnit}
                  </dd>
                  <dt className="text-muted-foreground">Hill</dt>
                  <dd className="font-mono tabular-nums">
                    {fit.hill.toFixed(2)}
                  </dd>
                  <dt className="text-muted-foreground">Fit</dt>
                  <dd className="font-mono tabular-nums" dir="ltr">
                    R² {fit.rSquared.toFixed(3)}
                  </dd>
                  <dt className="text-muted-foreground">Points</dt>
                  <dd className="font-mono tabular-nums">{fit.points}</dd>
                </dl>
                <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                  Unweighted 4PL on the mean response. The 95% interval is
                  asymptotic and should be checked before reporting.
                </p>
                {fit.rSquared < 0.9 ? (
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                    <TriangleAlertIcon
                      aria-hidden="true"
                      className="mt-0.5 size-3 shrink-0"
                    />
                    The fit is below R² 0.90. Inspect the points and the design
                    before using this half-max.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                No 4PL fit. Need at least {minFitPoints} positive doses and an
                R² of at least {minFitRSquared.toFixed(2)}.
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
              <dt className="text-muted-foreground">Doses</dt>
              <dd className="font-mono">{summaries.length}</dd>
              <dt className="text-muted-foreground">Present</dt>
              <dd className="font-mono tabular-nums">
                {presentReads} / {totalReads}
              </dd>
              <dt className="text-muted-foreground">Missed</dt>
              <dd className="font-mono tabular-nums">{missingReads}</dd>
              {nonPositiveDoses > 0 ? (
                <>
                  <dt className="text-muted-foreground">Non-positive</dt>
                  <dd className="font-mono tabular-nums">{nonPositiveDoses}</dd>
                </>
              ) : null}
            </dl>
            {nonPositiveDoses > 0 && plotScale === "log" ? (
              <p className="mt-2 flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="mt-0.5 size-3 shrink-0"
                />
                Non-positive doses are hidden on the log scale, excluded from
                the fit, and kept in the table.
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
