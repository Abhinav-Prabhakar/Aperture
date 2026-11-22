"use client";

import {
  DoseResponseCurve,
  type DoseResponseData,
} from "@/registry/default/instruments/dose-response-curve";

const REPLICATES = [
  { id: "a1", label: "A1" },
  { id: "a2", label: "A2" },
  { id: "a3", label: "A3" },
] as const;

const DOSES = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30] as const;
const LOW_PLATEAU = 4;
const HIGH_PLATEAU = 99;
const IC50 = 0.42;
const HILL = 1.15;
const MISSING = { a2: 3 } as const;

function expected(dose: number): number {
  return (
    LOW_PLATEAU + (HIGH_PLATEAU - LOW_PLATEAU) / (1 + (dose / IC50) ** HILL)
  );
}

function makeJitter(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return ((state >>> 8) / 0x1000000 - 0.5) * 4;
  };
}

const jitter = makeJitter(0x5eed);

export const DEMO_DOSE_RESPONSE: DoseResponseData = {
  id: "AP17-HELA-72H",
  name: "Compound AP-17 viability",
  description:
    "Synthetic ten-point viability series for demonstration only. Not a real assay.",
  compound: "AP-17",
  cellLine: "HeLa",
  duration: "72 h",
  instrument: "Plate reader · luminescence",
  doseUnit: "µM",
  responseLabel: "Viability",
  responseUnit: "%",
  replicates: REPLICATES,
  points: DOSES.map((dose, doseIndex) => ({
    dose,
    values: REPLICATES.map((replicate) =>
      MISSING[replicate.id as keyof typeof MISSING] === doseIndex
        ? null
        : Number((expected(dose) + jitter()).toFixed(2)),
    ),
  })),
  source: "Synthetic demo data",
};

export function DoseResponseDemo() {
  return <DoseResponseCurve data={DEMO_DOSE_RESPONSE} />;
}
