/**
 * Dimensions are vectors over the seven SI base quantities. A unit's
 * `dimension` is a human label; `dimensions` is what compatibility checks use.
 */
export const BASE_DIMENSIONS = [
  "length",
  "mass",
  "time",
  "temperature",
  "amount",
  "current",
  "luminous",
] as const;

export type BaseDimension = (typeof BASE_DIMENSIONS)[number];

export type DimensionVector = Record<BaseDimension, number>;

export type Dimension = BaseDimension | "dimensionless" | "derived";

export const DIMENSIONLESS: DimensionVector = {
  amount: 0,
  current: 0,
  length: 0,
  luminous: 0,
  mass: 0,
  temperature: 0,
  time: 0,
};

export function dimensionVector(
  partial: Partial<DimensionVector> = {},
): DimensionVector {
  return { ...DIMENSIONLESS, ...partial };
}

export function multiplyDimensions(
  a: DimensionVector,
  b: DimensionVector,
  power = 1,
): DimensionVector {
  const result = dimensionVector();
  for (const key of BASE_DIMENSIONS) {
    result[key] = a[key] + b[key] * power;
  }
  return result;
}

export function divideDimensions(
  a: DimensionVector,
  b: DimensionVector,
): DimensionVector {
  const result = dimensionVector();
  for (const key of BASE_DIMENSIONS) {
    result[key] = a[key] - b[key];
  }
  return result;
}

export function dimensionsEqual(
  a: DimensionVector,
  b: DimensionVector,
): boolean {
  return BASE_DIMENSIONS.every((key) => a[key] === b[key]);
}

export function isDimensionless(vector: DimensionVector): boolean {
  return BASE_DIMENSIONS.every((key) => vector[key] === 0);
}

/** A short label for a dimension vector, for UI and error messages. */
export function dimensionLabel(vector: DimensionVector): Dimension {
  if (isDimensionless(vector)) {
    return "dimensionless";
  }
  const base = BASE_DIMENSIONS.find(
    (key) =>
      vector[key] === 1 &&
      BASE_DIMENSIONS.every((other) => other === key || vector[other] === 0),
  );
  return base ?? "derived";
}
