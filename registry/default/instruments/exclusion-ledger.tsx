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

export type LedgerEntryKind =
  | "exclusion"
  | "transformation"
  | "imputation"
  | "conversion";

export type LedgerEntry = {
  id: string;
  kind: LedgerEntryKind;
  /** What was done, in the imperative: "Removed failed QC samples". */
  action: string;
  /** The table, sample set, or artifact the entry applies to. */
  target: string;
  /** Human-readable justification. */
  reason: string;
  /** A stable code for grouping, e.g. "QC_FAIL". */
  reasonCode: string;
  actor: string;
  /** ISO 8601 timestamp. */
  at: string;
  /** Row or record count before the step. */
  rowsBefore: number;
  /** Row or record count after the step. */
  rowsAfter: number;
  reversible: boolean;
  linkedRun?: string;
  note?: string;
};

export type LedgerReason = {
  code: string;
  label: string;
  entries: number;
  rows: number;
};

export type LedgerSummary = {
  raw: number;
  included: number;
  removed: number;
  added: number;
  entries: number;
  excluded: number;
  transformed: number;
  imputed: number;
  converted: number;
  /** True when every entry starts where the previous one ended. */
  reconciled: boolean;
  /** The first gap in the chain, if any. */
  gap: { index: number; expected: number; found: number } | null;
  reasons: readonly LedgerReason[];
};

export type ExclusionLedgerProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  entries: readonly LedgerEntry[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  onExport?: (artifact: { csv: string; json: string }) => void;
};

const KIND_LABEL: Record<LedgerEntryKind, string> = {
  conversion: "Conversion",
  exclusion: "Exclusion",
  imputation: "Imputation",
  transformation: "Transformation",
};

const KIND_ORDER: readonly LedgerEntryKind[] = [
  "exclusion",
  "transformation",
  "imputation",
  "conversion",
];

function safeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export function summarizeLedger(
  entries: readonly LedgerEntry[],
): LedgerSummary {
  const ordered = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const counts: Record<LedgerEntryKind, number> = {
    conversion: 0,
    exclusion: 0,
    imputation: 0,
    transformation: 0,
  };
  const reasons = new Map<string, LedgerReason>();
  let removed = 0;
  let added = 0;
  let gap: LedgerSummary["gap"] = null;

  ordered.forEach((entry, index) => {
    counts[entry.kind] += 1;
    const before = safeCount(entry.rowsBefore);
    const after = safeCount(entry.rowsAfter);
    const delta = after - before;
    if (delta < 0) {
      removed += -delta;
      if (entry.kind === "exclusion") {
        const key = entry.reasonCode || entry.reason;
        const current = reasons.get(key);
        if (current) {
          reasons.set(key, {
            ...current,
            entries: current.entries + 1,
            rows: current.rows - delta,
          });
        } else {
          reasons.set(key, {
            code: entry.reasonCode,
            entries: 1,
            label: entry.reason,
            rows: -delta,
          });
        }
      }
    } else {
      added += delta;
    }
    if (index > 0 && gap === null) {
      const previous = safeCount(ordered[index - 1].rowsAfter);
      if (previous !== before) {
        gap = { expected: previous, found: before, index };
      }
    }
  });

  const first = ordered[0];
  const last = ordered.at(-1);

  return {
    added,
    converted: counts.conversion,
    entries: ordered.length,
    excluded: counts.exclusion,
    gap,
    imputed: counts.imputation,
    included: last ? safeCount(last.rowsAfter) : 0,
    raw: first ? safeCount(first.rowsBefore) : 0,
    reasons: [...reasons.values()].sort((a, b) => b.rows - a.rows),
    reconciled: gap === null,
    removed,
    transformed: counts.transformation,
  };
}

function csvCell(value: string | number | boolean | null): string {
  const text = value === null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function ledgerCsv(entries: readonly LedgerEntry[]): string {
  const header = [
    "id",
    "at",
    "kind",
    "action",
    "target",
    "reason_code",
    "reason",
    "actor",
    "rows_before",
    "rows_after",
    "delta",
    "reversible",
    "linked_run",
    "note",
  ];
  const lines = [header.join(",")];
  for (const entry of [...entries].sort((a, b) => a.at.localeCompare(b.at))) {
    lines.push(
      [
        entry.id,
        entry.at,
        entry.kind,
        entry.action,
        entry.target,
        entry.reasonCode,
        entry.reason,
        entry.actor,
        entry.rowsBefore,
        entry.rowsAfter,
        entry.rowsAfter - entry.rowsBefore,
        entry.reversible ? "yes" : "no",
        entry.linkedRun ?? "",
        entry.note ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function ledgerJson(
  entries: readonly LedgerEntry[],
  summary: LedgerSummary = summarizeLedger(entries),
): string {
  return `${JSON.stringify({ summary, entries }, null, 2)}\n`;
}

function formatDelta(value: number): string {
  if (value === 0) {
    return "±0";
  }
  return value > 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
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

export function ExclusionLedger({
  entries,
  title,
  description,
  emptyLabel = "No ledger entries. Nothing has been excluded or transformed yet.",
  onExport,
  className,
  ...props
}: ExclusionLedgerProps): React.ReactElement {
  const titleId = React.useId();
  const [filter, setFilter] = React.useState<"all" | LedgerEntryKind>("all");

  const summary = React.useMemo(() => summarizeLedger(entries), [entries]);
  const ordered = React.useMemo(
    () => [...entries].sort((a, b) => b.at.localeCompare(a.at)),
    [entries],
  );
  const visible =
    filter === "all"
      ? ordered
      : ordered.filter((entry) => entry.kind === filter);
  const maxReason = Math.max(
    1,
    ...summary.reasons.map((reason) => reason.rows),
  );

  function handleExportCsv(): void {
    const csv = ledgerCsv(entries);
    onExport?.({ csv, json: ledgerJson(entries, summary) });
    download("exclusion-ledger.csv", csv, "text/csv;charset=utf-8");
  }

  function handleExportJson(): void {
    const csv = ledgerCsv(entries);
    const json = ledgerJson(entries, summary);
    onExport?.({ csv, json });
    download("exclusion-ledger.json", json, "application/json");
  }

  if (entries.length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="exclusion-ledger"
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
      data-slot="exclusion-ledger"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Append-only ledger
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? "Exclusions and transformations"}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>
              {summary.entries} entr{summary.entries === 1 ? "y" : "ies"}
            </span>
            <span>
              {summary.excluded} exclusion{summary.excluded === 1 ? "" : "s"}
            </span>
            <span>
              {summary.transformed + summary.imputed + summary.converted}{" "}
              transformations
            </span>
            {summary.removed > 0 ? (
              <span>{summary.removed} rows removed</span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-1.5 print:hidden">
          <Button
            onClick={handleExportJson}
            size="sm"
            type="button"
            variant="ghost"
          >
            JSON
          </Button>
          <Button
            onClick={handleExportCsv}
            size="sm"
            type="button"
            variant="outline"
          >
            <DownloadIcon />
            Export ledger
          </Button>
        </div>
      </header>

      <div className="grid gap-px bg-border sm:grid-cols-4">
        {[
          { label: "Raw", value: summary.raw, hint: "First recorded count" },
          {
            label: "Removed",
            value: summary.removed,
            hint: `${summary.reasons.length} reason codes`,
          },
          {
            label: "Added or imputed",
            value: summary.added,
            hint: "Rows introduced or filled",
          },
          {
            label: "Included",
            value: summary.included,
            hint: "Final analysis set",
          },
        ].map((item) => (
          <div className="bg-background px-4 py-2.5" key={item.label}>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
              {item.label}
            </p>
            <p className="font-heading font-semibold text-xl tabular-nums tracking-tight">
              {item.value}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">
              {item.hint}
            </p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "flex items-start gap-2 border-y px-4 py-2 text-xs",
          summary.reconciled
            ? "bg-muted/24 text-muted-foreground"
            : "bg-warning/8 text-warning-foreground",
        )}
      >
        {summary.reconciled ? (
          <p>
            Counts reconcile: {summary.raw} − {summary.removed} +{" "}
            {summary.added} = {summary.included}. Every step starts where the
            previous one ended.
          </p>
        ) : (
          <>
            <TriangleAlertIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p>
              The chain does not reconcile. Entry{" "}
              {summary.gap ? summary.gap.index + 1 : 0} starts at{" "}
              {summary.gap?.found ?? 0} rows but the previous entry ended at{" "}
              {summary.gap?.expected ?? 0}. Find the missing step before
              reporting <span className="font-mono">n</span>.
            </p>
          </>
        )}
      </div>

      {summary.reasons.length > 0 ? (
        <div className="border-b px-4 py-3">
          <h4 className="font-medium text-xs">Why rows left</h4>
          <ul className="mt-2 grid gap-1.5">
            {summary.reasons.map((reason) => (
              <li
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                key={reason.code || reason.label}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs">{reason.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {reason.code || "—"}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-foreground/32"
                      style={{
                        width: `${(reason.rows / maxReason) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs tabular-nums">
                  {reason.rows}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
        <div
          aria-label="Ledger filter"
          className="flex flex-wrap items-center gap-0.5 rounded-lg border p-0.5"
          role="group"
        >
          <Button
            aria-pressed={filter === "all"}
            className="rounded-md"
            onClick={() => setFilter("all")}
            size="xs"
            type="button"
            variant={filter === "all" ? "secondary" : "ghost"}
          >
            All
          </Button>
          {KIND_ORDER.map((kind) =>
            summary[
              kind === "exclusion"
                ? "excluded"
                : kind === "transformation"
                  ? "transformed"
                  : kind === "imputation"
                    ? "imputed"
                    : "converted"
            ] > 0 ? (
              <Button
                aria-pressed={filter === kind}
                className="rounded-md"
                key={kind}
                onClick={() => setFilter(kind)}
                size="xs"
                type="button"
                variant={filter === kind ? "secondary" : "ghost"}
              >
                {KIND_LABEL[kind]}
              </Button>
            ) : null,
          )}
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          newest first · export is chronological
        </p>
      </div>

      <Table>
        <caption className="sr-only">
          Exclusion and transformation ledger for{" "}
          {typeof title === "string" ? title : "the dataset"}, newest first.
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-20">When</TableHead>
            <TableHead className="min-w-44">Step</TableHead>
            <TableHead className="hidden md:table-cell">Kind</TableHead>
            <TableHead className="text-end">Rows</TableHead>
            <TableHead className="hidden lg:table-cell">Actor</TableHead>
            <TableHead className="text-end">Undo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((entry) => {
            const delta = entry.rowsAfter - entry.rowsBefore;
            return (
              <TableRow
                className="align-top"
                data-kind={entry.kind}
                key={entry.id}
              >
                <TableCell className="whitespace-nowrap py-2.5 font-mono text-[10px] text-muted-foreground">
                  <time dateTime={entry.at}>{formatWhen(entry.at)}</time>
                </TableCell>
                <TableCell className="min-w-0 py-2.5 whitespace-normal">
                  <p className="font-medium text-sm leading-snug">
                    {entry.action}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs leading-snug">
                    {entry.reason}
                    {entry.linkedRun ? (
                      <span className="font-mono"> · {entry.linkedRun}</span>
                    ) : null}
                  </p>
                  {entry.note ? (
                    <p className="mt-0.5 text-muted-foreground text-[11px] italic leading-snug">
                      {entry.note}
                    </p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-sm border bg-muted/48 px-1 font-mono text-[10px]">
                      {entry.reasonCode || "no code"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground md:hidden">
                      {entry.kind}
                    </span>
                  </p>
                </TableCell>
                <TableCell className="hidden py-2.5 md:table-cell">
                  <span className="inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-[10px]">
                    {KIND_LABEL[entry.kind]}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap py-2.5 text-end font-mono text-xs tabular-nums">
                  {entry.rowsBefore} → {entry.rowsAfter}
                  <span
                    className={cn(
                      "ms-1.5 text-[10px]",
                      delta < 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatDelta(delta)}
                  </span>
                </TableCell>
                <TableCell className="hidden py-2.5 text-xs lg:table-cell">
                  {entry.actor}
                </TableCell>
                <TableCell className="py-2.5 text-end text-[10px]">
                  {entry.reversible ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-[10px] text-muted-foreground">
        <p>
          Append-only. The component renders entries; it never rewrites them.
        </p>
        <p className="font-mono">
          export: CSV · JSON{" "}
          {summary.reconciled ? "· reconciled" : "· unreconciled"}
        </p>
      </footer>
    </section>
  );
}
