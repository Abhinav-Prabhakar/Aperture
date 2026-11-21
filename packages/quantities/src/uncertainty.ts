export type UncertaintyKind = "sd" | "sem" | "ci95" | "range" | "unknown";

export type Uncertainty = {
  /** Absolute uncertainty, in the same unit as the value. Always non-negative. */
  value: number;
  kind: UncertaintyKind;
};

export function uncertainty(
  value: number,
  kind: UncertaintyKind = "sd",
): Uncertainty {
  return { value: Math.abs(value), kind };
}

function combineKind(a: UncertaintyKind, b: UncertaintyKind): UncertaintyKind {
  return a === b ? a : "unknown";
}

/** Absolute uncertainties add in quadrature for independent measurements. */
export function combineUncertainties(
  a?: Uncertainty,
  b?: Uncertainty,
): Uncertainty | undefined {
  if (!a && !b) {
    return undefined;
  }
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  return {
    value: Math.hypot(a.value, b.value),
    kind: combineKind(a.kind, b.kind),
  };
}

/** Relative uncertainty as a fraction (0.05 = 5%). */
export function relativeUncertainty(
  value: number,
  uncertaintyValue: number,
): number {
  if (value === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(uncertaintyValue / value);
}

/**
 * Propagate for a sum or difference: σ² = Σσᵢ².
 * The caller is responsible for converting terms to the same unit first.
 */
export function propagateSum(
  terms: readonly { value: number; uncertainty?: Uncertainty }[],
): number | undefined {
  let variance = 0;
  let hasUncertainty = false;
  for (const term of terms) {
    if (term.uncertainty) {
      variance += term.uncertainty.value ** 2;
      hasUncertainty = true;
    }
  }
  return hasUncertainty ? Math.sqrt(variance) : undefined;
}

/** Propagate for a product: σ² = Σ((∂f/∂xᵢ)σᵢ)². */
export function propagateProduct(
  a: number,
  uncertaintyA: number | undefined,
  b: number,
  uncertaintyB: number | undefined,
): number | undefined {
  if (uncertaintyA === undefined && uncertaintyB === undefined) {
    return undefined;
  }
  const termA = uncertaintyA === undefined ? 0 : b * uncertaintyA;
  const termB = uncertaintyB === undefined ? 0 : a * uncertaintyB;
  return Math.hypot(termA, termB);
}

/** Propagate for a quotient a / b. */
export function propagateQuotient(
  a: number,
  uncertaintyA: number | undefined,
  b: number,
  uncertaintyB: number | undefined,
): number | undefined {
  if (uncertaintyA === undefined && uncertaintyB === undefined) {
    return undefined;
  }
  if (b === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const termA = uncertaintyA === undefined ? 0 : uncertaintyA / b;
  const termB = uncertaintyB === undefined ? 0 : (a * uncertaintyB) / (b * b);
  return Math.hypot(termA, termB);
}

/** Propagate for a power aⁿ. */
export function propagatePower(
  value: number,
  uncertaintyValue: number | undefined,
  exponent: number,
): number | undefined {
  if (uncertaintyValue === undefined) {
    return undefined;
  }
  return Math.abs(exponent * value ** (exponent - 1) * uncertaintyValue);
}
