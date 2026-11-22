import type { Metadata } from "next";
import Link from "next/link";
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
  {
    name: "Sequence Viewer",
    href: "/docs/instruments/sequence-viewer",
    status: "preview",
  },
  { name: "Growth Curve", status: "planned" },
  { name: "Dose–Response Curve", status: "planned" },
  { name: "Survival Curve", status: "planned" },
  { name: "Plate Reader Curve", status: "planned" },
  { name: "PCR Program", status: "planned" },
  { name: "Sample Table", status: "planned" },
  { name: "Sample Map", status: "planned" },
  { name: "Well Plate", status: "planned" },
  { name: "Instrument Status", status: "planned" },
  { name: "Calibration Log", status: "planned" },
  { name: "Reagent Inventory", status: "planned" },
];

const READY = new Map([
  ["Scientific Number", "scientific-number"],
  ["Quantity Input", "quantity-input"],
  ["Stat + Stat Grid", "stat"],
  ["Sparkline", "sparkline"],
  ["Status Badge + Dot", "status-badge"],
  ["Log Viewer", "log-viewer"],
  ["Timeline", "timeline"],
  ["Protocol Steps", "protocol-steps"],
  ["Metadata Editor", "metadata-editor"],
  ["File Dropzone + Queue", "file-dropzone"],
  ["Data Table", "data-table"],
  ["Uncertainty Input", "uncertainty-input"],
]);

export default function InstrumentsPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Layer 02</Badge>
        <Badge variant="outline">Phase 1</Badge>
        <Badge variant="outline">12 ready · 1 preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Instruments
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Focused research components that solve one real problem well. The
        founding twelve are ready, and the life-sciences pack has begun with the
        Sequence Viewer.
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
            {INSTRUMENTS.map(([name, family, job]) => {
              const slug = READY.get(name);
              return (
                <TableRow key={name}>
                  <TableCell className="font-medium">
                    {slug ? (
                      <Link
                        className="underline-offset-4 hover:underline"
                        href={`/docs/instruments/${slug}`}
                      >
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" variant="secondary">
                      {family}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-md whitespace-normal text-muted-foreground sm:table-cell">
                    {job}
                  </TableCell>
                  <TableCell className="text-end">
                    <Badge size="sm" variant={slug ? "success" : "outline"}>
                      {slug ? "Ready" : "Planned"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        First domain pack: life sciences and lab
      </h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        One pack, sequenced before the second. The Sequence Viewer is the first
        domain instrument; it stays in preview until a domain advisor has
        reviewed terminology, defaults, and one real workflow.
      </p>
      <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
        {LIFE_SCIENCE.map((item) => (
          <li
            className="flex items-center justify-between gap-3 bg-background px-4 py-3"
            key={item.name}
          >
            <span className="text-sm">{item.name}</span>
            {item.href ? (
              <Link
                className="font-mono text-[10px] text-muted-foreground uppercase underline-offset-4 hover:underline"
                href={item.href}
              >
                {item.status}
              </Link>
            ) : (
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                {item.status}
              </span>
            )}
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
