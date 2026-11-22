import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Workbenches",
  description:
    "Complete research layouts composed from Aperture elements and instruments, with real states, URL-addressable views, and a mock adapter.",
};

const WORKBENCHES = [
  {
    name: "Workspace Shell",
    href: "/docs/workbenches/workspace-shell",
    status: "Ready",
    description:
      "Sidebar, breadcrumbs, command palette, inspector, status bar, and mobile navigation.",
  },
  {
    name: "Data Explorer",
    href: "/docs/workbenches/data-explorer",
    status: "Ready",
    description:
      "Filter rail, sortable sample table, inspector, chain of custody, and CSV export.",
  },
  {
    name: "Lab Dashboard",
    href: "/docs/workbenches/lab-dashboard",
    status: "Ready",
    description:
      "Instrument status, samples in flight, alerts, schedule, and recent activity.",
  },
  {
    name: "Run Detail",
    href: "/docs/workbenches/run-detail",
    status: "Ready",
    description:
      "Parameters, status, logs, metrics, artifacts, and provenance for one run.",
  },
  {
    name: "Sample Registry",
    href: "/docs/workbenches/sample-registry",
    status: "Ready",
    description:
      "Index, filters, sample detail, and chain of custody across studies.",
  },
];

export default function WorkbenchesPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbenches</Badge>
        <Badge variant="outline">5 ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Workbenches
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A workbench is a whole screen, not a widget demonstration. Copy one in
        and replace the mock adapter with your data; the layout, states, and
        keyboard behavior are already done.
      </p>

      <ul className="mt-8 grid gap-3">
        {WORKBENCHES.map((workbench) => (
          <li
            className="rounded-xl border bg-background p-4"
            key={workbench.name}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-heading font-semibold text-lg">
                  {workbench.name}
                </h2>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {workbench.description}
                </p>
              </div>
              <Badge
                size="sm"
                variant={workbench.status === "Ready" ? "outline" : "secondary"}
              >
                {workbench.status}
              </Badge>
            </div>
            {workbench.href ? (
              <Button
                className="mt-3"
                render={<Link href={workbench.href} />}
                size="sm"
                variant="outline"
              >
                Open {workbench.name}
                <ArrowRightIcon />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What every workbench includes
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Every data state: loading, empty, error, permission denied, and
          offline. None of them is a blank screen. The shell adds offline,
          command palette, inspector, and mobile navigation states.
        </li>
        <li>
          A mock adapter with realistic, non-sensitive data. Replace it with your
          query; the components do not know where rows come from.
        </li>
        <li>
          URL-addressable filters, sort, and selection, so a colleague can open
          the exact view you are looking at.
        </li>
        <li>
          A mobile layout, a print layout, and keyboard paths for every action
          that matters.
        </li>
        <li>
          Composition only. A workbench installs elements and instruments from
          the registry; it does not hide a private runtime.
        </li>
      </ul>
    </article>
  );
}
