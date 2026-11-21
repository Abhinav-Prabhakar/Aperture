import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { StatusBadgeDemo } from "@/registry/default/examples/status-badge-demo";
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
  title: "Status Badge",
  description:
    "A state indicator that never relies on color alone: label, dot, semantics, and optional announcement.",
};

const STATES: Array<[string, string, string]> = [
  ["idle", "Idle", "Queued or waiting. Not an error."],
  ["running", "Running", "Work is in progress and the value may still change."],
  ["success", "Complete", "Finished as expected. Use past tense in the label."],
  ["warning", "Needs attention", "Finished, but outside the expected range."],
  ["error", "Failed", "Stopped without a usable result."],
  ["offline", "Offline", "The instrument cannot be reached."],
];

export default function StatusBadgePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Workflow</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Status Badge
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A state is a fact, not a decoration. The dot carries color, the label
        carries meaning, and the description explains what happened.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <StatusBadgeDemo />
      </div>
      <CodeBlock
        code={`<StatusBadge status="running" label="Acquiring" announce
  description="The plate reader is reporting live progress." />

<StatusDot status="success" label="Complete" />

<StatusBadge status="error" label="Failed" />`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        States
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Default label</TableHead>
              <TableHead className="hidden sm:table-cell">Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STATES.map(([status, label, meaning]) => (
              <TableRow key={status}>
                <TableCell className="font-mono text-xs">{status}</TableCell>
                <TableCell>{label}</TableCell>
                <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">
                  {meaning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Never use color alone. Every status has a visible label; a dot alone
          is only acceptable when the label is repeated nearby.
        </li>
        <li>
          Use the tense of the event: “Running” while it happens, “Complete” or
          “Failed” once it ends.
        </li>
        <li>
          A warning is not an error. Say what needs attention, not just that
          something does.
        </li>
        <li>
          Announce changes only when the change matters. A page full of{" "}
          <code className="font-mono">role="status"</code> regions is noise.
        </li>
        <li>
          The description is for cause and next step. Do not repeat the label in
          it.
        </li>
      </ul>
    </article>
  );
}
