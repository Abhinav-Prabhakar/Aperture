import { formatQuantity } from "./format";
import {
  combineUncertainties,
  propagatePower,
  propagateProduct,
  propagateQuotient,
  type Uncertainty,
} from "./uncertainty";
import type { Unit } from "./units";
import { assertCompatible, combineUnits, convert, parseUnit } from "./units";

export type MissingReason =
  | "not-collected"
  | "not-applicable"
  | "below-detection"
  | "redacted"
  | "pending";

export type Quantity = {
  value: number;
  unit: Unit;
  uncertainty?: Uncertainty;
};

export function quantity(
  value: number,
  unit: string | Unit,
  uncertaintyValue?: Uncertainty,
): Quantity {
  return {
    value,
    unit: parseUnit(unit),
    ...(uncertaintyValue ? { uncertainty: uncertaintyValue } : {}),
  };
}

export function withUncertainty(
  input: Quantity,
  uncertaintyValue: Uncertainty,
): Quantity {
  return { ...input, uncertainty: uncertaintyValue };
}

/** Convert a quantity, scaling its uncertainty but not applying the offset to it. */
export function convertQuantity(
  input: Quantity,
  target: string | Unit,
): Quantity {
  const unit = parseUnit(target);
  const value = convert(input.value, input.unit, unit);
  if (!input.uncertainty) {
    return { value, unit };
  }
  const scale = Math.abs(input.unit.factor / unit.factor);
  return {
    value,
    unit,
    uncertainty: {
      ...input.uncertainty,
      value: input.uncertainty.value * scale,
    },
  };
}

export function addQuantities(a: Quantity, b: Quantity): Quantity {
  assertCompatible(a.unit, b.unit, "add");
  const converted = convertQuantity(b, a.unit);
  const uncertaintyValue = combineUncertainties(
    a.uncertainty,
    converted.uncertainty,
  );
  return {
    value: a.value + converted.value,
    unit: a.unit,
    ...(uncertaintyValue ? { uncertainty: uncertaintyValue } : {}),
  };
}

export function subtractQuantities(a: Quantity, b: Quantity): Quantity {
  assertCompatible(a.unit, b.unit, "subtract");
  const converted = convertQuantity(b, a.unit);
  const uncertaintyValue = combineUncertainties(
    a.uncertainty,
    converted.uncertainty,
  );
  return {
    value: a.value - converted.value,
    unit: a.unit,
    ...(uncertaintyValue ? { uncertainty: uncertaintyValue } : {}),
  };
}

export function multiplyQuantities(a: Quantity, b: Quantity): Quantity {
  const value = a.value * b.value;
  const uncertaintyValue = propagateProduct(
    a.value,
    a.uncertainty?.value,
    b.value,
    b.uncertainty?.value,
  );
  return {
    value,
    unit: combineUnits(a.unit, b.unit, "multiply"),
    ...(uncertaintyValue !== undefined
      ? {
          uncertainty: {
            value: uncertaintyValue,
            kind: a.uncertainty?.kind ?? b.uncertainty?.kind ?? "unknown",
          },
        }
      : {}),
  };
}

export function divideQuantities(a: Quantity, b: Quantity): Quantity {
  const value = a.value / b.value;
  const uncertaintyValue = propagateQuotient(
    a.value,
    a.uncertainty?.value,
    b.value,
    b.uncertainty?.value,
  );
  return {
    value,
    unit: combineUnits(a.unit, b.unit, "divide"),
    ...(uncertaintyValue !== undefined
      ? {
          uncertainty: {
            value: uncertaintyValue,
            kind: a.uncertainty?.kind ?? b.uncertainty?.kind ?? "unknown",
          },
        }
      : {}),
  };
}

export function powerQuantity(a: Quantity, exponent: number): Quantity {
  const value = a.value ** exponent;
  const uncertaintyValue = propagatePower(
    a.value,
    a.uncertainty?.value,
    exponent,
  );
  return {
    value,
    unit: combineUnits(a.unit, a.unit, "power", exponent),
    ...(uncertaintyValue !== undefined
      ? {
          uncertainty: {
            value: uncertaintyValue,
            kind: a.uncertainty?.kind ?? "unknown",
          },
        }
      : {}),
  };
}

/** A compact "value ± uncertainty unit" string. */
export function displayQuantity(
  input: Quantity,
  options: { significantFigures?: number; precision?: number } = {},
): string {
  return formatQuantity(input, options);
}
