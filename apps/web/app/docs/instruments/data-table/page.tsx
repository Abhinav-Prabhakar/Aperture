import type { Metadata } from "next";
import { Badge } from "@/registry/default/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { DataTableDemo } from "@/registry/default/examples/data-table-demo";

export const metadata: Metadata = {
  title: "Data Table",
  description:
    "A sortable, selectable table for measurements: units in the header, numbers aligned, missing values explicit.",
};

export default function DataTablePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Data</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Data Table
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Rows are observations; columns are quantities. The table keeps units,
        precision, missing values, and quality flags in their proper places.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <DataTableDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Sort by a header, or select a row. Missing concentration is shown as{" "}
        <span className="font-mono">—</span> and sorts last, in either direction.
      </p>

      <CodeBlock
        code={`const columns: DataTableColumn<Sample>[] = [
  {
    id: "concentration",
    header: "Concentration",
    unit: "µg/mL",
    align: "end",
    numeric: true,
    cell: (row) =>
      row.concentration === null ? "—" : (
        <ScientificNumber value={row.concentration} />
      ),
    sortValue: (row) => row.concentration,
  },
];

<DataTable
  title="Samples · plate 1"
  columns={columns}
  rows={samples}
  getRowId={(row) => row.id}
  getRowLabel={(row) => row.sample}
  activeRowId={activeId}
  onRowActivate={(id) => setActiveId(id)}
  selectable
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          One unit per column, shown once in the header. If the unit changes by
          row, the unit belongs in the cell, not the header.
        </li>
        <li>
          Right-align numbers and use tabular numerals. Do not center a column of
          measurements.
        </li>
        <li>
          Missing is not zero. Render <span className="font-mono">—</span> with
          an explanation, and sort it last.
        </li>
        <li>
          Sorting is stable. Equal values keep their original order, so a second
          sort does not scramble the first.
        </li>
        <li>
          Selection is by stable row id, not index. Give every row a checkbox name
          a person can read. An active row is a reading position, not a
          selection: the inspector follows it while export follows the selection.
        </li>
        <li>
          This table sorts and renders in memory. For thousands of rows, add
          virtualization or server-side paging rather than shipping them all.
        </li>
      </ul>
    </article>
  );
}
