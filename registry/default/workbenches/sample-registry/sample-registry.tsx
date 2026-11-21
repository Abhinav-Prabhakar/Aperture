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
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  filterSamples,
  formatDate,
  formatLocation,
  formatShortDate,
  summarize,
  toCsv,
  uniqueStudies,
} from "./adapter";
import { FilterRail } from "./filter-rail";
import { MOCK_AS_OF, MOCK_SAMPLES } from "./mock-data";
import { SampleRecord } from "./sample-record";
import {
  isRegistryStatus,
  isSampleKind,
  isStudy,
  REGISTRY_STATUSES,
  type RegistryFilters,
  type RegistrySample,
  SAMPLE_KINDS,
  STATUS,
  STATUS_LABEL,
  STUDIES,
  type Study,
} from "./types";

const COLUMNS: DataTableColumn<RegistrySample>[] = [
  {
    id: "sample",
    header: "Sample",
    width: "7rem",
    cell: (row) => (
      <span className="inline-grid gap-0.5">
        <span className="font-mono text-xs">{row.id}</span>
        <span className="text-[10px] text-muted-foreground leading-none md:hidden">
          {row.kind}
        </span>
      </span>
    ),
    sortValue: (row) => row.id,
  },
  {
    id: "study",
    header: "Study",
    width: "7rem",
    className: "hidden lg:table-cell print:table-cell",
    cell: (row) => <span className="text-xs">{row.study}</span>,
    sortValue: (row) => row.study,
  },
  {
    id: "kind",
    header: "Type",
    width: "5rem",
    className: "hidden md:table-cell print:table-cell",
    cell: (row) => <span className="text-xs">{row.kind}</span>,
    sortValue: (row) => row.kind,
  },
  {
    id: "status",
    header: "Status",
    className: "hidden sm:table-cell print:table-cell",
    cell: (row) => (
      <StatusBadge
        label={STATUS_LABEL[row.status]}
        size="sm"
        status={STATUS[row.status]}
      />
    ),
    sortValue: (row) => STATUS_LABEL[row.status],
  },
  {
    id: "location",
    header: "Location",
    width: "9rem",
    className: "hidden xl:table-cell print:table-cell",
    cell: (row) => (
      <span className="font-mono text-[11px] text-muted-foreground">
        {formatLocation(row.location)}
      </span>
    ),
    sortValue: (row) => formatLocation(row.location),
  },
  {
    id: "volume",
    header: "Volume",
    unit: "µL",
    align: "end",
    numeric: true,
    width: "5rem",
    cell: (row) =>
      row.volumeUl === null ? (
        <span className="text-muted-foreground" title="Volume was not recorded">
          —
        </span>
      ) : (
        <span className="font-mono text-xs tabular-nums">
          {row.volumeUl.toLocaleString("en-GB")}
        </span>
      ),
    sortValue: (row) => row.volumeUl,
  },
  {
    id: "received",
    header: "Received",
    align: "end",
    width: "6rem",
    cell: (row) => (
      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
        {formatShortDate(row.receivedAt)}
      </span>
    ),
    sortValue: (row) => row.receivedAt,
  },
];

export type SampleRegistryProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  samples?: readonly RegistrySample[];
  headingLevel?: "h1" | "h2";
  title?: string;
  subtitle?: string;
  /** ISO 8601 timestamp for the last registry sync. */
  asOf?: string;
  loading?: boolean;
  error?: string | null;
  denied?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  /** Open a linked run in the run report. */
  onRunOpen?: (runId: string) => void;
  /** Keep filters, sort, and the open sample in the address bar. */
  syncToUrl?: boolean;
};

export function SampleRegistry({
  samples = MOCK_SAMPLES,
  headingLevel = "h1",
  title = "Sample registry",
  subtitle = "LAB-03 · Bay 3",
  asOf = MOCK_AS_OF,
  loading = false,
  error = null,
  denied = false,
  offline = false,
  onRetry,
  onRunOpen,
  syncToUrl = false,
  className,
  ...props
}: SampleRegistryProps): React.ReactElement {
  const Heading = headingLevel;
  const [filters, setFilters] = React.useState<RegistryFilters>({
    query: "",
    study: "all",
    kind: "all",
    status: "all",
  });
  const [activeId, setActiveId] = React.useState<string | null>(
    samples[0]?.id ?? null,
  );
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
    const study = params.get("study");
    const kind = params.get("kind");
    const status = params.get("status");
    const sample = params.get("sample");

    setFilters((current) => ({
      query: query ?? current.query,
      study: isStudy(study) ? study : current.study,
      kind: isSampleKind(kind) ? kind : current.kind,
      status: isRegistryStatus(status) ? status : current.status,
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
    set("study", filters.study === "all" ? "" : filters.study);
    set("kind", filters.kind === "all" ? "" : filters.kind);
    set("status", filters.status === "all" ? "" : filters.status);
    set("sample", activeId ?? "");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [syncToUrl, urlReady, filters, activeId]);

  const statusCounts = React.useMemo(() => {
    const counts = { all: samples.length } as Record<
      "all" | (typeof REGISTRY_STATUSES)[number],
      number
    >;
    for (const status of REGISTRY_STATUSES) {
      counts[status] = 0;
    }
    for (const sample of samples) {
      counts[sample.status] += 1;
    }
    return counts;
  }, [samples]);

  const studyCounts = React.useMemo(() => {
    const counts = { all: samples.length } as Record<"all" | Study, number>;
    for (const study of STUDIES) {
      counts[study] = 0;
    }
    for (const sample of samples) {
      counts[sample.study] += 1;
    }
    return counts;
  }, [samples]);

  const kindCounts = React.useMemo(() => {
    const counts = { all: samples.length } as Record<
      "all" | (typeof SAMPLE_KINDS)[number],
      number
    >;
    for (const kind of SAMPLE_KINDS) {
      counts[kind] = 0;
    }
    for (const sample of samples) {
      counts[sample.kind] += 1;
    }
    return counts;
  }, [samples]);

  const activeFilterCount =
    (filters.query.trim() ? 1 : 0) +
    (filters.study !== "all" ? 1 : 0) +
    (filters.kind !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0);

  const studyTotal = React.useMemo(() => uniqueStudies(samples), [samples]);

  function updateFilters(patch: Partial<RegistryFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function resetFilters() {
    setFilters({ query: "", study: "all", kind: "all", status: "all" });
  }

  function handleExport() {
    if (filtered.length === 0) {
      return;
    }
    const blob = new Blob([toCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-registry.csv";
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
      data-slot="sample-registry"
      {...props}
    >
      <div className="hidden print:block print:pb-2">
        <p className="font-heading font-semibold text-lg">{title}</p>
        <p className="text-muted-foreground text-xs">
          {filtered.length} of {samples.length} samples · {subtitle} ·{" "}
          {formatDate(asOf)} · UTC
        </p>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 print:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Registry · {subtitle}
          </p>
          <Heading className="font-heading font-semibold text-xl tracking-tight">
            {title}
          </Heading>
          <p className="text-muted-foreground text-xs">
            {samples.length} samples across {studyTotal} studies · updated{" "}
            {formatDate(asOf)}
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
            Export CSV
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
          className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs print:hidden"
          role="status"
        >
          <WifiOffIcon aria-hidden="true" className="size-3.5" />
          <p>
            <span className="font-medium">Offline.</span> Showing the cached
            registry. Filters and export stay local.
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
            "The registry service did not respond. Nothing was removed from storage."
          }
          title="Could not load the registry"
        />
      ) : null}

      {state === "denied" ? (
        <StatePanel
          icon={<LockIcon aria-hidden="true" className="size-5" />}
          message="Registry records are restricted to the lab’s members. Ask a custodian for access."
          title="You don’t have access to this registry"
        />
      ) : null}

      {state === "ready" ? (
        <>
          <StatGrid className="m-3 sm:m-4 print:mx-0" columns={4}>
            <Stat
              hint={`of ${samples.length} in the registry`}
              label="Samples"
              value={summary.count}
            />
            <Stat
              hint={
                summary.missingVolume === 0
                  ? "All volumes recorded"
                  : `${summary.missingVolume} missing volume${
                      summary.missingVolume === 1 ? "" : "s"
                    }`
              }
              label="Stored"
              value={summary.stored}
            />
            <Stat
              hint="checked out to runs"
              label="In use"
              value={summary.inUse}
            />
            <Stat
              hint="excluded from runs"
              label="Quarantined"
              value={summary.quarantined}
            />
          </StatGrid>

          <div className="grid border-t lg:grid-cols-[13rem_minmax(0,1fr)_21rem] print:block print:border-t-0">
            <FilterRail
              activeCount={activeFilterCount}
              filters={filters}
              kindCounts={kindCounts}
              onChange={updateFilters}
              onReset={resetFilters}
              statusCounts={statusCounts}
              studyCounts={studyCounts}
            />

            <div className="min-w-0">
              <DataTable
                activeRowId={activeId ?? undefined}
                className="rounded-none border-0"
                columns={COLUMNS}
                defaultSort={{ columnId: "received", direction: "desc" }}
                emptyLabel={
                  <div className="grid justify-items-center gap-2 py-4">
                    <p>
                      {samples.length === 0
                        ? "No samples in the registry."
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
                label="Registry samples"
                onRowActivate={(id) => setActiveId(id)}
                rows={filtered}
                title="Samples"
              />
            </div>

            <aside
              aria-label="Sample record"
              className="border-t p-4 lg:border-s lg:border-t-0 print:border-t print:pt-4"
            >
              <SampleRecord onRunOpen={onRunOpen} sample={active} />
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
      <span className="sr-only">Loading sample registry…</span>
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="bg-background p-4" key={index}>
            <div className="h-3 w-20 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-3 h-6 w-24 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="h-72 rounded-xl border bg-muted/32" />
        <div className="grid gap-3">
          <div className="h-10 rounded-xl border bg-muted/32" />
          <div className="h-72 rounded-xl border bg-muted/32" />
        </div>
      </div>
    </div>
  );
}
