import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { DEMO_DOSE_RESPONSE } from "@/registry/default/examples/dose-response-demo";
import {
  DoseResponseCurve,
  type DoseResponseData,
  type DoseResponseSummary,
  doseResponseBand,
  doseResponseCsv,
  fitDoseResponse,
  predictDoseResponse,
  summarizeDoseResponse,
} from "@/registry/default/instruments/dose-response-curve";

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

const DATA: DoseResponseData = {
  id: "DR-1",
  name: "Test compound",
  compound: "AP-1",
  cellLine: "HeLa",
  duration: "48 h",
  doseUnit: "µM",
  responseLabel: "Viability",
  responseUnit: "%",
  replicates: REPLICATES,
  points: [
    { dose: 0.01, values: [98, 99, 97] },
    { dose: 0.1, values: [90, 91, 89] },
    { dose: 1, values: [50, 51, null] },
    { dose: 10, values: [8, 9, 7] },
    { dose: 100, values: [3, 2, 4] },
  ],
};

const TRUE = { low: 100, high: 5, ic50: 0.5, hill: 1.2 };
const DOSES = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30];

function trueResponse(dose: number): number {
  return (
    TRUE.high + (TRUE.low - TRUE.high) / (1 + (dose / TRUE.ic50) ** TRUE.hill)
  );
}

function summary(dose: number, mean = trueResponse(dose)): DoseResponseSummary {
  return {
    dose,
    max: mean,
    mean,
    min: mean,
    n: 3,
    sd: 0.5,
    values: [mean, mean, mean],
  };
}

const EXACT = DOSES.map((dose) => summary(dose));

describe("dose-response helpers", () => {
  it("summarizes replicates, sorts by dose, and keeps misses null", () => {
    const summaries = summarizeDoseResponse(DATA);

    expect(summaries.map((row) => row.dose)).toEqual([0.01, 0.1, 1, 10, 100]);
    expect(summaries[0]).toMatchObject({
      max: 99,
      mean: 98,
      min: 97,
      n: 3,
    });
    expect(summaries[0].sd).toBeCloseTo(1, 10);

    expect(summaries[2]).toMatchObject({
      mean: 50.5,
      n: 2,
      values: [50, 51, null],
    });
    expect(summaries[2].sd).toBeCloseTo(Math.SQRT1_2, 10);

    const empty = summarizeDoseResponse({
      ...DATA,
      points: [{ dose: 1, values: [null, null, null] }],
    });
    expect(empty[0]).toMatchObject({ mean: null, n: 0, sd: null });
  });

  it("ignores non-finite doses and readings", () => {
    const summaries = summarizeDoseResponse({
      ...DATA,
      points: [
        { dose: Number.NaN, values: [1, 1, 1] },
        { dose: 1, values: [1, Number.POSITIVE_INFINITY, 1] },
      ],
    });

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ dose: 1, mean: 1, n: 2 });
  });

  it("recovers an exact four-parameter logistic curve", () => {
    const fit = fitDoseResponse(EXACT);

    expect(fit).not.toBeNull();
    expect(fit?.direction).toBe("inhibition");
    expect(fit?.halfMaxLabel).toBe("IC50");
    expect(fit?.plateauLow).toBeCloseTo(TRUE.low, 1);
    expect(fit?.plateauHigh).toBeCloseTo(TRUE.high, 1);
    expect(fit?.halfMax).toBeCloseTo(TRUE.ic50, 2);
    expect(fit?.hill).toBeCloseTo(TRUE.hill, 2);
    expect(fit?.rSquared).toBeCloseTo(1, 6);
    expect(fit?.df).toBe(6);
    expect(fit?.points).toBe(10);
  });

  it("orients a rising curve as stimulation and reports EC50", () => {
    const rising = DOSES.map((dose) =>
      summary(
        dose,
        2 + ((98 - 2) * (dose / 2.5) ** 1.6) / (1 + (dose / 2.5) ** 1.6),
      ),
    );
    const fit = fitDoseResponse(rising);

    expect(fit?.direction).toBe("stimulation");
    expect(fit?.halfMaxLabel).toBe("EC50");
    expect(fit?.plateauLow).toBeCloseTo(2, 1);
    expect(fit?.plateauHigh).toBeCloseTo(98, 1);
    expect(fit?.halfMax).toBeCloseTo(2.5, 2);
  });

  it("needs four positive doses and a real response range", () => {
    expect(fitDoseResponse(EXACT.slice(0, 3))).toBeNull();
    expect(
      fitDoseResponse([0.1, 1, 10, 100].map((dose) => summary(dose, 50))),
    ).toBeNull();
    expect(
      fitDoseResponse(
        [0.1, 1, 10, 100].map((dose) => summary(dose, Number.NaN)),
      ),
    ).toBeNull();
  });

  it("applies a caller-supplied R-squared threshold", () => {
    const noisy = EXACT.map((point, index) =>
      summary(
        point.dose,
        (point.mean as number) + (index % 2 === 0 ? 18 : -18),
      ),
    );

    expect(fitDoseResponse(noisy, { minRSquared: 0.5 })).not.toBeNull();
    expect(fitDoseResponse(noisy, { minRSquared: 0.999 })).toBeNull();
  });

  it("predicts the midpoint and a confidence band", () => {
    const fit = fitDoseResponse(EXACT);

    expect(fit).not.toBeNull();
    if (!fit) {
      return;
    }

    expect(predictDoseResponse(fit, TRUE.ic50)).toBeCloseTo(
      (TRUE.low + TRUE.high) / 2,
      1,
    );
    expect(predictDoseResponse(fit, 0)).toBeNull();
    expect(predictDoseResponse(fit, Number.NaN)).toBeNull();

    const band = doseResponseBand(fit, TRUE.ic50);
    expect(band).not.toBeNull();
    expect(band?.[0]).toBeLessThanOrEqual(
      predictDoseResponse(fit, TRUE.ic50) as number,
    );
    expect(band?.[1]).toBeGreaterThanOrEqual(
      predictDoseResponse(fit, TRUE.ic50) as number,
    );
  });

  it("fits the demo series close to its generating values", () => {
    const fit = fitDoseResponse(summarizeDoseResponse(DEMO_DOSE_RESPONSE));

    expect(fit).not.toBeNull();
    expect(fit?.direction).toBe("inhibition");
    expect(fit?.halfMax).toBeGreaterThan(0.38);
    expect(fit?.halfMax).toBeLessThan(0.46);
    expect(fit?.rSquared).toBeGreaterThan(0.98);
    expect(fit?.plateauLow).toBeGreaterThan(95);
    expect(fit?.plateauHigh).toBeLessThan(8);
    expect(fit?.halfMaxCi?.[0]).toBeLessThan(fit?.halfMax as number);
    expect(fit?.halfMaxCi?.[1]).toBeGreaterThan(fit?.halfMax as number);
  });

  it("exports aligned values with empty missing cells", () => {
    const fit = fitDoseResponse(summarizeDoseResponse(DATA));
    const csv = doseResponseCsv(DATA, summarizeDoseResponse(DATA), fit);
    const rows = csv.split("\n");

    expect(rows[0]).toBe(
      "dose_µM,Viability_A1,Viability_A2,Viability_A3,mean_Viability,sd_Viability,n,fit_Viability",
    );
    expect(rows[3]).toBe("1,50,51,,50.5,0.707107,2,50.0469");
  });

  it("quotes CSV cells with commas or quotes", () => {
    const csv = doseResponseCsv({
      ...DATA,
      replicates: [{ id: "a", label: 'A, "one"' }],
      points: [{ dose: 1, values: [50] }],
    });

    expect(csv.split("\n")[0]).toBe(
      'dose_µM,"Viability_A, ""one""",mean_Viability,sd_Viability,n,fit_Viability',
    );
  });
});

describe("DoseResponseCurve", () => {
  it("shows metadata, replicates, and the half-maximal fit", () => {
    render(<DoseResponseCurve data={DATA} />);

    expect(
      screen.getByRole("heading", { name: "Test compound", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 doses")).toBeInTheDocument();
    expect(screen.getByText("3 replicates")).toBeInTheDocument();
    expect(screen.getByText("0.01–100 µM")).toBeInTheDocument();
    expect(screen.getByText("1 missed read")).toBeInTheDocument();
    expect(screen.getByText("Good fit")).toBeInTheDocument();
    expect(screen.getAllByText("IC50").length).toBeGreaterThan(0);
    expect(screen.getByText("14 / 15")).toBeInTheDocument();
  });

  it("switches the dose scale and replicate points", async () => {
    const user = userEvent.setup();
    render(<DoseResponseCurve data={DATA} />);

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
    render(<DoseResponseCurve data={DATA} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show data table" }));

    const table = screen.getByRole("table", {
      name: "Test compound data table",
    });
    expect(within(table).getByText("50.5")).toBeInTheDocument();
    expect(within(table).getAllByText("—")).toHaveLength(1);
    expect(within(table).getByText("0.707")).toBeInTheDocument();
  });

  it("keeps the data table mounted for print while it is closed", () => {
    const { container } = render(<DoseResponseCurve data={DATA} />);
    const wrapper = container.querySelector('[id^="dose-response-table-"]');

    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper?.className).toContain("hidden");
    expect(wrapper?.className).toContain("print:block");
  });

  it("inspects doses from the keyboard", async () => {
    const user = userEvent.setup();
    render(<DoseResponseCurve data={DATA} />);

    const chart = screen.getByRole("slider", {
      name: /Test compound dose-response curve dose cursor/,
    });
    chart.focus();
    await user.keyboard("{Home}{ArrowRight}");

    expect(chart.getAttribute("aria-valuetext")).toContain(
      "0.1 µM · mean 90 ± 1 % · n=3",
    );

    await user.keyboard("{End}");
    expect(chart.getAttribute("aria-valuetext")).toContain(
      "100 µM · mean 3 ± 1 % · n=3",
    );
  });

  it("exports CSV and leaves the download to the browser", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<DoseResponseCurve data={DATA} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport.mock.calls[0][0]).toContain(
      "dose_µM,Viability_A1,Viability_A2,Viability_A3",
    );
  });

  it("counts, warns about, and skips non-positive doses", async () => {
    const user = userEvent.setup();
    render(
      <DoseResponseCurve
        data={{
          ...DATA,
          points: [{ dose: 0, values: [100, 99, 101] }, ...DATA.points],
        }}
      />,
    );

    expect(screen.getByText("Non-positive")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Non-positive doses are hidden on the log scale, excluded from the fit, and kept in the table.",
      ),
    ).toBeInTheDocument();

    const chart = screen.getByRole("slider", {
      name: /Test compound dose-response curve dose cursor/,
    });
    chart.focus();
    await user.keyboard("{Home}");
    expect(chart.getAttribute("aria-valuetext")).toContain("0.01 µM");

    await user.click(screen.getByRole("button", { name: "Show data table" }));
    const table = screen.getByRole("table", {
      name: "Test compound data table",
    });
    const vehicleRow = within(table).getByText("0").closest("tr");
    expect(vehicleRow).not.toBeNull();
    expect(
      within(vehicleRow as HTMLElement).getByText("101"),
    ).toBeInTheDocument();
  });

  it("hides the fit on request", () => {
    render(<DoseResponseCurve data={DATA} showFit={false} />);

    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(screen.queryByText("Good fit")).not.toBeInTheDocument();
    expect(screen.queryByText("IC50")).not.toBeInTheDocument();
    expect(screen.getByText(/The 4PL fit is hidden/)).toBeInTheDocument();
  });

  it("passes fit options through to the analysis", () => {
    render(<DoseResponseCurve data={DATA} fitOptions={{ minPoints: 10 }} />);

    expect(screen.getByText("No fit")).toBeInTheDocument();
    expect(
      screen.getByText(/Need at least 10 positive doses/),
    ).toBeInTheDocument();
  });

  it("renders an explicit empty state", () => {
    render(<DoseResponseCurve data={null} />);

    expect(
      screen.getByText("No dose-response data loaded."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export CSV" }),
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DoseResponseCurve data={DATA} />);
    await expectNoViolations(container);
  });
});
