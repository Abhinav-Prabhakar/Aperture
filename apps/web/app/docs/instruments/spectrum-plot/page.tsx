import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { SpectrumPlotDemo } from "@/registry/default/examples/spectrum-plot-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Spectrum Plot",
  description:
    "An emission or absorption spectrum with uncertainty, smoothing, a linear baseline, peak detection, reference-line matching, a keyboard cursor, a data table, and CSV export.",
};

export default function SpectrumPlotPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Physical sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Spectrum Plot
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A spectrum is a sampled measurement with uncertainty and a wavelength
        axis — not a decorative line. Keep the trace, its noise, the detected
        peaks, and the reference lines together, and make every number behind
        the picture inspectable.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <SpectrumPlotDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A synthetic optical spectrum of the Orion Nebula with Hβ, the [O III]
        doublet, Hα with its [N II] satellites, and the [S II] pair. Toggle raw
        and smoothed traces, remove a linear baseline, hide the peaks or
        reference lines, hover the chart or focus it and use the arrow keys,
        open the data table, or export the CSV.
      </p>

      <CodeBlock
        code={`import { SpectrumPlot } from "@/components/instruments/spectrum-plot";

<SpectrumPlot
  data={{
    id: "M42-SLIT-3",
    name: "Orion Nebula optical spectrum",
    wavelengthUnit: "nm",
    intensityLabel: "Counts",
    intensityUnit: "a.u.",
    mode: "emission",
    points: [
      { wavelength: 486.0, intensity: 102.4, uncertainty: 1.4 },
      { wavelength: 486.5, intensity: 129.8, uncertainty: 1.4 },
      // …
    ],
    lines: [
      { id: "h-beta", species: "Hβ", wavelength: 486.133 },
      { id: "oiii-5007", species: "[O III]", wavelength: 500.684 },
    ],
  }}
  options={{ lineTolerance: 1, minSeparation: 1.2 }}
  onExport={(csv) => track("spectrum-export", csv.length)}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The raw trace stays available.</strong>{" "}
          Smoothing is a display and detection aid, not a replacement for the
          measurement. Switch back to raw at any time; the table keeps both
          columns.
        </li>
        <li>
          <strong className="font-medium">Uncertainty is drawn, not implied.</strong>{" "}
          When points carry a one-sigma uncertainty, the chart draws a band
          around the working trace and the table reports each value. Points
          without an uncertainty are left as explicit gaps in the band.
        </li>
        <li>
          <strong className="font-medium">Peaks have a definition.</strong> A
          peak needs a local extremum, a minimum prominence as a fraction of the
          observed range, and a minimum separation from stronger peaks. The
          table reports the wavelength, intensity, prominence, and FWHM.
        </li>
        <li>
          <strong className="font-medium">Reference lines carry residuals.</strong>{" "}
          Each rest wavelength is matched to its nearest detected peak within
          the tolerance. The table shows observed minus rest, and marks a line
          as blended when more than one reference line shares the same peak.
        </li>
        <li>
          <strong className="font-medium">Absorption looks for troughs.</strong>{" "}
          Set <span className="font-mono text-xs">mode: "absorption"</span> and
          the same detector finds minima instead of maxima. The axis, peak
          table, and export do not change shape.
        </li>
        <li>
          <strong className="font-medium">Every sample is inspectable.</strong>{" "}
          The chart behaves as a slider over wavelength. Arrow keys, Home, and
          End move the cursor; the readout reports wavelength, intensity,
          uncertainty, and the nearest reference line.
        </li>
        <li>
          <strong className="font-medium">The export is the data.</strong> CSV
          columns carry wavelength, raw intensity, smoothed intensity,
          baseline-corrected intensity, uncertainty, and a peak flag. The file
          does not contain the plotted screen coordinates.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How the analysis works
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        All three steps are deterministic and exported as pure helpers. They
        are display aids for review, not a substitute for a validated
        spectroscopic line-fitting workflow.
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Smoothing.</strong> A centered moving
          average with an odd window (default 5 points), shrinking at the ends
          rather than padding.
        </li>
        <li>
          <strong className="font-medium">Baseline.</strong> A straight line
          through the medians of the outer 10% of the trace. It removes a
          simple continuum tilt; it is not a physical continuum model.
        </li>
        <li>
          <strong className="font-medium">Peaks.</strong> Local maxima with
          prominence of at least 4% of the observed range, separated by at
          least 1.5 wavelength units, capped at 24. FWHM is measured at half
          prominence by linear interpolation.
        </li>
        <li>
          <strong className="font-medium">Matching.</strong> The nearest peak
          within 1.5 wavelength units (configurable). Residuals are reported in
          the same unit as the axis; a blended flag means the assignment is not
          unique.
        </li>
        <li>
          <strong className="font-medium">Noise.</strong> A robust sigma from
          the median absolute first difference. It is a quick noise estimate,
          not a formal error propagation.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Data in.</strong>{" "}
          <span className="font-mono text-xs">data</span> is null or an object
          with an <span className="font-mono text-xs">id</span>, a name, and a
          non-empty <span className="font-mono text-xs">points</span> array. A
          missing or empty trace renders the empty state.
        </li>
        <li>
          <strong className="font-medium">Points are sorted, not trusted.</strong>{" "}
          Points are sorted by wavelength. A non-finite wavelength or intensity
          is dropped and counted in the header; a non-finite uncertainty is
          treated as missing, not as zero.
        </li>
        <li>
          <strong className="font-medium">Units are explicit.</strong>{" "}
          <span className="font-mono text-xs">wavelengthUnit</span> defaults to{" "}
          <span className="font-mono text-xs">nm</span>;{" "}
          <span className="font-mono text-xs">intensityLabel</span> defaults to{" "}
          <span className="font-mono text-xs">Intensity</span> and{" "}
          <span className="font-mono text-xs">intensityUnit</span> to{" "}
          <span className="font-mono text-xs">a.u.</span>. They appear on the
          axes, in the analysis, and in the CSV header.
        </li>
        <li>
          <strong className="font-medium">Reference lines are optional.</strong>{" "}
          Each line needs an id, a species, and a wavelength. An optional label
          adds a transition name. Without lines, the reference table is hidden
          and the rest of the instrument is unchanged.
        </li>
        <li>
          <strong className="font-medium">Analysis controls are options.</strong>{" "}
          <span className="font-mono text-xs">smoothingWindow</span>,{" "}
          <span className="font-mono text-xs">minProminence</span>,{" "}
          <span className="font-mono text-xs">minSeparation</span>,{" "}
          <span className="font-mono text-xs">maxPeaks</span>, and{" "}
          <span className="font-mono text-xs">lineTolerance</span> are passed
          once and shared by the chart, tables, summary, and export.
        </li>
        <li>
          <strong className="font-medium">Export is observable.</strong>{" "}
          <span className="font-mono text-xs">onExport(csv)</span> fires before
          the browser download. The component does not upload anything.
        </li>
        <li>
          <strong className="font-medium">Pure helpers are exported.</strong>{" "}
          <span className="font-mono text-xs">summarizeSpectrum</span>,{" "}
          <span className="font-mono text-xs">smoothSpectrum</span>,{" "}
          <span className="font-mono text-xs">spectrumBaseline</span>,{" "}
          <span className="font-mono text-xs">findSpectrumPeaks</span>,{" "}
          <span className="font-mono text-xs">matchSpectrumLines</span>, and{" "}
          <span className="font-mono text-xs">spectrumCsv</span>.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The chart exposes a slider role over wavelength. Arrow keys, Home, and
          End work without a pointer, and the value text names the nearest
          reference line when one matches.
        </li>
        <li>
          A screen-reader summary states the point count, wavelength range,
          sampling, peak count, strongest peak, matched line count, noise
          sigma, and ignored non-finite points.
        </li>
        <li>
          Peaks and reference matches are real tables with column headers and
          an explicit <span className="font-mono">—</span> for a missing value.
          The full data table is toggleable on screen and omitted from print
          unless opened.
        </li>
        <li>
          Status is never color alone: peaks are labeled in the legend and the
          table, and the baseline, raw, and smoothed states are button labels
          with <span className="font-mono text-xs">aria-pressed</span>.
        </li>
        <li>
          Layout uses logical properties and container queries. At 320 px the
          analysis moves below the chart without a page-level horizontal
          scroll.
        </li>
        <li>
          There are no entrance animations or counting numbers. Reduced-motion
          users see the same chart immediately.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The rendering, helpers, keyboard path, and export are complete and
        tested. The defaults still need a domain-advisor review: air versus
        vacuum wavelengths, the linear baseline, the smoothing and prominence
        thresholds, the line lists, and the absence of flux calibration or
        equivalent-width measurement. Treat this instrument as usable, not
        final. The{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/growth-curve"
        >
          Growth Curve
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/dose-response"
        >
          Dose–Response Curve
        </Link>{" "}
        carry the same preview status.
      </p>
    </article>
  );
}
