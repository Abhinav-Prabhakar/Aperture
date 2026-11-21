"use client";

import { formatNumber, formatWithUncertainty } from "@aperture/quantities";
import { CheckIcon, CopyIcon } from "lucide-react";
import type * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import { cn } from "@/registry/default/lib/utils";

export type ScientificNumberProps = Omit<
  React.ComponentProps<"span">,
  "children"
> & {
  /** The measured value. */
  value: number;
  /** Absolute uncertainty in the same unit. */
  uncertainty?: number;
  /** Display symbol, e.g. "mg/L". Rendered after the number. */
  unit?: string;
  /** Digits in the significand. Defaults to 3. */
  significantFigures?: number;
  /** Fixed decimal places. Wins over significantFigures. */
  precision?: number;
  /** "auto" switches to scientific notation at the edges. */
  notation?: "auto" | "scientific" | "fixed";
  /** Show a button that copies the full, unrounded value. */
  copyable?: boolean;
  /** Called after a successful copy. */
  onCopy?: (text: string) => void;
};

export function ScientificNumber({
  value,
  uncertainty,
  unit,
  significantFigures = 3,
  precision,
  notation = "auto",
  copyable = false,
  onCopy,
  className,
  ...props
}: ScientificNumberProps): React.ReactElement {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const display =
    uncertainty === undefined
      ? formatNumber(value, { notation, precision, significantFigures })
      : formatWithUncertainty(value, uncertainty, {
          notation,
          precision,
          significantFigures,
        });

  const full = [
    String(value),
    uncertainty === undefined ? null : `± ${uncertainty}`,
    unit,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={cn(
        "group inline-flex items-baseline gap-1.5 whitespace-nowrap tabular-nums",
        className,
      )}
      data-slot="scientific-number"
      data-unit={unit}
      data-value={value}
      {...props}
    >
      <span>{display}</span>
      {unit ? (
        <span className="font-normal text-[0.9em] text-muted-foreground">
          {unit}
        </span>
      ) : null}
      {copyable ? (
        <button
          aria-label={
            isCopied ? "Copied full precision" : "Copy full precision"
          }
          className="-my-1 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-64 outline-none transition-[opacity,background-color] hover:bg-accent hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            copyToClipboard(full);
            onCopy?.(full);
          }}
          type="button"
        >
          {isCopied ? (
            <CheckIcon aria-hidden="true" className="size-3" />
          ) : (
            <CopyIcon aria-hidden="true" className="size-3" />
          )}
        </button>
      ) : null}
    </span>
  );
}
