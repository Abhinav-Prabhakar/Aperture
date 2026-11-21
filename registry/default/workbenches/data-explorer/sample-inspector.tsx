"use client";

import { InboxIcon } from "lucide-react";
import type * as React from "react";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Sparkline } from "@/registry/default/instruments/sparkline";
import {
  type Status,
  StatusBadge,
} from "@/registry/default/instruments/status-badge";
import {
  Timeline,
  type TimelineItem,
} from "@/registry/default/instruments/timeline";
import { Separator } from "@/registry/default/ui/separator";
import { formatDateTime } from "./adapter";
import { type ExplorerSample, type SampleStatus, STATUS_LABEL } from "./types";

const STATUS: Record<SampleStatus, Status> = {
  passed: "success",
  warning: "warning",
  failed: "error",
};

function minutesAfter(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}

function custody(sample: ExplorerSample): TimelineItem[] {
  return [
    {
      id: "collected",
      title: "Collected",
      description: "Sample logged at the bench.",
      time: formatDateTime(sample.collectedAt),
      dateTime: sample.collectedAt,
      meta: sample.operator,
    },
    {
      id: "acquired",
      title: "Absorbance read",
      description: "A₆₀₀ measured at 600 nm.",
      time: formatDateTime(minutesAfter(sample.collectedAt, 18)),
      dateTime: minutesAfter(sample.collectedAt, 18),
      status: "success",
      meta: "BMG FLUOstar",
    },
    {
      id: "reviewed",
      title:
        sample.status === "passed" ? "QC reviewed" : "QC flagged for re-run",
      description:
        sample.status === "passed"
          ? "Within the assay’s acceptance window."
          : "See the sample note before using this value.",
      time: formatDateTime(minutesAfter(sample.collectedAt, 42)),
      dateTime: minutesAfter(sample.collectedAt, 42),
      status: STATUS[sample.status],
      meta: "A. Rao",
    },
  ];
}

export function SampleInspector({
  sample,
}: {
  sample: ExplorerSample | null;
}): React.ReactElement {
  if (!sample) {
    return (
      <div
        className="flex h-full min-h-48 flex-col items-center justify-center gap-2 p-6 text-center"
        data-slot="sample-inspector-empty"
      >
        <InboxIcon
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
        <p className="font-medium text-sm">No sample selected</p>
        <p className="max-w-52 text-muted-foreground text-xs leading-relaxed">
          Choose a row to see its measurement, series, and chain of custody.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4" data-slot="sample-inspector">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-muted-foreground text-xs">
            {sample.well} · {sample.id}
          </p>
          <h2 className="truncate font-heading font-semibold text-lg">
            {sample.treatment}
          </h2>
        </div>
        <StatusBadge
          label={STATUS_LABEL[sample.status]}
          status={STATUS[sample.status]}
        />
      </div>

      <dl className="grid gap-2 text-xs">
        <DetailRow
          label="Concentration"
          value={
            sample.concentration === null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <ScientificNumber
                precision={1}
                uncertainty={sample.uncertainty ?? undefined}
                unit="µg/mL"
                value={sample.concentration}
              />
            )
          }
        />
        <DetailRow
          label="A₆₀₀"
          value={
            <ScientificNumber precision={2} unit="AU" value={sample.a600} />
          }
        />
        <DetailRow
          label="Collected"
          value={formatDateTime(sample.collectedAt)}
        />
        <DetailRow label="Operator" value={sample.operator} />
      </dl>

      {sample.note ? (
        <p className="rounded-lg border border-dashed px-2.5 py-2 text-muted-foreground text-xs leading-relaxed">
          {sample.note}
        </p>
      ) : null}

      <Separator />

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-medium text-sm">12 h series</h3>
          <span className="font-mono text-muted-foreground text-xs">µg/mL</span>
        </div>
        <Sparkline
          className="mt-2 h-14 w-full"
          formatValue={(value) => `${value.toFixed(1)} µg/mL`}
          label={`${sample.id} concentration over 12 hours`}
          showLast
          values={sample.series}
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>0 h</span>
          <span>6 h</span>
          <span>12 h</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-medium text-sm">Chain of custody</h3>
        <Timeline items={custody(sample)} label={`Events for ${sample.id}`} />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end tabular-nums">{value}</dd>
    </div>
  );
}
