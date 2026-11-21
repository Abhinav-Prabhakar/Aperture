import { describe, expect, it } from "vitest";
import { convert, isDimensionlessUnit, parseUnit } from "../src/units";

describe("units", () => {
  it("converts the international inch exactly", () => {
    // 1 in = 0.0254 m, by the 1959 international yard and pound agreement.
    expect(convert(1, "in", "m")).toBeCloseTo(0.0254, 12);
    expect(convert(12, "in", "ft")).toBeCloseTo(1, 12);
  });

  it("converts temperature scales with offsets", () => {
    // 0 °C = 273.15 K and 32 °F = 0 °C, by definition.
    expect(convert(0, "°C", "K")).toBeCloseTo(273.15, 10);
    expect(convert(32, "°F", "°C")).toBeCloseTo(0, 10);
    expect(convert(212, "°F", "°C")).toBeCloseTo(100, 10);
  });

  it("parses prefixed and compound units", () => {
    expect(parseUnit("kHz").factor).toBeCloseTo(1e3, 12);
    expect(parseUnit("µm").factor).toBeCloseTo(1e-6, 18);
    expect(parseUnit("um").factor).toBeCloseTo(1e-6, 18);
    expect(parseUnit("mg/L").factor).toBeCloseTo(1e-3, 15);
    expect(parseUnit("µg/mL").factor).toBeCloseTo(1e-3, 15);
    expect(isDimensionlessUnit(parseUnit("%"))).toBe(true);
  });

  it("converts concentration units", () => {
    // 1 mg/L = 1 µg/mL
    expect(convert(1, "mg/L", "µg/mL")).toBeCloseTo(1, 12);
    // 1 M = 1 mol/L
    expect(convert(1, "M", "mol/L")).toBeCloseTo(1, 12);
  });

  it("converts electronvolts with the exact SI definition", () => {
    // 1 eV = 1.602 176 634 × 10⁻¹⁹ J (exact).
    expect(convert(1, "eV", "J")).toBeCloseTo(1.602_176_634e-19, 30);
  });

  it("rejects incompatible dimensions", () => {
    expect(() => convert(1, "m", "s")).toThrow(/incompatible units/);
    expect(() => convert(1, "kg", "mg/L")).toThrow(/incompatible units/);
  });

  it("rejects unknown symbols", () => {
    expect(() => parseUnit("furlong")).toThrow(/Unknown unit/);
  });

  it("keeps the speed of light in SI", () => {
    expect(convert(299_792_458, "m/s", "m/s")).toBe(299_792_458);
  });
});
