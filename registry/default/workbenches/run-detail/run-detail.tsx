"use client";

import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileJsonIcon,
  FileQuestionIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LockIcon,
  PrinterIcon,
  RefreshCwIcon,
  WifiOffIcon,
} from "lucide-react";
import * as React from "react";
import { LogViewer } from "@/registry/default/instruments/log-viewer";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { Timeline } from "@/registry/default/instruments/timeline";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  artifactBytes,
  formatBytes,
  formatDate,
  formatDuration,
  formatRunClock,
  formatTime,
  metricsInRange,
} from "./adapter";
import { MOCK_RUN } from "./mock-data";
import {
  ARTIFACT_KIND_LABEL,
  type ArtifactKind,
  METRIC_STATUS,
  METRIC_STATUS_LABEL,
  RUN_STATUS,
  RUN_STATUS_LABEL,
  type RunArtifact,
  type RunRecord,
} from "./types";

const ARTIFACT_ICON: Record<
  ArtifactKind,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  csv: FileSpreadsheetIcon,
  pdf: FileTextIcon,
  svg: FileImageIcon,
  json: FileJsonIcon,
  log: FileTextIcon,
  archive: FileArchiveIcon,
};

export type RunDetailProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  run?: RunRecord | null;
  headingLevel?: "h1" | "h2";
  loading?: boolean;
  error?: string | null;
  denied?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  /** Continue to the samples that belong to this run. */
  onOpenData?: (run: RunRecord) => void;
  /** Download or open an artifact. Omit to show metadata only. */
  onArtifactOpen?: (artifact: RunArtifact) => void;
  /** Keep the open artifact in the address bar. */
  syncToUrl?: boolean;
};

export function RunDetail({
  run = MOCK_RUN,
  headingLevel = "h1",
  loading = false,
  error = null,
  denied = false,
  offline = false,
  onRetry,
  onOpenData,
  onArtifactOpen,
  syncToUrl = false,
  className,
  ...props
}: RunDetailProps): React.ReactElement {
  const Heading = headingLevel;
  const detailId = React.useId();
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<
    string | null
  >(run?.artifacts[0]?.id ?? null);
  const [urlReady, setUrlReady] = React.useState(!syncToUrl);

  const runRef = React.useRef(run);
  runRef.current = run;

  React.useEffect(() => {
    if (!run) {
      return;
    }
    if (!run.artifacts.some((artifact) => artifact.id === selectedArtifactId)) {
      setSelectedArtifactId(run.artifacts[0]?.id ?? null);
    }
  }, [run, selectedArtifactId]);

  React.useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const artifact = new URLSearchParams(window.location.search).get(
      "artifact",
    );
    if (
      artifact &&
      runRef.current?.artifacts.some((entry) => entry.id === artifact)
    ) {
      setSelectedArtifactId(artifact);
    }
    setUrlReady(true);
  }, [syncToUrl]);

  React.useEffect(() => {
    if (!syncToUrl || !urlReady) {
      return;
    }
    const url = new URL(window.location.href);
    if (selectedArtifactId) {
      url.searchParams.set("artifact", selectedArtifactId);
    } else {
      url.searchParams.delete("artifact");
    }
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [syncToUrl, urlReady, selectedArtifactId]);

  const state = loading
    ? "loading"
    : error
      ? "error"
      : denied
        ? "denied"
        : run
          ? "ready"
          : "missing";

  const selectedArtifact =
    run?.artifacts.find((artifact) => artifact.id === selectedArtifactId) ??
    null;
  const inRange = run ? metricsInRange(run.metrics) : 0;
  const warnings = run
    ? run.metrics.filter((metric) => metric.status !== "passed").length
    : 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background text-sm",
        "print:overflow-visible print:rounded-none print:border-0",
        className,
      )}
      data-slot="run-detail"
      {...props}
    >
      {run ? (
        <div className="hidden print:block print:pb-2">
          <p className="font-heading font-semibold text-lg">{run.title}</p>
          <p className="text-muted-foreground text-xs">
            {run.id} · {formatDate(run.startedAt)} · {run.operator} · {run.lab}
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
            "The run service did not respond. The last known state is preserved."
          }
          title="Could not load this run"
        />
      ) : null}

      {state === "denied" ? (
        <StatePanel
          icon={<LockIcon aria-hidden="true" className="size-5" />}
          message="Run records are restricted to the run’s viewers. Ask the run owner for access."
          title="You don’t have access to this run"
        />
      ) : null}

      {state === "missing" ? (
        <StatePanel
          icon={<FileQuestionIcon aria-hidden="true" className="size-5" />}
          message="This run may have been archived or removed. The run ID is kept in every export and citation."
          title="Run not found"
        />
      ) : null}

      {state === "ready" && run ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 print:hidden">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                Run · {run.id}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <Heading className="font-heading font-semibold text-xl tracking-tight">
                  {run.title}
                </Heading>
                <StatusBadge
                  label={RUN_STATUS_LABEL[run.status]}
                  size="sm"
                  status={RUN_STATUS[run.status]}
                />
              </div>
              <p className="text-muted-foreground text-xs">{run.subtitle}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {formatDate(run.startedAt)} · {formatRunClock(run)} ·{" "}
                {run.operator} · {run.lab}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenData ? (
                <Button
                  onClick={() => onOpenData(run)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Open samples
                  <ArrowUpRightIcon />
                </Button>
              ) : null}
              <Button
                onClick={() => window.print()}
                size="sm"
                type="button"
                variant="outline"
              >
                <PrinterIcon />
                Print report
              </Button>
            </div>
          </header>

          {offline ? (
            <div
              className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs print:hidden"
              role="status"
            >
              <WifiOffIcon aria-hidden="true" className="size-3.5" />
              <p>
                <span className="font-medium">Offline.</span> Showing the cached
                report. Artifacts are not available until the connection
                returns.
              </p>
            </div>
          ) : null}

          <StatGrid className="m-3 sm:m-4" columns={4}>
            <Stat
              hint={formatRunClock(run)}
              label="Duration"
              value={formatDuration(run)}
            />
            <Stat
              hint={`${run.samples.passed} passed · ${run.samples.flagged} flagged`}
              label="Samples"
              value={run.samples.total}
            />
            <Stat
              hint={
                warnings === 0
                  ? "All metrics within range"
                  : `${warnings} ${warnings === 1 ? "needs" : "need"} review`
              }
              label="Metrics in range"
              value={`${inRange} of ${run.metrics.length}`}
            />
            <Stat
              hint={`${formatBytes(artifactBytes(run))} total`}
              label="Artifacts"
              value={run.artifacts.length}
            />
          </StatGrid>

          <div className="grid border-t xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 xl:border-e">
              <section aria-labelledby="run-parameters-heading">
                <SectionHeader
                  aside={`${run.parameters.length} parameters`}
                  id="run-parameters-heading"
                  title="Parameters"
                />
                <dl className="grid gap-x-6 gap-y-3 px-4 py-3 sm:grid-cols-2">
                  {run.parameters.map((parameter) => (
                    <div className="min-w-0" key={parameter.id}>
                      <dt className="text-[10px] text-muted-foreground">
                        {parameter.label}
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs">
                        {parameter.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section
                aria-labelledby="run-metrics-heading"
                className="border-t"
              >
                <SectionHeader
                  aside={`${inRange} of ${run.metrics.length} within range`}
                  id="run-metrics-heading"
                  title="Metrics"
                />
                <div className="overflow-x-auto border-t">
                  <table className="w-full text-xs">
                    <caption className="sr-only">
                      QC metrics for {run.id}
                    </caption>
                    <thead className="border-b bg-muted/32">
                      <tr>
                        <th
                          className="px-4 py-2 text-start font-medium"
                          scope="col"
                        >
                          Metric
                        </th>
                        <th
                          className="px-4 py-2 text-end font-medium"
                          scope="col"
                        >
                          Observed
                        </th>
                        <th
                          className="hidden px-4 py-2 text-end font-medium sm:table-cell"
                          scope="col"
                        >
                          Expected
                        </th>
                        <th
                          className="px-4 py-2 text-start font-medium"
                          scope="col"
                        >
                          QC
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {run.metrics.map((metric) => (
                        <tr key={metric.id}>
                          <th
                            className="px-4 py-2 text-start font-normal"
                            scope="row"
                          >
                            <span className="font-medium">{metric.label}</span>
                            {metric.hint ? (
                              <span className="mt-0.5 hidden text-[10px] text-muted-foreground leading-relaxed sm:block">
                                {metric.hint}
                              </span>
                            ) : null}
                          </th>
                          <td className="px-4 py-2 text-end tabular-nums">
                            <ScientificNumber
                              precision={metric.precision}
                              unit={metric.unit}
                              value={metric.value}
                            />
                          </td>
                          <td className="hidden px-4 py-2 text-end font-mono text-[11px] text-muted-foreground sm:table-cell">
                            {metric.expected}
                          </td>
                          <td className="px-4 py-2">
                            <StatusBadge
                              label={METRIC_STATUS_LABEL[metric.status]}
                              size="sm"
                              status={METRIC_STATUS[metric.status]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="border-t print:hidden">
                <LogViewer
                  className="rounded-none border-0"
                  entries={run.log}
                  follow={false}
                  height="20rem"
                  title="Run log"
                />
              </div>

              <section
                aria-labelledby="run-environment-heading"
                className="border-t"
              >
                <SectionHeader
                  id="run-environment-heading"
                  title="Environment"
                />
                <dl className="grid gap-x-6 gap-y-2 border-t px-4 py-3 text-[11px] sm:grid-cols-2">
                  <EnvRow label="Instrument" value={run.instrument} />
                  <EnvRow label="Serial" mono value={run.instrumentSerial} />
                  <EnvRow label="Firmware" mono value={run.firmware} />
                  <EnvRow label="QC pipeline" mono value={run.pipeline} />
                  <EnvRow label="Operator" value={run.operator} />
                  <EnvRow label="Lab" value={run.lab} />
                </dl>
              </section>
            </div>

            <aside className="min-w-0">
              <section aria-labelledby="run-provenance-heading">
                <SectionHeader
                  aside={`${run.events.length} events`}
                  id="run-provenance-heading"
                  title="Provenance"
                />
                <div className="border-t px-4 py-3">
                  <Timeline
                    items={run.events.map((event) => ({
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      time: event.time,
                      dateTime: event.dateTime,
                      status: event.status,
                      meta: event.actor,
                    }))}
                    label="Run provenance"
                  />
                </div>
              </section>

              <section
                aria-labelledby="run-artifacts-heading"
                className="border-t"
              >
                <SectionHeader
                  aside={`${run.artifacts.length} · ${formatBytes(
                    artifactBytes(run),
                  )}`}
                  id="run-artifacts-heading"
                  title="Artifacts"
                />
                <ul className="border-t">
                  {run.artifacts.map((artifact) => (
                    <ArtifactRow
                      artifact={artifact}
                      detailId={detailId}
                      key={artifact.id}
                      onSelect={() => setSelectedArtifactId(artifact.id)}
                      selected={artifact.id === selectedArtifactId}
                    />
                  ))}
                </ul>
                {selectedArtifact ? (
                  <ArtifactDetail
                    artifact={selectedArtifact}
                    id={detailId}
                    onOpen={onArtifactOpen}
                  />
                ) : null}
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}

function SectionHeader({
  id,
  title,
  aside,
}: {
  id: string;
  title: string;
  aside?: string;
}): React.ReactElement {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
      <h2 className="font-medium text-sm" id={id}>
        {title}
      </h2>
      {aside ? (
        <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {aside}
        </p>
      ) : null}
    </header>
  );
}

function ArtifactRow({
  artifact,
  selected,
  onSelect,
  detailId,
}: {
  artifact: RunArtifact;
  selected: boolean;
  onSelect: () => void;
  detailId: string;
}): React.ReactElement {
  const Icon = ARTIFACT_ICON[artifact.kind] ?? FileIcon;

  return (
    <li className="border-b last:border-b-0">
      <button
        aria-controls={selected ? detailId : undefined}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start gap-2 px-4 py-2.5 text-start outline-none transition-colors",
          "hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          selected && "bg-accent/32",
        )}
        onClick={onSelect}
        type="button"
      >
        <Icon
          aria-hidden={true}
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px]">
            {artifact.name}
          </span>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {ARTIFACT_KIND_LABEL[artifact.kind]} ·{" "}
            {formatBytes(artifact.sizeBytes)}
          </span>
        </span>
      </button>
    </li>
  );
}

function ArtifactDetail({
  artifact,
  id,
  onOpen,
}: {
  artifact: RunArtifact;
  id: string;
  onOpen?: (artifact: RunArtifact) => void;
}): React.ReactElement {
  return (
    <div
      className="border-t bg-muted/24 px-4 py-3"
      data-slot="artifact-detail"
      id={id}
    >
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {artifact.description}
      </p>
      {onOpen ? (
        <Button
          className="mt-2"
          onClick={() => onOpen(artifact)}
          size="xs"
          type="button"
          variant="outline"
        >
          <DownloadIcon />
          Download
        </Button>
      ) : null}
      <dl className="mt-2 grid gap-1 text-[10px]">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">SHA-256</dt>
          <dd
            className="break-all text-end font-mono"
            title={artifact.checksum}
          >
            {artifact.checksum}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Created</dt>
          <dd className="font-mono">
            {formatDate(artifact.createdAt)} · {formatTime(artifact.createdAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Kind</dt>
          <dd className="font-mono">
            {ARTIFACT_KIND_LABEL[artifact.kind]} ·{" "}
            {formatBytes(artifact.sizeBytes)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function EnvRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-end", mono && "font-mono")}>{value}</dd>
    </div>
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
      <span className="sr-only">Loading run report…</span>
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="bg-background p-4" key={index}>
            <div className="h-3 w-20 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-3 h-6 w-24 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-3">
          <div className="h-48 rounded-xl border bg-muted/32" />
          <div className="h-64 rounded-xl border bg-muted/32" />
          <div className="h-40 rounded-xl border bg-muted/32" />
        </div>
        <div className="h-96 rounded-xl border bg-muted/32" />
      </div>
    </div>
  );
}
