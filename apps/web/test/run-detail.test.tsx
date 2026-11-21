import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_RUN } from "@/registry/default/workbenches/run-detail/mock-data";
import { RunDetail } from "@/registry/default/workbenches/run-detail/run-detail";

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

afterEach(() => {
  document.documentElement.dir = "";
});

describe("RunDetail", () => {
  it("renders the run, parameters, metrics, artifacts, and provenance", () => {
    render(<RunDetail />);

    expect(
      screen.getByRole("heading", { name: "Absorbance screen" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();

    const duration = screen.getByText("Duration").closest('[data-slot="stat"]');
    expect(duration).toHaveTextContent(/42 min/);

    expect(screen.getByText("600 nm")).toBeInTheDocument();
    expect(screen.getByText("37.0 ± 0.2 °C")).toBeInTheDocument();

    const metrics = screen.getByRole("table", {
      name: "QC metrics for RUN-2026-1120",
    });
    expect(within(metrics).getByText("Z′ factor")).toBeInTheDocument();
    expect(within(metrics).getByText("Edge effect")).toBeInTheDocument();
    expect(within(metrics).getAllByText("Warning")).toHaveLength(1);

    expect(
      screen.getByRole("button", { name: /plate-12-samples.csv/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Provenance" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("log", { name: "Run log" })).toBeInTheDocument();
  });

  it("selects an artifact and keeps it in the URL", async () => {
    window.history.replaceState(null, "", "/workbenches/run-detail/");
    const user = userEvent.setup();
    render(<RunDetail syncToUrl />);

    await user.click(screen.getByRole("button", { name: /plate-12.qc.json/ }));

    const detail = screen.getByText(/Machine-readable QC result/);
    expect(detail).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /plate-12.qc.json/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(new URL(window.location.href).searchParams.get("artifact")).toBe(
        "qc-json",
      ),
    );
  });

  it("opens the artifact named in the URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/workbenches/run-detail/?artifact=heatmap-svg",
    );
    render(<RunDetail syncToUrl />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /plate-12-heatmap.svg/ }),
      ).toHaveAttribute("aria-pressed", "true"),
    );
    expect(
      screen.getByText(/colourblind-safe sequential scale/),
    ).toBeInTheDocument();
  });

  it("prints the report and continues to the samples", async () => {
    const print = vi.fn();
    Object.defineProperty(window, "print", { value: print, writable: true });
    const onOpenData = vi.fn();
    const user = userEvent.setup();
    render(<RunDetail onOpenData={onOpenData} />);

    await user.click(screen.getByRole("button", { name: "Print report" }));
    expect(print).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Open samples" }));
    expect(onOpenData).toHaveBeenCalledWith(
      expect.objectContaining({ id: "RUN-2026-1120" }),
    );
  });

  it("states loading, error, denied, missing, and offline", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<RunDetail loading />);
    expect(screen.getByText("Loading run report…")).toBeInTheDocument();

    rerender(<RunDetail error="Run service unavailable." onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load this run",
    );
    expect(screen.getByText("Run service unavailable.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<RunDetail denied />);
    expect(
      screen.getByText("You don’t have access to this run"),
    ).toBeInTheDocument();

    rerender(<RunDetail run={null} />);
    expect(screen.getByText("Run not found")).toBeInTheDocument();

    rerender(<RunDetail offline />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline.");
    expect(
      screen.getByRole("heading", { name: MOCK_RUN.title }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RunDetail />);
    await expectNoViolations(container);
  });

  it("renders right to left", async () => {
    document.documentElement.dir = "rtl";
    const { container } = render(<RunDetail />);
    expect(
      screen.getByRole("heading", { name: "Absorbance screen" }),
    ).toBeInTheDocument();
    await expectNoViolations(container);
  });
});
