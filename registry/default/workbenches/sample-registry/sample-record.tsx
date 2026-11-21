"use client";

import { AlertTriangleIcon, ArrowUpRightIcon, InboxIcon } from "lucide-react";
import type * as React from "react";
import {
  type Status,
  StatusBadge,
} from "@/registry/default/instruments/status-badge";
import {
  Timeline,
  type TimelineItem,
} from "@/registry/default/instruments/timeline";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  formatCustodyTime,
  formatDateTime,
  formatLocation,
  formatVolume,
} from "./adapter";
import {
  type Aliquot,
  type LastAction,
  type RegistrySample,
  STATUS,
  STATUS_LABEL,
  STUDY_TITLE,
} from "./types";

const ALIQUOT_LABEL: Record<Aliquot["status"], string> = {
  stored: "Stored",
  "in-use": "In use",
  consumed: "Consumed",
};

const ALIQUOT_STATUS: Record<Aliquot["status"], Status> = {
  stored: "success",
  "in-use": "running",
  consumed: "idle",
};

const ACTION_LABEL: Record<LastAction["kind"], string> = {
  retrieved: "Retrieved",
  quarantined: "Quarantined",
  depleted: "Depleted",
  destroyed: "Destroyed",
  verified: "Volume verified",
};

const ACTION_STATUS: Record<LastAction["kind"], Status> = {
  retrieved: "running",
  quarantined: "warning",
  depleted: "idle",
  destroyed: "idle",
  verified: "success",
};

function buildCustody(sample: RegistrySample): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      id: "collected",
      title: "Collected",
      description: `${sample.kind} collected from ${sample.subject}.`,
      time: formatCustodyTime(sample.collectedAt),
      dateTime: sample.collectedAt,
    },
    {
      id: "accessioned",
      title: "Accessioned",
      description: sample.accession,
      time: formatCustodyTime(sample.receivedAt),
      dateTime: sample.receivedAt,
      status: "success",
    },
    {
      id: "stored",
      title: "Stored",
      description: formatLocation(sample.location),
      time: formatCustodyTime(sample.storedAt),
      dateTime: sample.storedAt,
      status: "success",
      meta: sample.custodian,
    },
  ];

  if (sample.lastAction) {
    items.push({
      id: "last-action",
      title: ACTION_LABEL[sample.lastAction.kind],
      description: sample.lastAction.note,
      time: formatCustodyTime(sample.lastAction.at),
      dateTime: sample.lastAction.at,
      status: ACTION_STATUS[sample.lastAction.kind],
      meta: sample.lastAction.actor,
    });
  }

  return items;
}

export function SampleRecord({
  sample,
  onRunOpen,
}: {
  sample: RegistrySample | null;
  onRunOpen?: (runId: string) => void;
}): React.ReactElement {
  if (!sample) {
    return (
      <div
        className="flex h-full min-h-48 flex-col items-center justify-center gap-2 p-6 text-center"
        data-slot="sample-record-empty"
      >
        <InboxIcon
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
        <p className="font-medium text-sm">No sample selected</p>
        <p className="max-w-52 text-muted-foreground text-xs leading-relaxed">
          Choose a row to see storage, aliquots, and the full chain of custody.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 print:max-w-3xl" data-slot="sample-record">
      <header className="min-w-0">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
          {sample.accession}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2 className="font-mono font-semibold text-lg">{sample.id}</h2>
          <StatusBadge
            label={STATUS_LABEL[sample.status]}
            size="sm"
            status={STATUS[sample.status]}
          />
        </div>
        <p className="mt-1 text-xs">
          <span className="font-medium">{sample.study}</span>{" "}
          <span className="text-muted-foreground">
            · {STUDY_TITLE[sample.study]}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">
          Subject{" "}
          <span className="font-mono text-foreground">{sample.subject}</span>
        </p>
      </header>

      {sample.quarantineReason ? (
        <div
          className="flex gap-2 rounded-lg border border-warning/40 bg-warning/8 p-2.5 text-xs leading-relaxed"
          data-slot="sample-quarantine"
        >
          <AlertTriangleIcon
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-warning"
          />
          <p>{sample.quarantineReason}</p>
        </div>
      ) : null}

      {sample.note ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {sample.note}
        </p>
      ) : null}

      <section aria-label="Storage" className="grid gap-2 border-t pt-3">
        <h3 className="font-medium text-xs text-muted-foreground">Storage</h3>
        <dl className="grid gap-1.5 text-[11px]">
          <Fact label="Type" value={sample.kind} />
          <Fact label="Location" mono value={formatLocation(sample.location)} />
          <Fact
            label="Volume"
            mono
            title={
              sample.volumeUl === null ? "Volume was not recorded" : undefined
            }
            value={formatVolume(sample.volumeUl)}
          />
          <Fact label="Custodian" value={sample.custodian} />
          <Fact
            label="Collected"
            mono
            value={formatDateTime(sample.collectedAt)}
          />
          <Fact
            label="Received"
            mono
            value={formatDateTime(sample.receivedAt)}
          />
          {sample.parentId ? (
            <Fact label="Parent" mono value={sample.parentId} />
          ) : null}
        </dl>
        <p className="text-[10px] text-muted-foreground">
          All times UTC. Volume is the amount remaining in the parent tube.
        </p>
      </section>

      <section aria-label="Linked runs" className="grid gap-2 border-t pt-3">
        <h3 className="font-medium text-xs text-muted-foreground">
          Linked runs
        </h3>
        {sample.runIds.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No runs have used this sample.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {sample.runIds.map((runId) => (
              <li key={runId}>
                {onRunOpen ? (
                  <Button
                    onClick={() => onRunOpen(runId)}
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    <span className="font-mono">{runId}</span>
                    <ArrowUpRightIcon />
                  </Button>
                ) : (
                  <span className="font-mono text-xs">{runId}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Aliquots" className="grid gap-2 border-t pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-medium text-xs text-muted-foreground">
            Aliquots
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
            {sample.aliquots.length}
          </p>
        </div>
        {sample.aliquots.length === 0 ? (
          <p className="text-muted-foreground text-xs">No aliquots recorded.</p>
        ) : (
          <ul className="grid gap-1.5">
            {sample.aliquots.map((aliquot) => (
              <li
                className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                key={aliquot.id}
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[11px]">
                    {aliquot.id}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {aliquot.location}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[10px] tabular-nums">
                    {formatVolume(aliquot.volumeUl)}
                  </span>
                  <StatusBadge
                    label={ALIQUOT_LABEL[aliquot.status]}
                    size="sm"
                    status={ALIQUOT_STATUS[aliquot.status]}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-label="Chain of custody"
        className="grid gap-2 border-t pt-3"
      >
        <h3 className="font-medium text-xs text-muted-foreground">
          Chain of custody
        </h3>
        <Timeline
          items={buildCustody(sample)}
          label={`Chain of custody for ${sample.id}`}
        />
      </section>
    </div>
  );
}

function Fact({
  label,
  value,
  mono = false,
  title,
}: {
  label: string;
  value: string;
  mono?: boolean;
  title?: string;
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-end", mono && "font-mono")} title={title}>
        {value}
      </dd>
    </div>
  );
}
