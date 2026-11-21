import type { Metadata } from "next";
import { ContrastToggle } from "@/components/contrast-toggle";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Design tokens",
  description:
    "The Aperture token contract: surfaces, status colors, data palette, type, radius, and density.",
};

const SURFACES = [
  ["background", "Page canvas"],
  ["card", "Raised content surface"],
  ["popover", "Floating surface"],
  ["muted", "Recessive surface"],
  ["accent", "Hover and pressed wash"],
  ["primary", "Highest-emphasis action"],
  ["border", "Hairline separator"],
  ["input", "Form control edge"],
];

const STATUS = [
  ["destructive", "Error, failed run"],
  ["warning", "Degraded, needs attention"],
  ["success", "Complete, passing"],
  ["info", "Neutral informational state"],
];

const CHARTS = [1, 2, 3, 4, 5, 6, 7, 8];

const TYPE = [
  ["display", "text-5xl font-bold", "48 / 1.05"],
  ["h1", "text-3xl font-semibold", "32 / 1.1"],
  ["h2", "text-2xl font-semibold", "24 / 1.2"],
  ["h3", "text-xl font-semibold", "20 / 1.25"],
  ["h4", "text-lg font-semibold", "18 / 1.3"],
  ["body", "text-base", "16 / 1.5"],
  ["label", "text-sm font-medium", "14 / 1.125"],
  ["caption", "text-xs text-muted-foreground", "12 / 1.4"],
];

export default function TokensPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Design</Badge>
        <Badge variant="outline">Contract</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Design tokens
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Components consume semantic tokens only. No raw hex, no
        <code className="mx-1 font-mono text-sm">rgb()</code>, no
        <code className="mx-1 font-mono text-sm">hsl()</code>. The complete
        contract is in <code className="font-mono text-sm">design.md</code>.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <ContrastToggle />
        <span className="text-muted-foreground text-xs">
          Toggles the high-contrast token override.
        </span>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Monochrome brand
      </h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        There is no brand hue. Identity comes from the aperture mark, the type
        hierarchy, hairlines, and the grid. Color appears only to encode data or
        status.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Surfaces
      </h2>
      <div
        className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2"
        data-shot="tokens-surfaces"
      >
        {SURFACES.map(([token, job]) => (
          <div
            className="flex items-center gap-3 bg-background p-4"
            key={token}
          >
            <span
              className="size-8 shrink-0 rounded-md border"
              style={{ background: `var(--${token})` }}
            />
            <div className="min-w-0">
              <p className="font-mono text-xs">--{token}</p>
              <p className="text-muted-foreground text-xs">{job}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {STATUS.map(([token, job]) => (
          <div className="rounded-xl border p-4" key={token}>
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: `var(--${token})` }}
              />
              <span className="font-mono text-xs">--{token}</span>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">{job}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
        Status color is never the only signal. Pair it with a label, icon, or
        pattern.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data palette
      </h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        Eight categorical colors adapted from Okabe–Ito. Use them in order, and
        never cycle past eight without grouping the remainder.
      </p>
      <div
        className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8"
        data-shot="tokens-palette"
      >
        {CHARTS.map((index) => (
          <div key={index}>
            <div
              className="h-14 rounded-lg border"
              style={{ background: `var(--chart-${index})` }}
            />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              chart-{index}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Type scale
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        {TYPE.map(([name, className, spec]) => (
          <div
            className="flex items-baseline justify-between gap-6 border-b px-4 py-3 last:border-0"
            key={name}
          >
            <span className={className}>Aa</span>
            <div className="text-end">
              <p className="font-mono text-xs">{name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {spec}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Radius
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {[
          ["sm", "rounded-sm"],
          ["md", "rounded-md"],
          ["lg", "rounded-lg"],
          ["xl", "rounded-xl"],
          ["2xl", "rounded-2xl"],
        ].map(([name, className]) => (
          <div className="text-center" key={name}>
            <div className={`size-16 border bg-muted ${className}`} />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {name}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Density
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-9 px-3 text-left font-medium text-muted-foreground">
                Density
              </th>
              <th className="h-9 px-3 text-right font-medium text-muted-foreground">
                Row height
              </th>
              <th className="h-9 px-3 text-right font-medium text-muted-foreground">
                Cell padding
              </th>
              <th className="h-9 px-3 text-right font-medium text-muted-foreground">
                Table text
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["compact", "32 px", "6 px", "12 px"],
              ["default", "40 px", "10 px", "13 px"],
              ["comfortable", "48 px", "12 px", "14 px"],
            ].map((row) => (
              <tr className="border-b last:border-0" key={row[0]}>
                {row.map((cell, index) => (
                  <td
                    className={
                      index === 0
                        ? "px-3 py-2.5 font-mono text-xs"
                        : "px-3 py-2.5 text-right tabular-nums"
                    }
                    key={cell}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
