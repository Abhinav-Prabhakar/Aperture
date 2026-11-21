"use client";

import type * as React from "react";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import {
  REGISTRY_STATUSES,
  type RegistryFilters,
  SAMPLE_KINDS,
  STATUS_LABEL,
  STUDIES,
} from "./types";

export type FilterRailProps = {
  filters: RegistryFilters;
  onChange: (patch: Partial<RegistryFilters>) => void;
  onReset: () => void;
  activeCount: number;
  studyCounts: Record<"all" | (typeof STUDIES)[number], number>;
  kindCounts: Record<"all" | (typeof SAMPLE_KINDS)[number], number>;
  statusCounts: Record<"all" | (typeof REGISTRY_STATUSES)[number], number>;
};

export function FilterRail({
  filters,
  onChange,
  onReset,
  activeCount,
  studyCounts,
  kindCounts,
  statusCounts,
}: FilterRailProps): React.ReactElement {
  return (
    <aside
      aria-label="Filters"
      className="grid content-start gap-4 border-b p-3 lg:border-e lg:border-b-0 print:hidden"
      data-slot="sample-registry-filters"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium text-sm">Filters</h2>
        <Button
          disabled={activeCount === 0}
          onClick={onReset}
          size="xs"
          type="button"
          variant="ghost"
        >
          Reset
        </Button>
      </div>

      <Input
        aria-label="Filter samples"
        onChange={(event) => onChange({ query: event.target.value })}
        placeholder="Sample, accession, subject…"
        size="sm"
        type="search"
        value={filters.query}
      />

      <fieldset className="min-w-0">
        <legend className="mb-1.5 font-medium text-muted-foreground text-xs">
          Status
        </legend>
        <div className="flex flex-wrap gap-1 lg:grid">
          <FilterButton
            active={filters.status === "all"}
            count={statusCounts.all}
            label="All"
            onClick={() => onChange({ status: "all" })}
          />
          {REGISTRY_STATUSES.map((status) => (
            <FilterButton
              active={filters.status === status}
              count={statusCounts[status]}
              key={status}
              label={STATUS_LABEL[status]}
              onClick={() => onChange({ status })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-1.5 font-medium text-muted-foreground text-xs">
          Study
        </legend>
        <div className="flex flex-wrap gap-1 lg:grid">
          <FilterButton
            active={filters.study === "all"}
            count={studyCounts.all}
            label="All studies"
            onClick={() => onChange({ study: "all" })}
          />
          {STUDIES.map((study) => (
            <FilterButton
              active={filters.study === study}
              count={studyCounts[study]}
              key={study}
              label={study}
              onClick={() => onChange({ study })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-1.5 font-medium text-muted-foreground text-xs">
          Type
        </legend>
        <div className="flex flex-wrap gap-1 lg:grid">
          <FilterButton
            active={filters.kind === "all"}
            count={kindCounts.all}
            label="All types"
            onClick={() => onChange({ kind: "all" })}
          />
          {SAMPLE_KINDS.map((kind) => (
            <FilterButton
              active={filters.kind === kind}
              count={kindCounts[kind]}
              key={kind}
              label={kind}
              onClick={() => onChange({ kind })}
            />
          ))}
        </div>
      </fieldset>

      <p className="hidden text-muted-foreground text-xs leading-relaxed lg:block">
        Filters, sort, and the open sample are kept in the URL. Share the
        address to reproduce this view.
      </p>
    </aside>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <Button
      aria-pressed={active}
      className="justify-between gap-3 lg:w-full"
      onClick={onClick}
      size="xs"
      type="button"
      variant={active ? "secondary" : "ghost"}
    >
      <span className="truncate">{label}</span>
      <span className="font-mono text-muted-foreground text-xs tabular-nums">
        {count}
      </span>
    </Button>
  );
}
