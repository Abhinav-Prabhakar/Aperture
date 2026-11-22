"use client";

import {
  GrowthCurve,
  type GrowthCurveData,
} from "@/registry/default/instruments/growth-curve";

const REPLICATES = [
  { id: "a1", label: "A1" },
  { id: "a2", label: "A2" },
  { id: "a3", label: "A3" },
] as const;

const TIMES = Array.from({ length: 25 }, (_, index) => index * 0.5);
const N0 = 0.019;
const CARRYING_CAPACITY = 1.62;
const GROWTH_RATE = 0.78;
const LAG = 1.6;
const MISSING: Record<string, number> = { a1: 11, a2: 19 };

function expected(t: number): number {
  if (t <= LAG) {
    return N0 * (1 + 0.006 * t);
  }
  return (
    CARRYING_CAPACITY /
    (1 + (CARRYING_CAPACITY / N0 - 1) * Math.exp(-GROWTH_RATE * (t - LAG)))
  );
}

function makeNoise(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return 1 + ((state >>> 8) / 0x1000000 - 0.5) * 0.08;
  };
}

function reading(t: number, noise: () => number): number {
  const value = expected(t) * noise();
  return Number(value.toFixed(value < 0.1 ? 4 : 3));
}

const NOISE = REPLICATES.map((_, index) =>
  makeNoise(0x1f123bb5 + index * 0x9e3779b9),
);

export const DEMO_GROWTH_CURVE: GrowthCurveData = {
  description:
    "Synthetic logistic growth with a lag, exponential phase, and stationary phase. Two missed reads keep a gap in the curve rather than a zero.",
  id: "EC-BW-LB-37",
  instrument: "Spark 10M",
  medium: "LB",
  name: "E. coli BW25113 growth",
  replicates: REPLICATES,
  source: "Synthetic · Aperture demo",
  strain: "BW25113",
  temperatureC: 37,
  timeUnit: "h",
  timepoints: TIMES.map((time, timeIndex) => ({
    time,
    values: REPLICATES.map((replicate, replicateIndex) =>
      MISSING[replicate.id] === timeIndex
        ? null
        : reading(time, NOISE[replicateIndex]),
    ),
  })),
  valueLabel: "OD600",
};

export function GrowthCurveDemo() {
  return <GrowthCurve data={DEMO_GROWTH_CURVE} />;
}
