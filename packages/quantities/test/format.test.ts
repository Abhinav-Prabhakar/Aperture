import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatQuantity,
  formatWithUncertainty,
  uncertaintyDecimals,
} from "../src/format";
import { quantity } from "../src/quantity";
import { uncertainty } from "../src/uncertainty";

describe("formatNumber", () => {
  it("keeps significant trailing zeros", () => {
    expect(formatNumber(12.4, { significantFigures: 3 })).toBe("12.4");
    expect(formatNumber(12, { significantFigures: 3 })).toBe("12.0");
    expect(formatNumber(0.01234, { significantFigures: 3 })).toBe("0.0123");
  });

  it("rounds to significant figures, not decimal places", () => {
    expect(formatNumber(1234, { significantFigures: 3 })).toBe("1230");
    expect(formatNumber(0.00001234, { significantFigures: 3 })).toBe(
      "1.23 × 10⁻⁵",
    );
  });

  it("uses a true minus sign", () => {
    expect(formatNumber(-0.01234, { significantFigures: 3 })).toBe("−0.0123");
  });

  it("honours explicit precision", () => {
    expect(formatNumber(0.052, { precision: 2 })).toBe("0.05");
    expect(formatNumber(2.5, { precision: 0 })).toBe("3");
  });

  it("switches to scientific notation at the edges", () => {
    expect(formatNumber(3.2e-6, { significantFigures: 3 })).toBe("3.20 × 10⁻⁶");
    expect(formatNumber(1.5e7, { significantFigures: 2 })).toBe("1.5 × 10⁷");
  });

  it("keeps zero legible", () => {
    expect(formatNumber(0, { significantFigures: 3 })).toBe("0.00");
  });
});

describe("uncertainty formatting", () => {
  it("uses one or two significant digits", () => {
    expect(uncertaintyDecimals(0.2)).toBe(2);
    expect(uncertaintyDecimals(0.05)).toBe(2);
    expect(uncertaintyDecimals(0.3)).toBe(1);
  });

  it("aligns the value and the uncertainty", () => {
    expect(formatWithUncertainty(12.4, 0.2)).toBe("12.40 ± 0.20");
    expect(formatWithUncertainty(12.4, 0.3)).toBe("12.4 ± 0.3");
  });

  it("factors a common exponent for small values", () => {
    expect(formatWithUncertainty(3.42e-6, 1.8e-7)).toBe("(3.42 ± 0.18) × 10⁻⁶");
  });

  it("appends the unit once", () => {
    expect(formatQuantity(quantity(12.4, "mg/L", uncertainty(0.2)))).toBe(
      "12.40 ± 0.20 mg/L",
    );
  });
});
