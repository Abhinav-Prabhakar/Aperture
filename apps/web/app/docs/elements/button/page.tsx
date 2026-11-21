import {
  ArrowRightIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export const metadata: Metadata = {
  title: "Button",
  description:
    "The Aperture button: variants, sizes, loading, and composition.",
};

const VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "destructive-outline",
  "link",
] as const;

const SIZES = ["xs", "sm", "default", "lg", "xl"] as const;

export default function ButtonPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Element</Badge>
        <Badge variant="outline">Stable in coss/ui</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Button
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The primary action control. One default action per view; everything else
        is outline, ghost, or a menu item.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Variants
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border p-5">
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant === "destructive" || variant === "destructive-outline" ? (
              <TrashIcon />
            ) : null}
            {variant}
          </Button>
        ))}
      </div>
      <CodeBlock
        code={`<Button>Save</Button>
<Button variant="secondary">Duplicate</Button>
<Button variant="outline">Export</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="destructive"><TrashIcon /> Delete</Button>
<Button variant="link">Read the method</Button>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Sizes
      </h2>
      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border p-5">
        {SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button size="icon" variant="outline">
          <SettingsIcon />
        </Button>
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Heights are one step larger on touch: 28/24, 32/28, 36/32, 40/36, 44/40
        (mobile/desktop).
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Loading and disabled
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border p-5">
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <Button loading variant="outline">
          Recomputing
        </Button>
      </div>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        Loading preserves the button width, hides the label from sighted users,
        and sets <code className="font-mono">aria-disabled</code>. It is not a
        substitute for a progress indicator when the operation is long.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Composition
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border p-5">
        <Button>
          <PlusIcon />
          New sample
        </Button>
        <Button variant="outline">
          Export
          <ArrowRightIcon />
        </Button>
        <Button render={<Link href="/docs/instruments" />} variant="ghost">
          Instruments
        </Button>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Anatomy
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["Radius", "10 px (rounded-lg); xs = 8 px"],
              ["Type", "16 px mobile / 14 px desktop, medium"],
              ["Focus", "2 px ring, 1 px offset"],
              ["Disabled", "64% opacity, no pointer events"],
              ["Icon", "18/16 px, 80% opacity, 2 px optical pull"],
              ["Motion", "shadow only; no scale or translate"],
            ].map(([property, value]) => (
              <TableRow key={property}>
                <TableCell className="text-muted-foreground">
                  {property}
                </TableCell>
                <TableCell>{value}</TableCell>
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
          Use one default button per view. If everything is primary, nothing is.
        </li>
        <li>
          Destructive actions name the object: “Delete sample”, not “Delete”.
        </li>
        <li>Icon-only buttons require an accessible name.</li>
        <li>Do not put a button inside a button or a link inside a button.</li>
        <li>
          For navigation, render a link; do not attach an onClick to a button.
        </li>
      </ul>
    </article>
  );
}
