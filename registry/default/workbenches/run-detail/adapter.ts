import type { RunMetric, RunRecord } from "./types";

const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const day = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

export function formatDay(iso: string): string {
  return day.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

/** "42 min", or "—" when the run has not finished. */
export function formatDuration(run: RunRecord): string {
  if (!run.completedAt) {
    return "—";
  }
  const milliseconds =
    new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime();
  const minutes = Math.round(milliseconds / 60_000);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatRunClock(run: RunRecord): string {
  const start = formatTime(run.startedAt);
  const end = run.completedAt ? formatTime(run.completedAt) : "in progress";
  return `${start}–${end} UTC`;
}

const bytes = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 1,
});

/** Decimal file sizes, as operating systems report them. */
export function formatBytes(value: number): string {
  if (value < 1000) {
    return `${Math.round(value)} B`;
  }
  const units = ["kB", "MB", "GB", "TB"];
  let amount = value / 1000;
  let unit = 0;
  while (amount >= 1000 && unit < units.length - 1) {
    amount /= 1000;
    unit += 1;
  }
  return `${bytes.format(amount)} ${units[unit]}`;
}

export function metricsInRange(metrics: readonly RunMetric[]): number {
  return metrics.filter((metric) => metric.status === "passed").length;
}

export function artifactBytes(run: RunRecord): number {
  return run.artifacts.reduce((sum, artifact) => sum + artifact.sizeBytes, 0);
}
