import {
  type ExplorerFilters,
  type ExplorerSample,
  STATUS_LABEL,
} from "./types";

export function filterSamples(
  samples: readonly ExplorerSample[],
  filters: ExplorerFilters,
): ExplorerSample[] {
  const term = filters.query.trim().toLowerCase();
  return samples.filter((sample) => {
    if (filters.status !== "all" && sample.status !== filters.status) {
      return false;
    }
    if (filters.treatment !== "all" && sample.treatment !== filters.treatment) {
      return false;
    }
    if (!term) {
      return true;
    }
    const haystack = [
      sample.id,
      sample.well,
      sample.treatment,
      sample.operator,
      STATUS_LABEL[sample.status],
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export type SampleSummary = {
  count: number;
  passed: number;
  flagged: number;
  missing: number;
  /** Median concentration, excluding missing values. Null when nothing is left. */
  median: number | null;
};

export function summarize(samples: readonly ExplorerSample[]): SampleSummary {
  const concentrations = samples
    .map((sample) => sample.concentration)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  return {
    count: samples.length,
    passed: samples.filter((sample) => sample.status === "passed").length,
    flagged: samples.filter((sample) => sample.status !== "passed").length,
    missing: samples.length - concentrations.length,
    median:
      concentrations.length === 0
        ? null
        : concentrations.length % 2 === 1
          ? concentrations[Math.floor(concentrations.length / 2)]
          : (concentrations[concentrations.length / 2 - 1] +
              concentrations[concentrations.length / 2]) /
            2,
  };
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${DATE_TIME_FORMATTER.format(new Date(iso))} UTC`;
}

export function formatDateRange(values: readonly string[]): string {
  if (values.length === 0) {
    return "—";
  }
  const times = values
    .map((value) => Date.parse(value))
    .filter(Number.isFinite);
  if (times.length === 0) {
    return "—";
  }
  const first = new Date(Math.min(...times)).toISOString();
  const last = new Date(Math.max(...times)).toISOString();
  return first.slice(0, 10) === last.slice(0, 10)
    ? formatDate(first)
    : `${formatDate(first)} – ${formatDate(last)}`;
}

function cell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const CSV_HEADER = [
  "sample_id",
  "well",
  "treatment",
  "concentration_ug_ml",
  "uncertainty_ug_ml",
  "a600_au",
  "status",
  "collected_at",
  "operator",
  "note",
].join(",");

export function toCsv(samples: readonly ExplorerSample[]): string {
  const rows = samples.map((sample) =>
    [
      sample.id,
      sample.well,
      sample.treatment,
      sample.concentration,
      sample.uncertainty,
      sample.a600,
      sample.status,
      sample.collectedAt,
      sample.operator,
      sample.note ?? "",
    ]
      .map(cell)
      .join(","),
  );
  return [CSV_HEADER, ...rows].join("\n");
}
