"use client";

import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CheckIcon,
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
import {
  type LogEntry,
  LogViewer,
} from "@/registry/default/instruments/log-viewer";
import { Sparkline } from "@/registry/default/instruments/sparkline";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { Timeline } from "@/registry/default/instruments/timeline";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  formatDate,
  formatDay,
  formatEta,
  formatShortDay,
  formatTime,
  summarizeLab,
} from "./adapter";
import {
  MOCK_ACTIVITY,
  MOCK_ALERTS,
  MOCK_AS_OF,
  MOCK_INSTRUMENTS,
  MOCK_SAMPLES,
  MOCK_SCHEDULE,
} from "./mock-data";
import {
  ALERT_LABEL,
  ALERT_STATUS,
  IN_FLIGHT_LABEL,
  IN_FLIGHT_STATUS,
  INSTRUMENT_LABEL,
  INSTRUMENT_STATUS,
  type InFlightSample,
  type LabAlert,
  type LabInstrument,
  type ScheduleEntry,
} from "./types";

const SAMPLE_COLUMNS: DataTableColumn<InFlightSample>[] = [
  {
    id: "sample",
    header: "Sample",
    width: "7rem",
    cell: (row) => (
      <span className="grid">
        <span className="font-mono text-xs">{row.id}</span>
        <span className="text-[10px] text-muted-foreground">{row.study}</span>
      </span>
    ),
    sortValue: (row) => row.id,
  },
  {
    id: "stage",
    header: "Stage",
    cell: (row) => row.stage,
    sortValue: (row) => row.stage,
  },
  {
    id: "instrument",
    header: "Instrument",
    className: "hidden md:table-cell",
    cell: (row) => row.instrument,
    sortValue: (row) => row.instrument,
  },
  {
    id: "operator",
    header: "Operator",
    className: "hidden lg:table-cell",
    cell: (row) => row.operator,
    sortValue: (row) => row.operator,
  },
  {
    id: "eta",
    header: "ETA",
    align: "end",
    numeric: true,
    cell: (row) =>
      row.etaMinutes === null ? (
        <span className="text-muted-foreground">{formatEta(row)}</span>
      ) : (
        `${row.etaMinutes} min`
      ),
    sortValue: (row) => row.etaMinutes ?? Number.POSITIVE_INFINITY,
  },
  {
    id: "status",
    header: "Status",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <StatusBadge
        label={IN_FLIGHT_LABEL[row.status]}
        size="sm"
        status={IN_FLIGHT_STATUS[row.status]}
      />
    ),
  },
];

function firstSampleId(samples: readonly InFlightSample[]): string | null {
  let first: InFlightSample | null = null;
  for (const sample of samples) {
    const eta = sample.etaMinutes ?? Number.POSITIVE_INFINITY;
    const firstEta = first?.etaMinutes ?? Number.POSITIVE_INFINITY;
    if (!first || eta < firstEta) {
      first = sample;
    }
  }
  return first?.id ?? null;
}

export type LabDashboardProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  instruments?: readonly LabInstrument[];
  samples?: readonly InFlightSample[];
  alerts?: readonly LabAlert[];
  schedule?: readonly ScheduleEntry[];
  activity?: readonly LogEntry[];
  /** ISO instant used by the header, schedule, and ETAs. */
  asOf?: string;
  labId?: string;
  location?: string;
  title?: string;
  headingLevel?: "h1" | "h2";
  loading?: boolean;
  error?: string | null;
  denied?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  /** Open a sample elsewhere, for example in the Data Explorer. */
  onSampleOpen?: (sample: InFlightSample) => void;
  /** Keep the open instrument and active sample in the address bar. */
  syncToUrl?: boolean;
};

export function LabDashboard({
  instruments = MOCK_INSTRUMENTS,
  samples = MOCK_SAMPLES,
  alerts = MOCK_ALERTS,
  schedule = MOCK_SCHEDULE,
  activity = MOCK_ACTIVITY,
  asOf = MOCK_AS_OF,
  labId = "LAB-03",
  location = "Bay 3",
  title = "Lab dashboard",
  headingLevel = "h1",
  loading = false,
  error = null,
  denied = false,
  offline = false,
  onRetry,
  onSampleOpen,
  syncToUrl = false,
  className,
  ...props
}: LabDashboardProps): React.ReactElement {
  const Heading = headingLevel;
  const detailId = React.useId();
  const [acknowledged, setAcknowledged] = React.useState<Set<string>>(
    new Set(),
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = React.useState<string | null>(
    () => firstSampleId(samples),
  );
  const [urlReady, setUrlReady] = React.useState(!syncToUrl);

  const instrumentsRef = React.useRef(instruments);
  instrumentsRef.current = instruments;
  const samplesRef = React.useRef(samples);
  samplesRef.current = samples;

  React.useEffect(() => {
    if (!samples.some((sample) => sample.id === activeSampleId)) {
      setActiveSampleId(firstSampleId(samples));
    }
  }, [samples, activeSampleId]);

  React.useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const instrument = params.get("instrument");
    const sample = params.get("sample");

    if (
      instrument &&
      instrumentsRef.current.some((entry) => entry.id === instrument)
    ) {
      setExpandedId(instrument);
    }
    if (sample && samplesRef.current.some((entry) => entry.id === sample)) {
      setActiveSampleId(sample);
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
    set("instrument", expandedId ?? "");
    set("sample", activeSampleId ?? "");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [syncToUrl, urlReady, expandedId, activeSampleId]);

  const openAlerts = alerts.filter((alert) => !acknowledged.has(alert.id));
  const summary = summarizeLab(instruments, samples, openAlerts, schedule);
  const activeSample =
    samples.find((sample) => sample.id === activeSampleId) ?? null;
  const expanded =
    instruments.find((instrument) => instrument.id === expandedId) ?? null;

  function toggleInstrument(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function acknowledge(id: string) {
    setAcknowledged((current) => new Set(current).add(id));
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
      data-slot="lab-dashboard"
      {...props}
    >
      <div className="hidden print:block print:pb-2">
        <p className="font-heading font-semibold text-lg">{title}</p>
        <p className="text-muted-foreground text-xs">
          {labId} · {location} · {formatDay(asOf)} · {formatTime(asOf)} UTC
        </p>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 print:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            {labId} · {location}
          </p>
          <Heading className="font-heading font-semibold text-xl tracking-tight">
            {title}
          </Heading>
          <p className="text-muted-foreground text-xs">
            {formatDay(asOf)} · {formatTime(asOf)} UTC
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <span className="font-medium">Offline.</span> Showing the last
            synced state from {formatTime(asOf)} UTC. Acknowledging an alert
            stays local until the connection returns.
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
            "The lab service did not respond. The last known state is preserved."
          }
          title="Could not load the lab"
        />
      ) : null}

      {state === "denied" ? (
        <StatePanel
          icon={<LockIcon aria-hidden="true" className="size-5" />}
          message={`Lab status is restricted to members of ${labId}. Ask a lab admin for access.`}
          title="You don’t have access to this lab"
        />
      ) : null}

      {state === "ready" ? (
        <>
          <StatGrid className="m-3 sm:m-4" columns={4}>
            <Stat
              hint={
                instruments.length === 0
                  ? "No instruments registered"
                  : `${summary.instrumentsAttention} need attention`
              }
              label="Instruments online"
              unit={`of ${instruments.length}`}
              value={summary.instrumentsOnline}
            />
            <Stat
              hint={
                summary.samplesInFlight === 0
                  ? "Nothing on the bench"
                  : `${summary.samplesRunning} running · ${summary.samplesQueued} queued · ${summary.samplesBlocked} blocked`
              }
              label="Samples in flight"
              value={summary.samplesInFlight}
            />
            <Stat
              hint={
                openAlerts.length === 0
                  ? "All alerts acknowledged"
                  : `${summary.criticalAlerts} critical · ${summary.warningAlerts} warning`
              }
              label="Open alerts"
              value={openAlerts.length}
            />
            <Stat
              hint={
                summary.runsToday === 0
                  ? "No runs scheduled"
                  : `${summary.runsComplete} complete · ${summary.runsRunning} running · ${summary.runsWaiting} waiting`
              }
              label="Runs today"
              value={summary.runsToday}
            />
          </StatGrid>

          <section aria-labelledby="lab-alerts-heading" className="border-b">
            <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <h2 className="font-medium text-sm" id="lab-alerts-heading">
                  Alerts
                </h2>
                <span
                  aria-live="polite"
                  className="font-mono text-[10px] text-muted-foreground tabular-nums"
                >
                  {openAlerts.length} open
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Acknowledging keeps the record.
              </p>
            </header>

            {alerts.length === 0 ? (
              <EmptyLine
                icon={<CheckIcon aria-hidden="true" className="size-4" />}
                message="No alerts. Every instrument is within limits."
              />
            ) : (
              <ul className="grid gap-px border-t bg-border sm:grid-cols-2 xl:grid-cols-4">
                {alerts.map((alert) => (
                  <AlertCard
                    acknowledged={acknowledged.has(alert.id)}
                    alert={alert}
                    key={alert.id}
                    onAcknowledge={() => acknowledge(alert.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="lab-instruments-heading"
            className="border-b"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <h2
                  className="font-medium text-sm"
                  id="lab-instruments-heading"
                >
                  Instruments
                </h2>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {summary.instrumentsOnline} of {instruments.length} online
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                7-day utilization
              </p>
            </header>

            {instruments.length === 0 ? (
              <EmptyLine message="No instruments registered in this lab." />
            ) : (
              <>
                <div className="grid gap-px border-t bg-border sm:grid-cols-2 xl:grid-cols-4">
                  {instruments.map((instrument) => (
                    <InstrumentCard
                      expanded={instrument.id === expandedId}
                      instrument={instrument}
                      key={instrument.id}
                      onToggle={() => toggleInstrument(instrument.id)}
                      detailId={detailId}
                    />
                  ))}
                </div>
                {expanded ? (
                  <div
                    aria-label={`${expanded.name} details`}
                    className="border-t bg-muted/24 px-4 py-3"
                    data-slot="instrument-detail"
                    id={detailId}
                    role="region"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="font-medium text-sm">
                            {expanded.name}
                          </h3>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {expanded.model} · {expanded.location}
                          </span>
                        </div>
                        <p className="mt-1 max-w-3xl text-muted-foreground text-xs leading-relaxed">
                          {expanded.note}
                        </p>
                        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">
                              Calibrated
                            </dt>
                            <dd className="font-mono">
                              {formatDate(expanded.lastCalibrated)}
                            </dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">Due</dt>
                            <dd className="font-mono">
                              {expanded.calibrationDue
                                ? formatDate(expanded.calibrationDue)
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">
                              Next booking
                            </dt>
                            <dd className="font-mono">
                              {expanded.nextBooking ?? "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <Button
                        onClick={() => setExpandedId(null)}
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <div className="grid border-b xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section
              aria-label="Samples in flight"
              className="min-w-0 xl:border-e"
            >
              <DataTable
                activeRowId={activeSampleId ?? undefined}
                className="rounded-none border-0"
                columns={SAMPLE_COLUMNS}
                defaultSort={{ columnId: "eta", direction: "asc" }}
                emptyLabel="No samples in flight."
                getRowId={(sample) => sample.id}
                getRowLabel={(sample) => sample.id}
                label="Samples in flight"
                onRowActivate={(id) => setActiveSampleId(id)}
                rows={samples}
                title="Samples in flight"
              />

              {activeSample ? (
                <div
                  className="border-t bg-muted/16 px-4 py-3"
                  data-slot="sample-preview"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                        Active sample
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm">{activeSample.id}</p>
                        <StatusBadge
                          label={IN_FLIGHT_LABEL[activeSample.status]}
                          size="sm"
                          status={IN_FLIGHT_STATUS[activeSample.status]}
                        />
                        <p className="text-xs">
                          {activeSample.study} · {activeSample.stage}
                        </p>
                      </div>
                      {activeSample.note ? (
                        <p className="mt-1 max-w-2xl text-[11px] text-muted-foreground leading-relaxed">
                          {activeSample.note}
                        </p>
                      ) : null}
                      <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <div className="flex gap-1">
                          <dt>Instrument</dt>
                          <dd className="text-foreground">
                            {activeSample.instrument}
                          </dd>
                        </div>
                        <div className="flex gap-1">
                          <dt>Operator</dt>
                          <dd className="text-foreground">
                            {activeSample.operator}
                          </dd>
                        </div>
                        <div className="flex gap-1">
                          <dt>ETA</dt>
                          <dd className="text-foreground">
                            {activeSample.etaMinutes === null
                              ? formatEta(activeSample)
                              : `${activeSample.etaMinutes} min remaining`}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    {onSampleOpen ? (
                      <Button
                        onClick={() => onSampleOpen(activeSample)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Open in Data Explorer
                        <ArrowUpRightIcon />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <section aria-labelledby="lab-schedule-heading" className="min-w-0">
              <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                <h2 className="font-medium text-sm" id="lab-schedule-heading">
                  Today’s schedule
                </h2>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {formatShortDay(asOf)}
                </span>
              </header>
              <div className="border-t p-4">
                <Timeline
                  emptyLabel="No runs scheduled today."
                  items={schedule.map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    description: `${entry.instrument} · ${entry.operator}`,
                    time: entry.time,
                    dateTime: entry.dateTime,
                    status: entry.status,
                    meta: entry.detail,
                  }))}
                  label="Today’s schedule"
                />
              </div>
            </section>
          </div>

          <LogViewer
            className="rounded-none border-0 print:hidden"
            entries={activity}
            emptyLabel="No activity recorded today."
            filterable
            follow={false}
            height="15rem"
            title="Recent activity"
          />
        </>
      ) : null}
    </section>
  );
}

function InstrumentCard({
  instrument,
  expanded,
  onToggle,
  detailId,
}: {
  instrument: LabInstrument;
  expanded: boolean;
  onToggle: () => void;
  detailId: string;
}): React.ReactElement {
  const status = INSTRUMENT_STATUS[instrument.state];
  const label = instrument.stateLabel ?? INSTRUMENT_LABEL[instrument.state];

  return (
    <article
      className="flex min-w-0 flex-col bg-background p-3"
      data-slot="instrument-card"
      data-state={instrument.state}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-sm">{instrument.name}</h3>
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            {instrument.model} · {instrument.location}
          </p>
        </div>
        <StatusBadge
          className="shrink-0"
          label={label}
          size="sm"
          status={status}
        />
      </div>

      <p className="mt-2 min-h-8 text-xs leading-relaxed">
        {instrument.activity}
      </p>

      {typeof instrument.progress === "number" ? (
        <div className="mt-1 grid gap-1">
          <div
            aria-label={`${instrument.name} progress`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={instrument.progress}
            className="h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-foreground/72"
              style={{ width: `${instrument.progress}%` }}
            />
          </div>
          <p className="text-end font-mono text-[10px] text-muted-foreground tabular-nums">
            {instrument.progress}%
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground">7-day utilization</p>
          <Sparkline
            className="mt-0.5 h-7 w-24 text-foreground/64"
            formatValue={(value) => `${value}%`}
            label={`${instrument.name} utilization`}
            values={instrument.utilization}
          />
        </div>
        <p className="font-mono text-xs tabular-nums">
          {instrument.utilizationPct}%
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
        <p className="truncate text-[10px] text-muted-foreground">
          {instrument.calibrationDue
            ? `Cal due ${formatDate(instrument.calibrationDue)}`
            : "Calibration not tracked"}
          {instrument.nextBooking ? ` · Next ${instrument.nextBooking}` : ""}
        </p>
        <Button
          aria-controls={expanded ? detailId : undefined}
          aria-expanded={expanded}
          aria-label={`Details for ${instrument.name}`}
          className="-me-1.5 shrink-0 print:hidden"
          onClick={onToggle}
          size="xs"
          type="button"
          variant="ghost"
        >
          {expanded ? "Hide" : "Details"}
        </Button>
      </div>
    </article>
  );
}

function AlertCard({
  alert,
  acknowledged,
  onAcknowledge,
}: {
  alert: LabAlert;
  acknowledged: boolean;
  onAcknowledge: () => void;
}): React.ReactElement {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col bg-background p-3",
        acknowledged && "bg-muted/24",
      )}
      data-acknowledged={acknowledged ? "" : undefined}
      data-slot="lab-alert"
    >
      <div className="flex items-center justify-between gap-2">
        <StatusBadge
          label={ALERT_LABEL[alert.severity]}
          size="sm"
          status={ALERT_STATUS[alert.severity]}
        />
        <time
          className="font-mono text-[10px] text-muted-foreground tabular-nums"
          dateTime={alert.at}
        >
          {formatTime(alert.at)}
        </time>
      </div>
      <p className="mt-2 font-medium text-xs leading-relaxed">{alert.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        {alert.detail}
      </p>
      <div className="mt-auto flex min-h-6 items-center justify-between gap-2 pt-2">
        <span className="truncate text-[10px] text-muted-foreground">
          {alert.source}
        </span>
        {acknowledged ? (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            Acknowledged
          </span>
        ) : (
          <Button
            aria-label={`Acknowledge: ${alert.title}`}
            className="-me-1.5 shrink-0 print:hidden"
            onClick={onAcknowledge}
            size="xs"
            type="button"
            variant="ghost"
          >
            Acknowledge
          </Button>
        )}
      </div>
    </li>
  );
}

function EmptyLine({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 border-t px-4 py-5 text-muted-foreground text-xs">
      {icon}
      <p>{message}</p>
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
      <span className="sr-only">Loading lab status…</span>
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="bg-background p-4" key={index}>
            <div className="h-3 w-20 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-3 h-6 w-24 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="rounded-xl border p-3" key={index}>
            <div className="h-3 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-2 h-2 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-4 h-16 rounded-lg bg-muted/64 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border">
        {[0, 1, 2, 3, 4].map((index) => (
          <div className="border-b px-3 py-3.5" key={index}>
            <div className="h-3 w-full max-w-96 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
