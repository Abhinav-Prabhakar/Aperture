"use client";

import {
  DownloadIcon,
  Table2Icon,
  TriangleAlertIcon,
  WavesIcon,
} from "lucide-react";
import * as React from "react";
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

export type SpectrumMode = "emission" | "absorption";

export type SpectrumPoint = {
  /** Position on the wavelength axis, in `data.wavelengthUnit`. */
  wavelength: number;
  /** Measured intensity in `data.intensityUnit`. */
  intensity: number;
  /** One-sigma uncertainty in intensity units, when known. */
  uncertainty?: number | null;
};

export type SpectrumLine = {
  id: string;
  /** Rest or laboratory wavelength in `data.wavelengthUnit`. */
  wavelength: number;
  /** Species or transition, for example "Hα" or "[O III]". */
  species: string;
  label?: string;
};

export type SpectrumData = {
  id: string;
  name: string;
  description?: string;
  sample?: string;
  instrument?: string;
  /** Default "emission". Absorption looks for troughs. */
  mode?: SpectrumMode;
  /** Default "nm". */
  wavelengthUnit?: string;
  /** Default "a.u.". */
  intensityLabel?: string;
  intensityUnit?: string;
  points: readonly SpectrumPoint[];
  lines?: readonly SpectrumLine[];
  source?: string;
};

export type SpectrumPointSummary = {
  wavelength: number;
  intensity: number;
  uncertainty: number | null;
};

export type SpectrumSummary = {
  points: readonly SpectrumPointSummary[];
  minWavelength: number;
  maxWavelength: number;
  minIntensity: number;
  maxIntensity: number;
  hasUncertainty: boolean;
  /** Points dropped because a coordinate or reading was not finite. */
  missing: number;
  /** Median spacing between adjacent wavelengths. */
  resolution: number | null;
};

export type SpectrumPeak = {
  /** Index into the sorted, finite point array. */
  index: number;
  wavelength: number;
  intensity: number;
  prominence: number;
  /** Full width at half prominence, in wavelength units. */
  fwhm: number | null;
};

export type SpectrumLineMatch = {
  line: SpectrumLine;
  peak: SpectrumPeak | null;
  /** Observed minus reference wavelength, in wavelength units. */
  residual: number | null;
  /** True when more than one reference line is nearest to the same peak. */
  blended: boolean;
};

export type SpectrumOptions = {
  /** Odd moving-average window used for the smoothed trace and detection. */
  smoothingWindow?: number;
  /** Minimum prominence as a fraction of the observed range. Default 0.04. */
  minProminence?: number;
  /** Minimum separation between accepted peaks, in wavelength units. Default 1.5. */
  minSeparation?: number;
  /** Maximum number of reported peaks. Default 24. */
  maxPeaks?: number;
  /** Reference-line match tolerance, in wavelength units. Default 1.5. */
  lineTolerance?: number;
};

export type SpectrumPlotProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  data: SpectrumData | null;
  /** Start with the smoothed trace. Default true. */
  defaultSmoothing?: boolean;
  /** Start with the linear baseline removed. Default false. */
  defaultBaseline?: boolean;
  /** Draw detected peaks. Default true. */
  showPeaks?: boolean;
  /** Draw reference lines and the match table. Default true. */
  showLines?: boolean;
  /** Draw the uncertainty band when the data carries uncertainty. Default true. */
  showUncertainty?: boolean;
  options?: SpectrumOptions;
  emptyLabel?: React.ReactNode;
  /** Called with the CSV before the browser download starts. */
  onExport?: (csv: string) => void;
};

const CHART_HEIGHT = 280;
const DEFAULT_WINDOW = 5;
const DEFAULT_TOLERANCE = 1.5;
const NUMBER = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 4,
});
const SERIES_COLOR = "var(--color-chart-5)";
const RAW_COLOR = "var(--color-chart-8)";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function superscript(value: number): string {
  return String(value)
    .split("")
    .map((character) => SUPERSCRIPT[character] ?? character)
    .join("");
}

function formatValue(value: number): string {
  if (value === 0) {
    return "0";
  }
  const magnitude = Math.abs(value);
  if (magnitude >= 100_000 || magnitude < 0.001) {
    const [coefficient, exponent] = value.toExponential(2).split("e");
    return `${coefficient} × 10${superscript(Number(exponent))}`;
  }
  return NUMBER.format(value);
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function oddWindow(value: number | undefined): number {
  const requested = Math.max(3, Math.floor(value ?? DEFAULT_WINDOW));
  return requested % 2 === 0 ? requested + 1 : requested;
}

export function summarizeSpectrum(data: SpectrumData): SpectrumSummary {
  let missing = 0;
  const points: SpectrumPointSummary[] = [];

  for (const point of data.points) {
    if (!isFiniteNumber(point.wavelength) || !isFiniteNumber(point.intensity)) {
      missing += 1;
      continue;
    }
    points.push({
      intensity: point.intensity,
      uncertainty: isFiniteNumber(point.uncertainty)
        ? Math.abs(point.uncertainty)
        : null,
      wavelength: point.wavelength,
    });
  }

  points.sort((left, right) => left.wavelength - right.wavelength);

  if (points.length === 0) {
    return {
      hasUncertainty: false,
      maxIntensity: 0,
      maxWavelength: 0,
      minIntensity: 0,
      minWavelength: 0,
      missing,
      points,
      resolution: null,
    };
  }

  const spacings: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const spacing = points[index].wavelength - points[index - 1].wavelength;
    if (spacing > 0) {
      spacings.push(spacing);
    }
  }

  return {
    hasUncertainty: points.some((point) => point.uncertainty !== null),
    maxIntensity: Math.max(...points.map((point) => point.intensity)),
    maxWavelength: points[points.length - 1].wavelength,
    minIntensity: Math.min(...points.map((point) => point.intensity)),
    minWavelength: points[0].wavelength,
    missing,
    points,
    resolution: spacings.length > 0 ? median(spacings) : null,
  };
}

/** Centered moving average with a shrinking window at the edges. */
export function smoothSpectrum(
  points: readonly SpectrumPointSummary[],
  window = DEFAULT_WINDOW,
): number[] {
  const width = oddWindow(window);
  const half = Math.floor(width / 2);
  return points.map((_, index) => {
    const start = Math.max(0, index - half);
    const end = Math.min(points.length - 1, index + half);
    let sum = 0;
    for (let cursor = start; cursor <= end; cursor += 1) {
      sum += points[cursor].intensity;
    }
    return sum / (end - start + 1);
  });
}

export type SpectrumBaseline = {
  /** Intensity at the first observed wavelength. */
  intercept: number;
  /** Intensity change per wavelength unit. */
  slope: number;
  at: (wavelength: number) => number;
  /** Baseline value at each input point. */
  values: number[];
};

/**
 * A linear continuum estimated from the median of the outer 10% of points.
 * This is a display aid, not a physical continuum model.
 */
export function spectrumBaseline(
  points: readonly SpectrumPointSummary[],
  fraction = 0.1,
): SpectrumBaseline {
  if (points.length === 0) {
    return { at: () => 0, intercept: 0, slope: 0, values: [] };
  }

  if (points.length < 4) {
    const value = median(points.map((point) => point.intensity));
    return {
      at: () => value,
      intercept: value,
      slope: 0,
      values: points.map(() => value),
    };
  }

  const edgeCount = Math.max(2, Math.round(points.length * fraction));
  const left = points.slice(0, edgeCount);
  const right = points.slice(-edgeCount);
  const leftX = median(left.map((point) => point.wavelength));
  const rightX = median(right.map((point) => point.wavelength));
  const leftY = median(left.map((point) => point.intensity));
  const rightY = median(right.map((point) => point.intensity));

  if (!(rightX > leftX)) {
    const value = median([leftY, rightY]);
    return {
      at: () => value,
      intercept: value,
      slope: 0,
      values: points.map(() => value),
    };
  }

  const slope = (rightY - leftY) / (rightX - leftX);
  const intercept = leftY - slope * leftX;
  const at = (wavelength: number) => intercept + slope * wavelength;

  return {
    at,
    intercept,
    slope,
    values: points.map((point) => at(point.wavelength)),
  };
}

function crossing(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  level: number,
): number | null {
  if (!(y1 !== y2)) {
    return null;
  }
  const ratio = (level - y1) / (y2 - y1);
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    return null;
  }
  return x1 + ratio * (x2 - x1);
}

export function findSpectrumPeaks(
  points: readonly Pick<SpectrumPointSummary, "wavelength" | "intensity">[],
  options: SpectrumOptions & { direction?: "max" | "min" } = {},
): SpectrumPeak[] {
  if (points.length < 3) {
    return [];
  }

  const direction = options.direction ?? "max";
  const sign = direction === "max" ? 1 : -1;
  const values = points.map((point) => sign * point.intensity);
  const observedMin = Math.min(...values);
  const observedMax = Math.max(...values);
  const range = observedMax - observedMin;

  if (!(range > 0)) {
    return [];
  }

  const minimumProminence =
    (options.minProminence ?? 0.04) * Math.max(range, Number.EPSILON);
  const minimumSeparation = Math.max(0, options.minSeparation ?? 1.5);
  const maxPeaks = Math.max(1, Math.floor(options.maxPeaks ?? 24));
  const candidates: SpectrumPeak[] = [];

  for (let index = 1; index < points.length - 1; index += 1) {
    const value = values[index];
    if (!(value > values[index - 1] && value >= values[index + 1])) {
      continue;
    }

    let leftFloor = value;
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      leftFloor = Math.min(leftFloor, values[cursor]);
      if (values[cursor] > value) {
        break;
      }
    }

    let rightFloor = value;
    for (let cursor = index + 1; cursor < points.length; cursor += 1) {
      rightFloor = Math.min(rightFloor, values[cursor]);
      if (values[cursor] > value) {
        break;
      }
    }

    const prominence = value - Math.max(leftFloor, rightFloor);
    if (!(prominence >= minimumProminence)) {
      continue;
    }

    const half = value - prominence / 2;
    let left: number | null = null;
    for (let cursor = index; cursor > 0; cursor -= 1) {
      if (values[cursor - 1] <= half) {
        left = crossing(
          points[cursor].wavelength,
          values[cursor],
          points[cursor - 1].wavelength,
          values[cursor - 1],
          half,
        );
        break;
      }
    }

    let right: number | null = null;
    for (let cursor = index; cursor < points.length - 1; cursor += 1) {
      if (values[cursor + 1] <= half) {
        right = crossing(
          points[cursor].wavelength,
          values[cursor],
          points[cursor + 1].wavelength,
          values[cursor + 1],
          half,
        );
        break;
      }
    }

    candidates.push({
      fwhm:
        left !== null && right !== null && right > left ? right - left : null,
      index,
      intensity: points[index].intensity,
      prominence,
      wavelength: points[index].wavelength,
    });
  }

  candidates.sort(
    (left, right) =>
      right.prominence - left.prominence || left.wavelength - right.wavelength,
  );

  const accepted: SpectrumPeak[] = [];
  for (const candidate of candidates) {
    if (
      accepted.some(
        (peak) =>
          Math.abs(peak.wavelength - candidate.wavelength) < minimumSeparation,
      )
    ) {
      continue;
    }
    accepted.push(candidate);
    if (accepted.length >= maxPeaks) {
      break;
    }
  }

  return accepted.sort((left, right) => left.wavelength - right.wavelength);
}

/** Robust per-point noise estimate from the median absolute first difference. */
export function estimateSpectrumNoise(
  points: readonly Pick<SpectrumPointSummary, "intensity">[],
): number | null {
  if (points.length < 4) {
    return null;
  }
  const differences: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    differences.push(points[index].intensity - points[index - 1].intensity);
  }
  const center = median(differences);
  const mad = median(differences.map((value) => Math.abs(value - center)));
  const sigma = (1.4826 * mad) / Math.SQRT2;
  return Number.isFinite(sigma) ? sigma : null;
}

export function matchSpectrumLines(
  peaks: readonly SpectrumPeak[],
  lines: readonly SpectrumLine[],
  tolerance = DEFAULT_TOLERANCE,
): SpectrumLineMatch[] {
  const used = new Map<number, number>();
  const matches = lines.map((line) => {
    let best: SpectrumPeak | null = null;
    let distance = Number.POSITIVE_INFINITY;
    for (const peak of peaks) {
      const next = Math.abs(peak.wavelength - line.wavelength);
      if (next < distance) {
        best = peak;
        distance = next;
      }
    }
    if (best && distance <= tolerance) {
      used.set(best.index, (used.get(best.index) ?? 0) + 1);
      return {
        blended: false,
        line,
        peak: best,
        residual: best.wavelength - line.wavelength,
      };
    }
    return { blended: false, line, peak: null, residual: null };
  });

  return matches.map((match) =>
    match.peak && (used.get(match.peak.index) ?? 0) > 1
      ? { ...match, blended: true }
      : match,
  );
}

function exportNumber(value: number): string {
  return Number(value.toPrecision(12)).toString();
}

function csvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function spectrumCsv(
  data: SpectrumData,
  options: SpectrumOptions = {},
): string {
  const summary = summarizeSpectrum(data);
  const baseline = spectrumBaseline(summary.points);
  const corrected = summary.points.map(
    (point, index) => point.intensity - baseline.values[index],
  );
  const smoothed = smoothSpectrum(summary.points, options.smoothingWindow);
  const correctedSmoothed = smoothSpectrum(
    summary.points.map((point, index) => ({
      ...point,
      intensity: corrected[index],
    })),
    options.smoothingWindow,
  );
  const peaks = findSpectrumPeaks(
    summary.points.map((point, index) => ({
      intensity: correctedSmoothed[index],
      wavelength: point.wavelength,
    })),
    {
      ...options,
      direction: (data.mode ?? "emission") === "absorption" ? "min" : "max",
    },
  );
  const peakIndices = new Set(peaks.map((peak) => peak.index));
  const wavelengthUnit = (data.wavelengthUnit ?? "nm").replaceAll(
    /[^a-zA-Z0-9]/g,
    "",
  );

  const rows = summary.points.map((point, index) => [
    exportNumber(point.wavelength),
    exportNumber(point.intensity),
    exportNumber(smoothed[index]),
    exportNumber(corrected[index]),
    point.uncertainty === null ? "" : exportNumber(point.uncertainty),
    peakIndices.has(index) ? "1" : "0",
  ]);

  return [
    [
      `wavelength_${wavelengthUnit}`,
      "intensity",
      "smoothed",
      "baseline_corrected",
      "uncertainty",
      "is_peak",
    ],
    ...rows,
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
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
      <WavesIcon aria-hidden="true" className="size-5 text-muted-foreground" />
      <p className="font-medium text-sm">{label}</p>
      <p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
        Pass wavelength and intensity points with an optional one-sigma
        uncertainty. Add reference lines to identify peaks by species.
      </p>
    </div>
  );
}

export function SpectrumPlot({
  data,
  defaultSmoothing = true,
  defaultBaseline = false,
  showPeaks = true,
  showLines = true,
  showUncertainty = true,
  options = {},
  emptyLabel = "No spectrum loaded.",
  onExport,
  className,
  ...props
}: SpectrumPlotProps): React.ReactElement {
  const [chartRef, width] = useWidth();
  const [smoothing, setSmoothing] = React.useState(defaultSmoothing);
  const [baselineOn, setBaselineOn] = React.useState(defaultBaseline);
  const [peaksOn, setPeaksOn] = React.useState(showPeaks);
  const [linesOn, setLinesOn] = React.useState(showLines);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
  const baseId = React.useId().replaceAll(":", "");
  const titleId = `spectrum-title-${baseId}`;
  const summaryId = `spectrum-summary-${baseId}`;
  const tableId = `spectrum-table-${baseId}`;
  const clipId = `spectrum-clip-${baseId}`;

  const summary = React.useMemo(
    () => (data ? summarizeSpectrum(data) : null),
    [data],
  );
  const lines = React.useMemo(
    () =>
      data?.lines
        ? [...data.lines].sort(
            (left, right) => left.wavelength - right.wavelength,
          )
        : [],
    [data?.lines],
  );

  React.useEffect(() => {
    setFocusIndex(null);
    setTableOpen(false);
  }, [data?.id]);

  const baseline = React.useMemo(
    () => spectrumBaseline(summary?.points ?? [], 0.1),
    [summary?.points],
  );

  const corrected = React.useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.points.map(
      (point, index) => point.intensity - baseline.values[index],
    );
  }, [baseline.values, summary]);

  const workingValues = React.useMemo(
    () =>
      baselineOn ? corrected : (summary?.points ?? []).map((p) => p.intensity),
    [baselineOn, corrected, summary?.points],
  );

  const smoothedValues = React.useMemo(
    () =>
      smoothSpectrum(
        (summary?.points ?? []).map((point, index) => ({
          ...point,
          intensity: workingValues[index],
        })),
        options.smoothingWindow,
      ),
    [options.smoothingWindow, summary?.points, workingValues],
  );

  const detectionPoints = React.useMemo(
    () =>
      (summary?.points ?? []).map((point, index) => ({
        intensity: smoothedValues[index],
        wavelength: point.wavelength,
      })),
    [smoothedValues, summary?.points],
  );

  const peaks = React.useMemo(
    () =>
      findSpectrumPeaks(detectionPoints, {
        ...options,
        direction: (data?.mode ?? "emission") === "absorption" ? "min" : "max",
      }),
    [data?.mode, detectionPoints, options],
  );

  const matches = React.useMemo(
    () =>
      matchSpectrumLines(
        peaks,
        lines,
        options.lineTolerance ?? DEFAULT_TOLERANCE,
      ),
    [lines, options.lineTolerance, peaks],
  );

  const noise = React.useMemo(
    () => estimateSpectrumNoise(summary?.points ?? []),
    [summary?.points],
  );

  if (!data || !summary || summary.points.length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
        data-slot="spectrum-plot"
        {...props}
      >
        <EmptyState label={emptyLabel} />
      </section>
    );
  }

  const wavelengthUnit = data.wavelengthUnit ?? "nm";
  const intensityLabel = data.intensityLabel ?? "Intensity";
  const intensityUnit = data.intensityUnit ?? "a.u.";
  const mode = data.mode ?? "emission";
  const displayValues = smoothing ? smoothedValues : workingValues;
  const drawableValues = [
    ...workingValues,
    ...smoothedValues,
    ...summary.points
      .map((point, index) =>
        point.uncertainty === null
          ? null
          : workingValues[index] + point.uncertainty,
      )
      .filter(isFiniteNumber),
    ...summary.points
      .map((point, index) =>
        point.uncertainty === null
          ? null
          : workingValues[index] - point.uncertainty,
      )
      .filter(isFiniteNumber),
  ];
  const observedMin = Math.min(...drawableValues);
  const observedMax = Math.max(...drawableValues);
  const observedSpan = observedMax - observedMin;
  const yLower = Math.min(0, observedMin - observedSpan * 0.04);
  const yUpper = Math.max(
    yLower + 1,
    observedMax + Math.max(observedSpan * 0.06, Math.abs(observedMax) * 0.01),
  );
  const xLower = summary.minWavelength;
  const xUpper = summary.maxWavelength;

  const compact = width < 420;
  const margin = compact
    ? { bottom: 34, left: 42, right: 10, top: 18 }
    : { bottom: 38, left: 50, right: 14, top: 20 };
  const plotWidth = Math.max(60, width - margin.left - margin.right);
  const plotHeight = CHART_HEIGHT - margin.top - margin.bottom;
  const plotLeft = margin.left;
  const plotRight = margin.left + plotWidth;
  const plotTop = margin.top;
  const plotBottom = margin.top + plotHeight;

  const xScale = (wavelength: number) =>
    xUpper === xLower
      ? plotLeft + plotWidth / 2
      : plotLeft + ((wavelength - xLower) / (xUpper - xLower)) * plotWidth;
  const yScale = (value: number) =>
    plotBottom -
    ((value - yLower) / Math.max(yUpper - yLower, Number.EPSILON)) * plotHeight;

  const yTicks = linearTicks(yLower, yUpper, compact ? 4 : 5);
  const xTicks = linearTicks(xLower, xUpper, compact ? 4 : 6);

  const rawPath = linePath(
    summary.points.map((point, index) => ({
      x: xScale(point.wavelength),
      y: yScale(workingValues[index]),
    })),
  );
  const displayPath = linePath(
    summary.points.map((point, index) => ({
      x: xScale(point.wavelength),
      y: yScale(displayValues[index]),
    })),
  );

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
  if (showUncertainty && summary.hasUncertainty) {
    for (const [index, point] of summary.points.entries()) {
      if (point.uncertainty === null) {
        flushBand();
        continue;
      }
      bandRun.push({
        lower: yScale(workingValues[index] - point.uncertainty),
        upper: yScale(workingValues[index] + point.uncertainty),
        x: xScale(point.wavelength),
      });
    }
    flushBand();
  }

  const safeFocus =
    focusIndex === null
      ? null
      : Math.min(Math.max(focusIndex, 0), summary.points.length - 1);
  const focusedPoint = safeFocus === null ? null : summary.points[safeFocus];
  const focusStartIndex = (() => {
    const strongest = peaks.reduce<SpectrumPeak | null>(
      (best, peak) =>
        best === null || peak.prominence > best.prominence ? peak : best,
      null,
    );
    return strongest?.index ?? Math.floor(summary.points.length / 2);
  })();

  const nearestLine =
    focusedPoint === null
      ? null
      : lines.reduce<SpectrumLine | null>((best, line) => {
          if (best === null) {
            return line;
          }
          return Math.abs(line.wavelength - focusedPoint.wavelength) <
            Math.abs(best.wavelength - focusedPoint.wavelength)
            ? line
            : best;
        }, null);
  const nearestDistance =
    focusedPoint !== null && nearestLine !== null
      ? Math.abs(nearestLine.wavelength - focusedPoint.wavelength)
      : null;
  const nearestMatch =
    focusedPoint !== null && nearestLine !== null && nearestDistance !== null
      ? nearestDistance <= (options.lineTolerance ?? DEFAULT_TOLERANCE)
        ? nearestLine
        : null
      : null;

  const focusLabel =
    focusedPoint === null
      ? "Focus the chart and use the left and right arrow keys to inspect the spectrum."
      : `${formatValue(focusedPoint.wavelength)} ${wavelengthUnit} · ${formatValue(
          focusedPoint.intensity,
        )} ${intensityUnit}${
          focusedPoint.uncertainty === null
            ? ""
            : ` ± ${formatValue(focusedPoint.uncertainty)}`
        }${
          nearestMatch
            ? ` · ${nearestMatch.species} at ${formatValue(
                nearestMatch.wavelength,
              )} ${wavelengthUnit}`
            : ""
        }`;
  const strongest = peaks.reduce<SpectrumPeak | null>(
    (best, peak) =>
      best === null || peak.prominence > best.prominence ? peak : best,
    null,
  );
  const matchedCount = matches.filter((match) => match.peak !== null).length;
  const summaryText = `${data.name}. ${summary.points.length} points from ${formatValue(
    summary.minWavelength,
  )}–${formatValue(summary.maxWavelength)} ${wavelengthUnit}. ${
    peaks.length === 0
      ? "No peaks were detected."
      : `${peaks.length} peak${peaks.length === 1 ? "" : "s"} detected; strongest at ${formatValue(
          strongest?.wavelength ?? 0,
        )} ${wavelengthUnit}.`
  } ${
    lines.length === 0
      ? ""
      : `${matchedCount} of ${lines.length} reference lines matched within ${formatValue(
          options.lineTolerance ?? DEFAULT_TOLERANCE,
        )} ${wavelengthUnit}.`
  }${
    noise === null
      ? ""
      : ` Noise sigma is about ${formatValue(noise)} ${intensityUnit}.`
  } ${summary.missing} non-finite point${
    summary.missing === 1 ? "" : "s"
  } ignored. Use the left and right arrow keys to inspect the spectrum, or open the data table for exact values.`;

  function moveFocus(key: string): void {
    if (!summary) {
      return;
    }
    const current = safeFocus ?? focusStartIndex;
    let next = current;
    if (key === "ArrowLeft") {
      next = Math.max(0, current - 1);
    } else if (key === "ArrowRight") {
      next = Math.min(summary.points.length - 1, current + 1);
    } else if (key === "Home") {
      next = 0;
    } else if (key === "End") {
      next = summary.points.length - 1;
    } else {
      return;
    }
    setFocusIndex(next);
  }

  function handleExport(): void {
    if (!data || !summary) {
      return;
    }
    const csv = spectrumCsv(data, options);
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
    anchor.download = `spectrum-${data.id.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.csv`;
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
      data-slot="spectrum-plot"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">
              {data.id}
              {data.sample ? ` · ${data.sample}` : ""}
              {data.instrument ? ` · ${data.instrument}` : ""}
              {` · ${mode}`}
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
              {summary.points.length} point
              {summary.points.length === 1 ? "" : "s"}
            </span>
            <span dir="ltr">
              {formatValue(summary.minWavelength)}–
              {formatValue(summary.maxWavelength)} {wavelengthUnit}
            </span>
            {summary.resolution !== null ? (
              <span dir="ltr">
                {formatValue(summary.resolution)} {wavelengthUnit} sampling
              </span>
            ) : null}
            <span dir="ltr">
              {peaks.length} peak{peaks.length === 1 ? "" : "s"}
            </span>
            {noise !== null ? (
              <span dir="ltr">σ ≈ {formatValue(noise)}</span>
            ) : null}
            {summary.missing > 0 ? (
              <span className="text-warning-foreground" dir="ltr">
                {summary.missing} ignored
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

      <div className="grid @3xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 border-b @3xl:border-e @3xl:border-b-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
            <div
              aria-label="Trace"
              className="flex items-center gap-0.5 rounded-lg border p-0.5"
              role="group"
            >
              <Button
                aria-pressed={!smoothing}
                className="rounded-md"
                onClick={() => setSmoothing(false)}
                size="xs"
                type="button"
                variant={!smoothing ? "secondary" : "ghost"}
              >
                Raw
              </Button>
              <Button
                aria-pressed={smoothing}
                className="rounded-md"
                onClick={() => setSmoothing(true)}
                size="xs"
                type="button"
                variant={smoothing ? "secondary" : "ghost"}
              >
                Smoothed
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-0.5">
              <Button
                aria-pressed={baselineOn}
                onClick={() => setBaselineOn((current) => !current)}
                size="xs"
                type="button"
                variant={baselineOn ? "secondary" : "ghost"}
              >
                Baseline
              </Button>
              <Button
                aria-pressed={peaksOn}
                onClick={() => setPeaksOn((current) => !current)}
                size="xs"
                type="button"
                variant={peaksOn ? "secondary" : "ghost"}
              >
                Peaks
              </Button>
              {lines.length > 0 ? (
                <Button
                  aria-pressed={linesOn}
                  onClick={() => setLinesOn((current) => !current)}
                  size="xs"
                  type="button"
                  variant={linesOn ? "secondary" : "ghost"}
                >
                  Lines
                </Button>
              ) : null}
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pt-2 text-[10px] text-muted-foreground">
            {smoothing ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="w-4"
                  style={{
                    borderTop: `1px solid ${RAW_COLOR}`,
                    opacity: 0.5,
                  }}
                />
                Raw
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: SERIES_COLOR }}
              />
              {smoothing ? "Smoothed" : "Trace"}
            </span>
            {showUncertainty && summary.hasUncertainty ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-4 rounded-sm border border-chart-5/30"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-chart-5) 16%, transparent)",
                  }}
                />
                ±1σ
              </span>
            ) : null}
            {peaksOn ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-foreground"
                />
                Peaks
              </span>
            ) : null}
            {linesOn && lines.length > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="w-4 border-muted-foreground border-t border-dashed"
                />
                Reference
              </span>
            ) : null}
          </div>

          <div className="px-2 pt-1">
            <div ref={chartRef}>
              <div
                aria-describedby={summaryId}
                aria-label={`${data.name} spectrum wavelength cursor`}
                aria-orientation="horizontal"
                aria-valuemax={summary.maxWavelength}
                aria-valuemin={summary.minWavelength}
                aria-valuenow={
                  focusedPoint?.wavelength ??
                  summary.points[focusStartIndex].wavelength
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
                  for (const [index, point] of summary.points.entries()) {
                    const next = Math.abs(xScale(point.wavelength) - x);
                    if (next < distance) {
                      nearest = index;
                      distance = next;
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

                  <g>
                    {yTicks.map((value) => {
                      const y = yScale(value);
                      return (
                        <g key={`y-${value}`}>
                          <line
                            opacity={0.65}
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
                    {xTicks.map((value) => {
                      const x = xScale(value);
                      return (
                        <g key={`x-${value}`}>
                          <line
                            opacity={0.45}
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
                      Wavelength ({wavelengthUnit})
                    </text>
                    <text
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                      fontSize={9}
                      textAnchor="middle"
                      transform={`translate(11 ${plotTop + plotHeight / 2}) rotate(-90)`}
                    >
                      {intensityLabel} ({intensityUnit})
                    </text>
                  </g>

                  <g clipPath={`url(#${clipId})`}>
                    {bandSegments.map((segment) => (
                      <path
                        d={segment}
                        fill="color-mix(in srgb, var(--color-chart-5) 14%, transparent)"
                        key={segment}
                      />
                    ))}

                    {linesOn
                      ? lines.map((line, index) => {
                          const x = xScale(line.wavelength);
                          return (
                            <g key={line.id}>
                              <line
                                stroke="var(--color-border)"
                                strokeDasharray="3 3"
                                x1={x}
                                x2={x}
                                y1={plotTop}
                                y2={plotBottom}
                              />
                              <text
                                fill="var(--color-muted-foreground)"
                                fontFamily="var(--font-mono)"
                                fontSize={8}
                                textAnchor="middle"
                                x={x}
                                y={plotTop - 5}
                              >
                                {index + 1}
                              </text>
                            </g>
                          );
                        })
                      : null}

                    {smoothing ? (
                      <path
                        d={rawPath}
                        fill="none"
                        opacity={0.32}
                        stroke={RAW_COLOR}
                        strokeLinejoin="round"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                    <path
                      d={displayPath}
                      fill="none"
                      stroke={SERIES_COLOR}
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />

                    {peaksOn
                      ? peaks.map((peak) => {
                          const x = xScale(peak.wavelength);
                          const y = yScale(smoothedValues[peak.index]);
                          return (
                            <circle
                              cx={x}
                              cy={y}
                              fill="var(--color-foreground)"
                              key={`${peak.index}-${peak.wavelength}`}
                              r={2.6}
                              stroke="var(--color-background)"
                              strokeWidth={1.4}
                            />
                          );
                        })
                      : null}

                    {focusedPoint ? (
                      <>
                        <line
                          stroke="var(--color-foreground)"
                          strokeDasharray="3 2"
                          x1={xScale(focusedPoint.wavelength)}
                          x2={xScale(focusedPoint.wavelength)}
                          y1={plotTop}
                          y2={plotBottom}
                        />
                        <circle
                          cx={xScale(focusedPoint.wavelength)}
                          cy={yScale(
                            displayValues[
                              Math.min(safeFocus ?? 0, displayValues.length - 1)
                            ],
                          )}
                          fill="var(--color-foreground)"
                          r={3.2}
                          stroke="var(--color-background)"
                          strokeWidth={1.5}
                        />
                      </>
                    ) : null}
                  </g>
                </svg>
              </div>
            </div>
            <p
              className="min-h-8 px-2 py-1.5 font-mono text-[10px] text-muted-foreground tabular-nums"
              dir="ltr"
            >
              {focusedPoint
                ? focusLabel
                : "Hover or focus the chart, then use ← and → to inspect."}
            </p>
          </div>
        </div>

        <div className="grid content-start gap-4 p-3">
          <section>
            <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Analysis
            </h4>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
              <dt className="text-muted-foreground">Peaks</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {peaks.length}
              </dd>
              <dt className="text-muted-foreground">Strongest</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {strongest === null
                  ? "—"
                  : `${formatValue(strongest.wavelength)} ${wavelengthUnit}`}
              </dd>
              <dt className="text-muted-foreground">Noise σ</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {noise === null ? "—" : formatValue(noise)}
              </dd>
              <dt className="text-muted-foreground">Lines</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {lines.length === 0 ? "—" : `${matchedCount}/${lines.length}`}
              </dd>
            </dl>
            {summary.points.length < 8 ? (
              <p className="mt-2 flex items-start gap-1.5 text-[10px] text-warning-foreground leading-relaxed">
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="mt-0.5 size-3 shrink-0"
                />
                Fewer than eight points. Peak detection is unreliable.
              </p>
            ) : null}
          </section>

          {peaksOn && peaks.length > 0 ? (
            <section className="border-t pt-3">
              <h4 className="font-medium text-xs">Detected peaks</h4>
              <div className="mt-1.5 max-h-52 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-7 text-[10px]">
                        {wavelengthUnit}
                      </TableHead>
                      <TableHead className="h-7 text-end text-[10px]">
                        {intensityUnit}
                      </TableHead>
                      <TableHead className="h-7 text-end text-[10px]">
                        FWHM
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {peaks.map((peak) => (
                      <TableRow key={`${peak.index}-${peak.wavelength}`}>
                        <TableCell
                          className="py-1 font-mono text-[10px] tabular-nums"
                          dir="ltr"
                        >
                          {formatValue(peak.wavelength)}
                        </TableCell>
                        <TableCell
                          className="py-1 text-end font-mono text-[10px] tabular-nums"
                          dir="ltr"
                        >
                          {formatValue(peak.intensity)}
                        </TableCell>
                        <TableCell
                          className="py-1 text-end font-mono text-[10px] tabular-nums"
                          dir="ltr"
                        >
                          {peak.fwhm === null ? "—" : formatValue(peak.fwhm)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ) : null}

          {linesOn && lines.length > 0 ? (
            <section className="border-t pt-3">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-medium text-xs">Reference lines</h4>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Δ = observed − rest
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-7 text-[10px]">#</TableHead>
                    <TableHead className="h-7 text-[10px]">Species</TableHead>
                    <TableHead className="h-7 text-end text-[10px]">
                      {wavelengthUnit}
                    </TableHead>
                    <TableHead className="h-7 text-end text-[10px]">
                      Δ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match, index) => (
                    <TableRow key={match.line.id}>
                      <TableCell className="py-1 font-mono text-[10px] text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-1 text-[10px]">
                        <span className="font-medium">
                          {match.line.species}
                        </span>
                        {match.line.label ? (
                          <span className="block text-[9px] text-muted-foreground">
                            {match.line.label}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="py-1 text-end font-mono text-[10px] tabular-nums"
                        dir="ltr"
                      >
                        {formatValue(match.line.wavelength)}
                      </TableCell>
                      <TableCell
                        className="py-1 text-end font-mono text-[10px] tabular-nums"
                        dir="ltr"
                      >
                        {match.residual === null ? (
                          "—"
                        ) : (
                          <span
                            className={
                              Math.abs(match.residual) <=
                              (options.lineTolerance ?? DEFAULT_TOLERANCE)
                                ? ""
                                : "text-muted-foreground"
                            }
                            title={
                              match.blended
                                ? "Blended: more than one reference line is nearest to this peak"
                                : undefined
                            }
                          >
                            {match.residual > 0 ? "+" : ""}
                            {formatValue(match.residual)}
                            {match.blended ? " †" : ""}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {matches.some((match) => match.blended) ? (
                <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                  † Blended: more than one reference line shares the nearest
                  detected peak.
                </p>
              ) : null}
            </section>
          ) : null}

          {data.source ? (
            <p className="border-t pt-3 font-mono text-[10px] text-muted-foreground leading-relaxed">
              {data.source}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={cn("border-t", tableOpen ? "block" : "hidden print:hidden")}
        id={tableId}
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2">
          <h4 className="font-medium text-xs">Data table</h4>
          <span className="font-mono text-[10px] text-muted-foreground">
            {summary.points.length} rows
          </span>
        </div>
        <div className="max-h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-[10px]">
                  Wavelength ({wavelengthUnit})
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  {intensityLabel}
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Smoothed
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Baseline-corrected
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">±1σ</TableHead>
                <TableHead className="h-8 text-end text-[10px]">Peak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.points.map((point, index) => {
                const peak = peaks.some((item) => item.index === index);
                return (
                  <TableRow key={`${point.wavelength}-${index}`}>
                    <TableCell
                      className="py-1 font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatValue(point.wavelength)}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatValue(point.intensity)}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatValue(smoothedValues[index])}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatValue(corrected[index])}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {point.uncertainty === null
                        ? "—"
                        : formatValue(point.uncertainty)}
                    </TableCell>
                    <TableCell className="py-1 text-end text-[10px]">
                      {peak ? "Yes" : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
