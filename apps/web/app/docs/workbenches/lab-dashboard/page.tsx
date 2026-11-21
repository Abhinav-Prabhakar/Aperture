import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Lab Dashboard",
  description:
    "A complete lab operations workbench: instrument health, samples in flight, acknowledgeable alerts, today's schedule, and recent activity.",
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

export default function LabDashboardPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbench</Badge>
        <Badge variant="outline">P1</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Lab Dashboard
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The morning question for a lab: what is running, what is broken, and
        what needs a person? Instruments, samples, alerts, and the day’s
        schedule on one screen, with every number traceable to a timestamp.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          render={<Link href="/workbenches/lab-dashboard" />}
          size="sm"
          variant="default"
        >
          Open full screen
          <ArrowUpRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          Synthetic lab, real interactions.
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Lab Dashboard with instrument health, alerts, samples in flight, schedule, and activity"
        className="mt-6 w-full rounded-xl border"
        src={`${BASE_PATH}/assets/workbench-lab-dashboard.webp`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is inside
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Instrument health.</strong> A card per
          instrument with state, current activity, run progress, 7-day
          utilization, and the next calibration. Details open without leaving the
          page.
        </li>
        <li>
          <strong className="font-medium">Alerts that stay visible.</strong>{" "}
          Acknowledging an alert removes it from the open count and keeps the
          record on screen. Nothing disappears because someone clicked once.
        </li>
        <li>
          <strong className="font-medium">Samples in flight.</strong> Stage,
          instrument, operator, and a real ETA. Queued and blocked samples are
          distinct from running ones.
        </li>
        <li>
          <strong className="font-medium">Today’s schedule.</strong> Completed,
          running, and waiting runs share one timeline, so the day reads in
          order.
        </li>
        <li>
          <strong className="font-medium">Recent activity.</strong> A filterable
          log with levels, sources, and timestamps for the last few hours.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Every state
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Offline keeps the last synced dashboard and marks the acknowledgement
        local. Empty is a real lab with nothing scheduled, not a failed request.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {STATES.map(([label, state]) => (
          <li key={state}>
            <Button
              render={
                <Link href={`/workbenches/lab-dashboard?state=${state}`} />
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
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Everything in.</strong> Instruments,
          alerts, samples, schedule, activity, and <code className="font-mono text-xs">asOf</code>{" "}
          are the whole input. Replace the <code className="font-mono text-xs">MOCK_*</code>{" "}
          exports with one adapter that returns the same five arrays.
        </li>
        <li>
          <strong className="font-medium">Acknowledgement out.</strong>{" "}
          <code className="font-mono text-xs">onAcknowledge(alert)</code> fires
          after the local state moves. Persist it, then let the next fetch return
          the acknowledged record; the alert stays visible either way.
        </li>
        <li>
          <strong className="font-medium">Sample open out.</strong>{" "}
          <code className="font-mono text-xs">onSampleOpen(sample)</code> is the
          handoff to your sample or data route. Instrument selection and the
          active sample are local and URL-addressable.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Install
      </h2>
      <CodeBlock code="npx shadcn@latest add @aperture/lab-dashboard" />
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        The workbench installs its instruments and elements from the registry.
        No private runtime, no hidden provider.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Replace the adapter
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The dashboard takes four collections and the snapshot time. Keep the
        types and swap the mock for your queries:
      </p>
      <CodeBlock
        code={`import { LabDashboard } from "@/components/lab-dashboard/lab-dashboard";

const snapshot = await loadLabSnapshot(labId);

<LabDashboard
  asOf={snapshot.fetchedAt}
  labId={labId}
  location="Bay 3"
  instruments={snapshot.instruments}
  samples={snapshot.samples}
  alerts={snapshot.alerts}
  schedule={snapshot.schedule}
  activity={snapshot.activity}
  onSampleOpen={(sample) => openSample(sample.id)}
  syncToUrl
/>;`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        URL parameters
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        With <code className="font-mono">syncToUrl</code>, the open instrument
        and active sample survive a reload and can be shared. Unknown values are
        ignored.
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
              <td className="px-3 py-2">instrument</td>
              <td className="px-3 py-2 font-sans">
                Open the instrument detail
              </td>
              <td className="px-3 py-2">autoclave</td>
            </tr>
            <tr>
              <td className="px-3 py-2">sample</td>
              <td className="px-3 py-2 font-sans">Active sample row</td>
              <td className="px-3 py-2">S-024</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Acknowledge, do not delete. An alert is a record even after someone has
          seen it.
        </li>
        <li>
          Instrument state needs text. Color is an accent on the label, never the
          label itself.
        </li>
        <li>
          An ETA is data. Show minutes when the run is moving, show a clock time
          when it is scheduled, and show why when it is blocked.
        </li>
        <li>
          Offline is a mode, not an error. The last snapshot stays readable and
          local actions say they are local.
        </li>
        <li>
          The count in the header, the cards, and the table must describe the
          same snapshot. Pass one `asOf` and use it everywhere.
        </li>
      </ul>
    </article>
  );
}
