"use client";

import type { ComparisonRun } from "@/registry/default/instruments/run-comparison";
import { RunComparison } from "@/registry/default/instruments/run-comparison";

const BASELINE: ComparisonRun = {
  id: "RUN-2026-11-02-AU5800",
  instrument: "AU5800",
  label: "Run 118",
  metrics: {
    LOD: { unit: "ng/mL", value: 0.4 },
    carryover: { unit: "%", value: 0.08 },
    "peak area": { unit: "counts", value: 18420 },
    "plate count": { value: 12400 },
    "resolution (2:1)": { value: 1.8 },
    "retention time": { unit: "min", value: 6.42 },
    "tailing factor": { value: 1.12 },
  },
  parameters: {
    "column temperature": { unit: "°C", value: 35 },
    "detection wavelength": { unit: "nm", value: 214 },
    "flow rate": { unit: "mL/min", value: 0.3 },
    "gradient length": { unit: "min", value: 12 },
    "injection volume": { unit: "µL", value: 2 },
    "system pressure": { unit: "bar", value: 420 },
  },
  startedAt: "2026-11-02 08:14",
};

const CANDIDATE: ComparisonRun = {
  id: "RUN-2026-11-09-AU5800",
  instrument: "AU5800",
  label: "Run 119",
  metrics: {
    LOD: { unit: "ng/mL", value: 0.38 },
    "peak area": { unit: "counts", value: 19180 },
    "plate count": { value: 12150 },
    "resolution (2:1)": { value: 1.6 },
    "retention time": { unit: "min", value: 6.51 },
    "tailing factor": { value: 1.09 },
  },
  parameters: {
    "column temperature": { unit: "°C", value: 35 },
    "detection wavelength": { unit: "nm", value: 214 },
    "flow rate": { unit: "mL/min", value: 0.32 },
    "gradient length": { unit: "min", value: 14 },
    "injection volume": { unit: "µL", value: 2 },
    "system pressure": { unit: "psi", value: 6100 },
  },
  startedAt: "2026-11-09 08:11",
};

export function RunComparisonDemo() {
  return (
    <RunComparison
      description="The candidate run moves the flow rate and gradient, loses the carryover measurement, and reports pressure in psi instead of bar. The diff refuses to subtract across a unit change."
      runs={[BASELINE, CANDIDATE]}
      title="Method transfer check"
    />
  );
}
