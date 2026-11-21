import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Data Explorer",
  description:
    "A complete research workbench: filter rail, sortable sample table, inspector, chain of custody, states, and CSV export.",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const STATES = [
  ["Ready", "ready"],
  ["Loading", "loading"],
  ["Empty", "empty"],
  ["Error", "error"],
  ["Permission denied", "denied"],
  ["Offline", "offline"],
] as const;

export default function DataExplorerPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbench</Badge>
        <Badge variant="outline">P0</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Data Explorer
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A filter rail, a measurement table, and an inspector that keeps the
        selected sample in view. One screen for the question researchers ask
        most: what is in this run, and what does one row mean?
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          render={<Link href="/workbenches/data-explorer" />}
          size="sm"
          variant="default"
        >
          Open full screen
          <ArrowUpRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          Synthetic run, real interactions.
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Data Explorer workbench with stats, filter rail, sample table, and inspector"
        className="mt-6 w-full rounded-xl border"
        src={`${BASE_PATH}/assets/workbench-data-explorer.webp`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is inside
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Filter rail.</strong> Text search, QC
          status, and treatment. Counts make the effect of a filter visible
          before you apply it.
        </li>
        <li>
          <strong className="font-medium">Table.</strong> One unit per column,
          tabular numerals, explicit <span className="font-mono">—</span> for
          missing concentrations, and stable sorting that puts missing last.
        </li>
        <li>
          <strong className="font-medium">Inspector.</strong> The active row’s
          measurement, 12-hour series, note, and chain of custody. Selection for
          export is separate from the row you are reading.
        </li>
        <li>
          <strong className="font-medium">Export.</strong> A real CSV of the
          current view, or of the selected rows when there is a selection. File
          names and units are stable.
        </li>
        <li>
          <strong className="font-medium">Print.</strong> A print stylesheet
          drops the filter rail and actions, keeping the run header, summary, and
          table.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Every state
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Each state has its own page. Nothing is a blank screen, and none of them
        pretends an error is an empty result.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {STATES.map(([label, state]) => (
          <li key={state}>
            <Button
              render={
                <Link href={`/workbenches/data-explorer?state=${state}`} />
              }
              size="xs"
              variant="outline"
            >
              {label}
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Install
      </h2>
      <CodeBlock code="npx shadcn@latest add @aperture/data-explorer" />
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        The workbench installs its instruments and elements from the registry.
        No private runtime, no hidden provider.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Replace the adapter
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The workbench takes rows as a prop. Keep the types and swap the mock for
        your query:
      </p>
      <CodeBlock
        code={`import { DataExplorer } from "@/components/data-explorer/data-explorer";
import type { ExplorerSample } from "@/components/data-explorer/types";

const samples: ExplorerSample[] = await loadSamples(runId);

<DataExplorer
  runId={\`RUN-\${runId}\`}
  title="Absorbance screen"
  subtitle="Plate 12 · BMG FLUOstar"
  samples={samples}
  syncToUrl
/>;`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        URL parameters
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        With <code className="font-mono">syncToUrl</code>, the view is
        reproducible. Unknown values are ignored, not thrown.
      </p>
      <div className="mt-3 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/32 text-start">
            <tr>
              <th className="px-3 py-2 text-start font-medium">Parameter</th>
              <th className="px-3 py-2 text-start font-medium">Meaning</th>
              <th className="px-3 py-2 text-start font-medium">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-xs">
            <tr>
              <td className="px-3 py-2">q</td>
              <td className="px-3 py-2 font-sans">Free-text filter</td>
              <td className="px-3 py-2">S-014</td>
            </tr>
            <tr>
              <td className="px-3 py-2">status</td>
              <td className="px-3 py-2 font-sans">QC status</td>
              <td className="px-3 py-2">warning</td>
            </tr>
            <tr>
              <td className="px-3 py-2">treatment</td>
              <td className="px-3 py-2 font-sans">Treatment group</td>
              <td className="px-3 py-2">High dose</td>
            </tr>
            <tr>
              <td className="px-3 py-2">sample</td>
              <td className="px-3 py-2 font-sans">Open inspector row</td>
              <td className="px-3 py-2">S-014</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Compose, do not fork. If the workbench needs a new primitive, add it to
          the registry first so every workbench gets it.
        </li>
        <li>
          Missing is a measurement state, not a layout accident. A censored
          concentration is <span className="font-mono">—</span> with a reason in
          the note, never zero.
        </li>
        <li>
          The row count, filter counts, and export must all describe the same
          set. If the table says 24 rows, the CSV does not get 22.
        </li>
        <li>
          A permission error is not an empty dataset. Say what is restricted and
          who can grant access.
        </li>
        <li>
          Keep the export client-side unless the dataset requires otherwise. A
          view you can see is a view you can save.
        </li>
      </ul>
    </article>
  );
}
