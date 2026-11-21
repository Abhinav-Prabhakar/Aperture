import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { ProtocolStepsDemo } from "@/registry/default/examples/protocol-steps-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Protocol Steps",
  description:
    "A sequential protocol with progress, durations, active step, cautions, and skipped steps.",
};

export default function ProtocolStepsPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Workflow</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Protocol Steps
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A protocol is executed in order, under time pressure. Show where you
        are, what comes next, and what must not go wrong.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <ProtocolStepsDemo />
      </div>
      <CodeBlock
        code={`const steps: ProtocolStep[] = [
  {
    id: "load",
    title: "Load the gel",
    duration: "15 min",
    status: "active",
    note: {
      kind: "caution",
      text: "Do not overfill the wells.",
    },
  },
  {
    id: "run",
    title: "Run the gel",
    duration: "45 min at 120 V",
    status: "pending",
  },
];

<ProtocolSteps label="Western blot · day 1" steps={steps} />`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        States
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-3 text-start font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-10 px-3 text-start font-medium text-muted-foreground">
                Meaning
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Pending", "Not started. The default for every step."],
              ["Active", "Happening now. Exactly one step, or none."],
              ["Complete", "Finished and recorded."],
              [
                "Skipped",
                "Deliberately not done. Record the reason in the description.",
              ],
            ].map(([status, meaning]) => (
              <tr className="border-b last:border-0" key={status}>
                <td className="px-3 py-3 font-mono text-xs">{status}</td>
                <td className="px-3 py-3 text-muted-foreground">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          A step has one status. Do not derive it from a timer; a timer is not a
          completion record.
        </li>
        <li>
          Durations are part of the step, not a deadline. “45 min at 120 V” is
          more useful than “45 min”.
        </li>
        <li>
          A caution describes a way to lose the sample. A note describes
          something easy to forget. Do not use one for the other.
        </li>
        <li>Skipped is a result, not an absence. Say why it was skipped.</li>
        <li>
          The progress bar counts completed steps only. Skipped steps are shown
          but not counted as complete.
        </li>
      </ul>
    </article>
  );
}
