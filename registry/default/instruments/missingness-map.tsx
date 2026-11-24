"use client";

import { DownloadIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";

export type MissingnessKind =
  | "present"
  | "missing"
  | "censored"
  | "notApplicable"
  | "notCollected";

export type MissingnessCode = {
  code: string;
  label: string;
  kind: MissingnessKind;
};

export type MissingnessCell =
  | number
  | string
  | null
  | {
      kind: MissingnessKind;
      code?: string;
      note?: string;
    };

export type MissingnessColumn = {
  id: string;
  label: string;
};

export type MissingnessRow = {
  id: string;
  label?: string;
  values: Readonly<Record<string, MissingnessCell>>;
};

export type MissingnessColumnSummary = {
  id: string;
  label: string;
  present: number;
  missing: number;
  censored: number;
  notApplicable: number;
  notCollected: number;
  completeness: number;
};

export type MissingnessPair = {
  a: string;
  b: string;
  labelA: string;
  labelB: string;
  rows: number;
};

export type MissingnessSummary = {
  rows: number;
  columns: number;
  cells: number;
  present: number;
  missing: number;
  censored: number;
  notApplicable: number;
  notCollected: number;
  incompleteRows: number;
  completeness: number;
  perColumn: readonly MissingnessColumnSummary[];
  coMissing: readonly MissingnessPair[];
};

export type MissingnessMapProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  columns: readonly MissingnessColumn[];
  rows: readonly MissingnessRow[];
  /** Declared tokens in the source data, e.g. ND, HEM, n/a. */
  codes?: readonly MissingnessCode[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  onExport?: (csv: string) => void;
};

export const DEFAULT_MISSINGNESS_CODES: readonly MissingnessCode[] = [
  { code: "MISSING", kind: "missing", label: "Missing, reason not recorded" },
  { code: "N/A", kind: "notApplicable", label: "Not applicable" },
  { code: "NOT_COLLECTED", kind: "notCollected", label: "Not collected" },
  { code: "<", kind: "censored", label: "Censored, below a limit" },
];

export const MISSINGNESS_GLYPH: Record<MissingnessKind, string> = {
  censored: "<",
  missing: "—",
  notApplicable: "n/a",
  notCollected: "?",
  present: "·",
};

export const MISSINGNESS_LABEL: Record<MissingnessKind, string> = {
  censored: "Censored",
  missing: "Missing",
  notApplicable: "Not applicable",
  notCollected: "Not collected",
  present: "Present",
};

type ResolvedCell = {
  kind: MissingnessKind;
  code: string;
  label: string;
  note?: string;
};

function resolveCell(
  raw: MissingnessCell | undefined,
  codes: readonly MissingnessCode[],
): ResolvedCell {
  if (raw === null || raw === undefined || raw === "") {
    const declared = codes.find((code) => code.kind === "missing");
    return {
      code: declared?.code ?? "MISSING",
      kind: "missing",
      label: declared?.label ?? MISSINGNESS_LABEL.missing,
    };
  }

  if (typeof raw === "object") {
    const declared = codes.find(
      (code) => code.kind === raw.kind && (!raw.code || code.code === raw.code),
    );
    return {
      code: raw.code ?? declared?.code ?? MISSINGNESS_GLYPH[raw.kind],
      kind: raw.kind,
      label: declared?.label ?? MISSINGNESS_LABEL[raw.kind],
      ...(raw.note ? { note: raw.note } : {}),
    };
  }

  if (typeof raw === "string") {
    const declared = codes.find(
      (code) => code.code.toLowerCase() === raw.toLowerCase(),
    );
    if (declared) {
      return {
        code: declared.code,
        kind: declared.kind,
        label: declared.label,
      };
    }
  }

  return {
    code: "present",
    kind: "present",
    label: MISSINGNESS_LABEL.present,
  };
}

export function summarizeMissingness(
  columns: readonly MissingnessColumn[],
  rows: readonly MissingnessRow[],
  codes: readonly MissingnessCode[] = DEFAULT_MISSINGNESS_CODES,
): MissingnessSummary {
  const perColumn: MissingnessColumnSummary[] = columns.map((column) => ({
    censored: 0,
    completeness: 0,
    id: column.id,
    label: column.label,
    missing: 0,
    notApplicable: 0,
    notCollected: 0,
    present: 0,
  }));
  let incompleteRows = 0;
  const incompleteFlags = rows.map(() => false);
  const coMissing = new Map<string, number>();

  rows.forEach((row, rowIndex) => {
    columns.forEach((column, columnIndex) => {
      const cell = resolveCell(row.values[column.id], codes);
      const summary = perColumn[columnIndex];
      if (cell.kind === "present") {
        summary.present += 1;
      } else {
        incompleteFlags[rowIndex] = true;
        if (cell.kind === "censored") {
          summary.censored += 1;
        } else if (cell.kind === "notApplicable") {
          summary.notApplicable += 1;
        } else if (cell.kind === "notCollected") {
          summary.notCollected += 1;
        } else {
          summary.missing += 1;
        }
      }
    });
  });

  const missingColumns = new Map<string, Set<string>>();
  columns.forEach((column) => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const cell = resolveCell(row.values[column.id], codes);
      if (cell.kind === "missing" || cell.kind === "notCollected") {
        set.add(row.id);
      }
    });
    missingColumns.set(column.id, set);
  });
  columns.forEach((a, index) => {
    for (const b of columns.slice(index + 1)) {
      const setB = missingColumns.get(b.id);
      if (!setB) {
        continue;
      }
      let shared = 0;
      for (const id of missingColumns.get(a.id) ?? []) {
        if (setB.has(id)) {
          shared += 1;
        }
      }
      if (shared > 0) {
        coMissing.set(`${a.id}|${b.id}`, shared);
      }
    }
  });

  incompleteRows = incompleteFlags.filter(Boolean).length;

  const totalCells = rows.length * columns.length;
  const present = perColumn.reduce((sum, column) => sum + column.present, 0);
  const missing = perColumn.reduce((sum, column) => sum + column.missing, 0);
  const censored = perColumn.reduce((sum, column) => sum + column.censored, 0);
  const notApplicable = perColumn.reduce(
    (sum, column) => sum + column.notApplicable,
    0,
  );
  const notCollected = perColumn.reduce(
    (sum, column) => sum + column.notCollected,
    0,
  );

  return {
    cells: totalCells,
    censored,
    coMissing: [...coMissing.entries()]
      .map(([key, count]) => {
        const [a, b] = key.split("|");
        const columnA = columns.find((column) => column.id === a);
        const columnB = columns.find((column) => column.id === b);
        return {
          a,
          b,
          labelA: columnA?.label ?? a,
          labelB: columnB?.label ?? b,
          rows: count,
        };
      })
      .sort((left, right) => right.rows - left.rows)
      .slice(0, 3),
    columns: columns.length,
    completeness: totalCells === 0 ? 0 : present / totalCells,
    incompleteRows,
    missing,
    notApplicable,
    notCollected,
    perColumn: perColumn.map((column) => ({
      ...column,
      completeness: rows.length === 0 ? 0 : column.present / rows.length,
    })),
    present,
    rows: rows.length,
  };
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function missingnessCsv(
  columns: readonly MissingnessColumn[],
  rows: readonly MissingnessRow[],
  codes: readonly MissingnessCode[] = DEFAULT_MISSINGNESS_CODES,
): string {
  const header = ["record", ...columns.map((column) => column.id)];
  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) {
    const line = [row.label ?? row.id];
    for (const column of columns) {
      const cell = resolveCell(row.values[column.id], codes);
      line.push(cell.kind === "present" ? "present" : cell.code);
    }
    lines.push(line.map(csvCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function download(csv: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = "missingness-map.csv";
  anchor.href = href;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

const CELL_TONE: Record<MissingnessKind, string> = {
  censored:
    "border-foreground/32 bg-background text-foreground [border-style:dashed]",
  missing: "bg-warning/16 text-warning-foreground",
  notApplicable: "bg-muted/48 text-muted-foreground",
  notCollected: "bg-muted/48 text-muted-foreground",
  present: "bg-muted/24 text-muted-foreground",
};

export function MissingnessMap({
  columns,
  rows,
  codes = DEFAULT_MISSINGNESS_CODES,
  title,
  description,
  emptyLabel = "No matrix. Pass columns and rows to render the map.",
  onExport,
  className,
  ...props
}: MissingnessMapProps): React.ReactElement {
  const titleId = React.useId();
  const [incompleteOnly, setIncompleteOnly] = React.useState(false);
  const summary = React.useMemo(
    () => summarizeMissingness(columns, rows, codes),
    [columns, rows, codes],
  );

  const incompleteRowIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const row of rows) {
      for (const column of columns) {
        if (resolveCell(row.values[column.id], codes).kind !== "present") {
          ids.add(row.id);
          break;
        }
      }
    }
    return ids;
  }, [columns, rows, codes]);

  const visibleRows =
    incompleteOnly && incompleteRowIds.size > 0
      ? rows.filter((row) => incompleteRowIds.has(row.id))
      : rows;

  const usedCodes = React.useMemo(() => {
    const used = new Set<string>();
    for (const row of rows) {
      for (const column of columns) {
        const cell = resolveCell(row.values[column.id], codes);
        if (cell.kind !== "present") {
          used.add(cell.code);
        }
      }
    }
    return codes.filter((code) => used.has(code.code));
  }, [codes, columns, rows]);

  function handleExport(): void {
    const csv = missingnessCsv(columns, rows, codes);
    onExport?.(csv);
    download(csv);
  }

  if (columns.length === 0 || rows.length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="missingness-map"
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
      data-slot="missingness-map"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Missingness and censoring
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? "Matrix completeness"}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>
              {summary.rows} × {summary.columns} cells
            </span>
            <span>{percent(summary.completeness)} present</span>
            <span>
              {summary.incompleteRows} row
              {summary.incompleteRows === 1 ? "" : "s"} to review
            </span>
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
          Export codes
        </Button>
      </header>

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
            Incomplete only
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          each cell is a code, not a value
        </p>
      </div>

      <div className="grid @3xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 overflow-x-auto border-b @3xl:border-e @3xl:border-b-0">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Missingness matrix: {summary.rows} rows by {summary.columns}{" "}
              columns. Each cell reports its state and code.
            </caption>
            <thead>
              <tr>
                <th
                  className="sticky start-0 z-1 bg-background px-2 py-1 text-start font-medium text-[10px] text-muted-foreground"
                  scope="col"
                >
                  Record
                </th>
                {columns.map((column) => (
                  <th
                    className="border-s p-1 align-bottom font-normal"
                    key={column.id}
                    scope="col"
                  >
                    <span
                      className="mx-auto block max-h-24 text-[9px] text-muted-foreground leading-none"
                      style={{ writingMode: "vertical-rl" }}
                      title={column.label}
                    >
                      <span className="inline-block max-w-24 truncate">
                        {column.label}
                      </span>
                    </span>
                  </th>
                ))}
                <th
                  className="border-s px-2 py-1 text-end font-medium text-[10px] text-muted-foreground"
                  scope="col"
                >
                  Gaps
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                let gaps = 0;
                return (
                  <tr className="border-t" key={row.id}>
                    <th
                      className="sticky start-0 z-1 max-w-36 truncate bg-background px-2 py-1 text-start font-mono font-normal text-[10px]"
                      scope="row"
                      title={row.label ?? row.id}
                    >
                      {row.label ?? row.id}
                    </th>
                    {columns.map((column) => {
                      const cell = resolveCell(row.values[column.id], codes);
                      if (cell.kind !== "present") {
                        gaps += 1;
                      }
                      return (
                        <td className="p-0.5" key={column.id}>
                          <span
                            aria-label={`${row.label ?? row.id}, ${column.label}: ${cell.label}${
                              cell.note ? `, ${cell.note}` : ""
                            }`}
                            className={cn(
                              "mx-auto flex h-5 min-w-5 items-center justify-center rounded-[3px] border border-transparent px-1 font-mono text-[9px]",
                              CELL_TONE[cell.kind],
                            )}
                            role="img"
                            title={`${cell.label}${cell.note ? ` — ${cell.note}` : ""}`}
                          >
                            {cell.kind === "present"
                              ? MISSINGNESS_GLYPH.present
                              : cell.code.length <= 4
                                ? cell.code
                                : MISSINGNESS_GLYPH[cell.kind]}
                          </span>
                        </td>
                      );
                    })}
                    <td className="border-s px-2 py-1 text-end font-mono text-[10px] tabular-nums">
                      {gaps === 0 ? "0" : gaps}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid content-start gap-3 px-4 py-3">
          <div>
            <h4 className="font-medium text-[11px]">Column completeness</h4>
            <ul className="mt-1.5 grid gap-1.5">
              {summary.perColumn.map((column) => (
                <li key={column.id}>
                  <div className="flex items-baseline justify-between gap-2 font-mono text-[10px]">
                    <span className="truncate text-muted-foreground">
                      {column.label}
                    </span>
                    <span className="tabular-nums">
                      {percent(column.completeness)}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-foreground/32"
                      style={{ width: `${column.completeness * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {summary.coMissing.length > 0 ? (
            <div>
              <h4 className="font-medium text-[11px]">Missing together</h4>
              <ul className="mt-1 grid gap-1 text-[10px] text-muted-foreground">
                {summary.coMissing.map((pair) => (
                  <li
                    className="flex justify-between gap-2"
                    key={`${pair.a}-${pair.b}`}
                  >
                    <span className="truncate">
                      {pair.labelA} + {pair.labelB}
                    </span>
                    <span className="font-mono tabular-nums">{pair.rows}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h4 className="font-medium text-[11px]">Codes</h4>
            <ul className="mt-1 grid gap-1 text-[10px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="flex size-4 items-center justify-center rounded-[3px] border border-transparent bg-muted/24 font-mono text-[9px]"
                >
                  ·
                </span>
                Present
              </li>
              {usedCodes.map((code) => (
                <li className="flex items-start gap-1.5" key={code.code}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[3px] border font-mono text-[9px]",
                      CELL_TONE[code.kind],
                    )}
                  >
                    {code.code.length <= 3
                      ? code.code
                      : MISSINGNESS_GLYPH[code.kind]}
                  </span>
                  <span>
                    <span className="font-mono text-foreground">
                      {code.code}
                    </span>{" "}
                    — {code.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 font-mono text-[10px] text-muted-foreground">
        <p>
          {summary.missing} missing · {summary.censored} censored ·{" "}
          {summary.notApplicable} not applicable · {summary.notCollected} not
          collected
        </p>
        <p className="print:hidden">export carries codes, not measurements</p>
      </footer>
    </section>
  );
}
