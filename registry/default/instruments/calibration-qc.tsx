"use client";

import {
  CheckIcon,
  DownloadIcon,
  TriangleAlertIcon,
  XIcon,
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

export type CalibrationStandard = {
  /** Nominal concentration or amount, in `data.unit`. */
  level: number;
  /** Instrument response, in the response unit. */
  response: number;
  /** Optional one-sigma response uncertainty. */
  uncertainty?: number;
};

export type CalibrationFit = {
  slope: number;
  intercept: number;
  rSquared: number;
  n: number;
  residuals: readonly {
    level: number;
    response: number;
    predicted: number;
    residual: number;
  }[];
};

export type CalibrationLimits = {
  blankCount: number;
  blankMean: number;
  blankSd: number;
  lod: number | null;
  loq: number | null;
};

export type QcControlPoint = {
  at: string;
  value: number;
  runId?: string;
};

export type WestgardRule = "1-3s" | "2-2s" | "R-4s" | "4-1s" | "10-x";

export type WestgardViolation = {
  rule: WestgardRule;
  index: number;
  at: string;
  value: number;
  message: string;
};

export type CalibrationVerdict = "accept" | "review" | "reject";

export type CalibrationQcData = {
  id: string;
  name: string;
  analyte?: string;
  /** Concentration unit for standards and controls. */
  unit?: string;
  responseUnit?: string;
  instrument?: string;
  method?: string;
  standards: readonly CalibrationStandard[];
  blanks?: readonly number[];
  controls?: readonly QcControlPoint[];
  /** Target mean for the control material. Defaults to the observed mean. */
  controlMean?: number;
  /** Target SD for the control material. Defaults to the observed SD. */
  controlSd?: number;
  source?: string;
};

export type CalibrationOptions = {
  /** Minimum coefficient of determination. Default 0.995. */
  minRSquared?: number;
  /** Maximum control CV, in percent. Default 5. */
  maxCv?: number;
  /** Maximum absolute bias, in percent. Default 5. */
  maxBias?: number;
};

export type CalibrationQcSummary = {
  fit: CalibrationFit | null;
  limits: CalibrationLimits | null;
  controlMean: number | null;
  controlSd: number | null;
  controlCv: number | null;
  bias: number | null;
  violations: readonly WestgardViolation[];
  verdict: CalibrationVerdict;
  reasons: readonly string[];
};

export type CalibrationQcPanelProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  data: CalibrationQcData;
  options?: CalibrationOptions;
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  onExport?: (csv: string) => void;
};

const MINUS = "−";

function formatNumber(value: number, precision?: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 100_000 || abs < 0.001)) {
    return value.toExponential(precision ?? 2).replace("-", MINUS);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision ?? 3,
  })
    .format(value)
    .replace("-", MINUS);
}

// r² is bounded by 1, and rounding a near-perfect fit to "1" hides how close
// it really is. Keep four decimals visible so 0.999998 reads as a rounded
// value rather than an exact one.
function formatRSquared(value: number): string {
  return Number.isFinite(value) ? value.toFixed(4).replace("-", MINUS) : "—";
}

export function fitLinearCalibration(
  standards: readonly CalibrationStandard[],
): CalibrationFit | null {
  const points = standards.filter(
    (standard) =>
      Number.isFinite(standard.level) && Number.isFinite(standard.response),
  );
  if (points.length < 2) {
    return null;
  }
  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.level, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.response, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const point of points) {
    sxx += (point.level - meanX) ** 2;
    sxy += (point.level - meanX) * (point.response - meanY);
  }
  if (sxx === 0) {
    return null;
  }
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  let ssRes = 0;
  let ssTot = 0;
  const residuals = points.map((point) => {
    const predicted = intercept + slope * point.level;
    ssRes += (point.response - predicted) ** 2;
    ssTot += (point.response - meanY) ** 2;
    return {
      level: point.level,
      predicted,
      residual: point.response - predicted,
      response: point.response,
    };
  });
  const rSquared = ssTot === 0 ? (ssRes === 0 ? 1 : 0) : 1 - ssRes / ssTot;
  return { intercept, n, residuals, rSquared, slope };
}

export function calibrationLimits(
  fit: CalibrationFit | null,
  blanks: readonly number[] = [],
): CalibrationLimits | null {
  const values = blanks.filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return null;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (values.length < 2) {
    return {
      blankCount: values.length,
      blankMean: mean,
      blankSd: 0,
      lod: null,
      loq: null,
    };
  }
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (values.length - 1);
  const sd = Math.sqrt(variance);
  const slope = Math.abs(fit?.slope ?? 0);
  return {
    blankCount: values.length,
    blankMean: mean,
    blankSd: sd,
    lod: slope > 0 && sd > 0 ? (3.3 * sd) / slope : null,
    loq: slope > 0 && sd > 0 ? (10 * sd) / slope : null,
  };
}

export function evaluateWestgard(
  controls: readonly QcControlPoint[],
  mean: number,
  sd: number,
): readonly WestgardViolation[] {
  if (!(sd > 0) || !Number.isFinite(mean)) {
    return [];
  }
  const z = controls.map((point) => (point.value - mean) / sd);
  const violations: WestgardViolation[] = [];
  const add = (rule: WestgardRule, index: number, message: string): void => {
    const point = controls[index];
    if (!point) {
      return;
    }
    violations.push({
      at: point.at,
      index,
      message,
      rule,
      value: point.value,
    });
  };

  z.forEach((value, index) => {
    if (Math.abs(value) > 3) {
      add("1-3s", index, `1-3s: beyond ${value > 0 ? "+" : "−"}3 SD`);
    }
    if (
      index > 0 &&
      ((z[index - 1] > 2 && value > 2) || (z[index - 1] < -2 && value < -2))
    ) {
      add("2-2s", index, "2-2s: two consecutive points beyond 2 SD, same side");
    }
    if (
      index > 0 &&
      ((z[index - 1] > 2 && value < -2) || (z[index - 1] < -2 && value > 2))
    ) {
      add("R-4s", index, "R-4s: consecutive points differ by more than 4 SD");
    }
    if (
      index >= 3 &&
      [z[index - 3], z[index - 2], z[index - 1], value].every(
        (point) => point > 1,
      )
    ) {
      add(
        "4-1s",
        index,
        "4-1s: four consecutive points beyond 1 SD, same side",
      );
    }
    if (
      index >= 3 &&
      [z[index - 3], z[index - 2], z[index - 1], value].every(
        (point) => point < -1,
      )
    ) {
      add(
        "4-1s",
        index,
        "4-1s: four consecutive points beyond 1 SD, same side",
      );
    }
    if (
      index >= 9 &&
      (z.slice(index - 9, index + 1).every((point) => point > 0) ||
        z.slice(index - 9, index + 1).every((point) => point < 0))
    ) {
      add(
        "10-x",
        index,
        "10-x: ten consecutive points on one side of the mean",
      );
    }
  });

  return violations;
}

export function summarizeCalibrationQc(
  data: CalibrationQcData,
  options: CalibrationOptions = {},
): CalibrationQcSummary {
  const minRSquared = options.minRSquared ?? 0.995;
  const maxCv = options.maxCv ?? 5;
  const maxBias = options.maxBias ?? 5;
  const fit = fitLinearCalibration(data.standards);
  const limits = calibrationLimits(fit, data.blanks ?? []);
  const controls = data.controls ?? [];
  const observedMean =
    controls.length > 0
      ? controls.reduce((sum, point) => sum + point.value, 0) / controls.length
      : null;
  const mean = data.controlMean ?? observedMean;
  let sd: number | null = data.controlSd ?? null;
  if (sd === null && mean !== null && controls.length > 1) {
    const variance =
      controls.reduce((sum, point) => sum + (point.value - mean) ** 2, 0) /
      (controls.length - 1);
    sd = Math.sqrt(variance);
  }
  const controlCv =
    mean !== null && mean !== 0 && sd !== null
      ? (sd / Math.abs(mean)) * 100
      : null;
  const bias =
    mean !== null && data.controlMean !== undefined && data.controlMean !== 0
      ? ((mean - data.controlMean) / Math.abs(data.controlMean)) * 100
      : null;
  const violations =
    mean !== null && sd !== null ? evaluateWestgard(controls, mean, sd) : [];

  const reasons: string[] = [];
  if (!fit) {
    reasons.push("Fewer than two usable standards; no calibration fit.");
  } else if (fit.rSquared < minRSquared) {
    reasons.push(
      `r² ${formatRSquared(fit.rSquared)} is below the ${minRSquared} minimum.`,
    );
  }
  if (violations.length > 0) {
    reasons.push(
      `${violations.length} Westgard rejection${violations.length === 1 ? "" : "s"}.`,
    );
  }
  if (controlCv !== null && controlCv > maxCv) {
    reasons.push(
      `Control CV ${formatNumber(controlCv, 1)}% exceeds ${maxCv}%.`,
    );
  }
  if (bias !== null && Math.abs(bias) > maxBias) {
    reasons.push(`Bias ${formatNumber(bias, 1)}% exceeds ±${maxBias}%.`);
  }
  if (!limits || limits.lod === null) {
    reasons.push("No blank replicates; LOD and LOQ are not established.");
  }

  let verdict: CalibrationVerdict = "accept";
  if (!fit || (fit && fit.rSquared < minRSquared) || violations.length > 0) {
    verdict = "reject";
  } else if (
    (controlCv !== null && controlCv > maxCv) ||
    (bias !== null && Math.abs(bias) > maxBias) ||
    !limits ||
    limits.lod === null
  ) {
    verdict = "review";
  }

  return {
    bias,
    controlCv,
    controlMean: mean,
    controlSd: sd,
    fit,
    limits,
    reasons,
    verdict,
    violations,
  };
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function calibrationCsv(data: CalibrationQcData): string {
  const lines = ["section,level,response,predicted,residual,value,note"];
  const fit = fitLinearCalibration(data.standards);
  data.standards.forEach((standard, index) => {
    const residual = fit?.residuals[index];
    lines.push(
      [
        "standard",
        standard.level,
        standard.response,
        residual?.predicted ?? null,
        residual?.residual ?? null,
        "",
        "",
      ]
        .map(csvCell)
        .join(","),
    );
  });
  for (const [index, blank] of (data.blanks ?? []).entries()) {
    lines.push(
      ["blank", null, blank, null, null, blank, `blank ${index + 1}`]
        .map(csvCell)
        .join(","),
    );
  }
  for (const point of data.controls ?? []) {
    lines.push(
      [
        "control",
        null,
        null,
        null,
        null,
        point.value,
        `${point.at} ${point.runId ?? ""}`,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

function download(csv: string, name: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = `calibration-${name.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.csv`;
  anchor.href = href;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

const VERDICT_LABEL: Record<CalibrationVerdict, string> = {
  accept: "Accept",
  reject: "Reject",
  review: "Review",
};

function CalibrationChart({
  data,
  fit,
}: {
  data: CalibrationQcData;
  fit: CalibrationFit;
}): React.ReactElement {
  const width = 360;
  const height = 200;
  const padding = { bottom: 28, left: 40, right: 10, top: 12 };
  const maxLevel = Math.max(...data.standards.map((point) => point.level), 1);
  const maxResponse = Math.max(
    ...data.standards.map((point) => point.response),
    1,
  );
  const x = (value: number): number =>
    padding.left + (value / maxLevel) * (width - padding.left - padding.right);
  const y = (value: number): number =>
    height -
    padding.bottom -
    (value / maxResponse) * (height - padding.top - padding.bottom);

  return (
    <svg
      aria-label={`Calibration curve with ${fit.n} standards; slope ${formatNumber(fit.slope, 4)}, intercept ${formatNumber(fit.intercept, 4)}, r squared ${formatRSquared(fit.rSquared)}.`}
      className="w-full"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>Calibration curve</title>
      {[0, 0.5, 1].map((fraction) => {
        const level = maxLevel * fraction;
        return (
          <g key={`x-${fraction}`}>
            <line
              className="text-border"
              stroke="currentColor"
              strokeWidth={0.5}
              x1={x(level)}
              x2={x(level)}
              y1={padding.top}
              y2={height - padding.bottom}
            />
            <text
              className="fill-muted-foreground font-mono"
              fontSize={7}
              textAnchor="middle"
              x={x(level)}
              y={height - padding.bottom + 10}
            >
              {formatNumber(level, 2)}
            </text>
          </g>
        );
      })}
      {[0, 0.5, 1].map((fraction) => {
        const response = maxResponse * fraction;
        return (
          <g key={`y-${fraction}`}>
            <line
              className="text-border"
              stroke="currentColor"
              strokeWidth={0.5}
              x1={padding.left}
              x2={width - padding.right}
              y1={y(response)}
              y2={y(response)}
            />
            <text
              className="fill-muted-foreground font-mono"
              fontSize={7}
              textAnchor="end"
              x={padding.left - 4}
              y={y(response) + 2}
            >
              {formatNumber(response, 0)}
            </text>
          </g>
        );
      })}
      <line
        className="text-foreground"
        stroke="currentColor"
        strokeWidth={1}
        x1={x(0)}
        x2={x(maxLevel)}
        y1={y(fit.intercept)}
        y2={y(fit.intercept + fit.slope * maxLevel)}
      />
      {data.standards.map((point, index) => (
        <g key={`${point.level}-${index}`}>
          {point.uncertainty !== undefined ? (
            <line
              className="text-muted-foreground"
              stroke="currentColor"
              strokeWidth={0.75}
              x1={x(point.level)}
              x2={x(point.level)}
              y1={y(point.response - point.uncertainty)}
              y2={y(point.response + point.uncertainty)}
            />
          ) : null}
          <circle
            className="fill-background stroke-foreground"
            cx={x(point.level)}
            cy={y(point.response)}
            r={2.4}
            strokeWidth={1}
          />
        </g>
      ))}
      <text
        className="fill-muted-foreground"
        fontSize={7}
        textAnchor="middle"
        x={(padding.left + width - padding.right) / 2}
        y={height - 3}
      >
        Level{data.unit ? ` (${data.unit})` : ""}
      </text>
      <text
        className="fill-muted-foreground"
        fontSize={7}
        textAnchor="middle"
        transform={`rotate(-90 9 ${height / 2})`}
        x={9}
        y={height / 2}
      >
        Response{data.responseUnit ? ` (${data.responseUnit})` : ""}
      </text>
    </svg>
  );
}

function ControlChart({
  data,
  mean,
  sd,
  violations,
}: {
  data: CalibrationQcData;
  mean: number;
  sd: number;
  violations: readonly WestgardViolation[];
}): React.ReactElement | null {
  const controls = data.controls ?? [];
  if (controls.length < 2 || !(sd > 0)) {
    return null;
  }
  const width = 360;
  const height = 180;
  const padding = { bottom: 24, left: 40, right: 34, top: 10 };
  const lower = mean - 4 * sd;
  const upper = mean + 4 * sd;
  const x = (index: number): number =>
    padding.left +
    (controls.length === 1
      ? 0
      : (index / (controls.length - 1)) *
        (width - padding.left - padding.right));
  const y = (value: number): number =>
    height -
    padding.bottom -
    ((value - lower) / (upper - lower)) *
      (height - padding.top - padding.bottom);
  const violationIndices = new Set(violations.map((item) => item.index));

  return (
    <svg
      aria-label={`Levey–Jennings control chart with ${controls.length} points; mean ${formatNumber(mean, 3)}, standard deviation ${formatNumber(sd, 3)}, ${violations.length} rule violations.`}
      className="w-full"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>Levey–Jennings control chart</title>
      {[
        { label: "+3s", value: mean + 3 * sd, dashed: true },
        { label: "+2s", value: mean + 2 * sd, dashed: false },
        { label: "+1s", value: mean + sd, dashed: false },
        { label: "mean", value: mean, dashed: false },
        { label: "−1s", value: mean - sd, dashed: false },
        { label: "−2s", value: mean - 2 * sd, dashed: false },
        { label: "−3s", value: mean - 3 * sd, dashed: true },
      ].map((line) => (
        <g key={line.label}>
          <line
            className={
              line.label === "mean"
                ? "text-foreground"
                : line.dashed
                  ? "text-warning/64"
                  : "text-border"
            }
            stroke="currentColor"
            strokeDasharray={line.dashed ? "3 3" : undefined}
            strokeWidth={line.label === "mean" ? 1 : 0.6}
            x1={padding.left}
            x2={width - padding.right}
            y1={y(line.value)}
            y2={y(line.value)}
          />
          <text
            className="fill-muted-foreground font-mono"
            fontSize={6.5}
            textAnchor="start"
            x={width - padding.right + 3}
            y={y(line.value) + 2}
          >
            {line.label}
          </text>
        </g>
      ))}
      <polyline
        className="text-foreground/64"
        fill="none"
        points={controls
          .map((point, index) => `${x(index)},${y(point.value)}`)
          .join(" ")}
        stroke="currentColor"
        strokeWidth={0.8}
      />
      {controls.map((point, index) => (
        <g key={`${point.at}-${index}`}>
          <circle
            className={cn(
              "fill-background stroke-foreground",
              violationIndices.has(index) && "fill-warning/16",
            )}
            cx={x(index)}
            cy={y(point.value)}
            r={violationIndices.has(index) ? 3.4 : 2.4}
            strokeWidth={violationIndices.has(index) ? 1.6 : 1}
          />
          {violationIndices.has(index) ? (
            <text
              className="fill-warning-foreground font-mono"
              fontSize={7}
              textAnchor="middle"
              x={x(index)}
              y={y(point.value) - 6}
            >
              ×
            </text>
          ) : null}
        </g>
      ))}
      <text
        className="fill-muted-foreground"
        fontSize={7}
        textAnchor="middle"
        x={padding.left}
        y={height - 4}
      >
        {controls[0]?.at}
      </text>
      <text
        className="fill-muted-foreground"
        fontSize={7}
        textAnchor="middle"
        x={width - padding.right}
        y={height - 4}
      >
        {controls.at(-1)?.at}
      </text>
    </svg>
  );
}

export function CalibrationQcPanel({
  data,
  options,
  title,
  description,
  emptyLabel = "No calibration. Pass standards, blanks, and control results.",
  onExport,
  className,
  ...props
}: CalibrationQcPanelProps): React.ReactElement {
  const titleId = React.useId();
  const summary = React.useMemo(
    () => summarizeCalibrationQc(data, options),
    [data, options],
  );
  const { fit, limits } = summary;
  const unit = data.unit ? ` ${data.unit}` : "";

  if (!fit) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="calibration-qc"
        {...props}
      >
        <p className="text-center text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      </section>
    );
  }

  function handleExport(): void {
    const csv = calibrationCsv(data);
    onExport?.(csv);
    download(csv, data.id);
  }

  const verdictTone =
    summary.verdict === "accept"
      ? "bg-success/8 text-success-foreground border-success/24"
      : summary.verdict === "review"
        ? "bg-warning/8 text-warning-foreground border-warning/24"
        : "bg-destructive/8 text-destructive-foreground border-destructive/24";

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="calibration-qc"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Calibration and QC
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? data.name}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>{data.id}</span>
            {data.analyte ? <span>{data.analyte}</span> : null}
            {data.instrument ? <span>{data.instrument}</span> : null}
            <span>{fit.n} standards</span>
            {limits ? <span>{limits.blankCount} blanks</span> : null}
          </p>
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

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5",
          verdictTone,
        )}
      >
        <p className="flex items-center gap-1.5 font-medium text-sm">
          {summary.verdict === "accept" ? (
            <CheckIcon aria-hidden="true" className="size-4" />
          ) : summary.verdict === "review" ? (
            <TriangleAlertIcon aria-hidden="true" className="size-4" />
          ) : (
            <XIcon aria-hidden="true" className="size-4" />
          )}
          {VERDICT_LABEL[summary.verdict]}
        </p>
        <p className="min-w-0 flex-1 text-xs leading-snug">
          {summary.reasons.length === 0
            ? "Curve, blanks, and controls meet the stated acceptance criteria."
            : summary.reasons.join(" ")}
        </p>
        <p className="font-mono text-[10px]">
          r² ≥ {options?.minRSquared ?? 0.995} · CV ≤ {options?.maxCv ?? 5}% ·
          bias ≤ ±{options?.maxBias ?? 5}%
        </p>
      </div>

      <div className="grid @3xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 border-b px-3 py-3 @3xl:border-e @3xl:border-b-0">
          <CalibrationChart data={data} fit={fit} />
          <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
            y = {formatNumber(fit.slope, 4)}x {fit.intercept >= 0 ? "+" : "−"}{" "}
            {formatNumber(Math.abs(fit.intercept), 4)} · r²{" "}
            {formatRSquared(fit.rSquared)}
          </p>
        </div>

        <dl className="grid content-start gap-x-3 gap-y-1.5 px-4 py-3 text-[11px]">
          {[
            ["Slope", formatNumber(fit.slope, 4)],
            ["Intercept", formatNumber(fit.intercept, 4)],
            ["r²", formatRSquared(fit.rSquared)],
            ["Standards", String(fit.n)],
            ["Blank mean", limits ? formatNumber(limits.blankMean, 3) : "—"],
            ["Blank SD", limits ? formatNumber(limits.blankSd, 3) : "—"],
            [
              "LOD",
              limits?.lod === null || !limits
                ? "—"
                : `${formatNumber(limits.lod, 3)}${unit}`,
            ],
            [
              "LOQ",
              limits?.loq === null || !limits
                ? "—"
                : `${formatNumber(limits.loq, 3)}${unit}`,
            ],
            [
              "Control mean",
              summary.controlMean === null
                ? "—"
                : `${formatNumber(summary.controlMean, 3)}${unit}`,
            ],
            [
              "Control SD",
              summary.controlSd === null
                ? "—"
                : formatNumber(summary.controlSd, 3),
            ],
            [
              "CV",
              summary.controlCv === null
                ? "—"
                : `${formatNumber(summary.controlCv, 1)}%`,
            ],
            [
              "Bias",
              summary.bias === null ? "—" : `${formatNumber(summary.bias, 1)}%`,
            ],
          ].map(([label, value]) => (
            <div className="grid grid-cols-[6.5rem_1fr] gap-2" key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {data.controls && data.controls.length > 0 ? (
        <div className="border-t">
          <div className="flex flex-wrap items-baseline justify-between gap-2 bg-muted/24 px-4 py-1.5">
            <h4 className="font-medium text-[11px]">
              Levey–Jennings control chart
            </h4>
            <p className="font-mono text-[10px] text-muted-foreground">
              {summary.violations.length} violation
              {summary.violations.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="px-3 pt-2">
            {summary.controlMean !== null && summary.controlSd !== null ? (
              <ControlChart
                data={data}
                mean={summary.controlMean}
                sd={summary.controlSd}
                violations={summary.violations}
              />
            ) : null}
          </div>
          {summary.violations.length > 0 ? (
            <ul className="grid gap-1 border-t px-4 py-2 text-[11px] text-warning-foreground">
              {summary.violations.map((violation) => (
                <li key={`${violation.rule}-${violation.index}`}>
                  <span className="font-mono">{violation.rule}</span> ·{" "}
                  {violation.at} —{" "}
                  {violation.message.replace(`${violation.rule}: `, "")} (
                  {formatNumber(violation.value, 3)}
                  {unit})
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">
              No Westgard rejection rules fired.
            </p>
          )}
        </div>
      ) : null}

      <Table>
        <caption className="sr-only">
          Calibration standards with predicted response and residual.
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead>Level{data.unit ? ` (${data.unit})` : ""}</TableHead>
            <TableHead className="text-end">Response</TableHead>
            <TableHead className="text-end">Predicted</TableHead>
            <TableHead className="text-end">Residual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fit.residuals.map((point) => (
            <TableRow key={`${point.level}-${point.response}`}>
              <TableCell className="font-mono text-xs tabular-nums">
                {formatNumber(point.level, 3)}
              </TableCell>
              <TableCell className="text-end font-mono text-xs tabular-nums">
                {formatNumber(point.response, 3)}
              </TableCell>
              <TableCell className="text-end font-mono text-xs tabular-nums">
                {formatNumber(point.predicted, 3)}
              </TableCell>
              <TableCell className="text-end font-mono text-xs tabular-nums">
                {formatNumber(point.residual, 3)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-[10px] text-muted-foreground">
        <p>LOD = 3.3 × SD(blank) / |slope|; LOQ = 10 × SD(blank) / |slope|.</p>
        <p>{data.method ?? data.source ?? ""}</p>
      </footer>
    </section>
  );
}
