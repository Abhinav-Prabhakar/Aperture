import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { DEMO_SPECTRUM } from "@/registry/default/examples/spectrum-plot-demo";
import {
  estimateSpectrumNoise,
  findSpectrumPeaks,
  matchSpectrumLines,
  type SpectrumData,
  SpectrumPlot,
  smoothSpectrum,
  spectrumBaseline,
  spectrumCsv,
  summarizeSpectrum,
} from "@/registry/default/instruments/spectrum-plot";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

function gaussianSeries(
  centers: readonly number[],
  options: {
    amplitude?: number;
    baseline?: number;
    sigma?: number;
    start?: number;
    end?: number;
    step?: number;
  } = {},
) {
  const {
    amplitude = 100,
    baseline = 20,
    sigma = 2,
    start = 450,
    end = 650,
    step = 0.5,
  } = options;
  return Array.from(
    { length: Math.round((end - start) / step) + 1 },
    (_, index) => {
      const wavelength = start + index * step;
      const intensity =
        baseline +
        centers.reduce((sum, center) => {
          const z = (wavelength - center) / sigma;
          return sum + amplitude * Math.exp(-0.5 * z * z);
        }, 0);
      return { intensity, wavelength };
    },
  );
}

const SIMPLE: SpectrumData = {
  id: "TEST-1",
  intensityLabel: "Counts",
  name: "Test spectrum",
  points: [
    { intensity: 10, wavelength: 500 },
    { intensity: 30, wavelength: 501 },
    { intensity: 12, uncertainty: 0.5, wavelength: 502 },
    { intensity: 9, wavelength: 503 },
  ],
  wavelengthUnit: "nm",
};

describe("spectrum helpers", () => {
  it("sorts points, tracks missing data, and reports the sampling", () => {
    const summary = summarizeSpectrum({
      ...SIMPLE,
      points: [
        { intensity: 9, wavelength: 503 },
        { intensity: Number.NaN, wavelength: 500 },
        { intensity: 10, wavelength: 500 },
        { intensity: 12, uncertainty: 0.5, wavelength: 502 },
        { intensity: 30, wavelength: 501 },
        { intensity: 1, wavelength: Number.POSITIVE_INFINITY },
      ],
    });

    expect(summary.points).toHaveLength(4);
    expect(summary.points.map((point) => point.wavelength)).toEqual([
      500, 501, 502, 503,
    ]);
    expect(summary).toMatchObject({
      hasUncertainty: true,
      maxIntensity: 30,
      maxWavelength: 503,
      minIntensity: 9,
      minWavelength: 500,
      missing: 2,
      resolution: 1,
    });
  });

  it("smooths with a shrinking window at the edges", () => {
    const points = [0, 0, 0, 3, 0, 0, 0].map((intensity, index) => ({
      intensity,
      uncertainty: null,
      wavelength: 500 + index,
    }));

    expect(smoothSpectrum(points, 3)).toEqual([0, 0, 1, 1, 1, 0, 0]);
    expect(smoothSpectrum(points, 2)).toEqual(smoothSpectrum(points, 3));
  });

  it("removes a linear continuum estimated from the outer points", () => {
    const points = Array.from({ length: 101 }, (_, index) => ({
      intensity: 5 + index * 0.1,
      uncertainty: null,
      wavelength: 400 + index,
    }));
    const baseline = spectrumBaseline(points);

    expect(baseline.slope).toBeCloseTo(0.1, 10);
    expect(baseline.at(450)).toBeCloseTo(10, 8);
    expect(
      points.map((point, index) => point.intensity - baseline.values[index]),
    ).toEqual(points.map(() => expect.closeTo(0, 8)));
  });

  it("detects Gaussian peaks with prominence and FWHM", () => {
    const points = gaussianSeries([500, 600], { sigma: 2 });
    const peaks = findSpectrumPeaks(points, {
      minProminence: 0.05,
      minSeparation: 10,
    });

    expect(peaks).toHaveLength(2);
    expect(peaks[0].wavelength).toBeCloseTo(500, 1);
    expect(peaks[1].wavelength).toBeCloseTo(600, 1);
    expect(peaks[0].prominence).toBeCloseTo(100, 1);
    expect(peaks[0].fwhm).toBeCloseTo(2.355 * 2, 0);
  });

  it("finds troughs in absorption mode", () => {
    const points = gaussianSeries([500], {
      amplitude: -80,
      baseline: 100,
      sigma: 2,
    });
    const peaks = findSpectrumPeaks(points, {
      direction: "min",
      minProminence: 0.05,
    });

    expect(peaks).toHaveLength(1);
    expect(peaks[0].wavelength).toBeCloseTo(500, 1);
    expect(peaks[0].intensity).toBeCloseTo(20, 0);
  });

  it("keeps only the stronger peak inside the separation window", () => {
    const points = gaussianSeries([500, 501.5], {
      amplitude: 60,
      sigma: 0.5,
    });
    const merged = findSpectrumPeaks(points, {
      minProminence: 0.02,
      minSeparation: 3,
    });
    const split = findSpectrumPeaks(points, {
      minProminence: 0.02,
      minSeparation: 0.5,
    });

    expect(merged).toHaveLength(1);
    expect(split).toHaveLength(2);
  });

  it("estimates noise from the median first difference", () => {
    const smooth = gaussianSeries([500], { sigma: 4 });
    expect(estimateSpectrumNoise(smooth)).toBeCloseTo(0, 8);

    const noisy = Array.from({ length: 101 }, (_, index) => ({
      intensity: index % 2 === 0 ? 10 : 12,
    }));
    expect(estimateSpectrumNoise(noisy)).toBeGreaterThan(0.5);
  });

  it("matches reference lines and flags blended assignments", () => {
    const peaks = findSpectrumPeaks(gaussianSeries([500, 600], { sigma: 1 }), {
      minProminence: 0.02,
      minSeparation: 10,
    });
    const matches = matchSpectrumLines(
      peaks,
      [
        { id: "a", species: "A", wavelength: 500.2 },
        { id: "b", species: "B", wavelength: 600.6 },
        { id: "c", species: "C", wavelength: 500.4 },
      ],
      1,
    );

    expect(matches).toHaveLength(3);
    expect(matches[0].residual).toBeCloseTo(-0.2, 1);
    expect(matches[1].residual).toBeCloseTo(-0.6, 1);
    expect(matches[0].blended).toBe(true);
    expect(matches[2].blended).toBe(true);
    expect(matches[1].blended).toBe(false);
  });

  it("recognizes the demo's strong lines", () => {
    const summary = summarizeSpectrum(DEMO_SPECTRUM);
    const smoothed = smoothSpectrum(summary.points, 5);
    const peaks = findSpectrumPeaks(
      summary.points.map((point, index) => ({
        intensity: smoothed[index],
        wavelength: point.wavelength,
      })),
      { minSeparation: 1.2 },
    );
    const matches = matchSpectrumLines(peaks, DEMO_SPECTRUM.lines ?? [], 1);

    expect(summary.points).toHaveLength(441);
    expect(summary.minWavelength).toBe(460);
    expect(summary.maxWavelength).toBe(680);
    expect(peaks.length).toBeGreaterThanOrEqual(5);
    expect(
      matches.filter((match) => match.peak !== null).length,
    ).toBeGreaterThanOrEqual(6);
  });

  it("exports aligned values with a peak flag and empty uncertainty", () => {
    const csv = spectrumCsv(SIMPLE);
    const rows = csv.split("\n");

    expect(rows[0]).toBe(
      "wavelength_nm,intensity,smoothed,baseline_corrected,uncertainty,is_peak",
    );
    expect(rows[1].split(",")).toHaveLength(6);
    expect(rows[3]).toContain(",0.5,");
    expect(rows[2].split(",")[4]).toBe("");
  });
});

describe("SpectrumPlot", () => {
  it("renders the chart, analysis, and reference lines", () => {
    render(<SpectrumPlot data={DEMO_SPECTRUM} />);

    expect(
      screen.getByRole("heading", { name: "Orion Nebula optical spectrum" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByText("Detected peaks")).toBeInTheDocument();
    expect(screen.getByText("Reference lines")).toBeInTheDocument();
    expect(screen.getByText("Hα")).toBeInTheDocument();
    expect(screen.getByText("441 points")).toBeInTheDocument();
  });

  it("switches traces and toggles the analysis layers", async () => {
    const user = userEvent.setup();
    render(<SpectrumPlot data={DEMO_SPECTRUM} />);

    const raw = screen.getByRole("button", { name: "Raw" });
    const smoothed = screen.getByRole("button", { name: "Smoothed" });
    expect(raw).toHaveAttribute("aria-pressed", "false");
    expect(smoothed).toHaveAttribute("aria-pressed", "true");

    await user.click(raw);
    expect(raw).toHaveAttribute("aria-pressed", "true");
    expect(smoothed).toHaveAttribute("aria-pressed", "false");

    const peaks = screen.getByRole("button", { name: "Peaks" });
    await user.click(peaks);
    expect(peaks).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("Detected peaks")).not.toBeInTheDocument();

    const lines = screen.getByRole("button", { name: "Lines" });
    await user.click(lines);
    expect(screen.queryByText("Reference lines")).not.toBeInTheDocument();

    const baseline = screen.getByRole("button", { name: "Baseline" });
    await user.click(baseline);
    expect(baseline).toHaveAttribute("aria-pressed", "true");
  });

  it("inspects the spectrum from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SpectrumPlot data={DEMO_SPECTRUM} />);

    const slider = screen.getByRole("slider");
    slider.focus();
    const initial = slider.getAttribute("aria-valuetext");
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuetext")).not.toBe(initial);

    await user.keyboard("{End}");
    expect(slider.getAttribute("aria-valuetext")).toContain("680");
    await user.keyboard("{Home}");
    expect(slider.getAttribute("aria-valuetext")).toContain("460");
  });

  it("uses the pointer to move the wavelength cursor", () => {
    render(<SpectrumPlot data={DEMO_SPECTRUM} />);
    const slider = screen.getByRole("slider");
    vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
      bottom: 280,
      height: 280,
      left: 0,
      right: 640,
      top: 0,
      width: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const initial = slider.getAttribute("aria-valuetext");

    fireEvent.pointerMove(slider, { clientX: 300 });
    expect(slider.getAttribute("aria-valuetext")).not.toBe(initial);
  });

  it("opens a data table with explicit missing uncertainty", async () => {
    const user = userEvent.setup();
    render(<SpectrumPlot data={SIMPLE} />);

    await user.click(screen.getByRole("button", { name: "Data" }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("Wavelength (nm)")).toBeInTheDocument();
    expect(within(table).getByText("Counts")).toBeInTheDocument();
    expect(within(table).getAllByText("—").length).toBeGreaterThan(0);
  });

  it("calls onExport before the browser download", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<SpectrumPlot data={SIMPLE} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledOnce();
    expect(onExport.mock.calls[0][0]).toContain("wavelength_nm,intensity");
  });

  it("counts and skips non-finite points", () => {
    render(
      <SpectrumPlot
        data={{
          ...SIMPLE,
          points: [
            ...SIMPLE.points,
            { intensity: Number.NaN, wavelength: 504 },
          ],
        }}
      />,
    );

    expect(screen.getByText("1 ignored")).toBeInTheDocument();
  });

  it("renders an empty state", () => {
    render(<SpectrumPlot data={null} />);
    expect(screen.getByText("No spectrum loaded.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SpectrumPlot data={DEMO_SPECTRUM} />);
    await expectNoViolations(container);
  });
});
