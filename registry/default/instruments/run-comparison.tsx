"use client";

import { DownloadIcon, TriangleAlertIcon } from "lucide-react";
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

export type ComparisonValue =
  | { value: number; unit?: string; uncertainty?: number }
  | { value: string | boolean | null; unit?: string };

export type ComparisonRun = {
  id: string;
  label: string;
  startedAt?: string;
  instrument?: string;
  parameters: Readonly<Record<string, ComparisonValue>>;
  metrics: Readonly<Record<string, ComparisonValue>>;
};

export type ComparisonStatus =
  | "same"
  | "changed"
  | "missing"
  | "unitMismatch"
  | "notComparable";

export type ComparisonRow = {
  key: string;
  values: readonly (ComparisonValue | undefined)[];
  baseline: ComparisonValue | undefined;
  latest: ComparisonValue | undefined;
  status: ComparisonStatus;
  /** latest − baseline, when both are numeric in the same unit. */
  delta: number | null;
  relative: number | null;
  note?: string;
};

export type ComparisonSummary = {
  total: number;
  same: number;
  changed: number;
  missing: number;
  unitMismatch: number;
  parameters: readonly ComparisonRow[];
  metrics: readonly ComparisonRow[];
};

export type RunComparisonOptions = {
  /** Absolute tolerance per key, in the key's unit. */
  absoluteTolerance?: Readonly<Record<string, number>>;
  /** Relative tolerance applied when no absolute tolerance is set. Default 0.001. */
  relativeTolerance?: number;
};

export type RunComparisonProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  runs: readonly ComparisonRun[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  options?: RunComparisonOptions;
  emptyLabel?: React.ReactNode;
  onExport?: (artifact: { csv: string; json: string }) => void;
};

function numeric(
  value: ComparisonValue | undefined,
): value is { value: number; unit?: string; uncertainty?: number } {
  return (
    value !== undefined &&
    typeof value.value === "number" &&
    Number.isFinite(value.value)
  );
}

export function compareValue(
  baseline: ComparisonValue | undefined,
  latest: ComparisonValue | undefined,
  options: { absoluteTolerance?: number; relativeTolerance?: number } = {},
): Pick<ComparisonRow, "delta" | "note" | "relative" | "status"> {
  if (baseline === undefined || latest === undefined) {
    return {
      delta: null,
      note: "Not recorded in one run",
      relative: null,
      status: "missing",
    };
  }

  if (numeric(baseline) && numeric(latest)) {
    if ((baseline.unit ?? "") !== (latest.unit ?? "")) {
      return {
        delta: null,
        note: `${baseline.unit ?? "no unit"} vs ${latest.unit ?? "no unit"}`,
        relative: null,
        status: "unitMismatch",
      };
    }
    const delta = latest.value - baseline.value;
    const relative =
      baseline.value === 0 ? null : delta / Math.abs(baseline.value);
    const relativeTolerance = options.relativeTolerance ?? 0.001;
    const tolerance = Math.max(
      options.absoluteTolerance ?? 0,
      Math.abs(baseline.value) * relativeTolerance,
    );
    return {
      delta,
      note:
        relative === null
          ? "Baseline is zero; relative change is undefined"
          : undefined,
      relative,
      status: Math.abs(delta) <= tolerance ? "same" : "changed",
    };
  }

  if (baseline.value === latest.value) {
    return { delta: null, relative: null, status: "same" };
  }

  if (
    typeof baseline.value === "string" ||
    typeof latest.value === "string" ||
    typeof baseline.value === "boolean" ||
    typeof latest.value === "boolean"
  ) {
    return { delta: null, relative: null, status: "changed" };
  }

  return { delta: null, relative: null, status: "notComparable" };
}

export function compareRuns(
  runs: readonly ComparisonRun[],
  options: RunComparisonOptions = {},
): ComparisonSummary {
  if (runs.length < 2) {
    return {
      changed: 0,
      metrics: [],
      missing: 0,
      parameters: [],
      same: 0,
      total: 0,
      unitMismatch: 0,
    };
  }

  const build = (
    section: "parameters" | "metrics",
    key: string,
  ): ComparisonRow => {
    const values = runs.map((run) => run[section][key]);
    const absolute = options.absoluteTolerance?.[key];
    const compared = compareValue(values[0], values.at(-1), {
      absoluteTolerance: absolute,
      relativeTolerance: options.relativeTolerance,
    });
    return {
      baseline: values[0],
      delta: compared.delta,
      key,
      latest: values.at(-1),
      note: compared.note,
      relative: compared.relative,
      status: compared.status,
      values,
    };
  };

  const parameterKeys = [
    ...new Set(runs.flatMap((run) => Object.keys(run.parameters))),
  ];
  const metricKeys = [
    ...new Set(runs.flatMap((run) => Object.keys(run.metrics))),
  ];
  const parameters = parameterKeys.map((key) => build("parameters", key));
  const metrics = metricKeys.map((key) => build("metrics", key));
  const all = [...parameters, ...metrics];

  return {
    changed: all.filter((row) => row.status === "changed").length,
    metrics,
    missing: all.filter((row) => row.status === "missing").length,
    parameters,
    same: all.filter((row) => row.status === "same").length,
    total: all.length,
    unitMismatch: all.filter((row) => row.status === "unitMismatch").length,
  };
}

const STATUS_LABEL: Record<ComparisonStatus, string> = {
  changed: "Changed",
  missing: "Missing",
  notComparable: "Not comparable",
  same: "Same",
  unitMismatch: "Unit mismatch",
};

const MINUS = "−";

function formatNumber(value: number, precision?: number): string {
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1_000_000 || abs < 0.0001)) {
    return value.toExponential(precision ?? 2).replace("-", MINUS);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits:
      precision ?? Math.min(4, Math.max(0, decimals(value))),
  })
    .format(value)
    .replace("-", MINUS);
}

function decimals(value: number): number {
  const text = String(value);
  const dot = text.indexOf(".");
  if (dot === -1) {
    return 0;
  }
  const exponent = text.indexOf("e");
  return (exponent === -1 ? text.length : exponent) - dot - 1;
}

function formatValue(value: ComparisonValue | undefined): string {
  if (value === undefined) {
    return "—";
  }
  if (typeof value.value === "boolean") {
    return value.value ? "true" : "false";
  }
  if (typeof value.value === "number") {
    return `${formatNumber(value.value)}${value.unit ? ` ${value.unit}` : ""}`;
  }
  if (value.value === null) {
    return "—";
  }
  return `${value.value}${value.unit ? ` ${value.unit}` : ""}`;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function comparisonCsv(
  runs: readonly ComparisonRun[],
  summary: ComparisonSummary,
): string {
  const header = [
    "section",
    "key",
    ...runs.map((run) => run.label),
    "delta",
    "relative_change",
    "status",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const [section, rows] of [
    ["parameter", summary.parameters],
    ["metric", summary.metrics],
  ] as const) {
    for (const row of rows) {
      lines.push(
        [
          section,
          row.key,
          ...runs.map((_, index) => {
            const value = row.values[index];
            return value === undefined ? "" : String(value.value);
          }),
          row.delta === null ? "" : String(row.delta),
          row.relative === null ? "" : String(row.relative),
          row.status,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

export function comparisonJson(
  runs: readonly ComparisonRun[],
  summary: ComparisonSummary,
): string {
  return `${JSON.stringify({ runs, summary }, null, 2)}\n`;
}

function download(name: string, text: string, type: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }
  const blob = new Blob([text], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = name;
  anchor.href = href;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function StatusCell({ row }: { row: ComparisonRow }): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px]",
        row.status === "changed" && "border-foreground/24 bg-foreground/6",
        row.status === "missing" && "text-muted-foreground",
        row.status === "unitMismatch" &&
          "border-warning/32 bg-warning/8 text-warning-foreground",
      )}
      title={row.note}
    >
      {STATUS_LABEL[row.status]}
    </span>
  );
}

function ComparisonTable({
  label,
  rows,
  runs,
}: {
  label: string;
  rows: readonly ComparisonRow[];
  runs: readonly ComparisonRun[];
}): React.ReactElement | null {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div>
      <h4 className="border-b bg-muted/24 px-4 py-1.5 font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-32">Key</TableHead>
            {runs.map((run) => (
              <TableHead className="min-w-24 text-end" key={run.id}>
                {run.label}
              </TableHead>
            ))}
            <TableHead className="hidden text-end sm:table-cell">
              Delta
            </TableHead>
            <TableHead className="text-end">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableHead
                className="font-mono font-normal text-[11px]"
                scope="row"
              >
                {row.key}
                {row.note ? (
                  <span className="block text-[9px] text-muted-foreground">
                    {row.note}
                  </span>
                ) : null}
              </TableHead>
              {runs.map((run, index) => {
                const value = row.values[index];
                const missing = value === undefined;
                return (
                  <TableCell
                    className={cn(
                      "whitespace-nowrap text-end font-mono text-xs tabular-nums",
                      missing && "text-muted-foreground",
                    )}
                    key={run.id}
                  >
                    {formatValue(value)}
                    {numeric(value) && value.uncertainty !== undefined ? (
                      <span className="ms-1 text-[9px] text-muted-foreground">
                        ±{formatNumber(value.uncertainty)}
                      </span>
                    ) : null}
                  </TableCell>
                );
              })}
              <TableCell className="hidden whitespace-nowrap text-end font-mono text-xs tabular-nums sm:table-cell">
                {row.delta === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <>
                    {formatNumber(row.delta, 4)}
                    {row.relative === null ? null : (
                      <span className="ms-1 text-[9px] text-muted-foreground">
                        {row.relative >= 0 ? "+" : ""}
                        {formatNumber(row.relative * 100, 1)}%
                      </span>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell className="text-end">
                <StatusCell row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RunComparison({
  runs,
  title,
  description,
  options,
  emptyLabel = "No runs to compare. Pass at least two runs.",
  onExport,
  className,
  ...props
}: RunComparisonProps): React.ReactElement {
  const titleId = React.useId();
  const [differencesOnly, setDifferencesOnly] = React.useState(false);
  const summary = React.useMemo(
    () => compareRuns(runs, options),
    [runs, options],
  );

  if (runs.length < 2) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="run-comparison"
        {...props}
      >
        <p className="text-center text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      </section>
    );
  }

  const visible = (rows: readonly ComparisonRow[]): readonly ComparisonRow[] =>
    differencesOnly ? rows.filter((row) => row.status !== "same") : rows;

  function handleExport(): void {
    const csv = comparisonCsv(runs, summary);
    const json = comparisonJson(runs, summary);
    onExport?.({ csv, json });
    download("run-comparison.json", json, "application/json");
  }

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="run-comparison"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Run comparison
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? `${runs[0].label} vs ${runs.at(-1)?.label}`}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            {runs.map((run) => (
              <span key={run.id}>
                {run.id}
                {run.startedAt ? ` · ${run.startedAt}` : ""}
              </span>
            ))}
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
          Export diff
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-px border-b bg-border sm:grid-cols-4">
        {[
          ["Same", summary.same],
          ["Changed", summary.changed],
          ["Missing", summary.missing],
          ["Unit mismatch", summary.unitMismatch],
        ].map(([label, count]) => (
          <div className="bg-background px-4 py-2" key={label}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="font-heading font-semibold text-lg tabular-nums">
              {count}
            </p>
          </div>
        ))}
      </div>

      {summary.unitMismatch > 0 ? (
        <div className="flex items-start gap-2 border-b bg-warning/8 px-4 py-2 text-warning-foreground text-xs">
          <TriangleAlertIcon
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0"
          />
          <p>
            {summary.unitMismatch} key
            {summary.unitMismatch === 1 ? " uses" : "s use"} different units. No
            delta is computed across a unit change; convert the values first.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
        <Button
          aria-pressed={differencesOnly}
          onClick={() => setDifferencesOnly((current) => !current)}
          size="xs"
          type="button"
          variant={differencesOnly ? "secondary" : "ghost"}
        >
          {differencesOnly ? "Showing differences" : "Differences only"}
        </Button>
        <p className="font-mono text-[10px] text-muted-foreground">
          tolerance {options?.relativeTolerance ?? 0.001} relative
        </p>
      </div>

      <ComparisonTable
        label="Parameters"
        rows={visible(summary.parameters)}
        runs={runs}
      />
      <ComparisonTable
        label="Metrics"
        rows={visible(summary.metrics)}
        runs={runs}
      />

      <footer className="border-t px-4 py-2 font-mono text-[10px] text-muted-foreground">
        {summary.total} keys compared · baseline {runs[0].label} · latest{" "}
        {runs.at(-1)?.label}
      </footer>
    </section>
  );
}
