import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { TimelineDemo } from "@/registry/default/examples/timeline-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "A chronological record of a run with times, outcomes, context, and an honest empty state.",
};

export default function TimelinePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Provenance</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Timeline
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        An experiment is a sequence, not a pile of results. The timeline keeps
        the order, the times, and the outcomes visible together.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <TimelineDemo />
      </div>
      <CodeBlock
        code={`<Timeline
  label="Run 12 events"
  items={[
    {
      id: "calibration",
      title: "Reader calibrated",
      time: "09:05",
      dateTime: "2026-11-21T09:05:00Z",
      status: "success",
    },
    {
      id: "warning",
      title: "One well censored",
      description: "D7 saturated the detector.",
      time: "09:41",
      dateTime: "2026-11-21T09:41:00Z",
      status: "warning",
    },
  ]}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Oldest first, newest last. A timeline reads forward; a feed reads
          backward.
        </li>
        <li>
          Show a time for every event. If the time is unknown, say so instead of
          guessing.
        </li>
        <li>
          A status is optional. Neutral events are still events, and not
          everything is a success.
        </li>
        <li>
          Put operator, instrument, and sample context in the meta line, not in
          the title.
        </li>
        <li>
          The time element carries a machine-readable{" "}
          <code className="font-mono">dateTime</code>; the label stays short.
        </li>
      </ul>
    </article>
  );
}
