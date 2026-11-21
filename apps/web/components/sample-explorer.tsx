"use client";

import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/registry/default/ui/badge";
import { Input } from "@/registry/default/ui/input";
import { Separator } from "@/registry/default/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

type Status = "analyzed" | "pending" | "failed";

type Sample = {
  id: string;
  tissue: string;
  concentration: number | null;
  absorbance: number;
  status: Status;
  collected: string;
  operator: string;
};

const SAMPLES: Sample[] = [
  {
    id: "S-0142",
    tissue: "Liver",
    concentration: 12.4,
    absorbance: 0.482,
    status: "analyzed",
    collected: "2026-11-14",
    operator: "A. Okafor",
  },
  {
    id: "S-0143",
    tissue: "Liver",
    concentration: 8.1,
    absorbance: 0.317,
    status: "analyzed",
    collected: "2026-11-14",
    operator: "A. Okafor",
  },
  {
    id: "S-0144",
    tissue: "Kidney",
    concentration: 21.7,
    absorbance: 0.801,
    status: "pending",
    collected: "2026-11-15",
    operator: "M. Silva",
  },
  {
    id: "S-0145",
    tissue: "Kidney",
    concentration: null,
    absorbance: 0.112,
    status: "failed",
    collected: "2026-11-15",
    operator: "M. Silva",
  },
  {
    id: "S-0146",
    tissue: "Plasma",
    concentration: 5.6,
    absorbance: 0.221,
    status: "analyzed",
    collected: "2026-11-16",
    operator: "J. Chen",
  },
  {
    id: "S-0147",
    tissue: "Plasma",
    concentration: 7.9,
    absorbance: 0.308,
    status: "analyzed",
    collected: "2026-11-16",
    operator: "J. Chen",
  },
];

const STATUS_LABEL: Record<Status, string> = {
  analyzed: "Analyzed",
  pending: "Pending",
  failed: "Failed",
};

const STATUS_VARIANT: Record<Status, "success" | "warning" | "error"> = {
  analyzed: "success",
  pending: "warning",
  failed: "error",
};

function formatConcentration(value: number | null) {
  if (value === null) {
    return "—";
  }
  return value.toFixed(1);
}

function Sparkline({ values }: { values: number[] }) {
  const width = 132;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * (width - 2) + 1;
      const y = height - 2 - ((value - min) / span) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      aria-label={`Concentration trend across ${values.length} analyzed samples`}
      className="h-8 w-33 text-foreground"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function SampleExplorer() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("S-0142");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return SAMPLES;
    }
    return SAMPLES.filter(
      (sample) =>
        sample.id.toLowerCase().includes(term) ||
        sample.tissue.toLowerCase().includes(term) ||
        STATUS_LABEL[sample.status].toLowerCase().includes(term),
    );
  }, [query]);

  const selected =
    SAMPLES.find((sample) => sample.id === selectedId) ?? SAMPLES[0];
  const analyzed = SAMPLES.filter(
    (sample) => sample.status === "analyzed" && sample.concentration !== null,
  ).map((sample) => sample.concentration as number);

  return (
    <div className="grid overflow-hidden rounded-xl border bg-background lg:grid-cols-[1fr_17rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
            />
            <Input
              aria-label="Filter samples"
              className="ps-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter samples…"
              size="sm"
              type="search"
              value={query}
            />
          </div>
          <Badge size="sm" variant="outline">
            {filtered.length} of {SAMPLES.length}
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample</TableHead>
              <TableHead>Tissue</TableHead>
              <TableHead className="text-end">Concentration</TableHead>
              <TableHead className="text-end">A₄₈₂</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sample) => (
              <TableRow
                aria-selected={sample.id === selectedId}
                className="cursor-pointer"
                data-state={sample.id === selectedId ? "selected" : undefined}
                key={sample.id}
                onClick={() => setSelectedId(sample.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(sample.id);
                  }
                }}
                tabIndex={0}
              >
                <TableCell className="font-mono text-xs">{sample.id}</TableCell>
                <TableCell>{sample.tissue}</TableCell>
                <TableCell className="text-end tabular-nums">
                  {formatConcentration(sample.concentration)}
                  <span className="ms-1 text-muted-foreground text-xs">
                    mg/L
                  </span>
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {sample.absorbance.toFixed(3)}
                </TableCell>
                <TableCell>
                  <Badge size="sm" variant={STATUS_VARIANT[sample.status]}>
                    {STATUS_LABEL[sample.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-10 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No samples match “{query}”.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <aside className="border-t p-4 lg:border-s lg:border-t-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading font-semibold text-sm">Inspector</h3>
          <Badge size="sm" variant="secondary">
            {selected.id}
          </Badge>
        </div>
        <Separator className="my-3" />
        <dl className="grid gap-2.5 text-xs">
          {[
            ["Tissue", selected.tissue],
            ["Collected", selected.collected],
            ["Operator", selected.operator],
            ["Instrument", "UV-1900i"],
            [
              "Concentration",
              selected.concentration === null
                ? "—"
                : `${formatConcentration(selected.concentration)} mg/L`,
            ],
            ["Absorbance", `${selected.absorbance.toFixed(3)} AU`],
          ].map(([label, value]) => (
            <div
              className="flex items-baseline justify-between gap-4"
              key={label}
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-end tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <Separator className="my-4" />
        <p className="mb-2 text-muted-foreground text-xs">
          Concentration trend
        </p>
        <Sparkline values={analyzed} />
        <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
          Derived from 4 analyzed samples. Missing values are not zero.
        </p>
      </aside>
    </div>
  );
}
