"use client";

import {
  formatNumber,
  formatWithUncertainty,
  uncertaintyDecimals,
} from "@aperture/quantities";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Field, FieldLabel } from "@/registry/default/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/ui/input-group";

/** Symmetric error, or non-negative lower and upper half-widths. */
export type UncertaintyValue = number | { lower: number; upper: number };

export type UncertaintyInputProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> & {
  label: string;
  value: number | null;
  uncertainty: UncertaintyValue | null;
  onValueChange: (value: number | null) => void;
  onUncertaintyChange: (uncertainty: UncertaintyValue | null) => void;
  unit?: string;
  /** Fixed decimal places in the preview and on blur. */
  precision?: number;
  /** Name the kind of uncertainty: SD, SEM, 95% CI, range. */
  hint?: React.ReactNode;
  /** An external error from validation or the server. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
};

function parseNumeric(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function editable(value: number): string {
  return String(Number(value.toPrecision(12)));
}

export function UncertaintyInput({
  label,
  value,
  uncertainty,
  onValueChange,
  onUncertaintyChange,
  unit,
  precision,
  hint,
  error,
  required = false,
  disabled = false,
  id,
  className,
  ...props
}: UncertaintyInputProps): React.ReactElement {
  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const valueId = baseId;
  const uncertaintyId = `${baseId}-uncertainty`;

  const asymmetric = typeof uncertainty === "object" && uncertainty !== null;

  const [valueText, setValueText] = React.useState(
    value === null ? "" : editable(value),
  );
  const [errorText, setErrorText] = React.useState(
    typeof uncertainty === "number" ? editable(uncertainty) : "",
  );
  const [lowerText, setLowerText] = React.useState(
    asymmetric ? editable(uncertainty.lower) : "",
  );
  const [upperText, setUpperText] = React.useState(
    asymmetric ? editable(uncertainty.upper) : "",
  );
  const valueTextRef = React.useRef(valueText);
  const [touched, setTouched] = React.useState(false);

  valueTextRef.current = valueText;

  React.useEffect(() => {
    const parsed = parseNumeric(valueTextRef.current);
    if (value === null ? valueTextRef.current !== "" : parsed !== value) {
      const next = value === null ? "" : editable(value);
      valueTextRef.current = next;
      setValueText(next);
    }
  }, [value]);

  React.useEffect(() => {
    if (typeof uncertainty === "number") {
      setErrorText(editable(uncertainty));
    } else if (uncertainty === null) {
      setErrorText("");
    } else {
      setLowerText(editable(uncertainty.lower));
      setUpperText(editable(uncertainty.upper));
    }
  }, [uncertainty]);

  const parsedValue = parseNumeric(valueText);
  const parsedError = parseNumeric(errorText);
  const parsedLower = parseNumeric(lowerText);
  const parsedUpper = parseNumeric(upperText);

  const valueError =
    valueText.trim() === ""
      ? required
        ? "A value is required."
        : undefined
      : parsedValue === null
        ? "Enter a number."
        : undefined;

  const hasLower = lowerText.trim() !== "";
  const hasUpper = upperText.trim() !== "";
  const uncertaintyError = asymmetric
    ? hasLower !== hasUpper
      ? "Enter both bounds, or neither."
      : parsedLower !== null && parsedLower < 0
        ? "Lower error cannot be negative."
        : parsedUpper !== null && parsedUpper < 0
          ? "Upper error cannot be negative."
          : undefined
    : errorText.trim() !== "" && parsedError === null
      ? "Enter a number."
      : parsedError !== null && parsedError < 0
        ? "Uncertainty cannot be negative."
        : undefined;

  const shownValueError = touched ? valueError : undefined;
  const shownUncertaintyError = touched ? uncertaintyError : undefined;
  const shownError = error ?? shownValueError ?? shownUncertaintyError;

  function handleValueChange(next: string) {
    setValueText(next);
    valueTextRef.current = next;
    const parsedNext = parseNumeric(next);
    if (parsedNext !== null || next.trim() === "") {
      onValueChange(parsedNext);
    }
  }

  function handleSymmetricChange(next: string) {
    setErrorText(next);
    const parsedNext = parseNumeric(next);
    if (next.trim() === "") {
      onUncertaintyChange(null);
    } else if (parsedNext !== null && parsedNext >= 0) {
      onUncertaintyChange(parsedNext);
    }
  }

  function handleAsymmetricChange(next: { lower: string; upper: string }) {
    setLowerText(next.lower);
    setUpperText(next.upper);
    const lower = parseNumeric(next.lower);
    const upper = parseNumeric(next.upper);
    if (next.lower.trim() === "" && next.upper.trim() === "") {
      onUncertaintyChange(null);
    } else if (lower !== null && upper !== null && lower >= 0 && upper >= 0) {
      onUncertaintyChange({ lower, upper });
    }
  }

  let preview: string | null = null;
  if (
    value !== null &&
    uncertainty !== null &&
    !valueError &&
    !uncertaintyError
  ) {
    if (typeof uncertainty === "number") {
      preview = formatWithUncertainty(value, uncertainty, { precision });
    } else {
      const decimals = Math.max(
        uncertaintyDecimals(uncertainty.lower),
        uncertaintyDecimals(uncertainty.upper),
        precision ?? 0,
      );
      preview = `${formatNumber(value, { precision: decimals })} +${formatNumber(
        uncertainty.upper,
        { precision: decimals },
      )} / −${formatNumber(uncertainty.lower, { precision: decimals })}`;
    }
    if (unit) {
      preview = `${preview} ${unit}`;
    }
  }

  return (
    <div
      className={cn("grid gap-3", className)}
      data-slot="uncertainty-input"
      data-touched={touched ? "" : undefined}
      {...props}
    >
      <Field data-disabled={disabled ? "" : undefined}>
        <FieldLabel htmlFor={valueId}>{label}</FieldLabel>
        <InputGroup>
          <InputGroupInput
            aria-describedby={
              shownError
                ? `${baseId}-error`
                : hint
                  ? `${baseId}-hint`
                  : undefined
            }
            aria-invalid={shownError ? true : undefined}
            autoComplete="off"
            disabled={disabled}
            id={valueId}
            inputMode="decimal"
            onBlur={() => {
              setTouched(true);
              if (parsedValue !== null && precision !== undefined) {
                setValueText(formatNumber(parsedValue, { precision }));
              }
            }}
            onChange={(event) => handleValueChange(event.target.value)}
            placeholder="0.00"
            type="text"
            value={valueText}
          />
          {unit ? (
            <InputGroupAddon align="inline-end">
              <span className="font-mono text-muted-foreground text-xs">
                {unit}
              </span>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </Field>

      {asymmetric ? (
        <div className="grid grid-cols-2 gap-3">
          <Field data-disabled={disabled ? "" : undefined}>
            <FieldLabel htmlFor={`${uncertaintyId}-lower`}>
              {label} lower error
              {unit ? (
                <span className="font-normal text-muted-foreground">
                  ({unit})
                </span>
              ) : null}
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <span aria-hidden="true">−</span>
              </InputGroupAddon>
              <InputGroupInput
                autoComplete="off"
                disabled={disabled}
                id={`${uncertaintyId}-lower`}
                inputMode="decimal"
                onBlur={() => setTouched(true)}
                onChange={(event) =>
                  handleAsymmetricChange({
                    lower: event.target.value,
                    upper: upperText,
                  })
                }
                placeholder="0.00"
                type="text"
                value={lowerText}
              />
            </InputGroup>
          </Field>

          <Field data-disabled={disabled ? "" : undefined}>
            <FieldLabel htmlFor={`${uncertaintyId}-upper`}>
              {label} upper error
              {unit ? (
                <span className="font-normal text-muted-foreground">
                  ({unit})
                </span>
              ) : null}
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <span aria-hidden="true">+</span>
              </InputGroupAddon>
              <InputGroupInput
                autoComplete="off"
                disabled={disabled}
                id={`${uncertaintyId}-upper`}
                inputMode="decimal"
                onBlur={() => setTouched(true)}
                onChange={(event) =>
                  handleAsymmetricChange({
                    lower: lowerText,
                    upper: event.target.value,
                  })
                }
                placeholder="0.00"
                type="text"
                value={upperText}
              />
            </InputGroup>
          </Field>
        </div>
      ) : (
        <Field data-disabled={disabled ? "" : undefined}>
          <FieldLabel htmlFor={uncertaintyId}>
            {label} uncertainty
            {unit ? (
              <span className="font-normal text-muted-foreground">
                ({unit})
              </span>
            ) : null}
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <span aria-hidden="true">±</span>
            </InputGroupAddon>
            <InputGroupInput
              aria-describedby={
                shownUncertaintyError ? `${baseId}-error` : undefined
              }
              aria-invalid={shownUncertaintyError ? true : undefined}
              autoComplete="off"
              disabled={disabled}
              id={uncertaintyId}
              inputMode="decimal"
              onBlur={() => setTouched(true)}
              onChange={(event) => handleSymmetricChange(event.target.value)}
              placeholder="0.00"
              type="text"
              value={errorText}
            />
          </InputGroup>
        </Field>
      )}

      {shownError ? (
        <p
          className="text-destructive-foreground text-xs"
          id={`${baseId}-error`}
          role="alert"
        >
          {shownError}
        </p>
      ) : null}

      {hint ? (
        <p
          className="text-muted-foreground text-xs leading-relaxed"
          id={`${baseId}-hint`}
        >
          {hint}
        </p>
      ) : null}

      {preview ? (
        <p className="rounded-lg border bg-muted/32 px-2.5 py-1.5 text-muted-foreground text-xs">
          <span>Reported as </span>
          <span className="font-mono text-foreground tabular-nums">
            {preview}
          </span>
        </p>
      ) : null}
    </div>
  );
}
