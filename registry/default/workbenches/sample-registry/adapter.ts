import {
  type RegistryFilters,
  type RegistrySample,
  STATUS_LABEL,
  STUDY_TITLE,
} from "./types";

export function filterSamples(
  samples: readonly RegistrySample[],
  filters: RegistryFilters,
): RegistrySample[] {
  const term = filters.query.trim().toLowerCase();
  return samples.filter((sample) => {
    if (filters.study !== "all" && sample.study !== filters.study) {
      return false;
    }
    if (filters.kind !== "all" && sample.kind !== filters.kind) {
      return false;
    }
    if (filters.status !== "all" && sample.status !== filters.status) {
      return false;
    }
    if (!term) {
      return true;
    }
    const haystack = [
      sample.id,
      sample.accession,
      sample.subject,
      sample.study,
      STUDY_TITLE[sample.study],
      sample.kind,
      STATUS_LABEL[sample.status],
      formatLocation(sample.location),
      sample.custodian,
      sample.parentId ?? "",
      sample.runIds.join(" "),
      sample.note ?? "",
      sample.quarantineReason ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export type RegistrySummary = {
  count: number;
  stored: number;
  inUse: number;
  quarantined: number;
  consumed: number;
  destroyed: number;
  missingVolume: number;
};

export function summarize(samples: readonly RegistrySample[]): RegistrySummary {
  return {
    count: samples.length,
    stored: samples.filter((sample) => sample.status === "stored").length,
    inUse: samples.filter((sample) => sample.status === "in-use").length,
    quarantined: samples.filter((sample) => sample.status === "quarantined")
      .length,
    consumed: samples.filter((sample) => sample.status === "consumed").length,
    destroyed: samples.filter((sample) => sample.status === "destroyed").length,
    missingVolume: samples.filter((sample) => sample.volumeUl === null).length,
  };
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
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

const NUMBER_FORMATTER = new Intl.NumberFormat("en-GB");

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${DATE_TIME_FORMATTER.format(new Date(iso))} UTC`;
}

/** Compact timestamp for the custody timeline. Pair it with a UTC note. */
export function formatCustodyTime(iso: string): string {
  return `${SHORT_DATE_FORMATTER.format(new Date(iso))} · ${formatTime(iso)}`;
}

export function formatVolume(value: number | null): string {
  return value === null ? "—" : `${NUMBER_FORMATTER.format(value)} µL`;
}

export function formatLocation(location: RegistrySample["location"]): string {
  return `${location.freezer} · ${location.rack} · ${location.box} · ${location.position}`;
}

export function uniqueStudies(samples: readonly RegistrySample[]): number {
  return new Set(samples.map((sample) => sample.study)).size;
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
  "accession",
  "study",
  "kind",
  "subject",
  "status",
  "freezer",
  "rack",
  "box",
  "position",
  "volume_ul",
  "collected_at",
  "received_at",
  "custodian",
  "parent_id",
  "run_ids",
  "note",
].join(",");

export function toCsv(samples: readonly RegistrySample[]): string {
  const rows = samples.map((sample) =>
    [
      sample.id,
      sample.accession,
      sample.study,
      sample.kind,
      sample.subject,
      sample.status,
      sample.location.freezer,
      sample.location.rack,
      sample.location.box,
      sample.location.position,
      sample.volumeUl,
      sample.collectedAt,
      sample.receivedAt,
      sample.custodian,
      sample.parentId,
      sample.runIds.join(" "),
      sample.note ?? sample.quarantineReason ?? "",
    ]
      .map(cell)
      .join(","),
  );
  return [CSV_HEADER, ...rows].join("\n");
}
