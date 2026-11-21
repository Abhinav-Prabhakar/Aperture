import { ArrowUpRightIcon, MoreHorizontalIcon } from "lucide-react";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/registry/default/ui/card";

export const metadata: Metadata = {
  title: "Card",
  description: "The Aperture card and panel grammar.",
};

export default function CardPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Element</Badge>
        <Badge variant="outline">Stable in coss/ui</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Card
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A bordered surface for one coherent object: a sample, a run, a dataset,
        a settings group. A card is not a layout container.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Basic
      </h2>
      <div
        className="mt-4 rounded-xl border bg-muted/32 p-6"
        data-shot="card-basic"
      >
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Magnetic susceptibility</CardTitle>
            <CardDescription>
              Run 12 · 24 samples · analyzed 14 Nov 2026
            </CardDescription>
            <CardAction>
              <Button
                aria-label="Sample actions"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontalIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardPanel>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Mean χ</dt>
                <dd className="mt-0.5 tabular-nums">3.42 × 10⁻⁶ m³/kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Std. dev.</dt>
                <dd className="mt-0.5 tabular-nums">0.18 × 10⁻⁶ m³/kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Operator</dt>
                <dd className="mt-0.5">A. Okafor</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Instrument</dt>
                <dd className="mt-0.5">MPMS-3</dd>
              </div>
            </dl>
          </CardPanel>
          <CardFooter className="justify-between">
            <Badge variant="success">Complete</Badge>
            <Button size="sm" variant="outline">
              Open run
              <ArrowUpRightIcon />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <CodeBlock
        code={`<Card>
  <CardHeader>
    <CardTitle>Magnetic susceptibility</CardTitle>
    <CardDescription>Run 12 · 24 samples</CardDescription>
    <CardAction>
      <Button size="icon-sm" variant="ghost" aria-label="Actions">
        <MoreHorizontalIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardPanel>{/* values, units, provenance */}</CardPanel>
  <CardFooter>
    <Badge variant="success">Complete</Badge>
  </CardFooter>
</Card>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Anatomy
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Part
              </th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Job
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "CardHeader",
                "Title, description, and an optional action in column two.",
              ],
              [
                "CardPanel",
                "The body. The only part that scrolls if the card is fixed.",
              ],
              [
                "CardFooter",
                "Status and actions. Right-align primary actions.",
              ],
              [
                "CardAction",
                "A single icon or menu; it spans both header rows.",
              ],
            ].map(([part, job]) => (
              <tr className="border-b last:border-0" key={part}>
                <td className="px-3 py-3 font-mono text-xs">{part}</td>
                <td className="px-3 py-3 text-muted-foreground">{job}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>One object per card. If it needs tabs, it is a page or a panel.</li>
        <li>Put units in the label or the value, never in a tooltip.</li>
        <li>Use a table for comparison, a card for a single record.</li>
        <li>Do not nest cards. Use Frame or CardFrame for grouped panels.</li>
        <li>The footer is for state and actions, not for more data.</li>
      </ul>
    </article>
  );
}
