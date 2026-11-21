"use client";

import { useState } from "react";
import {
  MetadataEditor,
  type MetadataField,
} from "@/registry/default/instruments/metadata-editor";

const INITIAL: MetadataField[] = [
  {
    id: "instrument",
    label: "Instrument",
    value: "Plate reader · BMG FLUOstar",
    required: true,
  },
  {
    id: "operator",
    label: "Operator",
    value: "A. Rao",
    required: true,
  },
  {
    id: "acquired",
    label: "Acquired",
    value: "2026-11-21 09:32 UTC",
  },
  {
    id: "protocol",
    label: "Protocol",
    value: "absorbance-600 v3",
  },
  {
    id: "notes",
    label: "Notes",
    value: "",
    placeholder: "Anything the next person needs to know.",
  },
];

export function MetadataEditorDemo() {
  const [fields, setFields] = useState(INITIAL);

  return (
    <MetadataEditor
      className="w-full"
      description="Stored with every export and shown beside the results."
      fields={fields}
      onChange={setFields}
      title="Run metadata"
    />
  );
}
