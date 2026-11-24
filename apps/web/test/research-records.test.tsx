import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  type CalibrationQcData,
  CalibrationQcPanel,
  calibrationLimits,
  evaluateWestgard,
  fitLinearCalibration,
  summarizeCalibrationQc,
} from "@/registry/default/instruments/calibration-qc";
import {
  DatasetCard,
  type DatasetRecord,
  datasetChecklist,
  datasetCitation,
  datasetMetadataJson,
} from "@/registry/default/instruments/dataset-card";
import {
  ExclusionLedger,
  type LedgerEntry,
  ledgerCsv,
  ledgerJson,
  summarizeLedger,
} from "@/registry/default/instruments/exclusion-ledger";
import {
  formatMeasurementCell,
  isNumericMeasurementColumn,
  type MeasurementColumn,
  type MeasurementRow,
  MeasurementTable,
  measurementColumnType,
  measurementTableCsv,
  normalizeMeasurementCell,
  summarizeMeasurementColumns,
} from "@/registry/default/instruments/measurement-table";
import {
  DEFAULT_MISSINGNESS_CODES,
  type MissingnessColumn,
  MissingnessMap,
  type MissingnessRow,
  missingnessCsv,
  summarizeMissingness,
} from "@/registry/default/instruments/missingness-map";
import {
  manifestChecklist,
  manifestJson,
  manifestWarnings,
  ReproducibilityManifest,
  type ReproducibilityManifestData,
  reproduceCommand,
} from "@/registry/default/instruments/reproducibility-manifest";
import {
  type ComparisonRun,
  compareRuns,
  compareValue,
  comparisonCsv,
  comparisonJson,
  RunComparison,
} from "@/registry/default/instruments/run-comparison";
import {
  describeStatisticalResult,
  formatPValue,
  resultToText,
  resultWarnings,
  type StatisticalResult,
  StatisticalResultBlock,
} from "@/registry/default/instruments/statistical-result";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

const MEASUREMENT_COLUMNS: readonly MeasurementColumn[] = [
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
      { code: "HEM", label: "Haemolysed sample" },
      { code: "ND", label: "Not determined" },
    ],
    precision: 0,
    unit: "µmol/L",
  },
  {
    detectionLimit: { value: 0.01 },
    id: "troponin",
    label: "Troponin I",
    precision: 2,
    unit: "ng/L",
  },
  { id: "sample", label: "Sample", type: "category" },
];

const MEASUREMENT_ROWS: readonly MeasurementRow[] = [
  {
    id: "S-1",
    values: { creatinine: 78, glucose: 5.2, sample: "Serum", troponin: 0.02 },
  },
  {
    id: "S-2",
    values: {
      creatinine: { missing: "HEM" },
      glucose: { uncertainty: 0.4, value: 6.8 },
      sample: "Serum",
      troponin: { censored: { limit: 0.01 } },
    },
  },
  {
    id: "S-3",
    values: {
      creatinine: 95,
      glucose: "pending",
      sample: { flag: "fail", note: "Wrong tube", value: "Plasma" },
      troponin: 0.03,
    },
  },
];

describe("measurement table helpers", () => {
  it("resolves values, uncertainty, codes, censoring, and invalid strings", () => {
    const glucose = MEASUREMENT_COLUMNS[0];
    const creatinine = MEASUREMENT_COLUMNS[1];
    const troponin = MEASUREMENT_COLUMNS[2];

    expect(
      normalizeMeasurementCell(glucose, { uncertainty: 0.4, value: 6.8 }),
    ).toMatchObject({
      numeric: 6.8,
      state: "value",
      uncertainty: 0.4,
    });
    expect(
      normalizeMeasurementCell(creatinine, { missing: "HEM" }),
    ).toMatchObject({ code: "HEM", state: "missing" });
    expect(
      normalizeMeasurementCell(troponin, { censored: { limit: 0.01 } }),
    ).toMatchObject({ limit: 0.01, numeric: null, state: "censored" });
    expect(normalizeMeasurementCell(glucose, "pending")).toMatchObject({
      state: "invalid",
      text: "pending",
    });
    expect(normalizeMeasurementCell(glucose, null).state).toBe("empty");
  });

  it("infers a column type from the unit and detects numeric columns", () => {
    expect(measurementColumnType(MEASUREMENT_COLUMNS[0])).toBe("quantity");
    expect(measurementColumnType({ id: "count", label: "Count" })).toBe(
      "number",
    );
    expect(measurementColumnType(MEASUREMENT_COLUMNS[3])).toBe("category");
    expect(isNumericMeasurementColumn(MEASUREMENT_COLUMNS[2])).toBe(true);
    expect(isNumericMeasurementColumn(MEASUREMENT_COLUMNS[3])).toBe(false);
  });

  it("counts present, missing, censored, invalid, and flagged cells", () => {
    const summary = summarizeMeasurementColumns(
      MEASUREMENT_COLUMNS,
      MEASUREMENT_ROWS,
    );

    expect(summary).toMatchObject({
      cells: 12,
      censored: 1,
      columns: 4,
      flagged: 1,
      invalid: 1,
      missing: 1,
      present: 9,
      rows: 3,
    });
    expect(summary.columnsWithoutUnit).toEqual([]);
    expect(summary.perColumn[1]).toMatchObject({ missing: 1, present: 2 });
  });

  it("formats censored values with the operator and precision", () => {
    const troponin = MEASUREMENT_COLUMNS[2];
    const cell = normalizeMeasurementCell(troponin, {
      censored: { limit: 0.01 },
    });

    expect(formatMeasurementCell(troponin, cell)).toBe("< 0.01");
  });

  it("exports units, uncertainty, codes, and flags", () => {
    const csv = measurementTableCsv(
      MEASUREMENT_COLUMNS,
      MEASUREMENT_ROWS,
      "Sample",
    );
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "Sample,Glucose [mmol/L],Glucose uncertainty [mmol/L],Creatinine [µmol/L],Troponin I [ng/L],Sample,Flags",
    );
    expect(lines[2]).toBe("S-2,6.8,0.4,HEM,<0.01,Serum,");
    expect(lines[3]).toBe("S-3,pending,,95,0.03,Plasma,sample=fail");
  });
});

describe("MeasurementTable", () => {
  it("renders declared units, uncertainty, and coded missing values", () => {
    render(
      <MeasurementTable
        columns={MEASUREMENT_COLUMNS}
        rows={MEASUREMENT_ROWS}
        title="Serum panel"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Serum panel", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 records")).toBeInTheDocument();
    expect(screen.getByText("1 missing")).toBeInTheDocument();
    expect(screen.getByText("1 censored")).toBeInTheDocument();
    expect(screen.getByText("1 unparsed")).toBeInTheDocument();
    expect(screen.getAllByText("HEM").length).toBeGreaterThan(0);
    expect(screen.getByText("±0.4")).toBeInTheDocument();
  });

  it("filters to incomplete rows and exports the full table", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(
      <MeasurementTable
        columns={MEASUREMENT_COLUMNS}
        onExport={onExport}
        rows={MEASUREMENT_ROWS}
      />,
    );

    expect(screen.getByText("S-1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Needs review" }));
    expect(screen.queryByText("S-1")).not.toBeInTheDocument();
    expect(screen.getByText("S-2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport.mock.calls[0][0]).toContain(
      "Glucose [mmol/L],Glucose uncertainty [mmol/L]",
    );
  });

  it("renders an explicit empty state", () => {
    render(<MeasurementTable columns={[]} rows={[]} />);

    expect(
      screen.getByText(
        "No measurements. Pass columns and rows to render the table.",
      ),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MeasurementTable
        columns={MEASUREMENT_COLUMNS}
        rows={MEASUREMENT_ROWS}
        title="Serum panel"
      />,
    );
    await expectNoViolations(container);
  });
});

const LEDGER_ENTRIES: readonly LedgerEntry[] = [
  {
    action: "Excluded haemolysed samples",
    actor: "R. Iyer",
    at: "2026-11-02T14:03:00Z",
    id: "L-002",
    kind: "exclusion",
    reason: "Haemolysis index above 3+",
    reasonCode: "HEM",
    reversible: false,
    rowsAfter: 42,
    rowsBefore: 44,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Excluded initial records",
    actor: "R. Iyer",
    at: "2026-11-01T09:00:00Z",
    id: "L-001",
    kind: "exclusion",
    reason: "Duplicate draw",
    reasonCode: "DUP",
    reversible: false,
    rowsAfter: 44,
    rowsBefore: 48,
    target: "cohort-12/serum.csv",
  },
  {
    action: "Log-transformed creatinine",
    actor: "S. Okafor",
    at: "2026-11-03T10:00:00Z",
    id: "L-003",
    kind: "transformation",
    reason: "Right-skewed distribution",
    reasonCode: "LOG",
    reversible: true,
    rowsAfter: 42,
    rowsBefore: 42,
    target: "cohort-12/analysis.csv",
  },
  {
    action: "Excluded one 4 SD outlier",
    actor: "S. Okafor",
    at: "2026-11-04T11:00:00Z",
    id: "L-004",
    kind: "exclusion",
    reason: "Outside the pre-registered 4 SD rule",
    reasonCode: "OUTLIER",
    reversible: true,
    rowsAfter: 40,
    rowsBefore: 42,
    target: "cohort-12/analysis.csv",
  },
];

describe("exclusion ledger helpers", () => {
  it("reconciles counts by time and groups exclusions by reason", () => {
    const summary = summarizeLedger(LEDGER_ENTRIES);

    expect(summary).toMatchObject({
      added: 0,
      entries: 4,
      excluded: 3,
      included: 40,
      raw: 48,
      reconciled: true,
      removed: 8,
      transformed: 1,
    });
    expect(summary.gap).toBeNull();
    expect(summary.reasons.map((reason) => reason.code)).toEqual([
      "DUP",
      "HEM",
      "OUTLIER",
    ]);
  });

  it("reports the first gap in the chain", () => {
    const summary = summarizeLedger([
      LEDGER_ENTRIES[1],
      { ...LEDGER_ENTRIES[2], rowsBefore: 43 },
    ]);

    expect(summary.reconciled).toBe(false);
    expect(summary.gap).toEqual({ expected: 44, found: 43, index: 1 });
  });

  it("exports chronologically, not in display order", () => {
    const csv = ledgerCsv(LEDGER_ENTRIES);
    const rows = csv.split("\n");

    expect(rows[0]).toContain("reason_code");
    expect(rows[1].startsWith("L-001,")).toBe(true);
    expect(rows[2].startsWith("L-002,")).toBe(true);
    expect(JSON.parse(ledgerJson(LEDGER_ENTRIES)).summary).toMatchObject({
      included: 40,
      raw: 48,
    });
  });
});

describe("ExclusionLedger", () => {
  it("shows the reconciliation and filters by kind", async () => {
    const user = userEvent.setup();
    render(
      <ExclusionLedger
        entries={LEDGER_ENTRIES}
        title="Cohort 12 analysis set"
      />,
    );

    expect(
      screen.getByText(
        /Counts reconcile: 48 − 8 \+ 0 = 40\. Every step starts where the previous one ended\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Why rows left")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Transformation" }));
    expect(
      screen.queryByText("Excluded haemolysed samples"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Log-transformed creatinine")).toBeInTheDocument();
  });

  it("warns when the chain does not reconcile", () => {
    render(
      <ExclusionLedger
        entries={[LEDGER_ENTRIES[1], { ...LEDGER_ENTRIES[2], rowsBefore: 43 }]}
      />,
    );

    expect(
      screen.getByText(
        /The chain does not reconcile\. Entry 2 starts at 43 rows/,
      ),
    ).toBeInTheDocument();
  });

  it("exports CSV and JSON through one callback", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<ExclusionLedger entries={LEDGER_ENTRIES} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "JSON" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(JSON.parse(onExport.mock.calls[0][0].json).entries).toHaveLength(4);
    expect(onExport.mock.calls[0][0].csv).toContain("L-001");

    await user.click(screen.getByRole("button", { name: "Export ledger" }));
    expect(onExport).toHaveBeenCalledTimes(2);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ExclusionLedger
        entries={LEDGER_ENTRIES}
        title="Cohort 12 analysis set"
      />,
    );
    await expectNoViolations(container);
  });
});

const RESULT: StatisticalResult = {
  alpha: 0.05,
  assumptions: [
    {
      detail: "Shapiro–Wilk p = 0.18",
      name: "Residual normality",
      status: "met",
    },
    { name: "No unmeasured confounding", status: "notChecked" },
  ],
  correction: "Holm–Bonferroni, 4 comparisons",
  effectSize: { label: "Cohen's d", value: 0.71 },
  estimate: 0.62,
  interval: { level: 95, lower: 0.34, upper: 0.9 },
  method: "Linear model with batch as a fixed effect; HC3 errors.",
  n: 48,
  p: 0.00011,
  precision: 2,
  statistic: { df: "36.4", label: "t", value: 4.31 },
  test: "Welch two-sample t-test",
  unit: "mmol/L",
  warning: "Observational contrast. The estimate is adjusted, not causal.",
};

describe("statistical result helpers", () => {
  it("never prints p = 0 and rejects an out-of-range p", () => {
    expect(formatPValue(0)).toBe("p < 0.001");
    expect(formatPValue(0.00099)).toBe("p < 0.001");
    expect(formatPValue(0.04)).toBe("p = 0.040");
    expect(formatPValue(0.5)).toBe("p = 0.50");
    expect(formatPValue(Number.NaN)).toBe("p invalid");
    expect(formatPValue(1.2)).toBe("p invalid");
  });

  it("warns when the interval and p-value disagree", () => {
    const warnings = resultWarnings({
      ...RESULT,
      interval: { level: 95, lower: -0.1, upper: 0.9 },
      p: 0.001,
    });

    expect(warnings).toContain(
      "The interval includes the null value while p < α. Report both and do not claim a direction from p alone.",
    );
    expect(
      resultWarnings({
        ...RESULT,
        interval: { level: 95, lower: 0, upper: 0.5 },
      }),
    ).toContain("The interval does not contain the estimate.");
    expect(resultWarnings({ ...RESULT, n: 0 })).toContain(
      "n is missing or zero. A result without n is not reportable.",
    );
  });

  it("describes the estimate, interval, n, test, and effect size", () => {
    const sentence = describeStatisticalResult(RESULT, "Mean difference");

    expect(sentence).toContain("Mean difference 0.62 mmol/L");
    expect(sentence).toContain("95% confidence interval 0.34 to 0.90 mmol/L");
    expect(sentence).toContain("n = 48");
    expect(sentence).toContain("p < 0.001");
    expect(sentence).toContain("Cohen's d 0.71");
    expect(resultToText(RESULT, "Mean difference")).toContain(
      "Assumptions: Residual normality (met); No unmeasured confounding (notChecked).",
    );
  });
});

describe("StatisticalResultBlock", () => {
  it("renders the estimate, p-value, and assumption states", () => {
    render(
      <StatisticalResultBlock
        estimateLabel="Mean difference"
        result={RESULT}
        title="Treatment vs control, week 12"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Treatment vs control, week 12",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("p < 0.001").length).toBeGreaterThan(0);
    expect(screen.getByText("0.34 to 0.90")).toBeInTheDocument();
    expect(screen.getByText("1/2 met")).toBeInTheDocument();
    expect(screen.getByText(/Not checked/)).toBeInTheDocument();
    expect(screen.getByText(/Observational contrast/)).toBeInTheDocument();
  });

  it("copies a complete result sentence", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <StatisticalResultBlock
        estimateLabel="Mean difference"
        result={RESULT}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy result" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("n = 48");
    expect(writeText.mock.calls[0][0]).toContain("Assumptions:");
  });

  it("renders an explicit empty state", () => {
    render(
      <StatisticalResultBlock
        estimateLabel="Mean difference"
        result={{ ...RESULT, estimate: Number.NaN }}
      />,
    );
    expect(
      screen.getByText("No result. Pass a result object to render the block."),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <StatisticalResultBlock
        estimateLabel="Mean difference"
        result={RESULT}
        title="Treatment vs control"
      />,
    );
    await expectNoViolations(container);
  });
});

const MISSINGNESS_COLUMNS: readonly MissingnessColumn[] = [
  { id: "glucose", label: "Glucose" },
  { id: "creatinine", label: "Creatinine" },
  { id: "il6", label: "IL-6" },
  { id: "troponin", label: "Troponin I" },
];

const MISSINGNESS_CODES = [
  { code: "HEM", kind: "missing", label: "Haemolysed sample" },
  { code: "NOT_COLLECTED", kind: "notCollected", label: "Not collected" },
  { code: "<LOD", kind: "censored", label: "Below detection limit" },
] as const;

const MISSINGNESS_ROWS: readonly MissingnessRow[] = [
  {
    id: "S-01",
    values: {
      creatinine: 78,
      glucose: 5.2,
      il6: "NOT_COLLECTED",
      troponin: { kind: "censored" },
    },
  },
  {
    id: "S-02",
    values: {
      creatinine: "HEM",
      glucose: "HEM",
      il6: 1.8,
      troponin: { kind: "censored" },
    },
  },
  {
    id: "S-03",
    values: { creatinine: 61, glucose: 4.9, il6: 2.4, troponin: 0.03 },
  },
];

describe("missingness map helpers", () => {
  it("separates missing, censored, not applicable, and not collected", () => {
    const summary = summarizeMissingness(
      MISSINGNESS_COLUMNS,
      MISSINGNESS_ROWS,
      MISSINGNESS_CODES,
    );

    expect(summary).toMatchObject({
      cells: 12,
      censored: 2,
      incompleteRows: 2,
      missing: 2,
      notApplicable: 0,
      notCollected: 1,
      present: 7,
    });
    expect(summary.completeness).toBeCloseTo(7 / 12, 10);
    expect(summary.coMissing).toEqual([
      {
        a: "glucose",
        b: "creatinine",
        labelA: "Glucose",
        labelB: "Creatinine",
        rows: 1,
      },
    ]);
  });

  it("does not count censored values as co-missing", () => {
    const summary = summarizeMissingness(
      MISSINGNESS_COLUMNS,
      [
        {
          id: "x",
          values: {
            creatinine: { kind: "censored" },
            glucose: { kind: "censored" },
            il6: 1,
            troponin: 1,
          },
        },
      ],
      [...DEFAULT_MISSINGNESS_CODES, ...MISSINGNESS_CODES],
    );

    expect(summary.coMissing).toEqual([]);
  });

  it("exports codes rather than values", () => {
    const csv = missingnessCsv(
      MISSINGNESS_COLUMNS,
      MISSINGNESS_ROWS,
      MISSINGNESS_CODES,
    );
    const rows = csv.split("\n");

    expect(rows[0]).toBe("record,glucose,creatinine,il6,troponin");
    expect(rows[2]).toBe("S-02,HEM,HEM,present,<LOD");
  });
});

describe("MissingnessMap", () => {
  it("renders completeness and the declared code legend", () => {
    render(
      <MissingnessMap
        codes={MISSINGNESS_CODES}
        columns={MISSINGNESS_COLUMNS}
        rows={MISSINGNESS_ROWS}
        title="Panel completeness"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Panel completeness", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("58% present")).toBeInTheDocument();
    expect(screen.getByText("2 rows to review")).toBeInTheDocument();
    expect(screen.getAllByText(/Haemolysed|HEM/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Below detection limit/)).toBeInTheDocument();
  });

  it("filters to incomplete rows without dropping complete data from export", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(
      <MissingnessMap
        codes={MISSINGNESS_CODES}
        columns={MISSINGNESS_COLUMNS}
        onExport={onExport}
        rows={MISSINGNESS_ROWS}
      />,
    );

    expect(screen.getByText("S-03")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Incomplete only" }));
    expect(screen.queryByText("S-03")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export codes" }));
    expect(onExport.mock.calls[0][0]).toContain(
      "S-03,present,present,present,present",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MissingnessMap
        codes={MISSINGNESS_CODES}
        columns={MISSINGNESS_COLUMNS}
        rows={MISSINGNESS_ROWS}
        title="Panel completeness"
      />,
    );
    await expectNoViolations(container);
  });
});

const DATASET: DatasetRecord = {
  access: "restricted",
  accessNote: "Data-use agreement required.",
  checksum: {
    algorithm: "sha256",
    value: "9f2c41b7a8d3e56c0b1f4a7d2e8c95b36f0a1d4c7e2b8f5903a6c1d4e7b2f8a5c",
  },
  createdAt: "2026-10-18",
  description: "Fasting serum chemistry for 48 adults at two sites.",
  doi: "10.5281/zenodo.1234567",
  format: "CSV + data dictionary",
  id: "DS-COHORT12-SERUM",
  license: "CC BY-NC 4.0",
  method: "Venepuncture at 08:00; AU5800, two-point calibration.",
  owner: "Prabhakar Lab",
  repository: "Zenodo",
  size: "412 KB",
  stage: "raw",
  title: "Cohort 12 serum chemistry, raw export",
  updatedAt: "2026-11-05",
  version: "1.2.0",
};

describe("dataset card helpers", () => {
  it("checks the eight required fields and names what is missing", () => {
    expect(datasetChecklist(DATASET)).toMatchObject({
      missing: [],
      recorded: 8,
      total: 8,
    });
    expect(
      datasetChecklist({ ...DATASET, checksum: undefined, license: undefined }),
    ).toMatchObject({
      missing: ["License", "Checksum"],
      recorded: 6,
    });
  });

  it("generates a DataCite-style citation from the record", () => {
    expect(datasetCitation(DATASET)).toBe(
      "Prabhakar Lab (2026). Cohort 12 serum chemistry, raw export (Version 1.2.0) [Data set]. Zenodo https://doi.org/10.5281/zenodo.1234567",
    );
    expect(
      datasetCitation({ ...DATASET, citation: "A custom citation." }),
    ).toBe("A custom citation.");
  });

  it("puts the record, checks, and citation in one JSON artifact", () => {
    const parsed = JSON.parse(datasetMetadataJson(DATASET));

    expect(parsed.id).toBe("DS-COHORT12-SERUM");
    expect(parsed.checks.completeness).toBe("8/8");
    expect(parsed.citation).toContain("Version 1.2.0");
  });
});

describe("DatasetCard", () => {
  it("shows identity, integrity, and completeness", () => {
    render(<DatasetCard dataset={DATASET} />);

    expect(
      screen.getByRole("heading", {
        name: "Cohort 12 serum chemistry, raw export",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("8 of 8 required fields recorded · nothing missing"),
    ).toBeInTheDocument();
    expect(screen.getByText("sha256:")).toBeInTheDocument();
    expect(screen.getByText("Restricted")).toBeInTheDocument();
  });

  it("calls out a missing checksum and missing required fields", () => {
    render(
      <DatasetCard
        dataset={{ ...DATASET, checksum: undefined, license: undefined }}
      />,
    );

    expect(
      screen.getByText(
        "6 of 8 required fields recorded · missing License, Checksum",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No checksum recorded. The bytes are not verifiable."),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DatasetCard dataset={DATASET} />);
    await expectNoViolations(container);
  });
});

const BASELINE: ComparisonRun = {
  id: "RUN-118",
  label: "Run 118",
  metrics: {
    carryover: { unit: "%", value: 0.08 },
    retention: { unit: "min", value: 6.42 },
  },
  parameters: {
    flow: { unit: "mL/min", value: 0.3 },
    pressure: { unit: "bar", value: 420 },
    temperature: { unit: "°C", value: 35 },
  },
};

const CANDIDATE: ComparisonRun = {
  id: "RUN-119",
  label: "Run 119",
  metrics: {
    resolution: { value: 1.8 },
    retention: { unit: "min", value: 6.51 },
  },
  parameters: {
    flow: { unit: "mL/min", value: 0.32 },
    pressure: { unit: "psi", value: 6100 },
    temperature: { unit: "°C", value: 35 },
  },
};

describe("run comparison helpers", () => {
  it("requires matching units before subtracting", () => {
    expect(
      compareValue({ unit: "bar", value: 420 }, { unit: "psi", value: 6100 }),
    ).toMatchObject({ delta: null, status: "unitMismatch" });
    expect(
      compareValue({ unit: "min", value: 6.42 }, { unit: "min", value: 6.51 }),
    ).toMatchObject({ status: "changed" });
    expect(compareValue({ value: 1 }, { value: 1.0002 })).toMatchObject({
      status: "same",
    });
    expect(compareValue(undefined, { value: 1 })).toMatchObject({
      status: "missing",
    });
    expect(compareValue({ value: true }, { value: false })).toMatchObject({
      status: "changed",
    });
  });

  it("applies per-key absolute tolerance", () => {
    expect(
      compareValue({ value: 100 }, { value: 100.5 }, { absoluteTolerance: 1 }),
    ).toMatchObject({ delta: 0.5, status: "same" });
    expect(
      compareValue(
        { value: 100 },
        { value: 100.5 },
        { absoluteTolerance: 0.1 },
      ),
    ).toMatchObject({ status: "changed" });
  });

  it("summarizes same, changed, missing, and unit mismatch across runs", () => {
    const summary = compareRuns([BASELINE, CANDIDATE]);

    expect(summary).toMatchObject({
      changed: 2,
      missing: 2,
      same: 1,
      total: 6,
      unitMismatch: 1,
    });
    expect(
      summary.parameters.find((row) => row.key === "pressure")?.status,
    ).toBe("unitMismatch");
    expect(
      summary.metrics.find((row) => row.key === "carryover"),
    ).toMatchObject({ delta: null, latest: undefined });
  });

  it("exports the diff as CSV and JSON", () => {
    const summary = compareRuns([BASELINE, CANDIDATE]);
    const csv = comparisonCsv([BASELINE, CANDIDATE], summary);

    expect(csv.split("\n")[0]).toBe(
      "section,key,Run 118,Run 119,delta,relative_change,status",
    );
    expect(csv).toContain("metric,carryover,0.08,,,,");
    expect(
      JSON.parse(comparisonJson([BASELINE, CANDIDATE], summary)).summary,
    ).toMatchObject({ unitMismatch: 1 });
  });
});

describe("RunComparison", () => {
  it("shows the unit mismatch instead of a delta", () => {
    render(
      <RunComparison
        runs={[BASELINE, CANDIDATE]}
        title="Method transfer check"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Method transfer check", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 key uses different units/)).toBeInTheDocument();
    expect(screen.getAllByText("Unit mismatch").length).toBeGreaterThan(0);
    expect(screen.getByText(/6 keys compared/)).toBeInTheDocument();
  });

  it("hides unchanged keys on request", async () => {
    const user = userEvent.setup();
    render(<RunComparison runs={[BASELINE, CANDIDATE]} />);

    expect(screen.getByText("temperature")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Differences only" }));
    expect(screen.queryByText("temperature")).not.toBeInTheDocument();
    expect(screen.getByText("flow")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RunComparison runs={[BASELINE, CANDIDATE]} title="Method transfer" />,
    );
    await expectNoViolations(container);
  });
});

const CALIBRATION: CalibrationQcData = {
  blanks: [112, 118, 105, 109, 114],
  controlMean: 1000,
  controlSd: 30,
  controls: [
    { at: "2026-09-07", value: 1002 },
    { at: "2026-09-14", value: 996 },
    { at: "2026-09-21", value: 1008 },
    { at: "2026-09-28", value: 1010 },
    { at: "2026-10-05", value: 990 },
    { at: "2026-10-12", value: 1004 },
    { at: "2026-10-19", value: 1120, runId: "RUN-117" },
    { at: "2026-10-26", value: 1006 },
  ],
  id: "CAL-1",
  name: "Cortisol calibration and QC",
  standards: [
    { level: 0, response: 118 },
    { level: 0.5, response: 612 },
    { level: 1, response: 1118 },
    { level: 2, response: 2115 },
    { level: 5, response: 5105 },
    { level: 10, response: 10120 },
  ],
  unit: "ng/mL",
};

describe("calibration and QC helpers", () => {
  it("fits a line and reports r squared", () => {
    const fit = fitLinearCalibration(CALIBRATION.standards);

    expect(fit).not.toBeNull();
    expect(fit?.n).toBe(6);
    expect(fit?.slope).toBeGreaterThan(999);
    expect(fit?.slope).toBeLessThan(1003);
    expect(fit?.intercept).toBeGreaterThan(100);
    expect(fit?.intercept).toBeLessThan(120);
    expect(fit?.rSquared).toBeGreaterThan(0.9999);
    expect(fitLinearCalibration(CALIBRATION.standards.slice(0, 1))).toBeNull();
  });

  it("derives LOD and LOQ from blank replicates and slope", () => {
    const fit = fitLinearCalibration(CALIBRATION.standards);
    const limits = calibrationLimits(fit, CALIBRATION.blanks);

    expect(limits).not.toBeNull();
    if (!limits || !fit) {
      return;
    }
    expect(limits.lod).toBeCloseTo(
      (3.3 * limits.blankSd) / Math.abs(fit.slope),
      10,
    );
    expect(limits.loq).toBeCloseTo(
      (10 * limits.blankSd) / Math.abs(fit.slope),
      10,
    );
    expect(calibrationLimits(fit, [])).toBeNull();
  });

  it("fires 1-3s on a single point beyond three SD", () => {
    const violations = evaluateWestgard(
      [
        { at: "1", value: 1000 },
        { at: "2", value: 1000 },
        { at: "3", value: 1120 },
      ],
      1000,
      30,
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ rule: "1-3s", index: 2 });
  });

  it("rejects a run with a control violation and accepts a clean one", () => {
    expect(summarizeCalibrationQc(CALIBRATION)).toMatchObject({
      verdict: "reject",
    });
    expect(summarizeCalibrationQc(CALIBRATION).violations).toHaveLength(1);

    const clean = summarizeCalibrationQc({
      ...CALIBRATION,
      controls:
        CALIBRATION.controls?.filter((point) => point.value !== 1120) ?? [],
    });
    expect(clean.verdict).toBe("accept");
    expect(clean.reasons).toEqual([]);

    const noBlanks = summarizeCalibrationQc({
      ...CALIBRATION,
      blanks: [],
      controls:
        CALIBRATION.controls?.filter((point) => point.value !== 1120) ?? [],
    });
    expect(noBlanks.verdict).toBe("review");
    expect(noBlanks.reasons).toContain(
      "No blank replicates; LOD and LOQ are not established.",
    );
  });
});

describe("CalibrationQcPanel", () => {
  it("shows the verdict, the fit, and the named rule violation", () => {
    render(<CalibrationQcPanel data={CALIBRATION} />);

    expect(
      screen.getByRole("heading", {
        name: "Cortisol calibration and QC",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText(/1-3s/)).toBeInTheDocument();
    expect(screen.getByText(/1 Westgard rejection/)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Levey–Jennings control chart/ }),
    ).toBeInTheDocument();
  });

  it("accepts a clean run and reports no rule fired", () => {
    render(
      <CalibrationQcPanel
        data={{
          ...CALIBRATION,
          controls: CALIBRATION.controls?.filter(
            (point) => point.value !== 1120,
          ),
        }}
      />,
    );

    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(
      screen.getByText("No Westgard rejection rules fired."),
    ).toBeInTheDocument();
  });

  it("exports the standards, blanks, and controls", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<CalibrationQcPanel data={CALIBRATION} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport.mock.calls[0][0]).toContain("section,level,response");
    expect(onExport.mock.calls[0][0]).toContain("control");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CalibrationQcPanel data={CALIBRATION} />);
    await expectNoViolations(container);
  });
});

const MANIFEST: ReproducibilityManifestData = {
  branch: "main",
  command: "Rscript analysis/04_mixed_models.R --out results/",
  commit: "8c41d9e2b7f0a6d3c5e8b1a4f7d0c3e6b9a2f5d8",
  createdAt: "2026-11-09T14:22:08Z",
  dirty: false,
  environment: {
    language: "R",
    packages: [{ name: "lme4", version: "1.1-37" }],
    platform: "linux-x86_64",
    version: "4.4.2",
  },
  id: "MAN-1",
  inputs: [
    { bytes: 42112, hash: "sha256:41c9", path: "data/serum.csv" },
    { bytes: 2048, hash: "sha256:7b3d", path: "config.yml" },
  ],
  outputs: [{ bytes: 186240, hash: "sha256:9f2c", path: "results/model.rds" }],
  params: { missing: "complete-case" },
  project: "Cohort 12 mixed models",
  seeds: { bootstrap: 20261109 },
};

describe("reproducibility manifest helpers", () => {
  it("checks commit, command, tree, environment, and hashes", () => {
    expect(manifestChecklist(MANIFEST)).toMatchObject({
      complete: true,
      recorded: 6,
      total: 6,
    });
    expect(
      manifestChecklist({
        ...MANIFEST,
        dirty: true,
        inputs: [{ path: "data/serum.csv" }],
      }),
    ).toMatchObject({ complete: false, recorded: 4 });
  });

  it("warns about a dirty tree and unhashed artifacts", () => {
    const warnings = manifestWarnings({
      ...MANIFEST,
      dirty: true,
      inputs: [{ path: "data/serum.csv" }],
    });
    const keys = warnings.map((warning) => warning.key);

    expect(keys).toContain("dirty");
    expect(keys).toContain("input-hash");
    expect(keys).not.toContain("output-hash");
  });

  it("withholds the reproduce recipe when the tree is dirty", () => {
    expect(reproduceCommand(MANIFEST)).toBe(
      "git checkout 8c41d9e2b7f0a6d3c5e8b1a4f7d0c3e6b9a2f5d8 && Rscript analysis/04_mixed_models.R --out results/",
    );
    expect(reproduceCommand({ ...MANIFEST, dirty: true })).toBeNull();
    expect(reproduceCommand({ ...MANIFEST, command: undefined })).toBeNull();
  });

  it("exports one JSON artifact with checks and warnings", () => {
    const parsed = JSON.parse(manifestJson(MANIFEST));

    expect(parsed.id).toBe("MAN-1");
    expect(parsed.checks.recorded).toBe(6);
    expect(parsed.warnings).toEqual([]);
    expect(parsed.reproduce).toContain("git checkout");
  });
});

describe("ReproducibilityManifest", () => {
  it("shows a clean run and its hashed artifacts", () => {
    render(<ReproducibilityManifest manifest={MANIFEST} />);

    expect(
      screen.getByRole("heading", {
        name: "Cohort 12 mixed models",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("6/6 checks")).toBeInTheDocument();
    expect(screen.getAllByText("Clean tree").length).toBeGreaterThan(0);
    expect(screen.getByText("data/serum.csv")).toBeInTheDocument();
    expect(screen.getByText("results/model.rds")).toBeInTheDocument();
    expect(screen.getByText("lme4")).toBeInTheDocument();
  });

  it("labels a dirty tree and missing hashes", () => {
    render(
      <ReproducibilityManifest
        manifest={{
          ...MANIFEST,
          dirty: true,
          inputs: [{ path: "data/serum.csv" }],
        }}
      />,
    );

    expect(screen.getByText("Dirty tree")).toBeInTheDocument();
    expect(
      screen.getByText(/At least one input has no hash/),
    ).toBeInTheDocument();
    expect(screen.getByText("no hash recorded")).toBeInTheDocument();
    expect(screen.getByText("4/6 checks")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ReproducibilityManifest manifest={MANIFEST} />,
    );
    await expectNoViolations(container);
  });
});
