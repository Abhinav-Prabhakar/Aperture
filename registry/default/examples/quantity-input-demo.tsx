"use client";

import { useState } from "react";
import { QuantityInput } from "@/registry/default/instruments/quantity-input";

export function QuantityInputDemo() {
  const [value, setValue] = useState<number | null>(12.4);
  const [unit, setUnit] = useState("mg/L");
  const [uncertainty, setUncertainty] = useState<number | null>(0.2);

  return (
    <QuantityInput
      className="w-full max-w-sm"
      hint="Reported as mean ± standard deviation."
      label="Concentration"
      onUncertaintyChange={setUncertainty}
      onUnitChange={setUnit}
      onValueChange={setValue}
      uncertainty={uncertainty}
      unit={unit}
      units={["mg/L", "µg/mL", "g/L"]}
      value={value}
    />
  );
}
