import { CheckIcon, MinusIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/registry/default/lib/utils";

export type ProtocolStepStatus = "pending" | "active" | "complete" | "skipped";

export type ProtocolNote = {
  kind: "note" | "caution";
  text: React.ReactNode;
};

export type ProtocolStep = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Expected duration, e.g. "10 min" or "45 min at 120 V". */
  duration?: string;
  status: ProtocolStepStatus;
  note?: ProtocolNote;
};

export type ProtocolStepsProps = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  steps: readonly ProtocolStep[];
  /** Accessible name and visible heading. */
  label?: string;
  emptyLabel?: React.ReactNode;
};

const STATUS_LABEL: Record<ProtocolStepStatus, string | null> = {
  pending: null,
  active: "Active",
  complete: "Complete",
  skipped: "Skipped",
};

export function ProtocolSteps({
  steps,
  label = "Protocol",
  emptyLabel = "No steps defined.",
  className,
  ...props
}: ProtocolStepsProps): React.ReactElement {
  const complete = steps.filter((step) => step.status === "complete").length;

  return (
    <div
      className={cn("w-full", className)}
      data-slot="protocol-steps"
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium text-sm">{label}</h3>
        <p className="font-mono text-muted-foreground text-xs tabular-nums">
          {complete} / {steps.length} complete
        </p>
      </div>

      {steps.length === 0 ? (
        <p
          className="mt-3 rounded-lg border border-dashed px-4 py-8 text-center text-muted-foreground text-sm"
          data-slot="protocol-empty"
        >
          {emptyLabel}
        </p>
      ) : (
        <>
          <div
            aria-label={`${label} progress`}
            aria-valuemax={steps.length}
            aria-valuemin={0}
            aria-valuenow={complete}
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted"
            data-slot="protocol-progress"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-foreground motion-safe:transition-[width]"
              style={{
                width:
                  steps.length === 0
                    ? "0%"
                    : `${(complete / steps.length) * 100}%`,
              }}
            />
          </div>

          <ol aria-label={label} className="mt-5 grid">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const isActive = step.status === "active";
              const statusLabel = STATUS_LABEL[step.status];

              return (
                <li
                  aria-current={isActive ? "step" : undefined}
                  className="grid grid-cols-[1.75rem_1fr] gap-3"
                  data-slot="protocol-step"
                  data-status={step.status}
                  key={step.id}
                >
                  <div className="relative flex justify-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-1 mt-0.5 flex size-7 items-center justify-center rounded-full border font-mono text-xs tabular-nums",
                        step.status === "active" &&
                          "border-foreground bg-foreground text-background",
                        step.status === "complete" &&
                          "border-success/32 bg-success/8 text-success-foreground",
                        step.status === "skipped" &&
                          "border-border bg-muted text-muted-foreground",
                        step.status === "pending" &&
                          "border-border bg-background text-muted-foreground",
                      )}
                      data-slot="protocol-marker"
                    >
                      {step.status === "complete" ? (
                        <CheckIcon className="size-3.5" />
                      ) : step.status === "skipped" ? (
                        <MinusIcon className="size-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {isLast ? null : (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-8 start-1/2 w-px -translate-x-1/2 bg-border rtl:translate-x-1/2"
                      />
                    )}
                  </div>

                  <div className={cn("min-w-0", isLast ? "pb-0" : "pb-6")}>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h4
                        className={cn(
                          "font-medium text-sm leading-7",
                          step.status === "skipped" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {step.title}
                      </h4>
                      {step.duration ? (
                        <span className="font-mono text-muted-foreground text-xs tabular-nums">
                          {step.duration}
                        </span>
                      ) : null}
                      {statusLabel ? (
                        <span
                          className={cn(
                            "ms-auto text-xs",
                            step.status === "active"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {statusLabel}
                        </span>
                      ) : null}
                    </div>

                    {step.description ? (
                      <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    ) : null}

                    {step.note ? (
                      <p
                        className={cn(
                          "mt-2 rounded-md border-s-2 px-2.5 py-1.5 text-xs leading-relaxed",
                          step.note.kind === "caution"
                            ? "border-warning bg-warning/8 text-warning-foreground"
                            : "border-info bg-info/8 text-info-foreground",
                        )}
                        data-slot="protocol-note"
                      >
                        <span className="font-medium">
                          {step.note.kind === "caution" ? "Caution" : "Note"}
                        </span>
                        {" · "}
                        {step.note.text}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
