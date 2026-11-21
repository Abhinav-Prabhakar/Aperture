import { describe, expect, it } from "vitest";
import {
  BASE_DIMENSIONS,
  dimensionLabel,
  dimensionsEqual,
  dimensionVector,
  divideDimensions,
  multiplyDimensions,
} from "../src/dimensions";

describe("dimensions", () => {
  it("has seven SI base dimensions", () => {
    expect(BASE_DIMENSIONS).toHaveLength(7);
  });

  it("labels base and dimensionless vectors", () => {
    expect(dimensionLabel(dimensionVector({ length: 1 }))).toBe("length");
    expect(dimensionLabel(dimensionVector())).toBe("dimensionless");
    expect(dimensionLabel(dimensionVector({ length: 1, time: -1 }))).toBe(
      "derived",
    );
  });

  it("combines vectors multiplicatively", () => {
    const velocity = divideDimensions(
      dimensionVector({ length: 1 }),
      dimensionVector({ time: 1 }),
    );
    const acceleration = divideDimensions(
      velocity,
      dimensionVector({ time: 1 }),
    );
    expect(acceleration).toMatchObject({ length: 1, time: -2 });
  });

  it("compares vectors by value, not identity", () => {
    expect(
      dimensionsEqual(
        dimensionVector({ mass: 1, length: 1 }),
        dimensionVector({ length: 1, mass: 1 }),
      ),
    ).toBe(true);
    expect(
      dimensionsEqual(
        dimensionVector({ mass: 1 }),
        dimensionVector({ mass: 2 }),
      ),
    ).toBe(false);
  });

  it("raises a dimension to a power", () => {
    const volume = multiplyDimensions(
      dimensionVector(),
      dimensionVector({ length: 1 }),
      3,
    );
    expect(volume.length).toBe(3);
  });
});
