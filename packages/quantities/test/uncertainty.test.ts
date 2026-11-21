import { describe, expect, it } from "vitest";
import {
  combineUncertainties,
  propagatePower,
  propagateProduct,
  propagateQuotient,
  propagateSum,
  relativeUncertainty,
  uncertainty,
} from "../src/uncertainty";

describe("uncertainty", () => {
  it("combines independent absolute uncertainties in quadrature", () => {
    const combined = combineUncertainties(uncertainty(0.1), uncertainty(0.2));
    expect(combined?.value).toBeCloseTo(Math.sqrt(0.05), 12);
  });

  it("sums independent terms in quadrature", () => {
    expect(
      propagateSum([
        { value: 10, uncertainty: uncertainty(0.1) },
        { value: 5, uncertainty: uncertainty(0.2) },
      ]),
    ).toBeCloseTo(0.223_606_797_749_789, 12);
  });

  it("propagates a product", () => {
    // f = a·b: σ² = (bσa)² + (aσb)²
    expect(propagateProduct(2, 0.1, 3, 0.2)).toBeCloseTo(0.5, 12);
  });

  it("propagates a quotient", () => {
    expect(propagateQuotient(6, 0.3, 2, 0.1)).toBeCloseTo(
      Math.hypot(0.15, 0.15),
      12,
    );
  });

  it("propagates a power", () => {
    expect(propagatePower(2, 0.1, 3)).toBeCloseTo(1.2, 12);
  });

  it("reports relative uncertainty", () => {
    expect(relativeUncertainty(10, 0.5)).toBe(0.05);
    expect(relativeUncertainty(0, 0.5)).toBe(Number.POSITIVE_INFINITY);
  });

  it("keeps the kind only when both terms agree", () => {
    expect(
      combineUncertainties(uncertainty(1, "sd"), uncertainty(2, "sd"))?.kind,
    ).toBe("sd");
    expect(
      combineUncertainties(uncertainty(1, "sd"), uncertainty(2, "sem"))?.kind,
    ).toBe("unknown");
  });
});
