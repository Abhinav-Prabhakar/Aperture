import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  filterSamples,
  summarize,
  toCsv,
} from "@/registry/default/workbenches/data-explorer/adapter";
import { DataExplorer } from "@/registry/default/workbenches/data-explorer/data-explorer";
import { MOCK_SAMPLES } from "@/registry/default/workbenches/data-explorer/mock-data";
import type { ExplorerSample } from "@/registry/default/workbenches/data-explorer/types";

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

describe("DataExplorer", () => {
  it("renders the run, summary, table, and inspector", () => {
    render(<DataExplorer />);

    expect(
      screen.getByRole("heading", { name: "Absorbance screen" }),
    ).toBeInTheDocument();
    expect(screen.getByText("24 rows")).toBeInTheDocument();
    expect(screen.getByText("RUN-2026-1120")).toBeInTheDocument();
    expect(screen.getByText("83% of the view")).toBeInTheDocument();

    const inspector = screen.getByRole("complementary", {
      name: "Sample inspector",
    });
    expect(within(inspector).getByText("A1 · S-001")).toBeInTheDocument();
    expect(within(inspector).getByText("Chain of custody")).toBeInTheDocument();
  });

  it("filters the table and moves the inspector to a visible row", async () => {
    const user = userEvent.setup();
    render(<DataExplorer />);

    await user.click(screen.getByRole("button", { name: /Censored/ }));

    expect(screen.getByText("1 row")).toBeInTheDocument();
    expect(screen.getByText("1 missing concentration")).toBeInTheDocument();

    const inspector = screen.getByRole("complementary", {
      name: "Sample inspector",
    });
    expect(within(inspector).getByText("B6 · S-014")).toBeInTheDocument();
    expect(
      within(inspector).getByText(/Detector saturated/),
    ).toBeInTheDocument();
  });

  it("activates a row from the keyboard", async () => {
    const user = userEvent.setup();
    render(<DataExplorer />);

    const row = screen.getByRole("row", { name: /S-002/ });
    row.focus();
    await user.keyboard("{Enter}");

    const inspector = screen.getByRole("complementary", {
      name: "Sample inspector",
    });
    expect(within(inspector).getByText("A2 · S-002")).toBeInTheDocument();
  });

  it("keeps the view in the URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/workbenches/data-explorer/?status=failed&sample=S-014",
    );
    const user = userEvent.setup();
    render(<DataExplorer syncToUrl />);

    await waitFor(() => expect(screen.getByText("1 row")).toBeInTheDocument());
    const inspector = screen.getByRole("complementary", {
      name: "Sample inspector",
    });
    expect(within(inspector).getByText("B6 · S-014")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() =>
      expect(
        new URL(window.location.href).searchParams.get("status"),
      ).toBeNull(),
    );
    expect(new URL(window.location.href).searchParams.get("sample")).toBe(
      "S-014",
    );
  });

  it("states loading, error, denied, and offline without hiding them", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<DataExplorer loading />);
    expect(screen.getByText("Loading samples…")).toBeInTheDocument();

    rerender(
      <DataExplorer error="Run service unavailable." onRetry={onRetry} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load samples",
    );
    expect(screen.getByText("Run service unavailable.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<DataExplorer denied />);
    expect(
      screen.getByText("You don’t have access to this run"),
    ).toBeInTheDocument();

    rerender(<DataExplorer offline />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline.");
    expect(screen.getByText("24 rows")).toBeInTheDocument();
  });

  it("has an empty state and no accessibility violations", async () => {
    const { container, rerender } = render(<DataExplorer samples={[]} />);
    expect(screen.getByText("No samples in this run.")).toBeInTheDocument();
    await expectNoViolations(container);

    rerender(<DataExplorer />);
    await expectNoViolations(container);
  });
});

describe("data explorer adapter", () => {
  it("filters by text, status, and treatment", () => {
    const filters = { query: "", status: "all", treatment: "all" } as const;

    expect(filterSamples(MOCK_SAMPLES, filters)).toHaveLength(24);
    expect(
      filterSamples(MOCK_SAMPLES, { ...filters, status: "warning" }),
    ).toHaveLength(3);
    expect(
      filterSamples(MOCK_SAMPLES, { ...filters, treatment: "High dose" }),
    ).toHaveLength(8);
    expect(
      filterSamples(MOCK_SAMPLES, { ...filters, query: "b6" }),
    ).toMatchObject([{ id: "S-014" }]);
  });

  it("summarizes with a true median and explicit missing count", () => {
    expect(summarize(MOCK_SAMPLES)).toMatchObject({
      count: 24,
      passed: 20,
      flagged: 4,
      missing: 1,
    });
    expect(summarize(MOCK_SAMPLES).median).toBeCloseTo(8.1);

    const even: ExplorerSample[] = MOCK_SAMPLES.slice(0, 2);
    expect(summarize(even).median).toBeCloseTo((12.4 + 11.9) / 2);
    expect(summarize([]).median).toBeNull();
  });

  it("writes a CSV with units in the header and missing values empty", () => {
    const csv = toCsv(MOCK_SAMPLES);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(25);
    expect(lines[0]).toBe(
      "sample_id,well,treatment,concentration_ug_ml,uncertainty_ug_ml,a600_au,status,collected_at,operator,note",
    );
    expect(lines[14]).toContain("S-014,B6,Low dose,,,4.12,failed");
  });

  it("quotes cells that contain commas or quotes", () => {
    const first = MOCK_SAMPLES[0];
    if (!first) {
      throw new Error("Mock samples are missing.");
    }
    const sample: ExplorerSample = {
      ...first,
      note: 'Saturated, then "recovered".',
    };
    expect(toCsv([sample])).toContain('"Saturated, then ""recovered""."');
  });
});
