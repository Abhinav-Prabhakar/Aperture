import {
  ActivityIcon,
  ArrowUpRightIcon,
  FlaskConicalIcon,
  Table2Icon,
  TestTubesIcon,
} from "lucide-react";
import Link from "next/link";
import { LogViewer } from "@/registry/default/instruments/log-viewer";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { Button } from "@/registry/default/ui/button";
import {
  MOCK_ACTIVITY,
  MOCK_ALERTS,
  MOCK_INSTRUMENTS,
  MOCK_SCHEDULE,
} from "@/registry/default/workbenches/lab-dashboard/mock-data";
import {
  ALERT_LABEL,
  ALERT_STATUS,
} from "@/registry/default/workbenches/lab-dashboard/types";
import { summarize } from "@/registry/default/workbenches/sample-registry/adapter";
import { MOCK_SAMPLES } from "@/registry/default/workbenches/sample-registry/mock-data";

const WORKBENCHES = [
  {
    description: "Filter, inspect, and export a run's samples.",
    href: "/workbenches/data-explorer",
    icon: <Table2Icon />,
    label: "Data Explorer",
  },
  {
    description: "Storage, aliquots, and chain of custody.",
    href: "/workbenches/sample-registry",
    icon: <TestTubesIcon />,
    label: "Sample Registry",
  },
  {
    description: "Parameters, QC, artifacts, and provenance.",
    href: "/workbenches/run-detail",
    icon: <FlaskConicalIcon />,
    label: "Run Detail",
  },
  {
    description: "Instruments, alerts, schedule, and activity.",
    href: "/workbenches/lab-dashboard",
    icon: <ActivityIcon />,
    label: "Lab Dashboard",
  },
] as const;

const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: "UTC",
});

function alertTime(value: string): string {
  return TIME_FORMAT.format(new Date(value));
}

export default function WorkspaceOverviewPage() {
  const samples = summarize(MOCK_SAMPLES);
  const online = MOCK_INSTRUMENTS.filter(
    (instrument) => instrument.state !== "offline",
  ).length;
  const critical = MOCK_ALERTS.filter(
    (alert) => alert.severity === "critical",
  ).length;
  const warnings = MOCK_ALERTS.filter(
    (alert) => alert.severity === "warning",
  ).length;
  const onBench = MOCK_SCHEDULE.filter(
    (entry) =>
      entry.status === "running" ||
      entry.status === "warning" ||
      entry.status === "error",
  );

  return (
    <div className="grid gap-4" data-slot="workspace-overview">
      <header>
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
          Lab 03 · Bay 3
        </p>
        <h1 className="mt-1 font-heading font-bold text-3xl tracking-tight">
          Workspace
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Sunday, 22 November 2026 · Synthetic lab data. Every link opens a real
          workbench.
        </p>
      </header>

      <StatGrid columns={4}>
        <Stat
          hint={`${new Set(MOCK_SAMPLES.map((sample) => sample.study)).size} studies · ${
            samples.missingVolume
          } missing volume`}
          label="Samples"
          value={samples.count}
        />
        <Stat
          hint={`${samples.stored} stored · ${samples.quarantined} quarantined`}
          label="In use"
          value={samples.inUse}
        />
        <Stat
          hint={`${MOCK_INSTRUMENTS.length - online} offline · 1 error`}
          label="Instruments online"
          value={`${online} of ${MOCK_INSTRUMENTS.length}`}
        />
        <Stat
          hint={`${critical} critical · ${warnings} warning`}
          label="Open alerts"
          value={MOCK_ALERTS.length}
        />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-xl border bg-background">
          <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <div className="me-auto min-w-0">
              <h2 className="font-heading font-semibold text-lg tracking-tight">
                On the bench
              </h2>
              <p className="text-muted-foreground text-xs">
                Running now and next, with the instrument's own status.
              </p>
            </div>
            <Button
              render={<Link href="/workbenches/lab-dashboard" />}
              size="xs"
              variant="outline"
            >
              Lab dashboard
              <ArrowUpRightIcon />
            </Button>
          </header>
          <ul className="divide-y">
            {onBench.map((entry) => (
              <li
                className="grid gap-2 px-4 py-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center"
                key={entry.id}
              >
                <span className="font-mono text-muted-foreground text-xs tabular-nums">
                  {entry.time}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm">{entry.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {entry.instrument} · {entry.operator}
                  </p>
                  {entry.detail ? (
                    <p className="mt-1 text-muted-foreground text-xs">
                      {entry.detail}
                    </p>
                  ) : null}
                </div>
                <StatusBadge size="sm" status={entry.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-xl border bg-background">
          <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <div className="me-auto min-w-0">
              <h2 className="font-heading font-semibold text-lg tracking-tight">
                Needs attention
              </h2>
              <p className="text-muted-foreground text-xs">
                Open alerts from the lab.
              </p>
            </div>
            <span className="font-mono text-muted-foreground text-xs tabular-nums">
              {MOCK_ALERTS.length}
            </span>
          </header>
          <ul className="divide-y">
            {MOCK_ALERTS.map((alert) => {
              return (
                <li className="px-4 py-3" key={alert.id}>
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      label={ALERT_LABEL[alert.severity]}
                      size="sm"
                      status={ALERT_STATUS[alert.severity]}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {alertTime(alert.at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-snug">{alert.title}</p>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {alert.detail}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {alert.source}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <LogViewer
        entries={MOCK_ACTIVITY.slice(0, 6)}
        filterable={false}
        follow={false}
        height="14rem"
        title="Recent activity"
      />

      <section aria-label="Workbenches">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold text-2xl tracking-tight">
              Workbenches
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Whole screens, not widget demos. Each one installs from the
              registry.
            </p>
          </div>
          <Button
            render={<Link href="/docs/workbenches" />}
            size="xs"
            variant="outline"
          >
            Read the docs
            <ArrowUpRightIcon />
          </Button>
        </div>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {WORKBENCHES.map((workbench) => (
            <li key={workbench.href}>
              <Link
                className="group flex h-full flex-col rounded-xl border bg-background p-4 outline-none transition-colors hover:bg-muted/32 focus-visible:ring-2 focus-visible:ring-ring"
                href={workbench.href}
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-md border bg-muted/32 text-muted-foreground [&_svg]:size-4"
                >
                  {workbench.icon}
                </span>
                <span className="mt-3 flex items-center gap-1 font-medium text-sm">
                  {workbench.label}
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:rotate-[-90deg]"
                  />
                </span>
                <span className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {workbench.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
