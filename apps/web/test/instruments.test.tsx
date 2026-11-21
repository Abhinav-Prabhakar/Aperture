import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { QuantityInput } from "@/registry/default/instruments/quantity-input";
import { ScientificNumber } from "@/registry/default/instruments/scientific-number";
import { Sparkline } from "@/registry/default/instruments/sparkline";
import { Stat, StatGrid } from "@/registry/default/instruments/stat";

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
