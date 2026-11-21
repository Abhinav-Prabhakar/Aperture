import type {
  InFlightSample,
  LabAlert,
  LabInstrument,
  ScheduleEntry,
} from "./types";

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

const shortDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** 24-hour UTC clock. Stable across server and client. */
export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

/** "Sunday 22 November 2026". */
export function formatDay(iso: string): string {
  return day.format(new Date(iso));
}

/** "Sun 22 Nov". */
export function formatShortDay(iso: string): string {
  return shortDay.format(new Date(iso));
}

/** "28 Jan 2027". */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

export function formatEta(sample: InFlightSample): string {
  if (sample.etaMinutes !== null) {
    return `${sample.etaMinutes} min`;
  }
  return sample.etaLabel ?? "—";
}

export type LabSummary = {
  instrumentsOnline: number;
  instrumentsAttention: number;
  samplesInFlight: number;
  samplesRunning: number;
  samplesQueued: number;
  samplesBlocked: number;
  criticalAlerts: number;
  warningAlerts: number;
  runsToday: number;
  runsComplete: number;
  runsRunning: number;
  runsWaiting: number;
};

export function summarizeLab(
  instruments: readonly LabInstrument[],
  samples: readonly InFlightSample[],
  openAlerts: readonly LabAlert[],
  schedule: readonly ScheduleEntry[],
): LabSummary {
  let instrumentsOnline = 0;
  let instrumentsAttention = 0;
  for (const instrument of instruments) {
    if (instrument.state === "offline" || instrument.state === "error") {
      instrumentsAttention += 1;
    } else {
      instrumentsOnline += 1;
    }
    if (instrument.state === "warning") {
      instrumentsAttention += 1;
    }
  }

  let samplesRunning = 0;
  let samplesQueued = 0;
  let samplesBlocked = 0;
  for (const sample of samples) {
    if (sample.status === "running") {
      samplesRunning += 1;
    } else if (sample.status === "queued") {
      samplesQueued += 1;
    } else {
      samplesBlocked += 1;
    }
  }

  let criticalAlerts = 0;
  let warningAlerts = 0;
  for (const alert of openAlerts) {
    if (alert.severity === "critical") {
      criticalAlerts += 1;
    } else if (alert.severity === "warning") {
      warningAlerts += 1;
    }
  }

  let runsComplete = 0;
  let runsRunning = 0;
  let runsWaiting = 0;
  for (const entry of schedule) {
    if (entry.status === "success") {
      runsComplete += 1;
    } else if (entry.status === "running") {
      runsRunning += 1;
    } else {
      runsWaiting += 1;
    }
  }

  return {
    instrumentsOnline,
    instrumentsAttention,
    samplesInFlight: samples.length,
    samplesRunning,
    samplesQueued,
    samplesBlocked,
    criticalAlerts,
    warningAlerts,
    runsToday: schedule.length,
    runsComplete,
    runsRunning,
    runsWaiting,
  };
}
