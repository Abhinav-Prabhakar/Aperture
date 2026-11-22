"use client";

import { ConstantsReference } from "@/registry/default/instruments/constants-reference";

export function ConstantsReferenceDemo() {
  return (
    <ConstantsReference
      defaultConstantId="fine-structure-constant"
      defaultFilter="featured"
    />
  );
}
