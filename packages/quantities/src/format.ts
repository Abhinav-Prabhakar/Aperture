export type Notation = "auto" | "scientific" | "fixed";

export type NumberFormatOptions = {
  /** "auto" uses scientific notation below 1e-4 and at or above 1e6. */
  notation?: Notation;
  /** Digits in the significand. Ignored when `precision` is set. */
  significantFigures?: number;
  /** Fixed decimal places. Wins over significantFigures. */
  precision?: number;
};

const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function superscript(value: number): string {
  return String(value)
    .split("")
    .map((character) => SUPERSCRIPTS[character] ?? character)
    .join("");
}

function normalizeExponent(part: string): string {
  const exponent = Number(part.replace("+", ""));
  return superscript(exponent);
}

/**
 * Format a number for research display. Negative values use a true minus sign.
 * Trailing zeros are preserved: they communicate significant figures.
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const { notation = "auto", precision, significantFigures = 3 } = options;
  const sign = value < 0 ? "−" : "";
  const absolute = Math.abs(value);

  if (precision !== undefined) {
    return `${sign}${absolute.toFixed(precision)}`;
  }

  const useScientific =
    notation === "scientific" ||
    (notation === "auto" &&
      absolute !== 0 &&
      (absolute < 1e-4 || absolute >= 1e6));

  if (useScientific) {
    if (absolute === 0) {
      return `${sign}${(0).toFixed(Math.max(0, significantFigures - 1))}`;
    }
    const [mantissa, exponent] = absolute
      .toExponential(Math.max(0, significantFigures - 1))
      .split("e");
    return `${sign}${mantissa} × 10${normalizeExponent(exponent ?? "0")}`;
  }

  if (absolute === 0) {
    return significantFigures > 1
      ? `${sign}${(0).toFixed(significantFigures - 1)}`
      : `${sign}0`;
  }

  const rounded = Number(absolute.toPrecision(significantFigures));
  const exponent = Math.floor(Math.log10(rounded));
  const decimals = Math.max(0, significantFigures - 1 - exponent);
  return `${sign}${rounded.toFixed(decimals)}`;
}

/** Number of decimal places to show for an uncertainty, using 1–2 sig figs. */
export function uncertaintyDecimals(uncertainty: number): number {
  const absolute = Math.abs(uncertainty);
  if (absolute === 0 || !Number.isFinite(absolute)) {
    return 0;
  }
  const exponent = Math.floor(Math.log10(absolute));
  // Normalize the mantissa before flooring: 0.3 / 0.1 is 2.999… in binary.
  const mantissa = Number((absolute / 10 ** exponent).toPrecision(12));
  const firstDigit = Math.floor(mantissa);
  const sigFigs = firstDigit <= 2 ? 2 : 1;
  return Math.max(0, sigFigs - 1 - exponent);
}

export function formatWithUncertainty(
  value: number,
  uncertainty: number,
  options: NumberFormatOptions = {},
): string {
  if (uncertainty === 0) {
    return formatNumber(value, options);
  }

  const notation = options.notation ?? "auto";
  const absolute = Math.abs(value) || Math.abs(uncertainty);
  const useScientific =
    notation === "scientific" ||
    (notation === "auto" && (absolute < 1e-4 || absolute >= 1e6));

  if (useScientific) {
    const exponent = Math.floor(Math.log10(absolute));
    const scale = 10 ** exponent;
    const decimals = uncertaintyDecimals(uncertainty / scale);
    const scaledValue = formatNumber(value / scale, {
      ...options,
      notation: "fixed",
      precision: decimals,
    });
    const scaledUncertainty = formatNumber(uncertainty / scale, {
      ...options,
      notation: "fixed",
      precision: decimals,
    });
    return `(${scaledValue} ± ${scaledUncertainty}) × 10${superscript(exponent)}`;
  }

  const decimals = uncertaintyDecimals(uncertainty);
  const precision = options.precision ?? decimals;
  return `${formatNumber(value, { ...options, precision })} ± ${formatNumber(
    uncertainty,
    { ...options, precision },
  )}`;
}

export type QuantityFormatOptions = NumberFormatOptions & {
  showUnit?: boolean;
  showUncertainty?: boolean;
};

export function formatQuantity(
  quantity: {
    value: number;
    unit: { symbol: string };
    uncertainty?: { value: number };
  },
  options: QuantityFormatOptions = {},
): string {
  const { showUnit = true, showUncertainty = true, ...numberOptions } = options;

  const number =
    showUncertainty && quantity.uncertainty
      ? formatWithUncertainty(
          quantity.value,
          quantity.uncertainty.value,
          numberOptions,
        )
      : formatNumber(quantity.value, numberOptions);

  return showUnit ? `${number} ${quantity.unit.symbol}` : number;
}
