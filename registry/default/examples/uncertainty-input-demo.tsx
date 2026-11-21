"use client";

import { useState } from "react";
import {
  UncertaintyInput,
  type UncertaintyValue,
} from "@/registry/default/instruments/uncertainty-input";

export function UncertaintyInputDemo() {
  const [value, setValue] = useState<number | null>(12.47);
  const [uncertainty, setUncertainty] = useState<UncertaintyValue | null>(0.32);

  return (
    <UncertaintyInput
      className="w-full max-w-sm"
      hint="Standard deviation of three technical replicates."
      label="Concentration"
      onUncertaintyChange={setUncertainty}
      onValueChange={setValue}
      uncertainty={uncertainty}
      unit="µg/mL"
      value={value}
    />
  );
}

export function AsymmetricUncertaintyDemo() {
  const [value, setValue] = useState<number | null>(14.2);
  const [uncertainty, setUncertainty] = useState<UncertaintyValue | null>({
    lower: 1.5,
    upper: 1.8,
  });

  return (
    <UncertaintyInput
      className="w-full max-w-sm"
      hint="95% confidence interval from the fit. Errors are not symmetric."
      label="Half-life"
      onUncertaintyChange={setUncertainty}
      onValueChange={setValue}
      uncertainty={uncertainty}
      unit="h"
      value={value}
    />
  );
}
