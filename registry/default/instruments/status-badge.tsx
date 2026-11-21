"use client";

import type * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Badge } from "@/registry/default/ui/badge";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@/registry/default/ui/tooltip";

export const STATUS_META = {
  idle: {
    label: "Idle",
    dot: "bg-muted-foreground",
    variant: "secondary",
  },
  running: {
    label: "Running",
    dot: "bg-info",
    variant: "info",
  },
  success: {
    label: "Complete",
    dot: "bg-success",
    variant: "success",
  },
  warning: {
    label: "Needs attention",
    dot: "bg-warning",
    variant: "warning",
  },
  error: {
    label: "Failed",
    dot: "bg-destructive",
    variant: "error",
  },
  offline: {
    label: "Offline",
    dot: "bg-muted-foreground/64",
    variant: "outline",
  },
} as const;

export type Status = keyof typeof STATUS_META;

const DOT = "inline-block size-1.5 shrink-0 rounded-full";

function resolveLabel(status: Status, label?: string): string {
  return label ?? STATUS_META[status].label;
}

export type StatusDotProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The state being reported. */
  status: Status;
  /** Accessible name. Required when the dot is the only visible signal. */
  label?: string;
};

export function StatusDot({
  status,
  label,
  className,
  ...props
}: StatusDotProps): React.ReactElement {
  const meta = STATUS_META[status];
  const name = label ?? meta.label;

  return (
    <span
      aria-label={name}
      className={cn("inline-flex items-center align-middle", className)}
      data-slot="status-dot"
      data-status={status}
      role="img"
      {...props}
    >
      <span aria-hidden="true" className={cn(DOT, meta.dot)} />
    </span>
  );
}

export type StatusBadgeProps = Omit<
  React.ComponentProps<typeof Badge>,
  "children" | "variant"
> & {
  /** The state being reported. */
  status: Status;
  /** Visible text. Defaults to the status name. */
  label?: string;
  /** Extra context, shown in a tooltip and exposed as the description. */
  description?: React.ReactNode;
  /** Announce changes to assistive technology. */
  announce?: boolean;
};

export function StatusBadge({
  status,
  label,
  description,
  announce = false,
  size = "default",
  className,
  ...props
}: StatusBadgeProps): React.ReactElement {
  const meta = STATUS_META[status];
  const text = resolveLabel(status, label);

  const badge = (
    <Badge
      className={cn("gap-1.5 font-normal", className)}
      data-slot="status-badge"
      data-status={status}
      role={announce ? "status" : undefined}
      size={size}
      variant={meta.variant}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          DOT,
          meta.dot,
          status === "running" && "motion-safe:animate-pulse",
        )}
        data-slot="status-badge-dot"
      />
      <span data-slot="status-badge-label">{text}</span>
    </Badge>
  );

  if (!description) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={badge} />
      <TooltipPopup>{description}</TooltipPopup>
    </Tooltip>
  );
}
