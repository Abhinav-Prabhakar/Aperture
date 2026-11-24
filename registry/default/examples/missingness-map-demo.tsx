"use client";

import type {
  MissingnessCode,
  MissingnessColumn,
  MissingnessRow,
} from "@/registry/default/instruments/missingness-map";
import { MissingnessMap } from "@/registry/default/instruments/missingness-map";

const COLUMNS: readonly MissingnessColumn[] = [
  { id: "glucose", label: "Glucose" },
  { id: "creatinine", label: "Creatinine" },
  { id: "urea", label: "Urea" },
  { id: "crp", label: "CRP" },
  { id: "troponin", label: "Troponin I" },
  { id: "il6", label: "IL-6" },
  { id: "hba1c", label: "HbA1c" },
  { id: "consent", label: "Imaging consent" },
  { id: "biobank", label: "Biobank aliquot" },
];

const CODES: readonly MissingnessCode[] = [
  { code: "ND", kind: "missing", label: "Not determined" },
  { code: "HEM", kind: "missing", label: "Haemolysed sample" },
  { code: "QNS", kind: "missing", label: "Insufficient volume" },
  { code: "<LOD", kind: "censored", label: "Below detection limit" },
  { code: "N/A", kind: "notApplicable", label: "Visit not applicable" },
  {
    code: "NOT_COLLECTED",
    kind: "notCollected",
    label: "Assay not collected at this site",
  },
];

const ROWS: readonly MissingnessRow[] = [
  {
    id: "S-01",
    values: {
      biobank: "ND",
      consent: 1,
      creatinine: 78,
      crp: 2.1,
      glucose: 5.2,
      hba1c: 5.4,
      il6: 1.8,
      troponin: { kind: "censored" },
      urea: 5.1,
    },
  },
  {
    id: "S-02",
    values: {
      biobank: "QNS",
      consent: 1,
      creatinine: 104,
      crp: 8.4,
      glucose: 6.8,
      hba1c: 6.1,
      il6: "NOT_COLLECTED",
      troponin: { kind: "censored" },
      urea: 6.4,
    },
  },
  {
    id: "S-03",
    values: {
      biobank: "ND",
      consent: "N/A",
      creatinine: "HEM",
      crp: 3.2,
      glucose: 4.9,
      hba1c: 5.2,
      il6: "NOT_COLLECTED",
      troponin: { kind: "censored" },
      urea: "HEM",
    },
  },
  {
    id: "S-04",
    values: {
      biobank: "QNS",
      consent: 1,
      creatinine: 61,
      crp: 1.4,
      glucose: 11.4,
      hba1c: 7.8,
      il6: 2.4,
      troponin: { kind: "censored" },
      urea: 4.8,
    },
  },
  {
    id: "S-05",
    values: {
      biobank: "ND",
      consent: 1,
      creatinine: 88,
      crp: 5.6,
      glucose: "HEM",
      hba1c: "HEM",
      il6: 3.1,
      troponin: 0.03,
      urea: 5.9,
    },
  },
  {
    id: "S-06",
    values: {
      biobank: "ND",
      consent: "N/A",
      creatinine: 133,
      crp: 12.8,
      glucose: 7.1,
      hba1c: 6.6,
      il6: "NOT_COLLECTED",
      troponin: { kind: "censored" },
      urea: 8.2,
    },
  },
  {
    id: "S-07",
    values: {
      biobank: "QNS",
      consent: 1,
      creatinine: "HEM",
      crp: 2.8,
      glucose: 5.6,
      hba1c: 5.5,
      il6: 1.9,
      troponin: { kind: "censored" },
      urea: "HEM",
    },
  },
  {
    id: "S-08",
    values: {
      biobank: "ND",
      consent: 1,
      creatinine: 95,
      crp: "QNS",
      glucose: 6.2,
      hba1c: 5.9,
      il6: 2.2,
      troponin: { kind: "censored" },
      urea: 6.1,
    },
  },
  {
    id: "S-09",
    values: {
      biobank: "ND",
      consent: "N/A",
      creatinine: 71,
      crp: 1.9,
      glucose: 4.7,
      hba1c: 5.1,
      il6: "NOT_COLLECTED",
      troponin: { kind: "censored" },
      urea: 4.4,
    },
  },
  {
    id: "S-10",
    values: {
      biobank: "QNS",
      consent: 1,
      creatinine: 112,
      crp: 6.9,
      glucose: 8.3,
      hba1c: 6.8,
      il6: 3.8,
      troponin: 0.05,
      urea: 7.4,
    },
  },
  {
    id: "S-11",
    values: {
      biobank: "ND",
      consent: 1,
      creatinine: "ND",
      crp: 2.3,
      glucose: 5.9,
      hba1c: 5.7,
      il6: 2.7,
      troponin: { kind: "censored" },
      urea: "ND",
    },
  },
  {
    id: "S-12",
    values: {
      biobank: "QNS",
      consent: 1,
      creatinine: 84,
      crp: 4.1,
      glucose: 6.4,
      hba1c: 5.8,
      il6: 2.1,
      troponin: { kind: "censored" },
      urea: 5.3,
    },
  },
];

export function MissingnessMapDemo() {
  return (
    <MissingnessMap
      codes={CODES}
      columns={COLUMNS}
      description="Twelve samples across nine assays. Haemolysis takes out creatinine and urea together; IL-6 was never collected at this site. Censored troponin stays distinct from missing."
      rows={ROWS}
      title="Cohort 12 panel completeness"
    />
  );
}
