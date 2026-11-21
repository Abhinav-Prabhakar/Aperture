import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { LogViewerDemo } from "@/registry/default/examples/log-viewer-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Log Viewer",
  description:
    "A dense, filterable run log with severity, source, timestamps, and follow mode.",
};

export default function LogViewerPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Diagnostics</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Log Viewer
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        What happened, when, and where. A run log has to stay readable at 2
        a.m., with a thousand lines, on a laptop at the bench.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <LogViewerDemo />
      </div>
      <CodeBlock
        code={`const entries: LogEntry[] = [
  {
    id: "4",
    time: "14:03:42",
    dateTime: "2026-11-21T14:03:42Z",
    level: "warning",
    source: "reader",
    message: "Well D7 saturated at 4.12 × 10⁶ AU; result censored.",
  },
];

<LogViewer entries={entries} title="Plate reader · run 12" />`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Anatomy
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-3 text-start font-medium text-muted-foreground">
                Part
              </th>
              <th className="h-10 px-3 text-start font-medium text-muted-foreground">
                Behavior
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Time",
                "Short display time; the machine-readable moment goes in dateTime.",
              ],
              [
                "Level",
                "Debug, info, warn, or error. Always a word, never only a color.",
              ],
              [
                "Source",
                "The producer: reader, pump, analysis, export. Makes multi-process logs usable.",
              ],
              [
                "Follow",
                "Keeps the newest line in view. Turn it off to read history without being pulled down.",
              ],
              [
                "Filter",
                "Hides levels; it does not delete them. The count shows what is hidden.",
              ],
            ].map(([part, behavior]) => (
              <tr className="border-b last:border-0" key={part}>
                <td className="px-3 py-3 font-mono text-xs">{part}</td>
                <td className="px-3 py-3 text-muted-foreground">{behavior}</td>
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
          Put the interesting fact first. “Well D7 saturated” beats “Warning
          while reading”.
        </li>
        <li>
          A warning is a result with a caveat; an error is a failure. Do not use
          one for the other.
        </li>
        <li>
          Keep secrets out. Logs are copied into tickets, notebooks, and papers;
          redact at the source.
        </li>
        <li>
          Use <code className="font-mono">announce</code> only for a single
          monitored line, not a streaming log.
        </li>
        <li>
          This component presents entries. It does not rotate, store, or
          transmit them.
        </li>
      </ul>
    </article>
  );
}
