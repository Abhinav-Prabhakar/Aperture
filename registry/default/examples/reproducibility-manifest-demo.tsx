"use client";

import type { ReproducibilityManifestData } from "@/registry/default/instruments/reproducibility-manifest";
import { ReproducibilityManifest } from "@/registry/default/instruments/reproducibility-manifest";

const MANIFEST: ReproducibilityManifestData = {
  branch: "main",
  command:
    "Rscript analysis/04_mixed_models.R --config config/cohort12.yml --out results/",
  commit: "8c41d9e2b7f0a6d3c5e8b1a4f7d0c3e6b9a2f5d8",
  createdAt: "2026-11-09T14:22:08Z",
  dirty: false,
  durationSeconds: 184,
  environment: {
    language: "R",
    packages: [
      { name: "lme4", version: "1.1-37" },
      { name: "emmeans", version: "1.11.2" },
      { name: "readr", version: "2.1.5" },
      { name: "dplyr", version: "1.1.4" },
      { name: "ggplot2", version: "4.0.1" },
      { name: "renv", version: "1.1.5" },
    ],
    platform: "linux-x86_64, Ubuntu 24.04",
    version: "4.4.2",
  },
  id: "MAN-2026-11-09-1422",
  inputs: [
    {
      bytes: 42112,
      hash: "sha256:41c9a7e2d5b8f1036a4c9e7d2b5f8013c6a9e4d7b2f5081c3a6d9e2b5f84710",
      path: "data/cohort12/serum_analysis.csv",
    },
    {
      bytes: 2048,
      hash: "sha256:7b3d1f9a5c2e84601f9d3a7c5e2b8f4069d1a3c5e7b9f2048a6c1e3d5b7f9012",
      path: "config/cohort12.yml",
    },
    {
      bytes: 1840,
      hash: "sha256:2e8f4a6c1b9d7e5032a4c6e8b1d3f5a7092c4e6b8d1f3a5c7e9b2d4f6a8c0135",
      path: "analysis/04_mixed_models.R",
    },
  ],
  notes:
    "The complete-case analysis is the primary result. The sensitivity analysis with multiple imputation is a separate manifest.",
  outputs: [
    {
      bytes: 186240,
      hash: "sha256:9f2c41b7a8d3e56c0b1f4a7d2e8c95b36f0a1d4c7e2b8f5903a6c1d4e7b2f8a5c",
      path: "results/cohort12_model.rds",
    },
    {
      bytes: 48210,
      hash: "sha256:3a6c9e1d4b7f2058c4a6e8d1b3f50792c4e6a8d1f3b5c7092e4a6c8d1f3b5a70",
      path: "results/table2_estimates.csv",
    },
  ],
  params: {
    alpha: 0.05,
    method: "lmer",
    missing: "complete-case",
    reml: true,
  },
  project: "Cohort 12 — mixed models",
  seeds: {
    bootstrap: 20261109,
  },
};

export function ReproducibilityManifestDemo() {
  return (
    <ReproducibilityManifest
      description="A clean run of the mixed-model script: commit, command, package versions, seeds, and hashed inputs and outputs in one record."
      manifest={MANIFEST}
    />
  );
}
