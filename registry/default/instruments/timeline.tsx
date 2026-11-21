import type * as React from "react";
import {
  type Status,
  StatusDot,
} from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";

export type TimelineItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Display time, e.g. 09:12 or 21 Nov 09:12. */
  time?: string;
  /** Machine-readable timestamp. */
  dateTime?: string;
  /** Outcome of this step. Optional; a neutral event has no status. */
  status?: Status;
  /** Extra context: operator, instrument, sample count. */
  meta?: React.ReactNode;
};

export type TimelineProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: readonly TimelineItem[];
  /** Accessible name for the ordered list. */
  label?: string;
  emptyLabel?: React.ReactNode;
};

export function Timeline({
  items,
  label = "Timeline",
  emptyLabel = "No events yet.",
  className,
  ...props
}: TimelineProps): React.ReactElement {
  return (
    <div className={cn("w-full", className)} data-slot="timeline" {...props}>
      {items.length === 0 ? (
        <p
          className="rounded-lg border border-dashed px-4 py-8 text-center text-muted-foreground text-sm"
          data-slot="timeline-empty"
        >
          {emptyLabel}
        </p>
      ) : (
        <ol aria-label={label} className="grid">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                className="grid grid-cols-[1.5rem_1fr] gap-3"
                data-slot="timeline-item"
                key={item.id}
              >
                <div className="relative flex justify-center">
                  <span className="relative z-1 mt-1.5 flex size-3 items-center justify-center rounded-full bg-background">
                    {item.status ? (
                      <StatusDot status={item.status} />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-muted-foreground/48"
                      />
                    )}
                  </span>
                  {isLast ? null : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-3 start-1/2 w-px -translate-x-1/2 bg-border rtl:translate-x-1/2"
                    />
                  )}
                </div>

                <div className={cn("min-w-0", isLast ? "pb-0" : "pb-6")}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 className="font-medium text-sm leading-6">
                      {item.title}
                    </h3>
                    {item.time ? (
                      <time
                        className="font-mono text-muted-foreground text-xs tabular-nums"
                        dateTime={item.dateTime}
                      >
                        {item.time}
                      </time>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                  {item.meta ? (
                    <div className="mt-1.5 text-muted-foreground text-xs">
                      {item.meta}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
