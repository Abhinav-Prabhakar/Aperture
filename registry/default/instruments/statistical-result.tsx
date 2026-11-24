"use client";

import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";

export type ResultAssumptionStatus = "met" | "violated" | "notChecked";

export type ResultAssumption = {
  name: string;
  status: ResultAssumptionStatus;
  detail?: string;
};

export type StatisticalResult = {
  /** The estimate itself, in `unit`. */
  estimate: number;
  unit?: string;
  /** Decimal places for the estimate and interval. Default 2. */
  precision?: number;
  /** A confidence or credible interval. */
  interval?: {
    /** e.g. 95 for a 95% interval. */
    level: number;
    lower: number;
    upper: number;
    /** Default "confidence". */
    kind?: "confidence" | "credible" | "prediction";
  };
  /** The value under the null hypothesis. Default 0. */
  nullValue?: number;
  /** Number of experimental units. Required. */
  n: number;
  /** The test or model, named exactly: "Welch two-sample t-test". */
  test: string;
  statistic?: {
    /** e.g. "t", "F", "χ²", "z". */
    label: string;
    value: number;
    /** Degrees of freedom, when the test has them. */
    df?: number | string;
  };
  /** The p-value exactly as computed. 0 renders as "p < 0.001". */
  p: number;
  /** Default 0.05. */
  alpha?: number;
  effectSize?: {
    label: string;
    value: number;
    unit?: string;
    interval?: { level: number; lower: number; upper: number };
  };
  /** e.g. "Holm–Bonferroni, 4 comparisons". */
  correction?: string;
  /** One-sided or two-sided, when it matters. */
  tails?: "two-sided" | "one-sided";
  assumptions?: readonly ResultAssumption[];
  /** The model or procedure behind the numbers. */
  method?: string;
  /** A caveat that must stay visible with the result. */
  warning?: string;
};

export type StatisticalResultBlockProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  result: StatisticalResult;
  /** What the estimate is: "Mean difference", "Odds ratio", "Slope". */
  estimateLabel: string;
  /** The comparison or model, e.g. "Treatment vs control, week 12". */
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
};

const MINUS = "−";

function formatNumber(value: number, precision: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  })
    .format(value)
    .replace("-", MINUS);
}

export function formatPValue(p: number): string {
  if (!Number.isFinite(p) || p < 0 || p > 1) {
    return "p invalid";
  }
  if (p < 0.001) {
    return "p < 0.001";
  }
  const digits = p.toPrecision(2);
  return `p = ${digits}`;
}

export function resultWarnings(result: StatisticalResult): readonly string[] {
  const warnings: string[] = [];
  const alpha = result.alpha ?? 0.05;
  const nullValue = result.nullValue ?? 0;

  if (!Number.isFinite(result.p) || result.p < 0 || result.p > 1) {
    warnings.push("The p-value is outside [0, 1]. Check the test output.");
  }
  if (!(result.n > 0)) {
    warnings.push(
      "n is missing or zero. A result without n is not reportable.",
    );
  }

  const interval = result.interval;
  if (interval) {
    if (
      !Number.isFinite(interval.lower) ||
      !Number.isFinite(interval.upper) ||
      interval.lower > interval.upper
    ) {
      warnings.push("The interval bounds are invalid.");
    } else {
      if (
        result.estimate < interval.lower ||
        result.estimate > interval.upper
      ) {
        warnings.push("The interval does not contain the estimate.");
      }
      const includesNull =
        interval.lower <= nullValue && interval.upper >= nullValue;
      if (includesNull && result.p < alpha) {
        warnings.push(
          "The interval includes the null value while p < α. Report both and do not claim a direction from p alone.",
        );
      }
      if (!includesNull && result.p >= alpha) {
        warnings.push(
          "The interval excludes the null value while p ≥ α. Recheck the test and the interval.",
        );
      }
    }
  }

  return warnings;
}

export function describeStatisticalResult(
  result: StatisticalResult,
  estimateLabel: string,
): string {
  const precision = result.precision ?? 2;
  const unit = result.unit ? ` ${result.unit}` : "";
  const pieces = [
    `${estimateLabel} ${formatNumber(result.estimate, precision)}${unit}`,
  ];
  if (result.interval) {
    pieces.push(
      `${result.interval.level}% ${result.interval.kind ?? "confidence"} interval ${formatNumber(result.interval.lower, precision)} to ${formatNumber(result.interval.upper, precision)}${unit}`,
    );
  }
  pieces.push(`n = ${result.n}`);
  pieces.push(result.test);
  pieces.push(formatPValue(result.p));
  if (result.effectSize) {
    const sizeUnit = result.effectSize.unit ? ` ${result.effectSize.unit}` : "";
    pieces.push(
      `${result.effectSize.label} ${formatNumber(result.effectSize.value, precision)}${sizeUnit}`,
    );
  }
  if (result.correction) {
    pieces.push(result.correction);
  }
  return `${pieces.join("; ")}.`;
}

export function resultToText(
  result: StatisticalResult,
  estimateLabel: string,
): string {
  const lines = [describeStatisticalResult(result, estimateLabel)];
  if (result.assumptions?.length) {
    lines.push(
      `Assumptions: ${result.assumptions
        .map((assumption) => `${assumption.name} (${assumption.status})`)
        .join("; ")}.`,
    );
  }
  if (result.method) {
    lines.push(`Method: ${result.method}`);
  }
  if (result.warning) {
    lines.push(`Caution: ${result.warning}`);
  }
  return lines.join("\n");
}

const ASSUMPTION_MARK: Record<ResultAssumptionStatus, string> = {
  met: "✓",
  notChecked: "?",
  violated: "×",
};

const ASSUMPTION_LABEL: Record<ResultAssumptionStatus, string> = {
  met: "Met",
  notChecked: "Not checked",
  violated: "Violated",
};

function IntervalGraphic({
  result,
}: {
  result: StatisticalResult;
}): React.ReactElement | null {
  const interval = result.interval;
  if (!interval) {
    return null;
  }
  const nullValue = result.nullValue ?? 0;
  const values = [interval.lower, interval.upper, result.estimate, nullValue];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin || Math.abs(rawMax) || 1;
  const min = rawMin - span * 0.12;
  const max = rawMax + span * 0.12;
  const position = (value: number): number =>
    ((value - min) / (max - min)) * 100;
  const lower = position(interval.lower);
  const upper = position(interval.upper);
  const estimate = position(result.estimate);
  const nullPosition = position(nullValue);

  return (
    <div aria-hidden="true" className="mt-3">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-foreground/32"
          style={{ left: `${lower}%`, width: `${upper - lower}%` }}
        />
        <div
          className="absolute inset-y-0 w-px border-s border-muted-foreground/64 border-dashed"
          style={{ left: `${nullPosition}%` }}
          title={`Null value ${nullValue}`}
        />
        <div
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-background"
          style={{ left: `${estimate}%` }}
        />
        <span
          className="absolute -top-0.5 -translate-x-1/2 font-mono text-[9px] text-muted-foreground"
          style={{ left: `${lower}%` }}
        >
          {formatNumber(interval.lower, result.precision ?? 2)}
        </span>
        <span
          className="absolute -top-0.5 -translate-x-1/2 font-mono text-[9px] text-muted-foreground"
          style={{ left: `${upper}%` }}
        >
          {formatNumber(interval.upper, result.precision ?? 2)}
        </span>
      </div>
      <p className="mt-1 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
        <span>interval</span>
        <span>dashed = null ({nullValue})</span>
      </p>
    </div>
  );
}

export function StatisticalResultBlock({
  result,
  estimateLabel,
  title,
  description,
  emptyLabel = "No result. Pass a result object to render the block.",
  className,
  ...props
}: StatisticalResultBlockProps): React.ReactElement {
  const titleId = React.useId();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const warnings = resultWarnings(result);
  const precision = result.precision ?? 2;
  const alpha = result.alpha ?? 0.05;
  const assumptions = result.assumptions ?? [];

  if (!result || !Number.isFinite(result.estimate)) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="statistical-result"
        {...props}
      >
        <p className="text-center text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="statistical-result"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Statistical result
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? estimateLabel}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <Button
          className="print:hidden"
          onClick={() => copyToClipboard(resultToText(result, estimateLabel))}
          size="sm"
          type="button"
          variant="outline"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? "Copied" : "Copy result"}
        </Button>
      </header>

      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 border-b px-4 py-4 @2xl:border-e @2xl:border-b-0">
          <p className="text-muted-foreground text-xs">{estimateLabel}</p>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
            <span className="font-heading font-semibold text-4xl tabular-nums tracking-tight">
              {formatNumber(result.estimate, precision)}
            </span>
            {result.unit ? (
              <span className="text-muted-foreground text-sm">
                {result.unit}
              </span>
            ) : null}
            <span
              className={cn(
                "ms-auto inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px]",
                result.p < alpha
                  ? "border-foreground/24 bg-foreground/6"
                  : "text-muted-foreground",
              )}
            >
              {formatPValue(result.p)}
            </span>
          </p>
          {result.interval ? (
            <p className="mt-1 text-muted-foreground text-xs">
              {result.interval.level}% {result.interval.kind ?? "confidence"}{" "}
              interval{" "}
              <span className="font-mono text-foreground">
                {formatNumber(result.interval.lower, precision)} to{" "}
                {formatNumber(result.interval.upper, precision)}
              </span>{" "}
              {result.unit ?? ""}
            </p>
          ) : (
            <p className="mt-1 text-muted-foreground text-xs">
              No interval reported. An estimate without an interval hides its
              uncertainty.
            </p>
          )}
          <IntervalGraphic result={result} />
          <p className="mt-4 max-w-prose text-sm leading-relaxed">
            {describeStatisticalResult(result, estimateLabel)}
          </p>
        </div>

        <dl className="grid content-start gap-x-3 gap-y-2 px-4 py-4 text-xs">
          {(
            [
              ["n", String(result.n)],
              ["Test", result.test],
              result.statistic
                ? [
                    result.statistic.label,
                    `${formatNumber(result.statistic.value, 3)}${
                      result.statistic.df === undefined
                        ? ""
                        : `, df ${result.statistic.df}`
                    }`,
                  ]
                : null,
              ["α", String(alpha)],
              result.tails ? ["Tails", result.tails] : null,
              result.effectSize
                ? [
                    result.effectSize.label,
                    `${formatNumber(result.effectSize.value, precision)}${
                      result.effectSize.unit ? ` ${result.effectSize.unit}` : ""
                    }`,
                  ]
                : null,
              result.correction ? ["Correction", result.correction] : null,
            ] as Array<[string, string] | null>
          )
            .filter((row): row is [string, string] => row !== null)
            .map(([label, value]) => (
              <div className="grid grid-cols-[5.5rem_1fr] gap-2" key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-mono tabular-nums">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      {assumptions.length > 0 ? (
        <div className="border-t px-4 py-3">
          <h4 className="font-medium text-xs">
            Assumptions{" "}
            <span className="font-mono font-normal text-muted-foreground">
              {assumptions.filter((item) => item.status === "met").length}/
              {assumptions.length} met
            </span>
          </h4>
          <ul className="mt-2 grid gap-1.5 @xl:grid-cols-2">
            {assumptions.map((assumption) => (
              <li
                className="flex items-start gap-2 text-xs leading-snug"
                key={assumption.name}
              >
                <span
                  className={cn(
                    "mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px]",
                    assumption.status === "met" &&
                      "border-success/32 bg-success/8 text-success-foreground",
                    assumption.status === "violated" &&
                      "border-destructive/32 bg-destructive/8 text-destructive-foreground",
                    assumption.status === "notChecked" &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {ASSUMPTION_MARK[assumption.status]}
                </span>
                <span className="min-w-0">
                  <span className="font-medium">{assumption.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {ASSUMPTION_LABEL[assumption.status]}
                  </span>
                  {assumption.detail ? (
                    <span className="block text-[11px] text-muted-foreground">
                      {assumption.detail}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="border-t bg-warning/8 px-4 py-2.5 text-warning-foreground">
          <ul className="grid gap-1 text-xs leading-snug">
            {warnings.map((warning) => (
              <li className="flex items-start gap-2" key={warning}>
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.warning || result.method ? (
        <footer className="grid gap-1 border-t px-4 py-2.5 text-[11px] text-muted-foreground leading-relaxed">
          {result.warning ? (
            <p className="text-foreground">{result.warning}</p>
          ) : null}
          {result.method ? <p>Method: {result.method}</p> : null}
        </footer>
      ) : null}
    </section>
  );
}
