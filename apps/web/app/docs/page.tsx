import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Aperture is a copy-paste UI system for research software, built on coss/ui.",
};

const LAYERS = [
  {
    title: "Elements",
    href: "/docs/elements",
    description:
      "Accessible primitives: 56 vendored from coss/ui, plus research additions as they land.",
    badge: "56 ready",
  },
  {
    title: "Instruments",
    href: "/docs/instruments",
    description:
      "Research-native components: quantities, uncertainty, measurement tables, exclusion ledgers, result blocks, manifests, logs, protocols, sequences, growth curves, spectra, the periodic table, constants.",
    badge: "26 built",
  },
  {
    title: "Workbenches",
    href: "/docs/workbenches",
    description:
      "Complete screens: workspace shell, data explorer, lab dashboard, run detail, sample registry.",
    badge: "5 ready",
  },
];

export default function DocsPage() {
  return (
    <article>
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
        Documentation
      </p>
      <h1 className="mt-3 font-heading font-bold text-4xl tracking-tight">
        Aperture
      </h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        A copy-paste UI system for scientific software. Start with an element,
        compose an instrument, and ship a workbench you own.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="outline">Pre-alpha</Badge>
        <Badge variant="outline">MIT</Badge>
        <Badge variant="outline">React 19 · Tailwind 4</Badge>
      </div>

      <div className="mt-10 rounded-xl border bg-muted/32 p-4">
        <p className="font-medium text-sm">Phase 1 is well underway.</p>
        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
          The element layer, tokens, registry pipeline, all twelve founding
          instruments, the first three life-sciences instruments, the first
          three physical-sciences instruments, all five workbenches, and the
          first eight research records are in place. The remaining research-act
          instruments and the rest of the domain packs come next.
        </p>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          The research records came from an audit of the first eighteen
          instruments. Read{" "}
          <Link
            className="underline underline-offset-4"
            href="/docs/research/instruments-2026"
          >
            what researchers actually need
          </Link>{" "}
          for the evidence and the build order.
        </p>
      </div>

      <h2 className="mt-12 font-heading font-semibold text-2xl tracking-tight">
        The three layers
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {LAYERS.map((layer) => (
          <Card key={layer.title}>
            <CardHeader>
              <CardTitle className="text-base">{layer.title}</CardTitle>
              <CardDescription>{layer.description}</CardDescription>
            </CardHeader>
            <div className="mt-auto flex items-center justify-between gap-2 px-6 pb-6">
              <Badge size="sm" variant="secondary">
                {layer.badge}
              </Badge>
              <Button
                render={<Link href={layer.href} />}
                size="sm"
                variant="ghost"
              >
                Open
                <ArrowRightIcon />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-heading font-semibold text-2xl tracking-tight">
        Install
      </h2>
      <p className="mt-2 text-muted-foreground">
        The CLI and registry commands are the contract. They are implemented as
        the registry publishes.
      </p>
      <CodeBlock
        code={`# Add tokens, fonts, and base styles
npx @aperture/cli init

# Add an element
npx shadcn@latest add @aperture/button

# Add an instrument
npx shadcn@latest add @aperture/quantity-input

# Add a workbench
npx shadcn@latest add @aperture/data-explorer`}
        filename="Terminal"
      />

      <h2 className="mt-12 font-heading font-semibold text-2xl tracking-tight">
        Where to start
      </h2>
      <ul className="mt-4 grid gap-3">
        {[
          {
            href: "/docs/elements/button",
            label: "Button",
            detail: "Variants, sizes, loading, and icon composition.",
          },
          {
            href: "/docs/elements/card",
            label: "Card",
            detail: "The panel grammar used across every workbench.",
          },
          {
            href: "/docs/workbenches/workspace-shell",
            label: "Workspace Shell",
            detail: "The frame: navigation, command palette, inspector, and status bar.",
          },
          {
            href: "/docs/workbenches/data-explorer",
            label: "Data Explorer",
            detail: "The first complete workbench, with every state.",
          },
          {
            href: "/docs/workbenches/lab-dashboard",
            label: "Lab Dashboard",
            detail: "Instrument health, alerts, samples, and the day’s schedule.",
          },
          {
            href: "/docs/workbenches/run-detail",
            label: "Run Detail",
            detail: "Parameters, QC metrics, artifacts, and provenance for one run.",
          },
          {
            href: "/docs/workbenches/sample-registry",
            label: "Sample Registry",
            detail: "Storage, aliquots, chain of custody, and linked runs.",
          },
          {
            href: "/docs/design/tokens",
            label: "Design tokens",
            detail: "The exact surfaces, type scale, radius, and density.",
          },
        ].map((item) => (
          <li key={item.href}>
            <Link
              className="group flex items-baseline justify-between gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
              href={item.href}
            >
              <span>
                <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-muted-foreground text-sm">
                  {item.detail}
                </span>
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
