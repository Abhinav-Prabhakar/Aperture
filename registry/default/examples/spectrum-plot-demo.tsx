"use client";

import {
  type SpectrumData,
  type SpectrumLine,
  SpectrumPlot,
} from "@/registry/default/instruments/spectrum-plot";

const LINES: readonly SpectrumLine[] = [
  {
    id: "h-beta",
    label: "Balmer β",
    species: "Hβ",
    wavelength: 486.133,
  },
  {
    id: "oiii-4959",
    label: "Forbidden",
    species: "[O III]",
    wavelength: 495.891,
  },
  {
    id: "oiii-5007",
    label: "Forbidden",
    species: "[O III]",
    wavelength: 500.684,
  },
  {
    id: "nii-6548",
    label: "Forbidden",
    species: "[N II]",
    wavelength: 654.805,
  },
  {
    id: "h-alpha",
    label: "Balmer α",
    species: "Hα",
    wavelength: 656.281,
  },
  {
    id: "nii-6583",
    label: "Forbidden",
    species: "[N II]",
    wavelength: 658.345,
  },
  {
    id: "sii-6716",
    label: "Forbidden",
    species: "[S II]",
    wavelength: 671.644,
  },
  {
    id: "sii-6731",
    label: "Forbidden",
    species: "[S II]",
    wavelength: 673.082,
  },
];

type LineStrength = {
  wavelength: number;
  amplitude: number;
  width: number;
};

const STRENGTHS: readonly LineStrength[] = [
  { amplitude: 92, wavelength: 486.133, width: 0.46 },
  { amplitude: 148, wavelength: 495.891, width: 0.44 },
  { amplitude: 49, wavelength: 500.684, width: 0.44 },
  { amplitude: 39, wavelength: 654.805, width: 0.42 },
  { amplitude: 224, wavelength: 656.281, width: 0.46 },
  { amplitude: 50, wavelength: 658.345, width: 0.42 },
  { amplitude: 33, wavelength: 671.644, width: 0.4 },
  { amplitude: 27, wavelength: 673.082, width: 0.4 },
];

function makeNoise(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) / 0x1000000;
  };
}

const RANDOM = makeNoise(0x5eed1a7e);

function gaussian(value: number, center: number, width: number): number {
  const z = (value - center) / width;
  return Math.exp(-0.5 * z * z);
}

function continuum(wavelength: number): number {
  return 17 + 0.018 * (wavelength - 460);
}

function reading(wavelength: number): number {
  let value = continuum(wavelength);
  for (const line of STRENGTHS) {
    value += line.amplitude * gaussian(wavelength, line.wavelength, line.width);
  }
  // Sum of two uniforms gives a deterministic, bounded approximation of noise.
  const noise = (RANDOM() + RANDOM() - 1) * 3.4;
  return Number((value + noise).toFixed(2));
}

const POINTS = Array.from({ length: 441 }, (_, index) => {
  const wavelength = 460 + index * 0.5;
  return {
    intensity: reading(wavelength),
    uncertainty: 1.4,
    wavelength,
  };
});

export const DEMO_SPECTRUM: SpectrumData = {
  description:
    "Synthetic long-slit spectrum with Hβ, the [O III] doublet, Hα with its [N II] satellites, and the [S II] pair. The [S II] lines sit close to the 0.5 nm sampling limit.",
  id: "M42-SLIT-3",
  instrument: "UVES-like echelle (synthetic)",
  intensityLabel: "Counts",
  intensityUnit: "a.u.",
  lines: LINES,
  mode: "emission",
  name: "Orion Nebula optical spectrum",
  points: POINTS,
  sample: "M42 · slit 3",
  source: "Synthetic · Aperture demo",
  wavelengthUnit: "nm",
};

export function SpectrumPlotDemo() {
  return (
    <SpectrumPlot
      data={DEMO_SPECTRUM}
      options={{ lineTolerance: 1, minSeparation: 1.2 }}
    />
  );
}
