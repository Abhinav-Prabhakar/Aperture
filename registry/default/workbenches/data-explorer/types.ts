export type SampleStatus = "passed" | "warning" | "failed";

export type Treatment = "Control" | "Low dose" | "High dose";

export type ExplorerSample = {
  id: string;
  well: string;
  treatment: Treatment;
  /** µg/mL. Null when the measurement was censored or not taken. */
  concentration: number | null;
  /** Absolute uncertainty in µg/mL. */
  uncertainty: number | null;
  /** Absorbance at 600 nm, in arbitrary units. */
  a600: number;
  status: SampleStatus;
  /** ISO 8601 timestamp. */
  collectedAt: string;
  operator: string;
  /** Concentration over 12 hours, one value every 1.5 h. */
  series: readonly number[];
  note?: string;
};

export type ExplorerFilters = {
  query: string;
  status: "all" | SampleStatus;
  treatment: "all" | Treatment;
};

export const SAMPLE_STATUSES: readonly SampleStatus[] = [
  "passed",
  "warning",
  "failed",
];

export const TREATMENTS: readonly Treatment[] = [
  "Control",
  "Low dose",
  "High dose",
];

export const STATUS_LABEL: Record<SampleStatus, string> = {
  passed: "Passed",
  warning: "Low signal",
  failed: "Censored",
};

export function isSampleStatus(value: string | null): value is SampleStatus {
  return value !== null && SAMPLE_STATUSES.includes(value as SampleStatus);
}

export function isTreatment(value: string | null): value is Treatment {
  return value !== null && TREATMENTS.includes(value as Treatment);
}
