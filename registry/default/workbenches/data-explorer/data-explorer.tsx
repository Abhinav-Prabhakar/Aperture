"use client";

import {
  AlertTriangleIcon,
  DownloadIcon,
  LockIcon,
  PrinterIcon,
  RefreshCwIcon,
  WifiOffIcon,
} from "lucide-react";
import * as React from "react";
import {
  DataTable,
  type DataTableColumn,
} from "@/registry/default/instruments/data-table";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import {
  type Status,
  StatusBadge,
} from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { filterSamples, formatDateRange, summarize, toCsv } from "./adapter";
import { FilterRail } from "./filter-rail";
import { MOCK_SAMPLES } from "./mock-data";
import { SampleInspector } from "./sample-inspector";
import {
  type ExplorerFilters,
  type ExplorerSample,
  isSampleStatus,
  isTreatment,
  type SampleStatus,
  STATUS_LABEL,
} from "./types";

const STATUS: Record<SampleStatus, Status> = {
  passed: "success",
  warning: "warning",
  failed: "error",
};

const COLUMNS: DataTableColumn<ExplorerSample>[] = [
  {
    id: "sample",
    header: "Sample",
    width: "7rem",
    cell: (row) => <span className="font-mono text-xs">{row.id}</span>,
    sortValue: (row) => row.id,
  },
  {
    id: "well",
    header: "Well",
    width: "4rem",
    className: "hidden sm:table-cell",
    cell: (row) => <span className="font-mono text-xs">{row.well}</span>,
    sortValue: (row) => row.well,
  },
  {
    id: "treatment",
    header: "Treatment",
    width: "8rem",
    className: "hidden md:table-cell",
    cell: (row) => row.treatment,
    sortValue: (row) => row.treatment,
  },
  {
    id: "concentration",
    header: "Concentration",
    unit: "µg/mL",
    align: "end",
    numeric: true,
    cell: (row) => (
      <span className="inline-grid justify-items-end gap-0.5">
        {row.concentration === null ? (
          <span
            className="text-muted-foreground"
            title={row.note ?? "Not measured"}
          >
            —
          </span>
        ) : (
          <ScientificNumber
            className="text-xs"
            precision={1}
            uncertainty={row.uncertainty ?? undefined}
            value={row.concentration}
          />
        )}
        <span className="font-sans text-[10px] text-muted-foreground leading-none sm:hidden">
          {STATUS_LABEL[row.status]}
        </span>
      </span>
    ),
    sortValue: (row) => row.concentration,
  },
  {
    id: "a600",
    header: "A₆₀₀",
    unit: "AU",
    align: "end",
    numeric: true,
    className: "hidden lg:table-cell",
    cell: (row) => (
      <ScientificNumber className="text-xs" precision={2} value={row.a600} />
    ),
    sortValue: (row) => row.a600,
  },
  {
    id: "status",
    header: "QC",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <StatusBadge
        label={STATUS_LABEL[row.status]}
        size="sm"
        status={STATUS[row.status]}
      />
    ),
  },
];

export type DataExplorerProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  samples?: readonly ExplorerSample[];
  /** Accessible page heading level when the workbench is embedded. */
  headingLevel?: "h1" | "h2";
  title?: string;
  subtitle?: string;
  runId?: string;
  loading?: boolean;
  error?: string | null;
  denied?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  /** Keep filters and the open sample in the address bar. */
  syncToUrl?: boolean;
};

export function DataExplorer({
  samples = MOCK_SAMPLES,
  headingLevel = "h1",
  title = "Absorbance screen",
  subtitle = "Plate 12 · BMG FLUOstar",
  runId = "RUN-2026-1120",
  loading = false,
  error = null,
  denied = false,
  offline = false,
  onRetry,
  syncToUrl = false,
  className,
  ...props
}: DataExplorerProps): React.ReactElement {
  const Heading = headingLevel;
  const [filters, setFilters] = React.useState<ExplorerFilters>({
    query: "",
    status: "all",
    treatment: "all",
  });
  const [activeId, setActiveId] = React.useState<string | null>(
    samples[0]?.id ?? null,
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [urlReady, setUrlReady] = React.useState(!syncToUrl);

  const samplesRef = React.useRef(samples);
  samplesRef.current = samples;

  const filtered = React.useMemo(
    () => filterSamples(samples, filters),
    [samples, filters],
  );
  const summary = React.useMemo(() => summarize(filtered), [filtered]);
  const active = samples.find((sample) => sample.id === activeId) ?? null;

  React.useEffect(() => {
    if (!filtered.some((sample) => sample.id === activeId)) {
      setActiveId(filtered[0]?.id ?? null);
    }
  }, [filtered, activeId]);

  React.useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    const status = params.get("status");
    const treatment = params.get("treatment");
    const sample = params.get("sample");

    setFilters((current) => ({
      query: query ?? current.query,
      status: isSampleStatus(status) ? status : current.status,
      treatment: isTreatment(treatment) ? treatment : current.treatment,
    }));
    if (sample && samplesRef.current.some((entry) => entry.id === sample)) {
      setActiveId(sample);
    }
    setUrlReady(true);
  }, [syncToUrl]);

  React.useEffect(() => {
    if (!syncToUrl || !urlReady) {
      return;
    }
    const url = new URL(window.location.href);
    const set = (key: string, value: string) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    };
    set("q", filters.query.trim());
    set("status", filters.status === "all" ? "" : filters.status);
    set("treatment", filters.treatment === "all" ? "" : filters.treatment);
    set("sample", activeId ?? "");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [syncToUrl, urlReady, filters, activeId]);

  const statusCounts = React.useMemo(() => {
    const counts: Record<"all" | SampleStatus, number> = {
      all: samples.length,
      passed: 0,
      warning: 0,
      failed: 0,
    };
    for (const sample of samples) {
      counts[sample.status] += 1;
    }
    return counts;
  }, [samples]);

  const treatmentCounts = React.useMemo(() => {
    const counts: Record<"all" | ExplorerSample["treatment"], number> = {
      all: samples.length,
      Control: 0,
      "Low dose": 0,
      "High dose": 0,
    };
    for (const sample of samples) {
      counts[sample.treatment] += 1;
    }
    return counts;
  }, [samples]);

  const activeFilterCount =
    (filters.query.trim() ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.treatment !== "all" ? 1 : 0);

  const operators = Array.from(
    new Set(samples.map((sample) => sample.operator)),
  ).join(", ");

  function updateFilters(patch: Partial<ExplorerFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function resetFilters() {
    setFilters({ query: "", status: "all", treatment: "all" });
  }

  function exportRows() {
    return selected.size > 0
      ? filtered.filter((sample) => selected.has(sample.id))
      : filtered;
  }

  function handleExport() {
    const rows = exportRows();
    if (rows.length === 0) {
      return;
    }
    const blob = new Blob([toCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plate-12-samples.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const state = loading
    ? "loading"
    : error
      ? "error"
      : denied
        ? "denied"
        : "ready";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background text-sm",
        "print:overflow-visible print:rounded-none print:border-0",
        className,
      )}
      data-slot="data-explorer"
      {...props}
    >
      <div className="hidden print:block print:pb-2">
        <p className="font-heading font-semibold text-lg">{title}</p>
        <p className="text-muted-foreground text-xs">
          {runId} · {subtitle} ·{" "}
          {formatDateRange(samples.map((s) => s.collectedAt))}
        </p>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 print:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            {runId}
          </p>
          <Heading className="font-heading font-semibold text-xl tracking-tight">
            {title}
          </Heading>
          <p className="text-muted-foreground text-xs">
            {subtitle}
            {samples.length > 0
              ? ` · ${formatDateRange(samples.map((s) => s.collectedAt))} · ${operators}`
              : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={state !== "ready" || filtered.length === 0}
            onClick={handleExport}
            size="sm"
            type="button"
            variant="outline"
          >
            <DownloadIcon />
            Export{selected.size > 0 ? ` (${selected.size})` : " CSV"}
          </Button>
          <Button
            disabled={state !== "ready"}
            onClick={() => window.print()}
            size="sm"
            type="button"
            variant="outline"
          >
            <PrinterIcon />
            Print
          </Button>
        </div>
      </header>

      {offline && state === "ready" ? (
        <div
          className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs"
          role="status"
        >
          <WifiOffIcon aria-hidden="true" className="size-3.5" />
          <p>
            <span className="font-medium">Offline.</span> Showing the cached
            run. Filters and export stay local.
          </p>
        </div>
      ) : null}

      {state === "loading" ? <LoadingState /> : null}

      {state === "error" ? (
        <StatePanel
          action={
            <Button
              onClick={
                onRetry ??
                (() => {
                  window.location.reload();
                })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <RefreshCwIcon />
              Retry
            </Button>
          }
          icon={<AlertTriangleIcon aria-hidden="true" className="size-5" />}
          message={
            error ??
            "The run service did not respond. Nothing in the run was lost."
          }
          title="Could not load samples"
        />
      ) : null}

      {state === "denied" ? (
        <StatePanel
          icon={<LockIcon aria-hidden="true" className="size-5" />}
          message="Sample records are restricted to the run’s viewers. Ask the run owner for access."
          title="You don’t have access to this run"
        />
      ) : null}

      {state === "ready" ? (
        <>
          <StatGrid className="m-3 sm:m-4 print:mx-0" columns={4}>
            <Stat
              hint={`of ${samples.length} in the run`}
              label="Samples"
              value={summary.count}
            />
            <Stat
              hint={
                summary.count === 0
                  ? "No samples in view"
                  : `${Math.round((summary.passed / summary.count) * 100)}% of the view`
              }
              label="Passed"
              value={summary.passed}
            />
            <Stat
              hint={
                summary.median === null
                  ? "No measured concentrations"
                  : `n = ${summary.count - summary.missing}, missing excluded`
              }
              label="Median concentration"
              unit="µg/mL"
              value={
                summary.median === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <ScientificNumber precision={1} value={summary.median} />
                )
              }
            />
            <Stat
              hint={`${summary.missing} missing concentration`}
              label="Flagged"
              value={summary.flagged}
            />
          </StatGrid>

          <div className="grid border-t lg:grid-cols-[13rem_minmax(0,1fr)_19rem] print:block print:border-t-0">
            <FilterRail
              activeCount={activeFilterCount}
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              statusCounts={statusCounts}
              treatmentCounts={treatmentCounts}
            />

            <div className="min-w-0">
              <DataTable
                activeRowId={activeId ?? undefined}
                className="rounded-none border-0"
                columns={COLUMNS}
                defaultSort={{ columnId: "concentration", direction: "desc" }}
                emptyLabel={
                  <div className="grid justify-items-center gap-2 py-4">
                    <p>
                      {samples.length === 0
                        ? "No samples in this run."
                        : "No samples match these filters."}
                    </p>
                    {samples.length > 0 ? (
                      <Button
                        onClick={resetFilters}
                        size="xs"
                        type="button"
                        variant="outline"
                      >
                        Reset filters
                      </Button>
                    ) : null}
                  </div>
                }
                getRowId={(sample) => sample.id}
                getRowLabel={(sample) => sample.id}
                label="Samples"
                onRowActivate={(id) => setActiveId(id)}
                onSelectionChange={setSelected}
                rows={filtered}
                selectable
                selectedIds={selected}
                title="Samples"
              />
            </div>

            <aside
              aria-label="Sample inspector"
              className="border-t p-4 lg:border-s lg:border-t-0 print:border-t print:pt-4"
            >
              <SampleInspector sample={active} />
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}

function StatePanel({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      className="grid justify-items-center gap-2 px-6 py-16 text-center"
      role="alert"
    >
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="font-medium">{title}</h2>
      <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
        {message}
      </p>
      {action}
    </div>
  );
}

function LoadingState(): React.ReactElement {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-3 p-4">
      <span className="sr-only">Loading samples…</span>
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="bg-background p-4" key={index}>
            <div className="h-3 w-20 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-3 h-6 w-24 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="h-64 rounded-xl border bg-muted/32" />
        <div className="overflow-hidden rounded-xl border">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <div className="border-b px-3 py-3.5" key={index}>
              <div className="h-3 w-full max-w-96 rounded bg-muted motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
