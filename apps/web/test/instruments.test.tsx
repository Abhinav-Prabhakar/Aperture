import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  type LogEntry,
  LogViewer,
} from "@/registry/default/instruments/log-viewer";
import {
  type ProtocolStep,
  ProtocolSteps,
} from "@/registry/default/instruments/protocol-steps";
import { QuantityInput } from "@/registry/default/instruments/quantity-input";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Sparkline } from "@/registry/default/instruments/sparkline";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";
import {
  StatusBadge,
  StatusDot,
} from "@/registry/default/instruments/status-badge";
import {
  Timeline,
  type TimelineItem,
} from "@/registry/default/instruments/timeline";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

function QuantityHarness({
  required = false,
}: {
  required?: boolean;
}): React.ReactElement {
  const [value, setValue] = useState<number | null>(12.4);
  const [unit, setUnit] = useState("mg/L");
  const [uncertainty, setUncertainty] = useState<number | null>(0.2);

  return (
    <QuantityInput
      label="Concentration"
      onUncertaintyChange={setUncertainty}
      onUnitChange={setUnit}
      onValueChange={setValue}
      required={required}
      uncertainty={uncertainty}
      unit={unit}
      units={["mg/L", "µg/mL", "g/L"]}
      value={value}
    />
  );
}

describe("ScientificNumber", () => {
  it("keeps value, uncertainty, and unit together", () => {
    render(
      <ScientificNumber
        uncertainty={0.00000018}
        unit="m³/kg"
        value={0.00000342}
      />,
    );

    const value = screen.getByText(/3\.42/);
    expect(value).toBeInTheDocument();
    expect(screen.getByText("m³/kg")).toBeInTheDocument();
  });

  it("uses a true minus sign and significant figures", () => {
    const { container } = render(
      <ScientificNumber precision={4} value={-0.01234} />,
    );
    expect(container.textContent).toContain("−0.0123");
    expect(container.textContent).not.toContain("-");
  });

  it("copies the unrounded value with its uncertainty and unit", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <ScientificNumber
        copyable
        uncertainty={0.00000018}
        unit="m³/kg"
        value={0.00000342}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Copy full precision" }),
    );
    expect(writeText).toHaveBeenCalledWith("0.00000342 ± 1.8e-7 m³/kg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ScientificNumber unit="mm" value={12.4} />);
    await expectNoViolations(container);
  });
});

describe("QuantityInput", () => {
  it("links its label, hint, and unit menu", () => {
    render(<QuantityHarness />);

    expect(screen.getByLabelText("Concentration")).toHaveValue("12.4");
    expect(screen.getByLabelText("Concentration unit")).toHaveValue("mg/L");
    expect(screen.getByLabelText("Concentration uncertainty")).toHaveValue(
      "0.2",
    );
  });

  it("converts the value and uncertainty when the unit changes", async () => {
    const user = userEvent.setup();
    render(<QuantityHarness />);

    await user.selectOptions(
      screen.getByLabelText("Concentration unit"),
      "g/L",
    );

    expect(screen.getByLabelText("Concentration")).toHaveValue("0.0124");
    expect(screen.getByLabelText("Concentration uncertainty")).toHaveValue(
      "0.0002",
    );
    expect(screen.getByLabelText("Concentration unit")).toHaveValue("g/L");
  });

  it("reports a non-numeric entry after blur and marks the field invalid", async () => {
    const user = userEvent.setup();
    render(<QuantityHarness />);

    const input = screen.getByLabelText("Concentration");
    await user.clear(input);
    await user.type(input, "not a number");
    await user.tab();

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a number.");
  });

  it("requires a value when required is set", async () => {
    const user = userEvent.setup();
    render(<QuantityHarness required />);

    const input = screen.getByLabelText("Concentration");
    await user.clear(input);
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("A value is required.");
  });

  it("does not clamp values outside the range", async () => {
    const user = userEvent.setup();
    render(
      <QuantityInput
        label="Temperature"
        max={30}
        onUnitChange={() => {}}
        onValueChange={() => {}}
        unit="°C"
        value={42}
      />,
    );

    const input = screen.getByLabelText("Temperature");
    expect(input).toHaveValue("42");
    await user.click(input);
    await user.tab();
    expect(screen.getByRole("alert")).toHaveTextContent("Must be at most 30.");
    expect(input).toHaveValue("42");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<QuantityHarness />);
    await expectNoViolations(container);
  });
});

describe("Sparkline", () => {
  it("summarizes the series for screen readers", () => {
    render(
      <Sparkline
        label="Concentration over nine runs"
        values={[8.1, 9.4, 10.2, 9.8, 11.6, 12.4, 12.1, 12.9, 12.4]}
      />,
    );

    const image = screen.getByRole("img", {
      name: /Concentration over nine runs/,
    });
    expect(image).toHaveAccessibleName(
      "Concentration over nine runs: 8.1 to 12.4, low 8.1, high 12.9, 9 points",
    );
  });

  it("says no data instead of drawing a flat line", () => {
    render(<Sparkline label="No readings" values={[]} />);
    expect(
      screen.getByRole("img", { name: "No readings: no data" }),
    ).toHaveTextContent("—");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Sparkline label="Baseline" values={[3, 3, 3, 3]} />,
    );
    await expectNoViolations(container);
  });
});

describe("StatusBadge", () => {
  it("renders a visible label and a machine-readable state", () => {
    render(<StatusBadge status="running" />);
    const badge = screen
      .getByText("Running")
      .closest('[data-slot="status-badge"]');
    expect(badge).toHaveAttribute("data-status", "running");
  });

  it("accepts a domain label without losing the status", () => {
    render(<StatusBadge label="Acquiring" status="running" />);
    expect(screen.getByText("Acquiring")).toBeInTheDocument();
    expect(screen.queryByText("Running")).not.toBeInTheDocument();
  });

  it("announces changes only when asked", () => {
    const { rerender } = render(<StatusBadge status="running" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<StatusBadge announce status="success" />);
    expect(screen.getByRole("status")).toHaveTextContent("Complete");
  });

  it("gives a standalone dot an accessible name", () => {
    render(<StatusDot label="Reader 3 offline" status="offline" />);
    expect(
      screen.getByRole("img", { name: "Reader 3 offline" }),
    ).toHaveAttribute("data-status", "offline");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div className="flex gap-2">
        <StatusBadge status="success" />
        <StatusDot label="Offline" status="offline" />
      </div>,
    );
    await expectNoViolations(container);
  });
});

describe("LogViewer", () => {
  const entries: LogEntry[] = [
    {
      id: "1",
      time: "14:02:11",
      level: "info",
      source: "reader",
      message: "Acquisition started.",
    },
    {
      id: "2",
      time: "14:03:42",
      level: "warning",
      source: "reader",
      message: "Well D7 saturated.",
    },
    {
      id: "3",
      time: "14:05:09",
      level: "error",
      source: "export",
      message: "Write failed.",
    },
  ];

  it("renders a named log with time, level, source, and message", () => {
    render(<LogViewer entries={entries} title="Plate reader" />);

    const log = screen.getByRole("log", { name: "Plate reader" });
    expect(log).toBeInTheDocument();
    expect(screen.getByText("Acquisition started.")).toBeInTheDocument();
    expect(screen.getByText("Well D7 saturated.")).toBeInTheDocument();
    expect(screen.getAllByText("reader")).toHaveLength(2);
    expect(within(log).getByText("Warn")).toBeInTheDocument();
  });

  it("filters by level without discarding the entries", async () => {
    const user = userEvent.setup();
    render(<LogViewer entries={entries} />);

    await user.click(screen.getByRole("button", { name: "Warn" }));

    expect(screen.queryByText("Acquisition started.")).not.toBeInTheDocument();
    expect(screen.queryByText("Write failed.")).not.toBeInTheDocument();
    expect(screen.getByText("Well D7 saturated.")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Write failed.")).toBeInTheDocument();
  });

  it("uses an honest empty state for no entries and empty filters", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <LogViewer emptyLabel="Nothing recorded." entries={[]} />,
    );
    expect(screen.getByText("Nothing recorded.")).toBeInTheDocument();

    rerender(<LogViewer entries={entries} />);
    await user.click(screen.getByRole("button", { name: "Debug" }));
    expect(screen.getByText("No entries at this level.")).toBeInTheDocument();
  });

  it("toggles follow mode", async () => {
    const user = userEvent.setup();
    render(<LogViewer entries={entries} />);

    const follow = screen.getByRole("button", { name: "Follow" });
    expect(follow).toHaveAttribute("aria-pressed", "true");
    await user.click(follow);
    expect(follow).toHaveAttribute("aria-pressed", "false");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LogViewer entries={entries} />);
    await expectNoViolations(container);
  });
});

describe("Timeline", () => {
  const items: TimelineItem[] = [
    {
      id: "calibration",
      title: "Reader calibrated",
      time: "09:05",
      dateTime: "2026-11-21T09:05:00Z",
      status: "success",
    },
    {
      id: "warning",
      title: "One well censored",
      description: "D7 saturated the detector.",
      time: "09:41",
      status: "warning",
    },
  ];

  it("renders an ordered, named list with times and statuses", () => {
    render(<Timeline items={items} label="Run 12 events" />);

    const list = screen.getByRole("list", { name: "Run 12 events" });
    expect(within(list).getByText("Reader calibrated")).toBeInTheDocument();
    expect(within(list).getByText("09:05")).toHaveAttribute(
      "dateTime",
      "2026-11-21T09:05:00Z",
    );
    expect(screen.getByRole("img", { name: "Complete" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Needs attention" }),
    ).toBeInTheDocument();
  });

  it("states when nothing has happened", () => {
    render(<Timeline emptyLabel="No events recorded." items={[]} />);
    expect(screen.getByText("No events recorded.")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Timeline items={items} label="Run 12 events" />,
    );
    await expectNoViolations(container);
  });
});

describe("ProtocolSteps", () => {
  const steps: ProtocolStep[] = [
    { id: "1", title: "Lyse cells", status: "complete" },
    {
      id: "2",
      title: "Load the gel",
      duration: "15 min",
      status: "active",
      note: { kind: "caution", text: "Do not overfill the wells." },
    },
    { id: "3", title: "Run the gel", status: "pending" },
  ];

  it("shows position, progress, and the active step", () => {
    render(<ProtocolSteps label="Western blot" steps={steps} />);

    expect(screen.getByText("1 / 3 complete")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Western blot progress" }),
    ).toHaveAttribute("aria-valuenow", "1");

    const list = screen.getByRole("list", { name: "Western blot" });
    const active = within(list)
      .getByText("Load the gel")
      .closest('[data-slot="protocol-step"]');
    expect(active).toHaveAttribute("aria-current", "step");
    expect(active).toHaveAttribute("data-status", "active");
  });

  it("labels cautions and notes in text, not only color", () => {
    render(<ProtocolSteps steps={steps} />);
    expect(screen.getByText("Caution")).toBeInTheDocument();
    expect(screen.getByText(/Do not overfill the wells\./)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ProtocolSteps label="Western blot" steps={steps} />,
    );
    await expectNoViolations(container);
  });
});

describe("Stat", () => {
  it("renders label, value, unit, and context as a description list", () => {
    render(
      <StatGrid columns={2}>
        <Stat
          delta="+2.1%"
          hint="Versus run 11"
          label="Recovery"
          trend="up"
          unit="%"
          value="96.4"
        />
        <Stat label="Samples" value="24" />
      </StatGrid>,
    );

    const recovery = screen.getByText("Recovery");
    const list = recovery.closest("dl");
    if (!list) {
      throw new Error("Stat must render a description list.");
    }
    expect(within(list).getByText("96.4")).toBeInTheDocument();
    expect(within(list).getByText("%")).toBeInTheDocument();
    expect(within(list).getByText("+2.1%")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <StatGrid>
        <Stat hint="n = 24 samples" label="Mean χ" unit="m³/kg" value="3.42" />
      </StatGrid>,
    );
    await expectNoViolations(container);
  });
});
