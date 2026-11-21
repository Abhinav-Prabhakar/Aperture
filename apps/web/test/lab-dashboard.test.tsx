import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LabDashboard } from "@/registry/default/workbenches/lab-dashboard/lab-dashboard";

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

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("LabDashboard", () => {
  it("renders instrument health, alerts, samples, schedule, and activity", () => {
    render(<LabDashboard />);

    expect(
      screen.getByRole("heading", { name: "Lab dashboard" }),
    ).toBeInTheDocument();

    const online = screen
      .getByText("Instruments online")
      .closest('[data-slot="stat"]');
    expect(online).toHaveTextContent(/6\s*of 8/);

    expect(
      screen.getByRole("progressbar", { name: "Plate reader progress" }),
    ).toHaveAttribute("aria-valuenow", "68");
    expect(
      screen.getByText("Autoclave cycle 4412 aborted"),
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /S-024/ })).toBeInTheDocument();

    const schedule = screen.getByRole("list", {
      name: "Today’s schedule",
    });
    expect(within(schedule).getByText("Sterilization")).toBeInTheDocument();

    const log = screen.getByRole("log", { name: "Recent activity" });
    expect(
      within(log).getByText(/Facilities ticket FM-2291/),
    ).toBeInTheDocument();
  });

  it("acknowledges an alert without deleting the record", async () => {
    const onAcknowledge = vi.fn();
    const user = userEvent.setup();
    render(<LabDashboard onAcknowledge={onAcknowledge} />);

    const alerts = screen.getByRole("region", { name: "Alerts" });
    expect(within(alerts).getByText("4 open")).toBeInTheDocument();

    await user.click(
      within(alerts).getByRole("button", {
        name: "Acknowledge: Autoclave cycle 4412 aborted",
      }),
    );

    expect(onAcknowledge).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Autoclave cycle 4412 aborted" }),
    );
    expect(within(alerts).getByText("3 open")).toBeInTheDocument();
    expect(within(alerts).getByText("Acknowledged")).toBeInTheDocument();
    expect(
      within(alerts).getByText("Autoclave cycle 4412 aborted"),
    ).toBeInTheDocument();

    const openStat = screen
      .getByText("Open alerts")
      .closest('[data-slot="stat"]');
    expect(openStat).toHaveTextContent(/3/);
  });

  it("opens instrument details and keeps the view in the URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/workbenches/lab-dashboard/?instrument=autoclave&sample=S-024",
    );
    const user = userEvent.setup();
    render(<LabDashboard syncToUrl />);

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Autoclave details" }),
      ).toBeInTheDocument();
    });
    expect(
      within(
        screen.getByRole("region", { name: "Autoclave details" }),
      ).getByText(/Facilities ticket FM-2291/),
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /S-024/ })).toHaveAttribute(
      "data-active",
    );

    await user.click(
      screen.getByRole("button", { name: "Details for Plate reader" }),
    );

    await waitFor(() =>
      expect(new URL(window.location.href).searchParams.get("instrument")).toBe(
        "plate-reader",
      ),
    );
    expect(
      screen.getByRole("region", { name: "Plate reader details" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(
        new URL(window.location.href).searchParams.get("instrument"),
      ).toBeNull(),
    );
  });

  it("activates a sample from the keyboard and opens it", async () => {
    const onSampleOpen = vi.fn();
    const user = userEvent.setup();
    render(<LabDashboard onSampleOpen={onSampleOpen} />);

    const row = screen.getByText("S-014").closest("tr");
    if (!row) {
      throw new Error("Sample row not found.");
    }
    row.focus();
    await user.keyboard("{Enter}");

    expect(row).toHaveAttribute("data-active");
    await user.click(
      screen.getByRole("button", { name: "Open in Data Explorer" }),
    );
    expect(onSampleOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: "S-014" }),
    );
  });

  it("states loading, error, denied, and offline without hiding them", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<LabDashboard loading />);
    expect(screen.getByText("Loading lab status…")).toBeInTheDocument();

    rerender(
      <LabDashboard error="Lab service unavailable." onRetry={onRetry} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load the lab",
    );
    expect(screen.getByText("Lab service unavailable.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<LabDashboard denied />);
    expect(
      screen.getByText("You don’t have access to this lab"),
    ).toBeInTheDocument();

    rerender(<LabDashboard offline />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline.");
    expect(
      screen.getByRole("heading", { name: "Lab dashboard" }),
    ).toBeInTheDocument();
  });

  it("has an empty state and no accessibility violations", async () => {
    const { container, rerender } = render(
      <LabDashboard
        activity={[]}
        alerts={[]}
        instruments={[]}
        samples={[]}
        schedule={[]}
      />,
    );
    expect(
      screen.getByText("No instruments registered in this lab."),
    ).toBeInTheDocument();
    expect(screen.getByText("No samples in flight.")).toBeInTheDocument();
    expect(
      screen.getByText("No alerts. Every instrument is within limits."),
    ).toBeInTheDocument();
    expect(screen.getByText("No runs scheduled today.")).toBeInTheDocument();
    expect(screen.getByText("No activity recorded today.")).toBeInTheDocument();
    await expectNoViolations(container);

    rerender(<LabDashboard />);
    await expectNoViolations(container);
  });
});
