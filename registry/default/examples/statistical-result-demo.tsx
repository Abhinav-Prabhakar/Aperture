"use client";

import type { StatisticalResult } from "@/registry/default/instruments/statistical-result";
import { StatisticalResultBlock } from "@/registry/default/instruments/statistical-result";

const RESULT: StatisticalResult = {
  alpha: 0.05,
  assumptions: [
    {
      detail: "Shapiro–Wilk p = 0.18 on the residuals",
      name: "Residual normality",
      status: "met",
    },
    {
      detail: "Welch correction applied; equal variances are not assumed",
      name: "Homogeneity of variance",
      status: "met",
    },
    {
      detail: "Samples came from two batches; batch is a fixed effect",
      name: "Independence of observations",
      status: "met",
    },
    {
      detail: "No formal test; assignment was not randomized",
      name: "No unmeasured confounding",
      status: "notChecked",
    },
  ],
  correction: "Holm–Bonferroni, 4 comparisons",
  effectSize: {
    label: "Cohen's d",
    value: 0.71,
  },
  estimate: 0.62,
  interval: { level: 95, lower: 0.34, upper: 0.9 },
  method:
    "Linear model with batch as a fixed effect and HC3 standard errors; complete cases only (n = 48 of 52).",
  n: 48,
  p: 0.00011,
  precision: 2,
  statistic: { df: "36.4", label: "t", value: 4.31 },
  tails: "two-sided",
  test: "Welch two-sample t-test",
  unit: "mmol/L",
  warning:
    "Observational contrast between groups. The estimate is adjusted, not causal.",
};

export function StatisticalResultDemo() {
  return (
    <StatisticalResultBlock
      description="Fasting glucose at week 12, adjusted for batch. The interval, n, test, and assumptions stay attached to the number."
      estimateLabel="Mean difference"
      result={RESULT}
      title="Treatment vs control, week 12"
    />
  );
}
