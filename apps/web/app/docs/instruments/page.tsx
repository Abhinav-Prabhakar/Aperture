import type { Metadata } from "next";
import { Badge } from "@/registry/default/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export const metadata: Metadata = {
  title: "Instruments",
  description:
    "The founding set of Aperture research instruments and the first domain pack.",
};

const INSTRUMENTS = [
  [
    "Quantity Input",
    "Measurement",
    "Value, unit, conversion, precision, validation.",
  ],
  [
    "Scientific Number",
    "Measurement",
    "Notation, significant figures, copy full precision.",
  ],
  [
    "Uncertainty Input",
    "Measurement",
    "Value ± error, asymmetric errors, sig figs.",
  ],
  ["Stat + Stat Grid", "Measurement", "Label, value, unit, delta, context."],
  [
    "Sparkline",
    "Measurement",
    "Inline time series with an accessible summary.",
  ],
  [
    "Status Badge + Dot",
    "Workflow",
    "Live state with label, tooltip, announcement.",
  ],
  [
    "Metadata Editor",
    "Data",
    "Typed key/value editing with schema suggestions.",
  ],
  [
    "File Dropzone + Queue",
    "Data",
    "Upload, validate, retry, checksum, progress.",
  ],
  ["Data Table", "Data", "Virtualized, typed columns, selection, saved views."],
  ["Log Viewer", "Workflow", "Levels, filters, timestamps, follow-tail."],
  ["Timeline", "Workflow", "Event history with actors, types, details."],
  [
    "Protocol Steps",
    "Experiment",
    "Ordered, checkable steps with timing and notes.",
  ],
];

const LIFE_SCIENCE = [
  "Sequence Viewer",
  "Growth Curve",
  "Dose–Response Curve",
  "Survival Curve",
  "Plate Reader Curve",
  "PCR Program",
  "Sample Table",
  "Sample Map",
  "Well Plate",
  "Instrument Status",
  "Calibration Log",
  "Reagent Inventory",
];

export default function InstrumentsPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Layer 02</Badge>
        <Badge variant="outline">Phase 1</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Instruments
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Focused research components that solve one real problem well. These are
        the twelve that ship first, each with docs, tests, and a recipe.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Founding set
      </h2>
      <div
        className="mt-4 overflow-hidden rounded-xl border"
        data-shot="instruments-table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instrument</TableHead>
              <TableHead>Family</TableHead>
              <TableHead className="hidden sm:table-cell">Job</TableHead>
              <TableHead className="text-end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INSTRUMENTS.map(([name, family, job]) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>
                  <Badge size="sm" variant="secondary">
                    {family}
                  </Badge>
                </TableCell>
                <TableCell className="hidden max-w-md whitespace-normal text-muted-foreground sm:table-cell">
                  {job}
                </TableCell>
                <TableCell className="text-end">
                  <Badge size="sm" variant="outline">
                    Planned
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        First domain pack: life sciences and lab
      </h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        One pack, sequenced before the second. A pack is not done until a domain
        advisor has reviewed terminology, defaults, and one real workflow.
      </p>
      <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
        {LIFE_SCIENCE.map((name) => (
          <li
            className="flex items-center justify-between gap-3 bg-background px-4 py-3"
            key={name}
          >
            <span className="text-sm">{name}</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              planned
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What “done” means
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>Registry item, docs page, and a visual test fixture.</li>
        <li>Light, dark, and Contrast themes at 375, 768, and 1280 px.</li>
        <li>Keyboard-only and screen-reader paths; RTL; reduced motion.</li>
        <li>Logic tests with cited reference values.</li>
        <li>An export path or an accessible fallback where relevant.</li>
        <li>A domain advisor has reviewed the defaults and vocabulary.</li>
        <li>It appears in at least one recipe.</li>
      </ul>
    </article>
  );
}
