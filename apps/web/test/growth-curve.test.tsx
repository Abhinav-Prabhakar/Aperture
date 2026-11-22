import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { DEMO_GROWTH_CURVE } from "@/registry/default/examples/growth-curve-demo";
import {
  detectLogPhase,
  fitLogPhase,
  GrowthCurve,
  type GrowthCurveData,
  type GrowthCurveSummary,
  growthCurveCsv,
  summarizeGrowthCurve,
} from "@/registry/default/instruments/growth-curve";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

const REPLICATES = [
  { id: "r1", label: "A1" },
  { id: "r2", label: "A2" },
  { id: "r3", label: "A3" },
] as const;

const DATA: GrowthCurveData = {
  id: "EC-1",
  name: "Test culture",
  replicates: REPLICATES,
  temperatureC: 37,
  timeUnit: "h",
  timepoints: [
    { time: 0, values: [0.02, 0.021, 0.019] },
    { time: 1, values: [0.04, 0.042, 0.038] },
    { time: 2, values: [0.08, 0.084, 0.076] },
    { time: 3, values: [0.16, 0.168, 0.152] },
    { time: 4, values: [0.32, null, 0.304] },
    { time: 5, values: [0.6, 0.63, 0.57] },
  ],
  valueLabel: "OD600",
};

function summary(time: number, mean: number): GrowthCurveSummary {
  return {
    max: mean,
    mean,
    min: mean,
    n: 3,
    sd: 0.001,
    time,
    values: [mean, mean, mean],
  };
}

describe("growth curve helpers", () => {
  it("summarizes replicates, sorts by time, and keeps misses null", () => {
    const summaries = summarizeGrowthCurve(DATA);

    expect(summaries).toHaveLength(6);
    expect(summaries[1]).toMatchObject({
      max: 0.042,
      mean: 0.04,
      min: 0.038,
      n: 3,
      time: 1,
    });
    expect(summaries[1].sd).toBeCloseTo(0.002, 3);

    expect(summaries[4]).toMatchObject({
      mean: 0.312,
      n: 2,
      values: [0.32, null, 0.304],
    });
    expect(summaries[4].sd).toBeCloseTo(0.0113137, 6);

    const empty = summarizeGrowthCurve({
      ...DATA,
      timepoints: [{ time: 2, values: [null, null, null] }],
    });
    expect(empty[0]).toMatchObject({ mean: null, n: 0, sd: null });
  });

  it("ignores non-finite times and readings", () => {
    const summaries = summarizeGrowthCurve({
      ...DATA,
      timepoints: [
        { time: Number.NaN, values: [1, 1, 1] },
        { time: 1, values: [1, Number.POSITIVE_INFINITY, 1] },
      ],
    });

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ mean: 1, n: 2, time: 1 });
  });

  it("fits an exact exponential and reports the doubling time", () => {
    const points = [2, 3, 4, 5, 6].map((time) =>
      summary(time, 0.03 * 2 ** (time - 2)),
    );
    const fit = fitLogPhase(points, 2, 6);

    expect(fit).toMatchObject({
      end: 6,
      points: 5,
      start: 2,
    });
    expect(fit?.slope).toBeCloseTo(Math.LN2, 10);
    expect(fit?.doublingTime).toBeCloseTo(1, 10);
    expect(fit?.rSquared).toBeCloseTo(1, 10);
  });

  it("rejects a window with no positive slope", () => {
    const flat = [0, 1, 2, 3, 4].map((time) => summary(time, 0.5));
    expect(fitLogPhase(flat, 0, 4)).toBeNull();
    expect(detectLogPhase(flat)).toBeNull();
    expect(detectLogPhase([summary(0, 0.1), summary(1, 0.2)])).toBeNull();
  });

  it("finds the exponential window after a lag and before the plateau", () => {
    const points = Array.from({ length: 11 }, (_, time) =>
      summary(
        time,
        time <= 1
          ? 0.02 + time * 0.001
          : time <= 7
            ? 0.03 * 2 ** (time - 2)
            : 1.2 + (time - 7) * 0.05,
      ),
    );
    const fit = detectLogPhase(points);

    expect(fit).not.toBeNull();
    expect(fit?.start).toBe(2);
    expect(fit?.end).toBe(6);
    expect(fit?.doublingTime).toBeCloseTo(1, 10);
    expect(fit?.rSquared).toBeCloseTo(1, 10);
  });

  it("detects the exponential window in the demo curve", () => {
    const summaries = summarizeGrowthCurve(DEMO_GROWTH_CURVE);
    const fit = detectLogPhase(summaries);

    expect(fit).not.toBeNull();
    expect(fit?.start).toBeGreaterThanOrEqual(2);
    expect(fit?.end).toBeLessThanOrEqual(8);
    expect(fit?.doublingTime).toBeGreaterThan(0.7);
    expect(fit?.doublingTime).toBeLessThan(1.1);
    expect(fit?.rSquared).toBeGreaterThan(0.99);
  });

  it("exports aligned values with empty missing cells", () => {
    const csv = growthCurveCsv(DATA);
    const rows = csv.split("\n");

    expect(rows[0]).toBe(
      "time_h,OD600_A1,OD600_A2,OD600_A3,mean_OD600,sd_OD600,n",
    );
    expect(rows[5]).toBe("4,0.32,,0.304,0.312,0.0113137,2");
    expect(rows[6]).toBe("5,0.6,0.63,0.57,0.6,0.03,3");
  });

  it("quotes CSV cells with commas or quotes", () => {
    const csv = growthCurveCsv({
      ...DATA,
      replicates: [{ id: "a", label: 'A, "one"' }],
      timepoints: [{ time: 0, values: [0.02] }],
    });

    expect(csv.split("\n")[0]).toBe(
      'time_h,"OD600_A, ""one""",mean_OD600,sd_OD600,n',
    );
  });
});

describe("GrowthCurve", () => {
  it("shows metadata, replicates, and the log-phase statistics", () => {
    render(<GrowthCurve data={DATA} />);

    expect(
      screen.getByRole("heading", { name: "Test culture", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("6 time points")).toBeInTheDocument();
    expect(screen.getByText("3 replicates")).toBeInTheDocument();
    expect(screen.getByText("Detected")).toBeInTheDocument();
    expect(screen.getByText("17 / 18")).toBeInTheDocument();
  });

  it("switches the y scale and replicate traces", async () => {
    const user = userEvent.setup();
    render(<GrowthCurve data={DATA} />);

    const log = screen.getByRole("button", { name: "Log" });
    const linear = screen.getByRole("button", { name: "Linear" });
    const replicates = screen.getByRole("button", { name: "Replicates" });

    expect(log).toHaveAttribute("aria-pressed", "true");
    await user.click(linear);
    expect(linear).toHaveAttribute("aria-pressed", "true");
    expect(log).toHaveAttribute("aria-pressed", "false");

    expect(replicates).toHaveAttribute("aria-pressed", "true");
    await user.click(replicates);
    expect(replicates).toHaveAttribute("aria-pressed", "false");
  });

  it("opens the data table with explicit missing values", async () => {
    const user = userEvent.setup();
    render(<GrowthCurve data={DATA} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show data table" }));

    const table = screen.getByRole("table", {
      name: "Test culture data table",
    });
    expect(within(table).getByText("0.312")).toBeInTheDocument();
    expect(within(table).getAllByText("—")).toHaveLength(1);
    expect(within(table).getByText("0.0113")).toBeInTheDocument();
  });

  it("keeps the data table mounted for print while it is closed", () => {
    const { container } = render(<GrowthCurve data={DATA} />);
    const wrapper = container.querySelector('[id^="growth-curve-table-"]');

    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper?.className).toContain("hidden");
    expect(wrapper?.className).toContain("print:block");
  });

  it("inspects time points from the keyboard", async () => {
    const user = userEvent.setup();
    render(<GrowthCurve data={DATA} />);

    const chart = screen.getByRole("slider", {
      name: /Test culture growth curve time cursor/,
    });
    chart.focus();
    await user.keyboard("{Home}{ArrowRight}");

    expect(chart).toHaveAttribute(
      "aria-valuetext",
      "1 h · mean 0.04 ± 0.002 OD600 · n=3",
    );

    await user.keyboard("{End}");
    expect(chart.getAttribute("aria-valuetext")).toContain("5 h · mean 0.6");
  });

  it("exports CSV and leaves the download to the browser", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<GrowthCurve data={DATA} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport.mock.calls[0][0]).toContain(
      "time_h,OD600_A1,OD600_A2,OD600_A3",
    );
  });

  it("renders an explicit empty state", () => {
    render(<GrowthCurve data={null} />);

    expect(screen.getByText("No growth data loaded.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export CSV" }),
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<GrowthCurve data={DATA} />);
    await expectNoViolations(container);
  });
});
