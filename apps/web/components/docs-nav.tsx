"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/registry/default/lib/utils";

const NAV = [
  {
    title: "Getting started",
    items: [{ href: "/docs", label: "Introduction" }],
  },
  {
    title: "Instruments",
    items: [
      { href: "/docs/instruments", label: "Overview", exact: true },
      {
        href: "/docs/instruments/scientific-number",
        label: "Scientific Number",
      },
      { href: "/docs/instruments/quantity-input", label: "Quantity Input" },
      { href: "/docs/instruments/stat", label: "Stat" },
      { href: "/docs/instruments/sparkline", label: "Sparkline" },
      { href: "/docs/instruments/status-badge", label: "Status Badge" },
      { href: "/docs/instruments/log-viewer", label: "Log Viewer" },
      { href: "/docs/instruments/timeline", label: "Timeline" },
      { href: "/docs/instruments/protocol-steps", label: "Protocol Steps" },
      { href: "/docs/instruments/metadata-editor", label: "Metadata Editor" },
      { href: "/docs/instruments/file-dropzone", label: "File Dropzone" },
      { href: "/docs/instruments/data-table", label: "Data Table" },
      {
        href: "/docs/instruments/uncertainty-input",
        label: "Uncertainty Input",
      },
    ],
  },
  {
    title: "Life sciences",
    items: [
      {
        href: "/docs/instruments/sequence-viewer",
        label: "Sequence Viewer",
      },
    ],
  },
  {
    title: "Workbenches",
    items: [
      { href: "/docs/workbenches", label: "Overview", exact: true },
      { href: "/docs/workbenches/workspace-shell", label: "Workspace Shell" },
      { href: "/docs/workbenches/data-explorer", label: "Data Explorer" },
      { href: "/docs/workbenches/lab-dashboard", label: "Lab Dashboard" },
      { href: "/docs/workbenches/run-detail", label: "Run Detail" },
      { href: "/docs/workbenches/sample-registry", label: "Sample Registry" },
    ],
  },
  {
    title: "Elements",
    items: [
      { href: "/docs/elements", label: "All elements" },
      { href: "/docs/elements/button", label: "Button" },
      { href: "/docs/elements/card", label: "Card" },
    ],
  },
  {
    title: "Design",
    items: [{ href: "/docs/design/tokens", label: "Tokens" }],
  },
];

export function DocsNav() {
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const current =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;

  return (
    <nav aria-label="Docs" className="grid gap-7">
      {NAV.map((group) => (
        <div key={group.title}>
          <p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
            {group.title}
          </p>
          <ul className="grid gap-0.5">
            {group.items.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? current === item.href
                  : item.href === "/docs"
                    ? current === "/docs"
                    : current.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                      active
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
