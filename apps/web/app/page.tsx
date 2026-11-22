import { ArrowRightIcon, CommandIcon } from "lucide-react";
import Link from "next/link";
import { ApertureMark } from "@/components/aperture-mark";
import { CopyCommand } from "@/components/copy-command";
import { SampleExplorer } from "@/components/sample-explorer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import { Kbd } from "@/registry/default/ui/kbd";
import { Separator } from "@/registry/default/ui/separator";

const LAYERS = [
  {
    name: "Elements",
    copy: "Accessible primitives with the Aperture design language. Buttons, fields, tables, dialogs, navigation — the parts you should never rebuild.",
    detail: "56 vendored from coss/ui",
  },
  {
    name: "Instruments",
    copy: "Research-native components that solve one real problem well. Quantity inputs, uncertainty, log viewers, protocol steps, spectra.",
    detail: "13 built, 12 in the founding set",
  },
  {
    name: "Workbenches",
    copy: "Complete screens with navigation, canvas, inspector, status bar, empty states, and the details that take another month.",
    detail: "5 in the first release",
  },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Chrome is achromatic.",
    copy: "Color belongs to the data. The interface stays quiet so the measurement, image, or map can speak.",
  },
  {
    number: "02",
    title: "Dense by default.",
    copy: "Researchers read tables for a living. Density is a feature when it is structured, aligned, and predictable.",
  },
  {
    number: "03",
    title: "Show the state.",
    copy: "Units, uncertainty, missing values, provenance, and run status are never hidden. Missing data is not zero.",
  },
  {
    number: "04",
    title: "Accessible is not optional.",
    copy: "Keyboard-first, screen-reader-aware, colorblind-safe, reduced-motion-safe, RTL-ready, legible at 200% zoom.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b" data-shot="hero">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
          />
          <div className="container relative grid items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-22">
            <div>
              <p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-wider">
                Open source · React · Tailwind · MIT
              </p>
              <h1 className="max-w-xl text-balance font-heading font-bold text-5xl leading-[1.02] tracking-tight sm:text-6xl">
                Building blocks for researchers.
              </h1>
              <p className="mt-5 max-w-lg text-balance text-lg text-muted-foreground leading-relaxed">
                A copy-paste UI system for scientific software. Elements,
                instruments, and whole workbenches — so you can spend your time
                on the science.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <Button render={<Link href="/docs/instruments" />} size="lg">
                  Browse instruments
                  <ArrowRightIcon />
                </Button>
                <Button
                  render={<Link href="/docs/design/tokens" />}
                  size="lg"
                  variant="outline"
                >
                  Read the design system
                </Button>
              </div>
              <div className="mt-6">
                <CopyCommand command="npx @aperture/cli init" />
              </div>
            </div>

            <div className="min-w-0">
              <div
                className="rounded-2xl border bg-card p-1.5 shadow-sm"
                data-shot="explorer"
              >
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <ApertureMark className="size-4" />
                  <span className="font-medium text-xs">Data Explorer</span>
                  <span className="hidden text-muted-foreground text-xs sm:inline">
                    /
                  </span>
                  <span className="hidden truncate text-muted-foreground text-xs sm:inline">
                    Magnetic susceptibility · run 12
                  </span>
                  <div className="ms-auto flex items-center gap-2">
                    <Badge size="sm" variant="success">
                      Analysis complete
                    </Badge>
                    <span className="hidden items-center gap-1 text-muted-foreground text-xs sm:flex">
                      <CommandIcon className="size-3" />
                      <Kbd className="h-4 min-w-4 text-[10px]">K</Kbd>
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="p-1.5 pt-2">
                  <SampleExplorer />
                </div>
              </div>
              <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
                Live composition · every element is from the registry
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Project facts"
          className="border-b"
          data-shot="facts"
        >
          <div className="container grid grid-cols-2 divide-x divide-border py-0 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["56", "elements"],
              ["13", "instruments"],
              ["5", "workbenches"],
              ["MIT", "license"],
              ["AA", "WCAG 2.2 target"],
              ["8", "disciplines planned"],
            ].map(([value, label]) => (
              <div className="px-3 py-5 first:ps-0" key={label}>
                <p className="font-heading font-semibold text-xl tracking-tight">
                  {value}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b" data-shot="layers">
          <div className="container py-16 lg:py-20">
            <div className="max-w-2xl">
              <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                The layers
              </p>
              <h2 className="mt-3 font-heading font-semibold text-3xl tracking-tight">
                Three layers. One system.
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Start with an element. Compose an instrument. Ship a workbench.
              </p>
            </div>
            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
              {LAYERS.map((layer, index) => (
                <article className="bg-background p-6" key={layer.name}>
                  <p className="font-mono text-muted-foreground text-xs">
                    0{index + 1}
                  </p>
                  <h3 className="mt-6 font-heading font-semibold text-xl">
                    {layer.name}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {layer.copy}
                  </p>
                  <p className="mt-5 font-mono text-muted-foreground text-xs">
                    {layer.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b" data-shot="principles">
          <div className="container grid gap-10 py-16 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
            <div>
              <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                Principles
              </p>
              <h2 className="mt-3 font-heading font-semibold text-3xl tracking-tight">
                Designed like an instrument.
              </h2>
              <p className="mt-3 max-w-sm text-muted-foreground">
                Quiet surfaces, precise edges, and defaults that respect the
                data.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <article className="bg-background p-6" key={principle.number}>
                  <p className="font-mono text-muted-foreground text-xs">
                    {principle.number}
                  </p>
                  <h3 className="mt-4 font-heading font-semibold text-base">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {principle.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="container py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                  Provenance
                </p>
                <h2 className="mt-3 font-heading font-semibold text-3xl tracking-tight">
                  Built in the open. Standing on good work.
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Aperture is MIT-licensed and built on{" "}
                  <a
                    className="underline underline-offset-4 hover:text-foreground"
                    href="https://coss.com/ui"
                    rel="noreferrer"
                    target="_blank"
                  >
                    coss/ui
                  </a>
                  , the design system from Cal.com. We are grateful for their
                  work, and we are not affiliated with or endorsed by Cal.com.
                </p>
              </div>
              <Button
                render={<Link href="/docs" />}
                size="lg"
                variant="outline"
              >
                Read the plan
                <ArrowRightIcon />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-muted-foreground text-xs">
              {[
                "coss/ui",
                "Base UI",
                "Tailwind CSS",
                "shadcn/ui",
                "Cal Sans",
                "JetBrains Mono",
              ].map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container flex flex-wrap items-center gap-3 py-8 text-muted-foreground text-xs">
        <ApertureMark className="size-4" />
        <span className="font-medium text-foreground">Aperture</span>
        <span>© 2026 Aperture contributors</span>
        <span className="ms-auto font-mono">Built on coss/ui · MIT</span>
      </footer>
    </>
  );
}
