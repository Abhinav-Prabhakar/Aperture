import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Elements",
  description: "The Aperture element layer, vendored from coss/ui.",
};

const ELEMENTS = [
  "Accordion",
  "Alert",
  "Alert Dialog",
  "Autocomplete",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Button",
  "Calendar",
  "Card",
  "Checkbox",
  "Checkbox Group",
  "Collapsible",
  "Combobox",
  "Command",
  "Composer",
  "Context Menu",
  "Dialog",
  "Drawer",
  "Empty",
  "Field",
  "Fieldset",
  "Form",
  "Frame",
  "Group",
  "Input",
  "Input Group",
  "Kbd",
  "Label",
  "Menu",
  "Meter",
  "Number Field",
  "OTP Field",
  "Pagination",
  "Popover",
  "Preview Card",
  "Progress",
  "Radio Group",
  "Scroll Area",
  "Segmented Control",
  "Select",
  "Separator",
  "Sheet",
  "Sidebar",
  "Skeleton",
  "Slider",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "Toast",
  "Toggle",
  "Toggle Group",
  "Toolbar",
  "Tooltip",
];

const DOCUMENTED = new Set(["Button", "Card"]);

export default function ElementsPage() {
  return (
    <article>
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
        Layer 01
      </p>
      <h1 className="mt-3 font-heading font-bold text-4xl tracking-tight">
        Elements
      </h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        Accessible primitives with the Aperture design language. All 56 are
        vendored from{" "}
        <a
          className="underline underline-offset-4"
          href="https://coss.com/ui"
          rel="noreferrer"
          target="_blank"
        >
          coss/ui
        </a>{" "}
        at commit <code className="font-mono text-sm">b2336c4</code> and kept in
        sync.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="outline">56 elements</Badge>
        <Badge variant="outline">Keyboard accessible</Badge>
        <Badge variant="outline">Light · Dark · Contrast</Badge>
      </div>

      <div
        className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2"
        data-shot="elements-grid"
      >
        {ELEMENTS.map((name, index) => {
          const documented = DOCUMENTED.has(name);
          return (
            <div
              className="flex items-center gap-3 bg-background px-4 py-3"
              key={name}
            >
              <span className="w-7 font-mono text-[11px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {documented ? (
                <Link
                  className="font-medium text-sm underline-offset-4 hover:underline"
                  href={`/docs/elements/${name.toLowerCase()}`}
                >
                  {name}
                </Link>
              ) : (
                <span className="text-sm">{name}</span>
              )}
              <span className="ms-auto font-mono text-[10px] text-muted-foreground uppercase">
                {documented ? "docs" : "ready"}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
        Every element has a registry entry. Documentation pages are landing in
        order of use; the source in{" "}
        <code className="font-mono">registry/default/ui</code> is the reference.
      </p>

      <div className="mt-8">
        <Button
          render={<Link href="/docs/elements/button" />}
          variant="outline"
        >
          Start with Button
        </Button>
      </div>
    </article>
  );
}
