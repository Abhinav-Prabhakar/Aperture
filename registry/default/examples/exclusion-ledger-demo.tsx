"use client";

import type { LedgerEntry } from "@/registry/default/instruments/exclusion-ledger";
import { ExclusionLedger } from "@/registry/default/instruments/exclusion-ledger";

const ENTRIES: readonly LedgerEntry[] = [
  {
    action: "Registered the analysis extract",
    actor: "A. Prabhakar",
    at: "2026-11-02T09:12:00Z",
    id: "L-001",
    kind: "transformation",
    reason: "Raw instrument export received from the core lab",
    reasonCode: "INTAKE",
    reversible: true,
    rowsAfter: 48,
    rowsBefore: 48,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Removed duplicate records",
    actor: "A. Prabhakar",
    at: "2026-11-02T09:20:00Z",
    id: "L-002",
    kind: "exclusion",
    note: "Same subject, same draw time, byte-identical rows.",
    reason:
      "Re-export from the analyser produced two identical rows per sample",
    reasonCode: "DUP_ID",
    reversible: true,
    rowsAfter: 46,
    rowsBefore: 48,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Excluded haemolysed samples",
    actor: "R. Iyer",
    at: "2026-11-02T14:03:00Z",
    id: "L-003",
    kind: "exclusion",
    reason: "Haemolysis index above the assay's 3+ threshold",
    reasonCode: "HEM",
    reversible: false,
    rowsAfter: 44,
    rowsBefore: 46,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Log-transformed C-reactive protein",
    actor: "R. Iyer",
    at: "2026-11-03T08:41:00Z",
    id: "L-004",
    kind: "transformation",
    reason: "Right-skewed residuals; log scale chosen before model fitting",
    reasonCode: "LOG10",
    reversible: true,
    rowsAfter: 44,
    rowsBefore: 44,
    target: "crp",
  },
  {
    action: "Excluded participants without consent",
    actor: "S. Okafor",
    at: "2026-11-03T11:15:00Z",
    id: "L-005",
    kind: "exclusion",
    reason: "Secondary-use consent withdrawn before the analysis freeze",
    reasonCode: "CONSENT",
    reversible: false,
    rowsAfter: 42,
    rowsBefore: 44,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Imputed two missing glucose values",
    actor: "R. Iyer",
    at: "2026-11-04T10:02:00Z",
    id: "L-006",
    kind: "imputation",
    note: "Run median, 5.4 mmol/L. Sensitivity analysis without imputation is in the supplement.",
    reason: "Analyser consumed the sample before the glucose channel ran",
    reasonCode: "IMPUTE_MEDIAN",
    reversible: true,
    rowsAfter: 42,
    rowsBefore: 42,
    target: "glucose",
  },
  {
    action: "Excluded one outlier beyond 4 SD",
    actor: "R. Iyer",
    at: "2026-11-04T15:27:00Z",
    id: "L-007",
    kind: "exclusion",
    note: "Pre-specified rule; the value is 9.8 SD from the run mean.",
    reason: "Troponin value inconsistent with the assay's reportable range",
    reasonCode: "OUTLIER_4SD",
    reversible: true,
    rowsAfter: 41,
    rowsBefore: 42,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Converted creatinine units",
    actor: "A. Prabhakar",
    at: "2026-11-05T09:00:00Z",
    id: "L-008",
    kind: "conversion",
    reason: "Reporting convention for the manuscript: µmol/L to mg/dL",
    reasonCode: "UNIT_UMOL_MGDL",
    reversible: true,
    rowsAfter: 41,
    rowsBefore: 41,
    target: "creatinine",
  },
  {
    action: "Excluded a sample with no remaining volume",
    actor: "S. Okafor",
    at: "2026-11-05T16:44:00Z",
    id: "L-009",
    kind: "exclusion",
    reason: "Repeat measurement requested but the aliquot was exhausted",
    reasonCode: "VOLUME",
    reversible: false,
    rowsAfter: 40,
    rowsBefore: 41,
    target: "cohort-12/serum.csv",
  },
];

export function ExclusionLedgerDemo() {
  return (
    <ExclusionLedger
      description="Every step that changed the analysis set, in the order it happened. The header reconciles 48 raw rows to 40 included rows; a step that does not start where the previous one ended is called out."
      entries={ENTRIES}
      title="Cohort 12 analysis set"
    />
  );
}
