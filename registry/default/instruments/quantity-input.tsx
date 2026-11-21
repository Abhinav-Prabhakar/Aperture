"use client";

import { convert, formatNumber } from "@aperture/quantities";
import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/ui/input-group";

export type QuantityInputProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** Visible label. Also used to build the accessible names. */
  label: string;
  /** The numeric value, or null when empty. */
  value: number | null;
  /** The current unit symbol, e.g. "mg/L". */
  unit: string;
  /** Called with the parsed value on every valid edit. */
  onValueChange: (value: number | null) => void;
  /** Called when a different unit is selected. */
  onUnitChange: (unit: string) => void;
  /** Units offered in the menu. The current unit is always included. */
  units?: readonly string[];
  /** Absolute uncertainty in the current unit. */
  uncertainty?: number | null;
  /** Provide to render the uncertainty field. */
  onUncertaintyChange?: (value: number | null) => void;
  /** Fixed decimal places used when the field loses focus. */
  precision?: number;
  /** Inclusive bounds. Out-of-range values are reported, not clamped. */
  min?: number;
  max?: number;
  /** Require a value. */
  required?: boolean;
  /** A short hint. Hidden while an error is shown. */
  hint?: React.ReactNode;
  /** An external error from validation or the server. */
  error?: string;
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

export function QuantityInput({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  units = [],
  uncertainty,
  onUncertaintyChange,
  precision,
  min,
  max,
  required = false,
  hint,
  error,
  disabled = false,
  id,
  className,
  ...props
}: QuantityInputProps): React.ReactElement {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const [text, setText] = React.useState(value === null ? "" : editable(value));
  const textRef = React.useRef(text);
  const [touched, setTouched] = React.useState(false);

  const [uncertaintyText, setUncertaintyText] = React.useState(
    uncertainty === null || uncertainty === undefined
      ? ""
      : editable(uncertainty),
  );
  const [uncertaintyTouched, setUncertaintyTouched] = React.useState(false);

  textRef.current = text;

  const unitOptions = React.useMemo(() => {
    const unique = new Set([unit, ...units]);
    return [...unique];
  }, [unit, units]);

  React.useEffect(() => {
    const parsed = parseNumeric(textRef.current);
    if (value === null ? textRef.current !== "" : parsed !== value) {
      const next = value === null ? "" : editable(value);
      textRef.current = next;
      setText(next);
    }
  }, [value]);

  React.useEffect(() => {
    setUncertaintyText(
      uncertainty === null || uncertainty === undefined
        ? ""
        : editable(uncertainty),
    );
  }, [uncertainty]);

  const parsed = parseNumeric(text);

  const rangeError =
    parsed !== null && min !== undefined && parsed < min
      ? `Must be at least ${min}.`
      : parsed !== null && max !== undefined && parsed > max
        ? `Must be at most ${max}.`
        : undefined;

  const localError =
    text.trim() === ""
      ? required
        ? "A value is required."
        : undefined
      : parsed === null
        ? "Enter a number."
        : rangeError;

  const shownError = error ?? (touched ? localError : undefined);

  const parsedUncertainty = parseNumeric(uncertaintyText);
  const uncertaintyError =
    uncertaintyText.trim() !== "" && parsedUncertainty === null
      ? "Enter a number."
      : parsedUncertainty !== null && parsedUncertainty < 0
        ? "Uncertainty cannot be negative."
        : undefined;
  const shownUncertaintyError = uncertaintyTouched
    ? uncertaintyError
    : undefined;

  function handleUnitChange(nextUnit: string) {
    if (nextUnit === unit) {
      return;
    }

    try {
      if (value !== null) {
        const converted = Number(
          convert(value, unit, nextUnit).toPrecision(12),
        );
        onValueChange(converted);
        textRef.current = editable(converted);
        setText(textRef.current);
      }
      if (
        uncertainty !== null &&
        uncertainty !== undefined &&
        onUncertaintyChange
      ) {
        const scale = Math.abs(
          convert(1, unit, nextUnit) - convert(0, unit, nextUnit),
        );
        onUncertaintyChange(Number((uncertainty * scale).toPrecision(12)));
      }
      onUnitChange(nextUnit);
    } catch {
      // Incompatible units are a programming error. Keep the previous unit.
    }
  }

  const describedBy =
    [shownError ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={cn("grid gap-3", className)}
      data-slot="quantity-input"
      data-touched={touched ? "" : undefined}
      {...props}
    >
      <Field data-disabled={disabled ? "" : undefined}>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <InputGroup>
          <InputGroupInput
            aria-describedby={describedBy}
            aria-invalid={shownError ? true : undefined}
            autoComplete="off"
            disabled={disabled}
            id={inputId}
            inputMode="decimal"
            onBlur={() => {
              setTouched(true);
              if (parsed !== null) {
                const next =
                  precision === undefined
                    ? editable(parsed)
                    : formatNumber(parsed, { precision });
                textRef.current = next;
                setText(next);
              }
            }}
            onChange={(event) => {
              const next = event.target.value;
              textRef.current = next;
              setText(next);
              const parsedNext = parseNumeric(next);
              if (parsedNext !== null || next.trim() === "") {
                onValueChange(parsedNext);
              }
            }}
            placeholder="0.00"
            type="text"
            value={text}
          />
          <InputGroupAddon align="inline-end" className="relative">
            <select
              aria-label={`${label} unit`}
              className="h-full cursor-pointer appearance-none bg-transparent pe-4 text-sm text-muted-foreground outline-none disabled:cursor-not-allowed"
              disabled={disabled}
              onChange={(event) => handleUnitChange(event.target.value)}
              value={unit}
            >
              {unitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronsUpDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute end-2 size-4 text-muted-foreground"
            />
          </InputGroupAddon>
        </InputGroup>
        {shownError ? (
          <p
            className="text-destructive-foreground text-xs"
            id={errorId}
            role="alert"
          >
            {shownError}
          </p>
        ) : hint ? (
          <FieldDescription id={hintId}>{hint}</FieldDescription>
        ) : null}
      </Field>

      {onUncertaintyChange ? (
        <Field data-disabled={disabled ? "" : undefined}>
          <FieldLabel htmlFor={`${inputId}-uncertainty`}>
            Uncertainty
            <span className="font-normal text-muted-foreground">({unit})</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <span aria-hidden="true">±</span>
            </InputGroupAddon>
            <InputGroupInput
              aria-describedby={
                shownUncertaintyError
                  ? `${inputId}-uncertainty-error`
                  : undefined
              }
              aria-invalid={shownUncertaintyError ? true : undefined}
              aria-label={`${label} uncertainty`}
              autoComplete="off"
              disabled={disabled}
              id={`${inputId}-uncertainty`}
              inputMode="decimal"
              onBlur={() => {
                setUncertaintyTouched(true);
                if (parsedUncertainty !== null) {
                  setUncertaintyText(editable(parsedUncertainty));
                }
              }}
              onChange={(event) => {
                const next = event.target.value;
                setUncertaintyText(next);
                const parsedNext = parseNumeric(next);
                if (parsedNext !== null || next.trim() === "") {
                  onUncertaintyChange(parsedNext);
                }
              }}
              placeholder="0.00"
              type="text"
              value={uncertaintyText}
            />
          </InputGroup>
          {shownUncertaintyError ? (
            <p
              className="text-destructive-foreground text-xs"
              id={`${inputId}-uncertainty-error`}
              role="alert"
            >
              {shownUncertaintyError}
            </p>
          ) : null}
        </Field>
      ) : null}
    </div>
  );
}
