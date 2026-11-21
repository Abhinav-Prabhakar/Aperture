import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Run Detail",
  description:
    "A complete run report workbench: parameters, QC metrics, artifacts with checksums, provenance, run log, and every state.",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const STATES = [
  ["Ready", "ready"],
  ["Loading", "loading"],
  ["Error", "error"],
  ["Permission denied", "denied"],
  ["Not found", "missing"],
  ["Offline", "offline"],
] as const;

export default function RunDetailPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbench</Badge>
        <Badge variant="outline">P1</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Run Detail
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The record a reviewer asks for six months later: what ran, on which
        instrument, with which parameters, what passed, what did not, and which
        files came out. One page, every number traceable.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          render={<Link href="/workbenches/run-detail" />}
          size="sm"
          variant="default"
        >
          Open full screen
          <ArrowUpRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          A completed plate read, with synthetic data.
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Run Detail with parameters, QC metrics, provenance, artifacts, and a run log"
        className="mt-6 w-full rounded-xl border"
        src={`${BASE_PATH}/assets/workbench-run-detail.webp`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is inside
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The run at a glance.</strong> Status,
          duration, sample counts, QC metrics in range, and artifact size. Each
          stat carries the fact behind it, not just a number.
        </li>
        <li>
          <strong className="font-medium">Parameters as recorded.</strong>{" "}
          Wavelength, temperature, replicates, outlier rule, and plate layout in
          one definition list. Values keep their units and their precision.
        </li>
        <li>
          <strong className="font-medium">Metrics against acceptance rules.</strong>{" "}
          Observed value, expected range, and a QC status per row. A warning
          stays a warning; it is never rounded into a pass.
        </li>
        <li>
          <strong className="font-medium">Artifacts with provenance.</strong>{" "}
          Six files, each with a kind, size, creation time, and full SHA-256
          checksum. Selecting a file keeps the detail in the URL.
        </li>
        <li>
          <strong className="font-medium">Events and logs.</strong> A provenance
          timeline for the run and the raw log for the person who needs the
          instrument handshake.
        </li>
        <li>
          <strong className="font-medium">A print report.</strong> Printing keeps
          the header, stats, parameters, and metrics, and drops the interactive
          chrome.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Every state
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Offline keeps the cached report and says artifacts are unavailable.
        Missing is a run that was archived, not a failed request.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {STATES.map(([label, state]) => (
          <li key={state}>
            <Button
              render={<Link href={`/workbenches/run-detail?state=${state}`} />}
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
      <CodeBlock code="npx shadcn@latest add @aperture/run-detail" />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Composition
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Built from <code className="font-mono text-xs">Stat</code>,{" "}
        <code className="font-mono text-xs">ScientificNumber</code>,{" "}
        <code className="font-mono text-xs">StatusBadge</code>,{" "}
        <code className="font-mono text-xs">Timeline</code>, and{" "}
        <code className="font-mono text-xs">LogViewer</code>. The workbench adds
        layout, state handling, artifact selection, URL sync, and print — no
        private runtime.
      </p>
    </article>
  );
}
