"use client";

import {
  ActivityIcon,
  BookOpenIcon,
  BoxesIcon,
  FlaskConicalIcon,
  GithubIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PrinterIcon,
  Table2Icon,
  TestTubesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/registry/default/ui/button";
import { MOCK_AS_OF } from "@/registry/default/workbenches/lab-dashboard/mock-data";
import {
  type WorkspaceCommand,
  type WorkspaceNavGroup,
  WorkspaceShell,
} from "@/registry/default/workbenches/workspace-shell/workspace-shell";

const NAV: readonly WorkspaceNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/workbenches",
        icon: <LayoutDashboardIcon />,
        id: "overview",
        label: "Overview",
      },
      {
        href: "/workbenches/data-explorer",
        icon: <Table2Icon />,
        id: "data-explorer",
        label: "Data Explorer",
      },
      {
        href: "/workbenches/sample-registry",
        icon: <TestTubesIcon />,
        id: "sample-registry",
        label: "Sample Registry",
      },
      {
        href: "/workbenches/run-detail",
        icon: <FlaskConicalIcon />,
        id: "run-detail",
        label: "Run Detail",
      },
      {
        href: "/workbenches/lab-dashboard",
        icon: <ActivityIcon />,
        id: "lab-dashboard",
        label: "Lab Dashboard",
      },
    ],
  },
  {
    label: "Reference",
    items: [
      {
        href: "/docs/workbenches",
        icon: <BookOpenIcon />,
        id: "docs",
        label: "Workbench docs",
      },
      {
        href: "/docs/elements",
        icon: <BoxesIcon />,
        id: "elements",
        label: "Element catalog",
      },
      {
        href: "/",
        icon: <HomeIcon />,
        id: "home",
        label: "Aperture home",
      },
    ],
  },
];

const COMMANDS: readonly WorkspaceCommand[] = [
  {
    group: "Actions",
    icon: <PrinterIcon />,
    id: "print",
    label: "Print current page",
    run: () => window.print(),
    shortcut: "⌘P",
  },
  {
    external: true,
    group: "Reference",
    href: "https://github.com/Abhinav-Prabhakar/Aperture",
    icon: <GithubIcon />,
    id: "github",
    label: "Open the GitHub repository",
  },
];

const ITEMS = NAV.flatMap((group) => group.items);

function activeIdFor(pathname: string): string | undefined {
  const matches = ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length);

  return matches[0]?.id;
}

export default function WorkbenchesLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = (usePathname() ?? "/").replace(/\/+$/, "") || "/";
  const router = useRouter();
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    // Search params are not part of usePathname; re-read after each route.
    void pathname;
    const state = new URLSearchParams(window.location.search).get("state");
    setOffline(state === "offline");
  }, [pathname]);

  return (
    <WorkspaceShell
      activeId={activeIdFor(pathname)}
      actions={
        <>
          <Button
            className="hidden sm:inline-flex"
            render={<Link href="/docs/workbenches" />}
            size="xs"
            variant="ghost"
          >
            <BookOpenIcon />
            Docs
          </Button>
          <Button
            aria-label="Open the GitHub repository"
            render={
              <a
                href="https://github.com/Abhinav-Prabhakar/Aperture"
                rel="noreferrer"
                target="_blank"
              >
                <GithubIcon />
              </a>
            }
            size="icon-sm"
            variant="ghost"
          />
        </>
      }
      asOf={MOCK_AS_OF}
      commands={COMMANDS}
      nav={NAV}
      offline={offline}
      onNavigate={(href) => router.push(href)}
      sidebarFooter={
        <p>
          Aperture 0.1 · MIT
          <br />
          Synthetic lab data
        </p>
      }
      user={{ name: "A. Rao", role: "Lab manager" }}
      workspace={{
        code: "L03",
        location: "Bay 3 · Synthetic data",
        name: "Lab 03",
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
