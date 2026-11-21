import { describe, expect, it } from "vitest";
import {
  addQuantities,
  convertQuantity,
  divideQuantities,
  multiplyQuantities,
  powerQuantity,
  quantity,
  subtractQuantities,
} from "../src/quantity";
import { uncertainty } from "../src/uncertainty";

describe("quantity", () => {
  it("converts a value and its uncertainty", () => {
    const inches = quantity(1, "in", uncertainty(0.01));
    const centimetres = convertQuantity(inches, "cm");
    expect(centimetres.value).toBeCloseTo(2.54, 12);
    expect(centimetres.uncertainty?.value).toBeCloseTo(0.0254, 12);
    expect(centimetres.unit.symbol).toBe("cm");
  });

  it("adds compatible quantities", () => {
    const total = addQuantities(
      quantity(10, "m", uncertainty(0.1)),
      quantity(500, "cm", uncertainty(20)),
    );
    expect(total.value).toBeCloseTo(15, 12);
    expect(total.unit.symbol).toBe("m");
    expect(total.uncertainty?.value).toBeCloseTo(Math.hypot(0.1, 0.2), 12);
  });

  it("subtracts compatible quantities", () => {
    const difference = subtractQuantities(
      quantity(10, "m", uncertainty(0.1)),
      quantity(5, "m", uncertainty(0.2)),
    );
    expect(difference.value).toBe(5);
    expect(difference.uncertainty?.value).toBeCloseTo(Math.hypot(0.1, 0.2), 12);
  });

  it("multiplies and names the resulting unit", () => {
    const area = multiplyQuantities(quantity(2, "m"), quantity(3, "m"));
    expect(area.value).toBe(6);
    expect(area.unit.symbol).toBe("m·m");
    expect(area.unit.dimensions.length).toBe(2);
  });

  it("divides and names the resulting unit", () => {
    const speed = divideQuantities(quantity(6, "m"), quantity(2, "s"));
    expect(speed.value).toBe(3);
    expect(speed.unit.symbol).toBe("m/s");
    expect(speed.unit.dimensions.time).toBe(-1);
  });

  it("raises a quantity to a power", () => {
    const volume = powerQuantity(quantity(2, "m"), 3);
    expect(volume.value).toBe(8);
    expect(volume.unit.dimensions.length).toBe(3);
  });

  it("rejects incompatible addition", () => {
    expect(() => addQuantities(quantity(1, "m"), quantity(1, "s"))).toThrow(
      /incompatible units/,
    );
  });
});
