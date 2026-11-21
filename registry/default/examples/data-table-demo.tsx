"use client";

import type { DataTableColumn } from "@/registry/default/instruments/data-table";
import { DataTable } from "@/registry/default/instruments/data-table";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { StatusBadge } from "@/registry/default/instruments/status-badge";

type Sample = {
  id: string;
  sample: string;
  well: string;
  concentration: number | null;
  a600: number;
  qc: "success" | "warning" | "error";
};

const SAMPLE: Sample[] = [
  {
    id: "s1",
    sample: "S-001",
    well: "A1",
    concentration: 12.4,
    a600: 0.412,
    qc: "success",
  },
  {
    id: "s2",
    sample: "S-002",
    well: "A2",
    concentration: 11.9,
    a600: 0.398,
    qc: "success",
  },
  {
    id: "s3",
    sample: "S-003",
    well: "A3",
    concentration: null,
    a600: 0.221,
    qc: "warning",
  },
  {
    id: "s4",
    sample: "S-004",
    well: "A4",
    concentration: 12.8,
    a600: 0.431,
    qc: "success",
  },
  {
    id: "s5",
    sample: "S-005",
    well: "A5",
    concentration: 12.1,
    a600: 4.12,
    qc: "error",
  },
  {
    id: "s6",
    sample: "S-006",
    well: "A6",
    concentration: 11.6,
    a600: 0.389,
    qc: "success",
  },
];

const QC_LABEL = {
  success: "Passed",
  warning: "Low signal",
  error: "Censored",
} as const;

const COLUMNS: DataTableColumn<Sample>[] = [
  {
    id: "sample",
    header: "Sample",
    cell: (row) => <span className="font-mono text-xs">{row.sample}</span>,
    sortValue: (row) => row.sample,
  },
  {
    id: "well",
    header: "Well",
    cell: (row) => <span className="font-mono text-xs">{row.well}</span>,
    sortValue: (row) => row.well,
  },
  {
    id: "concentration",
    header: "Concentration",
    unit: "µg/mL",
    align: "end",
    numeric: true,
    cell: (row) =>
      row.concentration === null ? (
        <span
          className="text-muted-foreground"
          title="Not measured: detector saturated"
        >
          —
        </span>
      ) : (
        <ScientificNumber value={row.concentration} />
      ),
    sortValue: (row) => row.concentration,
  },
  {
    id: "a600",
    header: "A₆₀₀",
    unit: "AU",
    align: "end",
    numeric: true,
    cell: (row) => <ScientificNumber value={row.a600} />,
    sortValue: (row) => row.a600,
  },
  {
    id: "qc",
    header: "QC",
    cell: (row) => (
      <StatusBadge label={QC_LABEL[row.qc]} size="sm" status={row.qc} />
    ),
  },
];

export function DataTableDemo() {
  return (
    <DataTable
      columns={COLUMNS}
      defaultSort={{ columnId: "concentration", direction: "desc" }}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.sample}
      rows={SAMPLE}
      selectable
      title="Samples · plate 1"
    />
  );
}
