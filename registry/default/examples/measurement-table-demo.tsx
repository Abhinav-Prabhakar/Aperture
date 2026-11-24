"use client";

import type {
  MeasurementColumn,
  MeasurementRow,
} from "@/registry/default/instruments/measurement-table";
import { MeasurementTable } from "@/registry/default/instruments/measurement-table";

const COLUMNS: readonly MeasurementColumn[] = [
  {
    id: "glucose",
    label: "Glucose",
    precision: 1,
    uncertainty: { value: 0.15 },
    unit: "mmol/L",
  },
  {
    id: "creatinine",
    label: "Creatinine",
    missingCodes: [
      { code: "ND", label: "Not determined" },
      { code: "HEM", kind: "missing", label: "Haemolysed sample" },
    ],
    precision: 0,
    unit: "µmol/L",
  },
  {
    id: "egfr",
    label: "eGFR",
    precision: 0,
    unit: "mL/min/1.73 m²",
  },
  {
    detectionLimit: { label: "LoD", value: 0.01 },
    id: "troponin",
    label: "Troponin I",
    precision: 2,
    unit: "ng/L",
  },
  {
    id: "sampleType",
    label: "Sample",
    type: "category",
  },
];

const ROWS: readonly MeasurementRow[] = [
  {
    id: "S-1042",
    label: "S-1042",
    values: {
      creatinine: 78,
      egfr: 92,
      glucose: 5.2,
      sampleType: "Serum",
      troponin: 0.02,
    },
  },
  {
    id: "S-1043",
    label: "S-1043",
    values: {
      creatinine: { note: "Second draw", value: 104 },
      egfr: 71,
      glucose: { uncertainty: 0.4, value: 6.8 },
      sampleType: "Serum",
      troponin: { censored: { limit: 0.01 } },
    },
  },
  {
    id: "S-1044",
    label: "S-1044",
    values: {
      creatinine: { missing: "HEM" },
      egfr: 68,
      glucose: 4.9,
      sampleType: "Plasma",
      troponin: { flag: "warning", note: "Slightly haemolysed", value: 0.04 },
    },
  },
  {
    id: "S-1045",
    label: "S-1045",
    values: {
      creatinine: 61,
      egfr: 99,
      glucose: {
        flag: "fail",
        note: "Outside ±3 SD of the run mean",
        value: 11.4,
      },
      sampleType: "Serum",
      troponin: { censored: { limit: 0.01 } },
    },
  },
  {
    id: "S-1046",
    label: "S-1046",
    values: {
      creatinine: 88,
      egfr: 84,
      glucose: { missing: "ND" },
      sampleType: "Serum",
      troponin: 0.03,
    },
  },
  {
    id: "S-1047",
    label: "S-1047",
    values: {
      creatinine: 133,
      egfr: 52,
      glucose: 7.1,
      sampleType: "Serum",
      troponin: {
        censored: { limit: 0.01 },
        note: "Below the reporting limit",
      },
    },
  },
  {
    id: "S-1048",
    label: "S-1048",
    values: {
      creatinine: { missing: "ND" },
      egfr: 76,
      glucose: "pending",
      sampleType: "Plasma",
      troponin: 0.07,
    },
  },
  {
    id: "S-1049",
    label: "S-1049",
    values: {
      creatinine: 95,
      egfr: 79,
      glucose: 5.6,
      sampleType: "Serum",
      troponin: { censored: { limit: 0.01 } },
    },
  },
];

export function MeasurementTableDemo() {
  return (
    <MeasurementTable
      columns={COLUMNS}
      description="A synthetic serum panel. Creatinine is reported whole; glucose carries a method uncertainty; troponin below 0.01 ng/L stays censored rather than zero."
      rows={ROWS}
      title="Serum chemistry, cohort 12"
    />
  );
}
