"use client";

import {
  ChevronRightIcon,
  PanelLeftIcon,
  PanelRightIcon,
  SearchIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Avatar, AvatarFallback } from "@/registry/default/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/default/ui/breadcrumb";
import { Button } from "@/registry/default/ui/button";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/default/ui/command";
import { Kbd } from "@/registry/default/ui/kbd";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/registry/default/ui/sheet";

export type WorkspaceNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
};

export type WorkspaceNavGroup = {
  label: string;
  items: readonly WorkspaceNavItem[];
};

export type WorkspaceCommand = {
  id: string;
  label: string;
  group?: string;
  href?: string;
  /** Open an absolute URL in a new tab. */
  external?: boolean;
  shortcut?: string;
  keywords?: string;
  icon?: React.ReactNode;
  run?: () => void;
};

export type WorkspaceShellProps = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  workspace: {
    name: string;
    code: string;
    location?: string;
  };
  nav: readonly WorkspaceNavGroup[];
  activeId?: string;
  commands?: readonly WorkspaceCommand[];
  user?: {
    name: string;
    role?: string;
  };
  /** ISO instant shown in the status bar and formatted in UTC. */
  asOf?: string;
  /** Page label used when no nav item is active. */
  title?: string;
  /** Top-bar controls supplied by the host, after search. */
  actions?: React.ReactNode;
  /** Side panel. Collapsible on desktop, a sheet below that. */
  inspector?: React.ReactNode;
  inspectorLabel?: string;
  defaultInspectorOpen?: boolean;
  offline?: boolean;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
  /** Intercept navigation. The host usually routes; the shell prevents the default. */
  onNavigate?: (
    href: string,
    event?: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  onCommand?: (command: WorkspaceCommand) => void;
};

const AS_OF_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatAsOf(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }
  return `${AS_OF_FORMAT.format(date)} UTC`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type PaletteItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  command: WorkspaceCommand;
};

function buildPalette(
  nav: readonly WorkspaceNavGroup[],
  commands: readonly WorkspaceCommand[],
): { value: string; items: PaletteItem[] }[] {
  const navigate: PaletteItem[] = nav.flatMap((group) =>
    group.items.map((item) => ({
      command: {
        group: "Navigate",
        href: item.href,
        id: `nav-${item.id}`,
        keywords: group.label,
        label: item.label,
      },
      icon: item.icon,
      label: item.label,
      value: `Navigate ${item.label} ${group.label}`,
    })),
  );

  const groups = new Map<string, PaletteItem[]>([["Navigate", navigate]]);

  for (const command of commands) {
    const label = command.group ?? "Actions";
    const item: PaletteItem = {
      command,
      icon: command.icon,
      label: command.label,
      shortcut: command.shortcut,
      value: `${label} ${command.label} ${command.keywords ?? ""}`,
    };
    const existing = groups.get(label);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(label, [item]);
    }
  }

  return [...groups.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([value, items]) => ({ items, value }));
}

export function WorkspaceShell({
  workspace,
  nav,
  activeId,
  commands = [],
  user,
  asOf,
  title,
  actions,
  inspector,
  inspectorLabel = "Inspector",
  defaultInspectorOpen = true,
  offline = false,
  sidebarFooter,
  children,
  onNavigate,
  onCommand,
  className,
  ...props
}: WorkspaceShellProps): React.ReactElement {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [inspectorSheetOpen, setInspectorSheetOpen] = React.useState(false);
  const [inspectorOpen, setInspectorOpen] =
    React.useState(defaultInspectorOpen);

  const allItems = nav.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.label })),
  );
  const activeItem = allItems.find((item) => item.id === activeId);
  const asOfLabel = asOf ? formatAsOf(asOf) : null;
  const palette = React.useMemo(
    () => buildPalette(nav, commands),
    [nav, commands],
  );

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(command: WorkspaceCommand): void {
    setCommandOpen(false);
    onCommand?.(command);

    if (command.run) {
      command.run();
      return;
    }

    if (!command.href) {
      return;
    }

    if (command.external) {
      window.open(command.href, "_blank", "noopener,noreferrer");
      return;
    }

    if (onNavigate) {
      onNavigate(command.href);
    } else {
      window.location.assign(command.href);
    }
  }

  function renderNav(onSelect?: () => void): React.ReactElement {
    return (
      <nav
        aria-label="Workspace"
        className="grid gap-4"
        data-slot="workspace-nav"
      >
        {nav.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {group.label}
            </p>
            <ul className="grid gap-0.5">
              {group.items.map((item) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <a
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex h-8 items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors",
                        "hover:bg-muted/64 focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                      data-active={active ? "" : undefined}
                      href={item.href}
                      onClick={(event) => {
                        if (onNavigate) {
                          event.preventDefault();
                          onNavigate(item.href, event);
                        }
                        onSelect?.();
                      }}
                    >
                      {item.icon ? (
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-muted-foreground [&_svg]:size-4"
                        >
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ms-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                          {item.badge}
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <div
      className={cn(
        "flex h-svh flex-col overflow-hidden bg-background text-foreground",
        "print:block print:h-auto print:overflow-visible",
        className,
      )}
      data-slot="workspace-shell"
      {...props}
    >
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm"
        href="#workspace-main"
      >
        Skip to content
      </a>

      <header
        className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-2 sm:px-3 print:hidden"
        data-slot="workspace-topbar"
      >
        <Button
          aria-label="Open navigation"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <PanelLeftIcon />
        </Button>

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap gap-1.5 text-xs">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <span className="font-medium">{workspace.name}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:flex">
              <ChevronRightIcon className="rtl:rotate-180" />
            </BreadcrumbSeparator>
            {activeItem?.group ? (
              <>
                <BreadcrumbItem className="hidden md:inline-flex">
                  <span>{activeItem.group}</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:flex">
                  <ChevronRightIcon className="rtl:rotate-180" />
                </BreadcrumbSeparator>
              </>
            ) : null}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">
                {activeItem?.label ?? title ?? "Workspace"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ms-auto flex items-center gap-1">
          {actions}

          <Button
            aria-keyshortcuts="Meta+K Control+K"
            aria-label="Search workspace"
            className="text-muted-foreground"
            onClick={() => setCommandOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <SearchIcon />
            <span className="hidden md:inline">Search</span>
            <Kbd className="hidden ms-2 lg:inline-flex">⌘K</Kbd>
          </Button>

          {inspector ? (
            <>
              <Button
                aria-expanded={inspectorOpen}
                aria-label={inspectorOpen ? "Hide inspector" : "Show inspector"}
                aria-controls="workspace-inspector"
                className="hidden xl:inline-flex"
                onClick={() => setInspectorOpen((open) => !open)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <PanelRightIcon />
              </Button>
              <Button
                aria-label="Open inspector"
                className="xl:hidden"
                onClick={() => setInspectorSheetOpen(true)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <PanelRightIcon />
              </Button>
            </>
          ) : null}

          {user ? (
            <div className="hidden items-center gap-2 border-s ps-2 sm:flex">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden max-w-32 md:block">
                <p className="truncate text-xs leading-none">{user.name}</p>
                {user.role ? (
                  <p className="mt-1 truncate text-[10px] text-muted-foreground leading-none">
                    {user.role}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 print:block">
        <aside
          className="hidden w-60 shrink-0 flex-col border-e bg-background lg:flex print:hidden"
          data-slot="workspace-sidebar"
        >
          <div className="flex h-12 items-center gap-2 border-b px-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-md border bg-muted font-mono text-[10px]">
              {workspace.code}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-xs">{workspace.name}</p>
              {workspace.location ? (
                <p className="truncate text-[10px] text-muted-foreground">
                  {workspace.location}
                </p>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {renderNav()}
          </div>

          {sidebarFooter ? (
            <div className="border-t px-3 py-2 text-[10px] text-muted-foreground">
              {sidebarFooter}
            </div>
          ) : null}
        </aside>

        <main
          className="min-w-0 flex-1 overflow-y-auto bg-muted/24 print:overflow-visible print:bg-background"
          data-slot="workspace-main"
          id="workspace-main"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-[110rem] p-3 sm:p-4 print:max-w-none print:p-0">
            {children}
          </div>
        </main>

        {inspector && inspectorOpen ? (
          <aside
            aria-label={inspectorLabel}
            className="hidden w-80 shrink-0 flex-col overflow-y-auto border-s bg-background xl:flex print:hidden"
            data-slot="workspace-inspector"
            id="workspace-inspector"
          >
            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3">
              <h2 className="font-medium text-xs">{inspectorLabel}</h2>
              <Button
                aria-label="Close inspector"
                onClick={() => setInspectorOpen(false)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </div>
            <div className="p-3">{inspector}</div>
          </aside>
        ) : null}
      </div>

      <footer
        className="flex h-7 shrink-0 items-center gap-3 border-t bg-background px-3 font-mono text-[10px] text-muted-foreground print:hidden"
        data-slot="workspace-statusbar"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            offline && "text-foreground",
          )}
          role="status"
        >
          {offline ? (
            <WifiOffIcon aria-hidden="true" className="size-3" />
          ) : (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-foreground/50"
            />
          )}
          {offline ? "Offline · showing cached data" : "Ready"}
        </span>
        {asOfLabel ? (
          <span className="hidden sm:inline">As of {asOfLabel}</span>
        ) : null}
        <span className="ms-auto hidden md:inline">UTC</span>
        <span className="hidden lg:inline">⌘K commands</span>
        <span>v0.1</span>
      </footer>

      <Sheet onOpenChange={setMobileNavOpen} open={mobileNavOpen}>
        <SheetPopup
          className="w-72 max-w-[calc(100%-3rem)]"
          side="left"
          showCloseButton
        >
          <SheetHeader>
            <SheetTitle>{workspace.name}</SheetTitle>
            <SheetDescription>
              {workspace.location ?? "Workspace navigation"}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="overflow-y-auto p-2">
            {renderNav(() => setMobileNavOpen(false))}
          </SheetPanel>
        </SheetPopup>
      </Sheet>

      {inspector ? (
        <Sheet onOpenChange={setInspectorSheetOpen} open={inspectorSheetOpen}>
          <SheetPopup className="w-80 max-w-[calc(100%-3rem)]" side="right">
            <SheetHeader>
              <SheetTitle>{inspectorLabel}</SheetTitle>
              <SheetDescription>
                Details for the current selection.
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="overflow-y-auto p-3">{inspector}</SheetPanel>
          </SheetPopup>
        </Sheet>
      ) : null}

      <CommandDialog onOpenChange={setCommandOpen} open={commandOpen}>
        <CommandDialogPopup
          aria-label="Command palette"
          className="max-h-[min(34rem,calc(100svh-2rem))]"
        >
          <Command items={palette}>
            <CommandInput
              aria-label="Search commands"
              placeholder="Search pages and actions…"
            />
            <CommandPanel>
              <CommandEmpty>No matching commands.</CommandEmpty>
              <CommandList>
                {(group: { value: string; items: PaletteItem[] }) => (
                  <React.Fragment key={group.value}>
                    <CommandGroup items={group.items}>
                      <CommandGroupLabel>{group.value}</CommandGroupLabel>
                      <CommandCollection>
                        {(item: PaletteItem) => (
                          <CommandItem
                            key={item.value}
                            onClick={() => runCommand(item.command)}
                            value={item.value}
                          >
                            {item.icon ? (
                              <span
                                aria-hidden="true"
                                className="me-2 text-muted-foreground [&_svg]:size-3.5"
                              >
                                {item.icon}
                              </span>
                            ) : null}
                            <span className="flex-1">{item.label}</span>
                            {item.shortcut ? (
                              <CommandShortcut>{item.shortcut}</CommandShortcut>
                            ) : null}
                          </CommandItem>
                        )}
                      </CommandCollection>
                    </CommandGroup>
                    <CommandSeparator />
                  </React.Fragment>
                )}
              </CommandList>
            </CommandPanel>
            <CommandFooter>
              <span>↑↓ navigate · ↵ open · esc close</span>
              <span className="hidden sm:inline">{workspace.code}</span>
            </CommandFooter>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </div>
  );
}
