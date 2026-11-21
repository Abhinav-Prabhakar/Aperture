import {
  type Dimension,
  type DimensionVector,
  dimensionLabel,
  dimensionsEqual,
  dimensionVector,
  divideDimensions,
  isDimensionless,
  multiplyDimensions,
} from "./dimensions";

export type Unit = {
  /** Display symbol: "mg/L", "kHz", "°C". */
  symbol: string;
  /** Human name: "milligram per litre". */
  name: string;
  /** Compatibility label. Compound units are "derived". */
  dimension: Dimension;
  /** SI base-vector used for compatibility. */
  dimensions: DimensionVector;
  /** Multiplicative factor to the canonical unit. */
  factor: number;
  /** Additive offset to the canonical unit (temperature scales). */
  offset?: number;
  aliases?: readonly string[];
};

export const SI_PREFIXES = {
  "": 1,
  Y: 1e24,
  Z: 1e21,
  E: 1e18,
  P: 1e15,
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  h: 1e2,
  da: 1e1,
  d: 1e-1,
  c: 1e-2,
  m: 1e-3,
  µ: 1e-6,
  u: 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
  a: 1e-18,
  z: 1e-21,
  y: 1e-24,
} as const;

export type Prefix = keyof typeof SI_PREFIXES;

function unit(
  symbol: string,
  name: string,
  dimensions: DimensionVector,
  factor = 1,
  offset?: number,
  aliases?: readonly string[],
): Unit {
  return {
    symbol,
    name,
    dimension: dimensionLabel(dimensions),
    dimensions,
    factor,
    ...(offset === undefined ? {} : { offset }),
    ...(aliases ? { aliases } : {}),
  };
}

const LENGTH = dimensionVector({ length: 1 });
const MASS = dimensionVector({ mass: 1 });
const TIME = dimensionVector({ time: 1 });
const TEMPERATURE = dimensionVector({ temperature: 1 });
const AMOUNT = dimensionVector({ amount: 1 });
const CURRENT = dimensionVector({ current: 1 });
const LUMINOUS = dimensionVector({ luminous: 1 });
const DIMENSIONLESS = dimensionVector();

const VOLUME = multiplyDimensions(LENGTH, LENGTH, 3);
const FORCE = divideDimensions(
  multiplyDimensions(MASS, LENGTH),
  multiplyDimensions(TIME, TIME),
);
const PRESSURE = divideDimensions(FORCE, multiplyDimensions(LENGTH, LENGTH));
const ENERGY = multiplyDimensions(FORCE, LENGTH);
const POWER = divideDimensions(ENERGY, TIME);
const FREQUENCY = divideDimensions(dimensionVector(), TIME);
const CHARGE = multiplyDimensions(CURRENT, TIME);
const VOLTAGE = divideDimensions(POWER, CURRENT);
const CAPACITANCE = divideDimensions(CHARGE, VOLTAGE);
const RESISTANCE = divideDimensions(VOLTAGE, CURRENT);
const CONDUCTANCE = divideDimensions(dimensionVector(), RESISTANCE);
const MAGNETIC_FLUX = multiplyDimensions(VOLTAGE, TIME);
const MAGNETIC_FIELD = divideDimensions(
  MAGNETIC_FLUX,
  multiplyDimensions(LENGTH, LENGTH),
);
const INDUCTANCE = divideDimensions(MAGNETIC_FLUX, CURRENT);
const ILLUMINANCE = divideDimensions(
  LUMINOUS,
  multiplyDimensions(LENGTH, LENGTH),
);
const ACTIVITY = divideDimensions(dimensionVector(), TIME);
const DOSE = divideDimensions(ENERGY, MASS);
const CATALYTIC = divideDimensions(AMOUNT, TIME);
const CONCENTRATION = divideDimensions(AMOUNT, VOLUME);

/**
 * Canonical units, keyed by symbol. The registry is intentionally small and
 * auditable; add units deliberately, with a source for the factor.
 */
export const UNITS: Record<string, Unit> = {};

function add(unitDefinition: Unit) {
  UNITS[unitDefinition.symbol] = unitDefinition;
  for (const alias of unitDefinition.aliases ?? []) {
    UNITS[alias] = unitDefinition;
  }
}

// Dimensionless
add(unit("1", "one", DIMENSIONLESS, 1, undefined, ["", "one"]));
add(unit("%", "percent", DIMENSIONLESS, 1e-2));
add(unit("ppm", "parts per million", DIMENSIONLESS, 1e-6));

// Length
add(unit("m", "metre", LENGTH, 1, undefined, ["metre", "meter"]));
add(unit("km", "kilometre", LENGTH, 1e3));
add(unit("cm", "centimetre", LENGTH, 1e-2));
add(unit("mm", "millimetre", LENGTH, 1e-3));
add(unit("µm", "micrometre", LENGTH, 1e-6, undefined, ["um", "micron"]));
add(unit("nm", "nanometre", LENGTH, 1e-9));
add(unit("Å", "ångström", LENGTH, 1e-10, undefined, ["angstrom"]));
add(unit("in", "inch", LENGTH, 0.0254, undefined, ["inch"]));
add(unit("ft", "foot", LENGTH, 0.3048, undefined, ["foot"]));
add(unit("yd", "yard", LENGTH, 0.9144));
add(unit("mi", "mile", LENGTH, 1609.344));
add(unit("au", "astronomical unit", LENGTH, 149_597_870_700));
add(unit("ly", "light-year", LENGTH, 9.460_730_472_580_8e15));
add(unit("pc", "parsec", LENGTH, 3.085_677_581_491_367e16));

// Mass
add(unit("kg", "kilogram", MASS, 1));
add(unit("g", "gram", MASS, 1e-3));
add(unit("mg", "milligram", MASS, 1e-6));
add(unit("µg", "microgram", MASS, 1e-9, undefined, ["ug"]));
add(unit("ng", "nanogram", MASS, 1e-12));
add(unit("t", "tonne", MASS, 1e3));
add(unit("lb", "pound", MASS, 0.453_592_37));
add(unit("oz", "ounce", MASS, 0.028_349_523_125));
add(
  unit("u", "unified atomic mass unit", MASS, 1.660_539_066_6e-27, undefined, [
    "Da",
    "dalton",
  ]),
);

// Time
add(unit("s", "second", TIME, 1, undefined, ["sec"]));
add(unit("ms", "millisecond", TIME, 1e-3));
add(unit("µs", "microsecond", TIME, 1e-6, undefined, ["us"]));
add(unit("ns", "nanosecond", TIME, 1e-9));
add(unit("min", "minute", TIME, 60));
add(unit("h", "hour", TIME, 3600, undefined, ["hr"]));
add(unit("d", "day", TIME, 86_400));
add(unit("yr", "year", TIME, 31_557_600, undefined, ["year"]));

// Temperature (canonical: kelvin)
add(unit("K", "kelvin", TEMPERATURE, 1));
add(unit("°C", "degree Celsius", TEMPERATURE, 1, 273.15, ["C", "degC"]));
add(
  unit("°F", "degree Fahrenheit", TEMPERATURE, 5 / 9, 273.15 - (32 * 5) / 9, [
    "F",
    "degF",
  ]),
);

// Amount and current
add(unit("mol", "mole", AMOUNT, 1));
add(unit("mmol", "millimole", AMOUNT, 1e-3));
add(unit("µmol", "micromole", AMOUNT, 1e-6, undefined, ["umol"]));
add(unit("nmol", "nanomole", AMOUNT, 1e-9));
add(unit("A", "ampere", CURRENT, 1));
add(unit("mA", "milliampere", CURRENT, 1e-3));
add(unit("µA", "microampere", CURRENT, 1e-6, undefined, ["uA"]));
add(unit("cd", "candela", LUMINOUS, 1));

// Derived mechanical and electrical units
add(unit("Hz", "hertz", FREQUENCY, 1));
add(unit("N", "newton", FORCE, 1));
add(unit("Pa", "pascal", PRESSURE, 1));
add(unit("kPa", "kilopascal", PRESSURE, 1e3));
add(unit("MPa", "megapascal", PRESSURE, 1e6));
add(unit("bar", "bar", PRESSURE, 1e5));
add(unit("atm", "atmosphere", PRESSURE, 101_325));
add(unit("J", "joule", ENERGY, 1));
add(unit("kJ", "kilojoule", ENERGY, 1e3));
add(unit("cal", "calorie", ENERGY, 4.184));
add(unit("kcal", "kilocalorie", ENERGY, 4184));
add(unit("eV", "electronvolt", ENERGY, 1.602_176_634e-19));
add(unit("W", "watt", POWER, 1));
add(unit("kW", "kilowatt", POWER, 1e3));
add(unit("C", "coulomb", CHARGE, 1));
add(unit("V", "volt", VOLTAGE, 1));
add(unit("mV", "millivolt", VOLTAGE, 1e-3));
add(unit("F", "farad", CAPACITANCE, 1));
add(unit("Ω", "ohm", RESISTANCE, 1, undefined, ["ohm"]));
add(unit("S", "siemens", CONDUCTANCE, 1));
add(unit("Wb", "weber", MAGNETIC_FLUX, 1));
add(unit("T", "tesla", MAGNETIC_FIELD, 1));
add(unit("H", "henry", INDUCTANCE, 1));
add(unit("lx", "lux", ILLUMINANCE, 1));
add(unit("Bq", "becquerel", ACTIVITY, 1));
add(unit("Gy", "gray", DOSE, 1));
add(unit("Sv", "sievert", DOSE, 1));
add(unit("kat", "katal", CATALYTIC, 1));

// Volume and concentration
add(unit("L", "litre", VOLUME, 1e-3, undefined, ["l", "liter", "litre"]));
add(unit("mL", "millilitre", VOLUME, 1e-6, undefined, ["ml"]));
add(unit("µL", "microlitre", VOLUME, 1e-9, undefined, ["uL", "ul"]));
add(unit("M", "molar", CONCENTRATION, 1e3, undefined, ["mol/L"]));
add(unit("mM", "millimolar", CONCENTRATION, 1));

function assertCompatible(a: Unit, b: Unit, context: string) {
  if (!dimensionsEqual(a.dimensions, b.dimensions)) {
    throw new Error(
      `${context}: incompatible units ${a.symbol} (${a.dimension}) and ${b.symbol} (${b.dimension})`,
    );
  }
}

function parseToken(token: string): Unit {
  const exact = UNITS[token];
  if (exact) {
    return exact;
  }

  const prefixes = Object.keys(SI_PREFIXES).sort(
    (a, b) => b.length - a.length,
  ) as Prefix[];

  for (const prefix of prefixes) {
    if (prefix === "" || !token.startsWith(prefix)) {
      continue;
    }
    const rest = token.slice(prefix.length);
    const base = UNITS[rest];
    if (!base) {
      continue;
    }
    const factor = SI_PREFIXES[prefix];
    return {
      ...base,
      symbol: token,
      name: `${base.name} (${prefix === "µ" ? "micro" : prefix} prefix)`,
      factor: base.factor * factor,
      offset: base.offset,
    };
  }

  throw new Error(`Unknown unit: ${token}`);
}

/** Resolve a symbol or alias to a Unit, including compound forms like mg/L. */
export function parseUnit(input: string | Unit): Unit {
  if (typeof input !== "string") {
    return input;
  }

  const symbol = input.trim();
  if (!symbol) {
    throw new Error("Unit symbol is empty");
  }

  const exact = UNITS[symbol];
  if (exact) {
    return exact;
  }

  const parts = symbol.split("/");
  if (parts.length === 2) {
    const numerator = parseToken(parts[0] as string);
    const denominator = parseToken(parts[1] as string);
    const dimensions = divideDimensions(
      numerator.dimensions,
      denominator.dimensions,
    );
    return {
      symbol: `${numerator.symbol}/${denominator.symbol}`,
      name: `${numerator.name} per ${denominator.name}`,
      dimension: dimensionLabel(dimensions),
      dimensions,
      factor: numerator.factor / denominator.factor,
    };
  }
  if (parts.length > 2) {
    throw new Error(`Unsupported unit expression: ${symbol}`);
  }

  return parseToken(symbol);
}

export function convert(
  value: number,
  from: string | Unit,
  to: string | Unit,
): number {
  const source = parseUnit(from);
  const target = parseUnit(to);
  assertCompatible(source, target, "convert");

  const canonical = value * source.factor + (source.offset ?? 0);
  return (canonical - (target.offset ?? 0)) / target.factor;
}

/** Build a synthetic unit for a product or quotient. */
export function combineUnits(
  left: Unit,
  right: Unit,
  operation: "multiply" | "divide" | "power",
  power = 1,
): Unit {
  if (operation === "power") {
    const dimensions = multiplyDimensions(
      dimensionVector(),
      left.dimensions,
      power,
    );
    return {
      symbol: `${left.symbol}^${power}`,
      name: `${left.name} to the power ${power}`,
      dimension: dimensionLabel(dimensions),
      dimensions,
      factor: left.factor ** power,
    };
  }

  const dimensions =
    operation === "multiply"
      ? multiplyDimensions(left.dimensions, right.dimensions)
      : divideDimensions(left.dimensions, right.dimensions);
  return {
    symbol:
      operation === "multiply"
        ? `${left.symbol}·${right.symbol}`
        : `${left.symbol}/${right.symbol}`,
    name:
      operation === "multiply"
        ? `${left.name} times ${right.name}`
        : `${left.name} per ${right.name}`,
    dimension: dimensionLabel(dimensions),
    dimensions,
    factor:
      operation === "multiply"
        ? left.factor * right.factor
        : left.factor / right.factor,
  };
}

export function isDimensionlessUnit(unit: Unit): boolean {
  return isDimensionless(unit.dimensions);
}

export { assertCompatible };
