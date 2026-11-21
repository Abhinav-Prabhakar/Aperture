import type { Status } from "@/registry/default/instruments/status-badge";

export type InstrumentState =
  | "running"
  | "idle"
  | "warning"
  | "offline"
  | "error";

export type LabInstrument = {
  id: string;
  name: string;
  model: string;
  location: string;
  state: InstrumentState;
  /** One line describing what it is doing, or why it is not available. */
  activity: string;
  /** Short status override. Defaults to the state label. */
  stateLabel?: string;
  /** 0–100 while a run is in progress. Null or omitted when idle. */
  progress?: number | null;
  /** Daily utilization, oldest first. One value per day. */
  utilization: readonly number[];
  /** Utilization for the last seven days, in percent. */
  utilizationPct: number;
  /** ISO 8601 timestamp. */
  lastCalibrated: string;
  /** ISO 8601 date. Null when calibration is not tracked. */
  calibrationDue: string | null;
  /** Today's next booking, e.g. "14:30 · plate 13". */
  nextBooking: string | null;
  /** Full detail shown in the instrument panel. */
  note: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type LabAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  /** ISO 8601 timestamp. */
  at: string;
  source: string;
};

export type InFlightStatus = "running" | "queued" | "blocked";

export type InFlightSample = {
  id: string;
  study: string;
  stage: string;
  instrument: string;
  operator: string;
  /** Minutes remaining. Null when the run has not started. */
  etaMinutes: number | null;
  /** Shown instead of minutes: "next", "16:30". */
  etaLabel?: string;
  /** ISO 8601 timestamp. */
  startedAt: string;
  status: InFlightStatus;
  /** One line of run context shown in the sample preview. */
  note?: string;
};

export type ScheduleEntry = {
  id: string;
  /** Display time, HH:MM. */
  time: string;
  /** ISO 8601 timestamp. */
  dateTime: string;
  title: string;
  instrument: string;
  operator: string;
  status: Status;
  detail?: string;
};

export const INSTRUMENT_STATUS: Record<InstrumentState, Status> = {
  running: "running",
  idle: "idle",
  warning: "warning",
  offline: "offline",
  error: "error",
};

export const INSTRUMENT_LABEL: Record<InstrumentState, string> = {
  running: "Running",
  idle: "Idle",
  warning: "Needs attention",
  offline: "Offline",
  error: "Failed",
};

export const ALERT_STATUS: Record<AlertSeverity, Status> = {
  critical: "error",
  warning: "warning",
  info: "running",
};

export const ALERT_LABEL: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const IN_FLIGHT_STATUS: Record<InFlightStatus, Status> = {
  running: "running",
  queued: "idle",
  blocked: "warning",
};

export const IN_FLIGHT_LABEL: Record<InFlightStatus, string> = {
  running: "Running",
  queued: "Queued",
  blocked: "Blocked",
};
