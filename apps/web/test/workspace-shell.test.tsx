import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type WorkspaceCommand,
  type WorkspaceNavGroup,
  WorkspaceShell,
} from "@/registry/default/workbenches/workspace-shell/workspace-shell";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

const NAV: readonly WorkspaceNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/workbenches", id: "overview", label: "Overview" },
      {
        href: "/workbenches/sample-registry",
        id: "samples",
        label: "Sample Registry",
      },
      { href: "/runs", id: "runs", label: "Runs", badge: "3" },
    ],
  },
  {
    label: "Reference",
    items: [{ href: "/docs", id: "docs", label: "Documentation" }],
  },
];

const COMMANDS: readonly WorkspaceCommand[] = [
  {
    group: "Actions",
    id: "print",
    label: "Print current page",
    shortcut: "⌘P",
  },
];

afterEach(() => {
  document.documentElement.dir = "";
});

describe("WorkspaceShell", () => {
  it("renders the frame, the active page, and the content", () => {
    render(
      <WorkspaceShell
        activeId="samples"
        asOf="2026-11-22T12:18:00Z"
        nav={NAV}
        user={{ name: "A. Rao", role: "Lab manager" }}
        workspace={{
          code: "L03",
          location: "Bay 3",
          name: "Lab 03",
        }}
      >
        <h1>Canvas content</h1>
      </WorkspaceShell>,
    );

    expect(
      screen.getByRole("link", { name: "Sample Registry" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeVisible();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { name: "Canvas content" }),
    );
    expect(
      screen.getByText(/As of 22 Nov 2026, 12:18 UTC/),
    ).toBeInTheDocument();
    expect(screen.getByText("AR")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ready");
  });

  it("opens the command palette from the keyboard and navigates", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(
      <WorkspaceShell
        activeId="overview"
        commands={COMMANDS}
        nav={NAV}
        onNavigate={onNavigate}
        workspace={{ code: "L03", name: "Lab 03" }}
      >
        <p>Canvas content</p>
      </WorkspaceShell>,
    );

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    const dialog = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    const search = within(dialog).getByRole("combobox", {
      name: "Search commands",
    });
    await user.type(search, "sample");

    await user.click(
      within(dialog).getByRole("option", { name: /Sample Registry/ }),
    );
    expect(onNavigate).toHaveBeenCalledWith("/workbenches/sample-registry");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Command palette" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("runs an action from the palette and closes it", async () => {
    const run = vi.fn();
    const user = userEvent.setup();
    render(
      <WorkspaceShell
        activeId="overview"
        commands={[{ ...COMMANDS[0], run }]}
        nav={NAV}
        workspace={{ code: "L03", name: "Lab 03" }}
      >
        <p>Canvas content</p>
      </WorkspaceShell>,
    );

    await user.click(screen.getByRole("button", { name: "Search workspace" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    await user.click(
      within(dialog).getByRole("option", { name: /Print current page/ }),
    );

    expect(run).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Command palette" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("opens navigation on a small screen and closes it after a choice", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(
      <WorkspaceShell
        activeId="overview"
        nav={NAV}
        onNavigate={onNavigate}
        workspace={{ code: "L03", location: "Bay 3", name: "Lab 03" }}
      >
        <p>Canvas content</p>
      </WorkspaceShell>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = await screen.findByRole("dialog", { name: "Lab 03" });
    await user.click(
      within(dialog).getByRole("link", { name: "Sample Registry" }),
    );

    expect(onNavigate).toHaveBeenCalledWith(
      "/workbenches/sample-registry",
      expect.anything(),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Lab 03" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("collapses and restores the inspector", async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceShell
        activeId="overview"
        inspector={<p>Sample S-014</p>}
        inspectorLabel="Sample details"
        nav={NAV}
        workspace={{ code: "L03", name: "Lab 03" }}
      >
        <p>Canvas content</p>
      </WorkspaceShell>,
    );

    expect(
      screen.getByRole("complementary", { name: "Sample details" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide inspector" }));
    expect(
      screen.queryByRole("complementary", { name: "Sample details" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show inspector" }));
    expect(
      screen.getByRole("complementary", { name: "Sample details" }),
    ).toBeInTheDocument();
  });

  it("reports an offline connection", () => {
    render(
      <WorkspaceShell
        activeId="overview"
        nav={NAV}
        offline
        workspace={{ code: "L03", name: "Lab 03" }}
      >
        <p>Canvas content</p>
      </WorkspaceShell>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Offline · showing cached data",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <WorkspaceShell
        activeId="samples"
        asOf="2026-11-22T12:18:00Z"
        commands={COMMANDS}
        inspector={<p>Sample S-014</p>}
        inspectorLabel="Sample details"
        nav={NAV}
        user={{ name: "A. Rao", role: "Lab manager" }}
        workspace={{ code: "L03", location: "Bay 3", name: "Lab 03" }}
      >
        <h1>Canvas content</h1>
      </WorkspaceShell>,
    );

    await expectNoViolations(container);
  });

  it("renders right to left", async () => {
    document.documentElement.dir = "rtl";
    const { container } = render(
      <WorkspaceShell
        activeId="samples"
        asOf="2026-11-22T12:18:00Z"
        nav={NAV}
        workspace={{ code: "L03", location: "Bay 3", name: "Lab 03" }}
      >
        <h1>Canvas content</h1>
      </WorkspaceShell>,
    );

    expect(
      screen.getByRole("link", { name: "Sample Registry" }),
    ).toHaveAttribute("aria-current", "page");
    await expectNoViolations(container);
  });
});
