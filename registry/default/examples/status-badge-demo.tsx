"use client";

import { useState } from "react";
import {
  STATUS_META,
  type Status,
  StatusBadge,
  StatusDot,
} from "@/registry/default/instruments/status-badge";
import { Button } from "@/registry/default/ui/button";

const CYCLE: Status[] = ["idle", "running", "success", "warning", "error"];

export function StatusBadgeDemo() {
  const [index, setIndex] = useState(1);
  const status = CYCLE[index];

  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <StatusBadge
            announce
            description="The plate reader is reporting live progress."
            label={status === "running" ? "Acquiring" : undefined}
            status={status}
          />
          <span className="text-muted-foreground text-xs">
            Plate reader · run 12
          </span>
        </div>
        <Button
          onClick={() => setIndex((value) => (value + 1) % CYCLE.length)}
          size="sm"
          variant="outline"
        >
          Advance
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {(Object.keys(STATUS_META) as Status[]).map((key) => (
          <span className="inline-flex items-center gap-2" key={key}>
            <StatusDot label={STATUS_META[key].label} status={key} />
            <span className="text-muted-foreground text-xs">
              {STATUS_META[key].label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
