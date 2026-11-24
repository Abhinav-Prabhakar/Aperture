"use client";

import type { CalibrationQcData } from "@/registry/default/instruments/calibration-qc";
import { CalibrationQcPanel } from "@/registry/default/instruments/calibration-qc";

const DATA: CalibrationQcData = {
  blanks: [112, 118, 105, 109, 114],
  controls: [
    { at: "2026-09-07", value: 1002 },
    { at: "2026-09-14", value: 996 },
    { at: "2026-09-21", value: 1008 },
    { at: "2026-09-28", value: 1010 },
    { at: "2026-10-05", value: 990 },
    { at: "2026-10-12", value: 1004 },
    { at: "2026-10-19", value: 1120, runId: "RUN-117" },
    { at: "2026-10-26", value: 1006 },
    { at: "2026-11-02", value: 998 },
    { at: "2026-11-09", value: 1012 },
  ],
  controlMean: 1000,
  controlSd: 30,
  id: "CAL-2026-11-04-AU5800",
  instrument: "AU5800 · lot 24C",
  method:
    "Six-point external standard curve, 1/x weighting not applied; blank SD from five independent blanks. Control limits from the 2026 stable period.",
  name: "Cortisol calibration and QC",
  responseUnit: "mAU·s",
  source: "Synthetic · Aperture demo",
  standards: [
    { level: 0, response: 118, uncertainty: 8 },
    { level: 0.5, response: 612, uncertainty: 9 },
    { level: 1, response: 1118, uncertainty: 10 },
    { level: 2, response: 2115, uncertainty: 11 },
    { level: 5, response: 5105, uncertainty: 14 },
    { level: 10, response: 10120, uncertainty: 18 },
  ],
  unit: "ng/mL",
  analyte: "Cortisol",
};

export function CalibrationQcDemo() {
  return (
    <CalibrationQcPanel
      data={DATA}
      description="Six standards, five blanks, and ten weekly controls. The 19 October control sits 4 SD above the mean, so the run is rejected even though the curve itself is excellent."
    />
  );
}
