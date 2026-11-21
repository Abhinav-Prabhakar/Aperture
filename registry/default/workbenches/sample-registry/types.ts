import type { Status } from "@/registry/default/instruments/status-badge";

export const STUDIES = ["NORDIC-2", "ACUTE-1", "TREAT-7", "RENAL-4"] as const;

export type Study = (typeof STUDIES)[number];

export const STUDY_TITLE: Record<Study, string> = {
  "NORDIC-2": "Nordic cohort follow-up",
  "ACUTE-1": "Acute infection panel",
  "TREAT-7": "Treatment response",
  "RENAL-4": "Renal function study",
};

export const SAMPLE_KINDS = [
  "Serum",
  "Plasma",
  "Tissue",
  "DNA",
  "RNA",
  "Urine",
] as const;

export type SampleKind = (typeof SAMPLE_KINDS)[number];

export const REGISTRY_STATUSES = [
  "stored",
  "in-use",
  "quarantined",
  "consumed",
  "destroyed",
] as const;

export type RegistryStatus = (typeof REGISTRY_STATUSES)[number];

export const STATUS_LABEL: Record<RegistryStatus, string> = {
  stored: "Stored",
  "in-use": "In use",
  quarantined: "Quarantined",
  consumed: "Consumed",
  destroyed: "Destroyed",
};

export const STATUS: Record<RegistryStatus, Status> = {
  stored: "success",
  "in-use": "running",
  quarantined: "warning",
  consumed: "idle",
  destroyed: "idle",
};

export type StorageLocation = {
  /** Freezer, e.g. "F2". */
  freezer: string;
  /** Rack, e.g. "R3". */
  rack: string;
  /** Box, e.g. "B12". */
  box: string;
  /** Position inside the box, e.g. "A4". */
  position: string;
};

export type Aliquot = {
  id: string;
  /** Remaining volume in µL. Null when it was not recorded. */
  volumeUl: number | null;
  location: string;
  status: "stored" | "in-use" | "consumed";
};

/**
 * The most recent custody event. Earlier events — collected, accessioned,
 * stored — are derived from the record so the mock adapter cannot disagree
 * with itself.
 */
export type LastAction = {
  kind: "retrieved" | "quarantined" | "depleted" | "destroyed" | "verified";
  /** ISO 8601 timestamp. */
  at: string;
  actor: string;
  note?: string;
};

export type RegistrySample = {
  id: string;
  accession: string;
  study: Study;
  kind: SampleKind;
  /** De-identified participant identifier. */
  subject: string;
  status: RegistryStatus;
  /** ISO 8601 timestamp. */
  collectedAt: string;
  /** ISO 8601 timestamp. */
  receivedAt: string;
  /** ISO 8601 timestamp. */
  storedAt: string;
  location: StorageLocation;
  /** Remaining volume in µL. Null when it was not recorded. */
  volumeUl: number | null;
  aliquots: readonly Aliquot[];
  custodian: string;
  /** Parent sample for derived material, e.g. DNA from a serum sample. */
  parentId: string | null;
  runIds: readonly string[];
  note?: string;
  quarantineReason?: string;
  lastAction: LastAction | null;
};

export type RegistryFilters = {
  query: string;
  study: "all" | Study;
  kind: "all" | SampleKind;
  status: "all" | RegistryStatus;
};

export function isStudy(value: string | null): value is Study {
  return value !== null && STUDIES.includes(value as Study);
}

export function isSampleKind(value: string | null): value is SampleKind {
  return value !== null && SAMPLE_KINDS.includes(value as SampleKind);
}

export function isRegistryStatus(
  value: string | null,
): value is RegistryStatus {
  return value !== null && REGISTRY_STATUSES.includes(value as RegistryStatus);
}
