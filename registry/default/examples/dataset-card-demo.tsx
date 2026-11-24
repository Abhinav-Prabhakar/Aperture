"use client";

import type { DatasetRecord } from "@/registry/default/instruments/dataset-card";
import { DatasetCard } from "@/registry/default/instruments/dataset-card";

const DATASET: DatasetRecord = {
  access: "restricted",
  accessNote:
    "De-identified participant data. Application and data-use agreement required; no re-identification attempts.",
  checksum: {
    algorithm: "sha256",
    value: "9f2c41b7a8d3e56c0b1f4a7d2e8c95b36f0a1d4c7e2b8f5903a6c1d4e7b2f8a5c",
  },
  contributors: ["R. Iyer", "S. Okafor", "M. Lindqvist"],
  createdAt: "2026-10-18",
  description:
    "Fasting serum chemistry, C-reactive protein, and troponin for 48 adults enrolled at two sites. One row per participant per draw; the analysis set is a separate derived file.",
  doi: "10.5281/zenodo.0000000",
  format: "CSV + data dictionary",
  id: "DS-COHORT12-SERUM",
  keywords: ["serum chemistry", "cohort", "troponin", "CRP"],
  license: "CC BY-NC 4.0",
  method:
    "Venepuncture at 08:00 after a 10 h fast. Analyser: AU5800, two-point calibration per run. Haemolysis index recorded; samples at 3+ excluded from the analysis set.",
  owner: "Prabhakar Lab",
  ownerAffiliation: "Department of Clinical Biochemistry",
  related: [
    {
      id: "DS-COHORT12-ANALYSIS",
      label: "Cohort 12 analysis set (v4)",
      relation: "documents",
    },
    {
      id: "RUN-2026-11-02-AU5800",
      label: "AU5800 run, 2 Nov 2026",
      relation: "derivedFrom",
    },
    {
      id: "DS-COHORT12-PROTOCOL",
      label: "Study protocol v2.1",
      relation: "partOf",
    },
  ],
  repository: "Zenodo",
  size: "412 KB",
  stage: "raw",
  title: "Cohort 12 serum chemistry, raw export",
  updatedAt: "2026-11-05",
  version: "1.2.0",
  warning:
    "Contains draw dates. Dates are shifted per participant before any public release.",
};

export function DatasetCardDemo() {
  return <DatasetCard dataset={DATASET} />;
}
