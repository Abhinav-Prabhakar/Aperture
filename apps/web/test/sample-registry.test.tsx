import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  filterSamples,
  summarize,
  toCsv,
} from "@/registry/default/workbenches/sample-registry/adapter";
import { MOCK_SAMPLES } from "@/registry/default/workbenches/sample-registry/mock-data";
import { SampleRegistry } from "@/registry/default/workbenches/sample-registry/sample-registry";

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

describe("SampleRegistry", () => {
  it("renders the inventory and the open sample record", () => {
    render(<SampleRegistry onRunOpen={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Sample registry" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/12 samples across 4 studies/)).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /S-014/ })).toHaveAttribute(
      "data-active",
    );

    const record = screen.getByRole("complementary", { name: "Sample record" });
    expect(
      within(record).getByRole("heading", { name: "S-014" }),
    ).toBeInTheDocument();
    expect(within(record).getAllByText("ACC-2026-0412")).toHaveLength(2);
    expect(
      within(record).getAllByText("F2 · R3 · B12 · A4").length,
    ).toBeGreaterThanOrEqual(1);
    expect(within(record).getByText("420 µL")).toBeInTheDocument();
    expect(
      within(record).getByRole("button", { name: /RUN-2026-1120/ }),
    ).toBeInTheDocument();
    expect(
      within(record).getByRole("list", {
        name: "Chain of custody for S-014",
      }),
    ).toBeInTheDocument();
  });

  it("renders an unrecorded volume as an em dash", async () => {
    const user = userEvent.setup();
    render(<SampleRegistry />);

    const row = screen.getByText("S-041").closest("tr");
    if (!row) {
      throw new Error("Sample row not found.");
    }
    await user.click(row);

    const record = screen.getByRole("complementary", { name: "Sample record" });
    expect(
      within(record).getByTitle("Volume was not recorded"),
    ).toHaveTextContent("—");
  });

  it("filters to quarantined samples and opens the flagged record", async () => {
    const user = userEvent.setup();
    render(<SampleRegistry />);

    await user.click(screen.getByRole("button", { name: /Quarantined/ }));

    expect(
      screen.queryByRole("row", { name: /S-014/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("row", { name: /S-022/ })).toHaveAttribute(
      "data-active",
    );

    const record = screen.getByRole("complementary", { name: "Sample record" });
    expect(within(record).getByText(/Gross hemolysis/)).toBeInTheDocument();
    expect(
      within(record).getByText("No aliquots recorded."),
    ).toBeInTheDocument();
  });

  it("restores filters and the open sample from the URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/workbenches/sample-registry/?study=NORDIC-2&status=stored&sample=S-024",
    );
    const user = userEvent.setup();
    render(<SampleRegistry syncToUrl />);

    await waitFor(() =>
      expect(screen.getByRole("row", { name: /S-024/ })).toHaveAttribute(
        "data-active",
      ),
    );
    const record = screen.getByRole("complementary", { name: "Sample record" });
    expect(within(record).getByText("S-014")).toBeInTheDocument();
    expect(
      screen.queryByRole("row", { name: /S-019/ }),
    ).not.toBeInTheDocument();

    const search = screen.getByRole("searchbox", { name: "Filter samples" });
    await user.type(search, "P-4090");

    await waitFor(() =>
      expect(screen.getByRole("row", { name: /S-047/ })).toHaveAttribute(
        "data-active",
      ),
    );
    await waitFor(() =>
      expect(new URL(window.location.href).searchParams.get("q")).toBe(
        "P-4090",
      ),
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(
        new URL(window.location.href).searchParams.get("status"),
      ).toBeNull(),
    );
    expect(new URL(window.location.href).searchParams.get("study")).toBeNull();
  });

  it("states loading, error, denied, empty, and offline", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<SampleRegistry loading />);
    expect(screen.getByText("Loading sample registry…")).toBeInTheDocument();

    rerender(
      <SampleRegistry
        error="Registry service unavailable."
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load the registry",
    );
    expect(
      screen.getByText("Registry service unavailable."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<SampleRegistry denied />);
    expect(
      screen.getByText("You don’t have access to this registry"),
    ).toBeInTheDocument();

    rerender(<SampleRegistry samples={[]} />);
    expect(screen.getByText("No samples in the registry.")).toBeInTheDocument();
    expect(screen.getByText("No sample selected")).toBeInTheDocument();

    rerender(<SampleRegistry offline />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline.");
    expect(
      screen.getByRole("heading", { name: "Sample registry" }),
    ).toBeInTheDocument();
  });

  it("summarizes and exports the filtered inventory", () => {
    const summary = summarize(MOCK_SAMPLES);
    expect(summary).toMatchObject({
      count: 12,
      stored: 6,
      inUse: 3,
      quarantined: 1,
      consumed: 1,
      destroyed: 1,
      missingVolume: 1,
    });

    const dna = filterSamples(MOCK_SAMPLES, {
      query: "",
      study: "all",
      kind: "DNA",
      status: "all",
    });
    expect(dna.map((sample) => sample.id)).toEqual(["S-024", "S-041"]);

    const csv = toCsv(MOCK_SAMPLES);
    expect(csv.split("\n")[0]).toBe(
      "sample_id,accession,study,kind,subject,status,freezer,rack,box,position,volume_ul,collected_at,received_at,custodian,parent_id,run_ids,note",
    );
    const s041 = csv.split("\n").find((line) => line.startsWith("S-041,"));
    expect(s041).toContain(",ACUTE-1,DNA,P-2011,stored,F3,R1,B04,D1,,");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SampleRegistry />);
    await expectNoViolations(container);
  });

  it("renders right to left", async () => {
    document.documentElement.dir = "rtl";
    const { container } = render(<SampleRegistry />);
    expect(
      screen.getByRole("heading", { name: "Sample registry" }),
    ).toBeInTheDocument();
    await expectNoViolations(container);
  });
});
