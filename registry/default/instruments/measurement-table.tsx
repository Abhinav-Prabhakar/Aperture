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

export type MeasurementColumnType =
  | "quantity"
  | "number"
  | "category"
  | "datetime"
  | "text";

export type MeasurementMissingCode = {
  /** The token as it appears in the source data, e.g. "ND" or "HEM". */
  code: string;
  /** What the code means, e.g. "Not detected". */
  label: string;
  kind?: "missing" | "notApplicable" | "notCollected";
};

export type MeasurementDetectionLimit = {
  value: number;
  /** Default "<". */
  operator?: "<" | "<=";
  /** Default "LOD". */
  label?: string;
};

export type MeasurementColumnUncertainty = {
  /** Absolute uncertainty in the column's unit. */
  value: number;
  kind?: "absolute" | "relative";
};

export type MeasurementColumn = {
  id: string;
  label: string;
  /** Defaults to "quantity" when a unit is present, otherwise "number". */
  type?: MeasurementColumnType;
  /** Required for a quantity column; the table flags the column when absent. */
  unit?: string;
  /** Decimal places. Inferred from the value when absent, capped at 6. */
  precision?: number;
  /** Declared missing-value tokens for this column. */
  missingCodes?: readonly MeasurementMissingCode[];
  /** A limit applied to censored cells that do not carry their own. */
  detectionLimit?: MeasurementDetectionLimit;
  /** A column-wide uncertainty, used when a cell has none. */
  uncertainty?: MeasurementColumnUncertainty;
  /** Hide the uncertainty even when it is present. */
  showUncertainty?: boolean;
};

export type MeasurementCellFlag = "ok" | "warning" | "fail";

export type MeasurementCell =
  | number
  | string
  | null
  | {
      value?: number | string | null;
      uncertainty?: number | null;
      /** A non-detect reported as a limit, e.g. { limit: 0.05 }. */
      censored?: { limit: number; operator?: "<" | "<=" } | null;
      /** The missing-code token for this cell. */
      missing?: string | null;
      note?: string | null;
      flag?: MeasurementCellFlag | null;
    };

export type MeasurementRow = {
  id: string;
  /** Display label for the record column. Defaults to the id. */
  label?: string;
  values: Readonly<Record<string, MeasurementCell>>;
};

export type MeasurementCellState =
  | "value"
  | "censored"
  | "missing"
  | "empty"
  | "invalid";

export type NormalizedMeasurementCell = {
  state: MeasurementCellState;
  numeric: number | null;
  text: string | null;
  uncertainty: number | null;
  limit: number | null;
  operator: "<" | "<=";
  code: string | null;
  note: string | null;
  flag: MeasurementCellFlag | null;
};

export type MeasurementColumnSummary = {
  id: string;
  present: number;
  missing: number;
  censored: number;
  invalid: number;
};

export type MeasurementTableSummary = {
  rows: number;
  columns: number;
  cells: number;
  present: number;
  missing: number;
  censored: number;
  invalid: number;
  flagged: number;
  columnsWithoutUnit: readonly string[];
  perColumn: readonly MeasurementColumnSummary[];
};

export type MeasurementTableProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  columns: readonly MeasurementColumn[];
  rows: readonly MeasurementRow[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Accessible table caption. Defaults to the title. */
  caption?: string;
  /** Heading for the record column. Default "Record". */
  recordLabel?: string;
  emptyLabel?: React.ReactNode;
  onExport?: (csv: string) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function measurementColumnType(
  column: MeasurementColumn,
): MeasurementColumnType {
  if (column.type) {
    return column.type;
  }
  return column.unit ? "quantity" : "number";
}

export function isNumericMeasurementColumn(column: MeasurementColumn): boolean {
  const type = measurementColumnType(column);
  return type === "quantity" || type === "number";
}

export function normalizeMeasurementCell(
  column: MeasurementColumn,
  raw: MeasurementCell | undefined,
): NormalizedMeasurementCell {
  const numericColumn = isNumericMeasurementColumn(column);
  const declaredLimit = column.detectionLimit;
  const operator: "<" | "<=" = declaredLimit?.operator ?? "<";
  const base: NormalizedMeasurementCell = {
    code: null,
    flag: null,
    limit: null,
    note: null,
    numeric: null,
    operator,
    state: "empty",
    text: null,
    uncertainty: null,
  };

  if (raw === null || raw === undefined) {
    return base;
  }

  if (isRecord(raw)) {
    const next: NormalizedMeasurementCell = { ...base };
    if (typeof raw.note === "string" && raw.note.trim() !== "") {
      next.note = raw.note;
    }
    if (raw.flag === "ok" || raw.flag === "warning" || raw.flag === "fail") {
      next.flag = raw.flag;
    }

    const censored = raw.censored;
    if (isRecord(censored) && Number.isFinite(censored.limit)) {
      const limit = Number(censored.limit);
      next.state = "censored";
      next.limit = limit;
      next.operator =
        censored.operator === "<=" || censored.operator === "<"
          ? censored.operator
          : operator;
      if (typeof raw.value === "number" && Number.isFinite(raw.value)) {
        next.numeric = raw.value;
      }
      return next;
    }

    if (typeof raw.missing === "string" && raw.missing !== "") {
      next.state = "missing";
      next.code = raw.missing;
      return next;
    }

    if (raw.value === null || raw.value === undefined || raw.value === "") {
      return next;
    }

    if (typeof raw.value === "number") {
      if (!Number.isFinite(raw.value)) {
        next.state = "invalid";
        next.text = String(raw.value);
        return next;
      }
      next.state = "value";
      next.numeric = raw.value;
      if (
        typeof raw.uncertainty === "number" &&
        Number.isFinite(raw.uncertainty) &&
        raw.uncertainty >= 0
      ) {
        next.uncertainty = raw.uncertainty;
      }
      return next;
    }

    if (numericColumn) {
      next.state = "invalid";
      next.text = String(raw.value);
      return next;
    }

    next.state = "value";
    next.text = String(raw.value);
    return next;
  }

  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      return { ...base, state: "invalid", text: String(raw) };
    }
    return { ...base, numeric: raw, state: "value" };
  }

  if (raw === "") {
    return base;
  }

  if (numericColumn) {
    return { ...base, state: "invalid", text: raw };
  }

  return { ...base, state: "value", text: raw };
}

export function summarizeMeasurementColumns(
  columns: readonly MeasurementColumn[],
  rows: readonly MeasurementRow[],
): MeasurementTableSummary {
  const perColumn: MeasurementColumnSummary[] = columns.map((column) => ({
    censored: 0,
    id: column.id,
    invalid: 0,
    missing: 0,
    present: 0,
  }));
  let flagged = 0;
  let present = 0;
  let missing = 0;
  let censored = 0;
  let invalid = 0;

  for (const row of rows) {
    columns.forEach((column, index) => {
      const cell = normalizeMeasurementCell(column, row.values[column.id]);
      const summary = perColumn[index];
      if (cell.flag) {
        flagged += 1;
      }
      if (cell.state === "value") {
        present += 1;
        summary.present += 1;
      } else if (cell.state === "censored") {
        censored += 1;
        summary.censored += 1;
      } else if (cell.state === "invalid") {
        invalid += 1;
        summary.invalid += 1;
      } else {
        missing += 1;
        summary.missing += 1;
      }
    });
  }

  return {
    cells: rows.length * columns.length,
    censored,
    columns: columns.length,
    columnsWithoutUnit: columns
      .filter(
        (column) =>
          measurementColumnType(column) === "quantity" && !column.unit,
      )
      .map((column) => column.label),
    flagged,
    invalid,
    missing,
    perColumn,
    present,
    rows: rows.length,
  };
}

const MINUS = "−";

function formatMagnitude(value: number, precision: number | undefined): string {
  const abs = Math.abs(value);
  const digits = precision ?? Math.min(4, Math.max(0, countDecimals(value)));
  if (abs !== 0 && (abs >= 1_000_000 || abs < 0.001)) {
    return value
      .toExponential(precision === undefined ? 2 : Math.min(6, digits))
      .replace("-", MINUS);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: precision === undefined ? 0 : digits,
  })
    .format(value)
    .replace("-", MINUS);
}

function countDecimals(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const text = String(value);
  const dot = text.indexOf(".");
  if (dot === -1) {
    return 0;
  }
  const exponent = text.indexOf("e");
  return (exponent === -1 ? text.length : exponent) - dot - 1;
}

export function formatMeasurementCell(
  column: MeasurementColumn,
  cell: NormalizedMeasurementCell,
): string {
  if (cell.state === "censored" && cell.limit !== null) {
    const limit = formatMagnitude(cell.limit, column.precision);
    return `${cell.operator === "<=" ? "≤" : "<"} ${limit}`;
  }
  if (cell.state === "value") {
    if (cell.numeric !== null) {
      return formatMagnitude(cell.numeric, column.precision);
    }
    return cell.text ?? "";
  }
  if (cell.state === "invalid") {
    return cell.text ?? "";
  }
  return "";
}

function exportNumber(value: number): string {
  if (Object.is(value, -0)) {
    return "0";
  }
  return String(value);
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function measurementTableCsv(
  columns: readonly MeasurementColumn[],
  rows: readonly MeasurementRow[],
  recordLabel = "Record",
): string {
  const normalizedRows = rows.map((row) => ({
    row,
    cells: columns.map((column) =>
      normalizeMeasurementCell(column, row.values[column.id]),
    ),
  }));
  const uncertaintyColumns = columns.filter(
    (column, index) =>
      column.showUncertainty !== false &&
      normalizedRows.some(({ cells }) => cells[index].uncertainty !== null),
  );
  const hasFlags = normalizedRows.some(({ cells }) =>
    cells.some((cell) => cell.flag !== null),
  );

  const header = [recordLabel];
  for (const column of columns) {
    header.push(
      column.unit ? `${column.label} [${column.unit}]` : column.label,
    );
    if (uncertaintyColumns.includes(column)) {
      header.push(`${column.label} uncertainty [${column.unit ?? ""}]`);
    }
  }
  if (hasFlags) {
    header.push("Flags");
  }

  const lines = [header.map(csvCell).join(",")];

  for (const { row, cells } of normalizedRows) {
    const line = [row.label ?? row.id];
    columns.forEach((column, index) => {
      const cell = cells[index];
      if (cell.state === "censored" && cell.limit !== null) {
        line.push(`${cell.operator}${exportNumber(cell.limit)}`);
      } else if (cell.state === "value" && cell.numeric !== null) {
        line.push(exportNumber(cell.numeric));
      } else if (cell.state === "value") {
        line.push(cell.text ?? "");
      } else if (cell.state === "invalid") {
        line.push(cell.text ?? "");
      } else {
        line.push(cell.code ?? "");
      }
      if (uncertaintyColumns.includes(column)) {
        line.push(
          cell.uncertainty === null ? "" : exportNumber(cell.uncertainty),
        );
      }
    });
    if (hasFlags) {
      line.push(
        cells
          .map((cell, index) =>
            cell.flag ? `${columns[index].id}=${cell.flag}` : "",
          )
          .filter(Boolean)
          .join("; "),
      );
    }
    lines.push(line.map(csvCell).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function triggerDownload(csv: string, name: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = `measurement-table-${name.replaceAll(
    /[^a-zA-Z0-9._-]/g,
    "-",
  )}.csv`;
  anchor.href = href;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

const FLAG_LABEL: Record<MeasurementCellFlag, string> = {
  fail: "Failed check",
  ok: "Passed check",
  warning: "Warning",
};

const FLAG_MARK: Record<MeasurementCellFlag, string> = {
  fail: "×",
  ok: "✓",
  warning: "!",
};

export function MeasurementTable({
  columns,
  rows,
  title,
  description,
  caption,
  recordLabel = "Record",
  emptyLabel = "No measurements. Pass columns and rows to render the table.",
  onExport,
  className,
  ...props
}: MeasurementTableProps): React.ReactElement {
  const titleId = React.useId();
  const tableId = React.useId();
  const [incompleteOnly, setIncompleteOnly] = React.useState(false);

  const summary = React.useMemo(
    () => summarizeMeasurementColumns(columns, rows),
    [columns, rows],
  );

  const normalized = React.useMemo(
    () =>
      rows.map((row) => ({
        cells: columns.map((column) =>
          normalizeMeasurementCell(column, row.values[column.id]),
        ),
        row,
      })),
    [columns, rows],
  );

  const incompleteRows = normalized.filter(({ cells }) =>
    cells.some(
      (cell) =>
        cell.state === "missing" ||
        cell.state === "empty" ||
        cell.state === "censored" ||
        cell.state === "invalid" ||
        cell.flag === "warning" ||
        cell.flag === "fail",
    ),
  );

  const visibleRows =
    incompleteOnly && incompleteRows.length > 0 ? incompleteRows : normalized;

  const usedCodes = React.useMemo(() => {
    const used = new Set<string>();
    for (const { cells } of normalized) {
      for (const cell of cells) {
        if (cell.code) {
          used.add(cell.code);
        }
      }
    }
    return columns.flatMap((column) =>
      (column.missingCodes ?? []).filter(
        (code) => used.has(code.code) || used.size === 0,
      ),
    );
  }, [columns, normalized]);

  const usedLimits = columns.filter((column) => column.detectionLimit);
  const hasChecks =
    summary.missing > 0 ||
    summary.censored > 0 ||
    summary.invalid > 0 ||
    summary.flagged > 0 ||
    summary.columnsWithoutUnit.length > 0;

  function handleExport(): void {
    const csv = measurementTableCsv(columns, rows, recordLabel);
    onExport?.(csv);
    triggerDownload(csv, title ? String(title) : "export");
  }

  if (columns.length === 0 || rows.length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="measurement-table"
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
      data-slot="measurement-table"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Measurement table
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? "Measurements"}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>
              {summary.rows} record{summary.rows === 1 ? "" : "s"}
            </span>
            <span>{summary.columns} columns</span>
            {summary.missing > 0 ? (
              <span>{summary.missing} missing</span>
            ) : null}
            {summary.censored > 0 ? (
              <span>{summary.censored} censored</span>
            ) : null}
            {summary.invalid > 0 ? (
              <span className="text-destructive-foreground">
                {summary.invalid} unparsed
              </span>
            ) : null}
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

      {incompleteRows.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
          <div
            aria-label="Row filter"
            className="flex items-center gap-0.5 rounded-lg border p-0.5"
            role="group"
          >
            <Button
              aria-pressed={!incompleteOnly}
              className="rounded-md"
              onClick={() => setIncompleteOnly(false)}
              size="xs"
              type="button"
              variant={incompleteOnly ? "ghost" : "secondary"}
            >
              All rows
            </Button>
            <Button
              aria-pressed={incompleteOnly}
              className="rounded-md"
              onClick={() => setIncompleteOnly(true)}
              size="xs"
              type="button"
              variant={incompleteOnly ? "secondary" : "ghost"}
            >
              Needs review
            </Button>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {incompleteRows.length} of {summary.rows} rows carry a missing,
            censored, or flagged cell
          </p>
        </div>
      ) : null}

      <div id={tableId}>
        <Table>
          <caption className="sr-only">
            {caption ??
              `${typeof title === "string" ? title : "Measurement table"} — ${
                summary.rows
              } records, ${summary.columns} columns.`}
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-28">{recordLabel}</TableHead>
              {columns.map((column) => {
                const numeric = isNumericMeasurementColumn(column);
                const type = measurementColumnType(column);
                return (
                  <TableHead
                    className={cn(
                      "min-w-24 align-bottom",
                      numeric && "text-end",
                    )}
                    key={column.id}
                    scope="col"
                  >
                    <span className="block font-medium text-foreground">
                      {column.label}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] font-normal text-muted-foreground">
                      {column.unit ? (
                        <span dir="ltr">{column.unit}</span>
                      ) : type === "quantity" ? (
                        <span className="text-warning-foreground">
                          unit not set
                        </span>
                      ) : (
                        type
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map(({ row, cells }) => (
              <TableRow key={row.id}>
                <TableHead
                  className="font-mono font-normal text-xs"
                  scope="row"
                >
                  <span className="block text-foreground">
                    {row.label ?? row.id}
                  </span>
                  {row.label ? (
                    <span className="block text-[10px] text-muted-foreground">
                      {row.id}
                    </span>
                  ) : null}
                </TableHead>
                {cells.map((cell, index) => {
                  const column = columns[index];
                  const numeric = isNumericMeasurementColumn(column);
                  const hasValue =
                    cell.state === "value" || cell.state === "censored";
                  const uncertainty = Math.max(
                    cell.uncertainty ?? 0,
                    cell.uncertainty === null && column.uncertainty
                      ? column.uncertainty.kind === "relative"
                        ? Math.abs(cell.numeric ?? 0) * column.uncertainty.value
                        : column.uncertainty.value
                      : 0,
                  );
                  const showUncertainty =
                    column.showUncertainty !== false &&
                    hasValue &&
                    cell.state !== "censored" &&
                    (cell.uncertainty !== null || column.uncertainty) &&
                    uncertainty > 0;

                  const missingCode = cell.code
                    ? (column.missingCodes ?? []).find(
                        (code) => code.code === cell.code,
                      )
                    : undefined;
                  const stateLabel =
                    cell.state === "missing" || cell.state === "empty"
                      ? missingCode
                        ? `Missing — ${missingCode.label} (${missingCode.code})`
                        : "No value recorded"
                      : cell.state === "censored"
                        ? `Below limit of ${formatMagnitude(
                            cell.limit ?? 0,
                            column.precision,
                          )} ${column.unit ?? ""}`.trim()
                        : cell.state === "invalid"
                          ? `Unparsed value ${cell.text ?? ""}`
                          : null;
                  const flagLabel = cell.flag
                    ? `${FLAG_LABEL[cell.flag]}${
                        cell.note ? `: ${cell.note}` : ""
                      }`
                    : "";

                  return (
                    <TableCell
                      className={cn(
                        "whitespace-nowrap align-top tabular-nums",
                        numeric && "text-end",
                        (cell.state === "missing" || cell.state === "empty") &&
                          "text-muted-foreground",
                        cell.state === "invalid" &&
                          "bg-destructive/4 text-destructive-foreground",
                      )}
                      key={column.id}
                      title={[cell.note, stateLabel, flagLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    >
                      {cell.state === "value" ? (
                        <span className="inline-flex items-baseline gap-1">
                          <span
                            className="font-mono text-xs"
                            dir={numeric ? "ltr" : undefined}
                          >
                            {formatMeasurementCell(column, cell)}
                          </span>
                          {showUncertainty ? (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ±
                              {formatMagnitude(
                                uncertainty,
                                Math.max(column.precision ?? 0, 1),
                              )}
                            </span>
                          ) : null}
                        </span>
                      ) : cell.state === "censored" ? (
                        <span
                          className="inline-flex items-baseline gap-1 font-mono text-xs"
                          dir="ltr"
                        >
                          <span className="text-muted-foreground">
                            {cell.operator === "<=" ? "≤" : "<"}
                          </span>
                          {formatMagnitude(cell.limit ?? 0, column.precision)}
                        </span>
                      ) : cell.state === "invalid" ? (
                        <span className="inline-flex items-baseline gap-1 font-mono text-xs">
                          <TriangleAlertIcon
                            aria-hidden="true"
                            className="size-3 translate-y-0.5"
                          />
                          {cell.text}
                        </span>
                      ) : (
                        <span className="inline-flex items-baseline gap-1">
                          <span className="font-mono text-xs">
                            {cell.code ?? "—"}
                          </span>
                          <span className="sr-only">
                            {stateLabel ?? "Missing"}
                          </span>
                        </span>
                      )}
                      {cell.flag ? (
                        <span
                          aria-label={flagLabel}
                          className={cn(
                            "ms-1.5 inline-flex size-4 items-center justify-center rounded-sm border font-mono text-[10px]",
                            cell.flag === "warning" &&
                              "border-warning/32 bg-warning/8 text-warning-foreground",
                            cell.flag === "fail" &&
                              "border-destructive/32 bg-destructive/8 text-destructive-foreground",
                            cell.flag === "ok" &&
                              "border-success/32 bg-success/8 text-success-foreground",
                          )}
                          role="img"
                        >
                          {FLAG_MARK[cell.flag]}
                        </span>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <tfoot className="border-t bg-muted/24">
            <TableRow>
              <TableCell className="py-2 font-mono text-[10px] text-muted-foreground">
                Column checks
              </TableCell>
              {columns.map((column) => {
                const index = columns.indexOf(column);
                const counts = summary.perColumn[index];
                const issues =
                  counts.missing + counts.censored + counts.invalid;
                return (
                  <TableCell
                    className={cn(
                      "py-2 text-end font-mono text-[10px]",
                      issues > 0
                        ? "text-muted-foreground"
                        : "text-muted-foreground/64",
                    )}
                    key={column.id}
                  >
                    n {counts.present}
                    {issues > 0 ? ` · ${issues} to review` : " · complete"}
                  </TableCell>
                );
              })}
            </TableRow>
          </tfoot>
        </Table>
      </div>

      {hasChecks ? (
        <div className="grid gap-2 border-t px-4 py-2.5 text-[10px] text-muted-foreground sm:grid-cols-2">
          <ul className="grid gap-1">
            {usedCodes.map((code) => (
              <li key={code.code}>
                <span className="font-mono text-foreground">{code.code}</span> —{" "}
                {code.label}
              </li>
            ))}
            {usedLimits.map((column) => (
              <li key={`limit-${column.id}`}>
                <span className="font-mono text-foreground">
                  {column.detectionLimit?.label ?? "LOD"}
                </span>{" "}
                — {column.label} below{" "}
                {formatMagnitude(
                  column.detectionLimit?.value ?? 0,
                  column.precision,
                )}{" "}
                {column.unit ?? ""}
              </li>
            ))}
          </ul>
          <ul className="grid gap-1 sm:text-end">
            {summary.columnsWithoutUnit.length > 0 ? (
              <li className="text-warning-foreground">
                Quantity without a unit: {summary.columnsWithoutUnit.join(", ")}
              </li>
            ) : null}
            <li>
              <span className="font-mono text-foreground">✓</span> passed ·{" "}
              <span className="font-mono text-foreground">!</span> warning ·{" "}
              <span className="font-mono text-foreground">×</span> failed
            </li>
            <li>Censored values keep their limit; they are never zero.</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
