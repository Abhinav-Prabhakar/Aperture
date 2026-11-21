import type { LogEntry } from "@/registry/default/instruments/log-viewer";
import type { Status } from "@/registry/default/instruments/status-badge";

export type RunStatus = "complete" | "running" | "failed" | "queued";

export const RUN_STATUS: Record<RunStatus, Status> = {
  complete: "success",
  running: "running",
  failed: "error",
  queued: "idle",
};

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  complete: "Complete",
  running: "Running",
  failed: "Failed",
  queued: "Queued",
};

export type RunParameter = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

export type MetricStatus = "passed" | "warning" | "failed";

export const METRIC_STATUS: Record<MetricStatus, Status> = {
  passed: "success",
  warning: "warning",
  failed: "error",
};

export const METRIC_STATUS_LABEL: Record<MetricStatus, string> = {
  passed: "Passed",
  warning: "Warning",
  failed: "Failed",
};

export type RunMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  precision?: number;
  /** The acceptance rule, e.g. "≥ 0.50". */
  expected: string;
  status: MetricStatus;
  hint?: string;
};

export type ArtifactKind = "csv" | "pdf" | "svg" | "json" | "log" | "archive";

export const ARTIFACT_KIND_LABEL: Record<ArtifactKind, string> = {
  csv: "CSV",
  pdf: "PDF",
  svg: "SVG",
  json: "JSON",
  log: "Log",
  archive: "Archive",
};

export type RunArtifact = {
  id: string;
  name: string;
  kind: ArtifactKind;
  sizeBytes: number;
  /** Full SHA-256 digest. */
  checksum: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  description: string;
};

export type RunEvent = {
  id: string;
  /** Display time, HH:MM. */
  time: string;
  /** ISO 8601 timestamp. */
  dateTime: string;
  title: string;
  description?: string;
  status?: Status;
  actor?: string;
};

export type RunSamples = {
  total: number;
  passed: number;
  flagged: number;
  censored: number;
};

export type RunRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: RunStatus;
  /** ISO 8601 timestamp. */
  startedAt: string;
  /** ISO 8601 timestamp. Null while the run is in progress. */
  completedAt: string | null;
  operator: string;
  lab: string;
  instrument: string;
  instrumentSerial: string;
  firmware: string;
  pipeline: string;
  samples: RunSamples;
  parameters: readonly RunParameter[];
  metrics: readonly RunMetric[];
  artifacts: readonly RunArtifact[];
  events: readonly RunEvent[];
  log: readonly LogEntry[];
};
