import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Sample Registry",
  description:
    "A complete sample inventory workbench: studies, storage, aliquots, chain of custody, linked runs, CSV export, and every state.",
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

export default function SampleRegistryPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbench</Badge>
        <Badge variant="outline">P1</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Sample Registry
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Where the sample is, who has it, what remains, and how it got here. The
        inventory a freezer lies about, replaced by a record with a custodian
        and a timestamp on every step.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          render={<Link href="/workbenches/sample-registry" />}
          size="sm"
          variant="default"
        >
          Open full screen
          <ArrowUpRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          Twelve synthetic samples across four studies.
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Sample Registry with filters, inventory table, storage detail, aliquots, and chain of custody"
        className="mt-6 w-full rounded-xl border"
        src={`${BASE_PATH}/assets/workbench-sample-registry.webp`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is inside
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">One inventory across studies.</strong>{" "}
          Sample ID, accession, study, type, status, storage, volume, and receipt
          date. Quarantined, consumed, and destroyed samples stay in the record
          instead of vanishing.
        </li>
        <li>
          <strong className="font-medium">Storage you can act on.</strong> Freezer,
          rack, box, and position in one mono string, plus the remaining volume
          and a missing volume rendered as an em dash, never zero.
        </li>
        <li>
          <strong className="font-medium">Aliquots and lineage.</strong> Each
          aliquot carries its own location, volume, and state. Derived material
          points back to its parent sample.
        </li>
        <li>
          <strong className="font-medium">Chain of custody.</strong> Collected,
          accessioned, stored, and the latest action — retrieval, quarantine,
          depletion, destruction, or a volume check — with an actor and a UTC
          timestamp.
        </li>
        <li>
          <strong className="font-medium">Linked runs.</strong> A sample opens the
          run report that consumed it, so the inventory and the result stay
          connected.
        </li>
        <li>
          <strong className="font-medium">Export and print.</strong> The current
          filtered view exports as CSV; printing keeps the inventory and the open
          record and drops the chrome.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Every state
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Offline keeps the cached registry and marks that export stays local.
        Empty is a lab with no samples, not a failed request.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {STATES.map(([label, state]) => (
          <li key={state}>
            <Button
              render={
                <Link href={`/workbenches/sample-registry?state=${state}`} />
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
      <CodeBlock code="npx shadcn@latest add @aperture/sample-registry" />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Composition
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Built from <code className="font-mono text-xs">DataTable</code>,{" "}
        <code className="font-mono text-xs">StatusBadge</code>,{" "}
        <code className="font-mono text-xs">Stat</code>, and{" "}
        <code className="font-mono text-xs">Timeline</code>. The workbench adds
        filtering, storage and aliquot records, custody events, URL sync, CSV,
        and print — no private runtime.
      </p>
    </article>
  );
}
