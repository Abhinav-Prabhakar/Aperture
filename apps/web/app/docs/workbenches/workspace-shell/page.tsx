import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export const metadata: Metadata = {
  title: "Workspace Shell",
  description:
    "A complete application frame: sidebar, breadcrumbs, command palette, inspector, status bar, mobile navigation, and print.",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const COMPOSITION = `import { usePathname, useRouter } from "next/navigation";
import { TestTubesIcon } from "lucide-react";
import { WorkspaceShell } from "@/components/workbenches/workspace-shell";

const nav = [
  {
    label: "Workspace",
    items: [
      {
        id: "samples",
        label: "Sample Registry",
        href: "/samples",
        icon: <TestTubesIcon />,
      },
    ],
  },
];

export function LabLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <WorkspaceShell
      activeId={pathname === "/samples" ? "samples" : undefined}
      asOf="2026-11-22T12:18:00Z"
      nav={nav}
      onNavigate={(href) => router.push(href)}
      workspace={{ name: "Lab 03", code: "L03", location: "Bay 3" }}
    >
      {children}
    </WorkspaceShell>
  );
}`;

export default function WorkspaceShellPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Workbench</Badge>
        <Badge variant="outline">P0</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Workspace Shell
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The frame around every other screen. Navigation, breadcrumbs, a command
        palette, an inspector, a status bar, and mobile drawers — without a
        sidebar that becomes a second product.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          render={<Link href="/workbenches" />}
          size="sm"
          variant="default"
        >
          Open the workspace
          <ArrowUpRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          The workbench previews on this site run inside it.
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Workspace Shell with a sidebar, breadcrumbs, command search, status bar, and a lab overview"
        className="mt-6 w-full rounded-xl border"
        src={`${BASE_PATH}/assets/workbench-workspace-shell.webp`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is inside
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">A quiet sidebar.</strong> Grouped
          navigation with icons, optional counts, and an active state. On small
          screens it becomes a left sheet; the page keeps its scroll position.
        </li>
        <li>
          <strong className="font-medium">A command palette.</strong>{" "}
          <kbd className="rounded border bg-muted px-1 font-mono text-[11px]">
            ⌘K
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border bg-muted px-1 font-mono text-[11px]">
            Ctrl K
          </kbd>{" "}
          searches every page and host action. Arrow keys, Enter, and Escape work
          without a mouse.
        </li>
        <li>
          <strong className="font-medium">Breadcrumbs with a place.</strong>{" "}
          Workspace, section group, and page. The active nav item is derived by
          the host, so the shell does not guess from a URL it does not own.
        </li>
        <li>
          <strong className="font-medium">An inspector slot.</strong> A right
          panel on desktop, a right sheet below that. The host supplies the
          contents; the shell supplies the frame, close control, and focus
          return.
        </li>
        <li>
          <strong className="font-medium">A status bar with facts.</strong>{" "}
          Connection state, the fixed{" "}
          <code className="font-mono text-xs">asOf</code> instant in UTC, a
          keyboard hint, and a version. No fake live clock.
        </li>
        <li>
          <strong className="font-medium">Print without chrome.</strong> The top
          bar, sidebar, inspector, and status bar disappear; the workbench's own
          print header remains.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Layout states
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Ready and offline.</strong> Offline
          replaces the connection line in the status bar and leaves the cached
          content in place.
        </li>
        <li>
          <strong className="font-medium">Navigation closed, open, and
          dismissed.</strong> Desktop keeps the sidebar; mobile opens a labeled
          sheet and returns focus to the trigger.
        </li>
        <li>
          <strong className="font-medium">Inspector open and collapsed.</strong>{" "}
          The toggle reports its state, and the panel has its own accessible
          name.
        </li>
        <li>
          <strong className="font-medium">Command palette idle, searching, and
          empty.</strong> An unmatched query says so instead of showing a blank
          list.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Navigation in.</strong> Pass groups of
          items with an <code className="font-mono text-xs">href</code>, a stable{" "}
          <code className="font-mono text-xs">id</code>, and an optional icon,
          badge, or description. The shell renders links; your router decides
          what they mean.
        </li>
        <li>
          <strong className="font-medium">Commands in.</strong> A command can be
          a route, an external URL, or a{" "}
          <code className="font-mono text-xs">run()</code> callback. Every
          navigation item is added to the palette automatically.
        </li>
        <li>
          <strong className="font-medium">Navigation out.</strong>{" "}
          <code className="font-mono text-xs">onNavigate(href, event)</code> is
          called after the default is prevented. Without it, links navigate
          normally and commands use{" "}
          <code className="font-mono text-xs">window.location</code>.
        </li>
        <li>
          <strong className="font-medium">Actions out.</strong>{" "}
          <code className="font-mono text-xs">onCommand(command)</code> fires for
          every selection, before the command runs. Use it for analytics,
          permission checks, or persistence.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Install
      </h2>
      <CodeBlock code="npx shadcn@latest add @aperture/workspace-shell" />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Composition
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Built from <code className="font-mono text-xs">Breadcrumb</code>,{" "}
        <code className="font-mono text-xs">Command</code>,{" "}
        <code className="font-mono text-xs">Sheet</code>,{" "}
        <code className="font-mono text-xs">Avatar</code>,{" "}
        <code className="font-mono text-xs">Kbd</code>, and{" "}
        <code className="font-mono text-xs">Button</code>. The host supplies
        pages, user, actions, and inspector content. No private runtime and no
        hidden provider.
      </p>
      <CodeBlock code={COMPOSITION} />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>A skip link targets the scrollable main region.</li>
        <li>
          The sidebar is a labeled{" "}
          <code className="font-mono text-xs">nav</code>; the active item uses{" "}
          <code className="font-mono text-xs">aria-current</code>.
        </li>
        <li>
          Dialogs have accessible names, close buttons, and focus return. The
          command input is a labeled combobox.
        </li>
        <li>
          Inspector and navigation toggles report{" "}
          <code className="font-mono text-xs">aria-expanded</code> and control a
          named region.
        </li>
        <li>
          Every icon-only control has a label; the status line is announced with{" "}
          <code className="font-mono text-xs">role=&quot;status&quot;</code>.
        </li>
        <li>
          Logical properties and mirrored chevrons keep RTL layouts honest.
        </li>
      </ul>
    </article>
  );
}
