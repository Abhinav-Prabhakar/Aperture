import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  ConstantsReference,
  constantCsv,
  constantPlainValue,
  filterConstants,
  formatConstantUncertainty,
  formatConstantUnit,
  formatConstantValue,
  searchConstants,
} from "@/registry/default/instruments/constants-reference";
import {
  CODATA_CONSTANTS,
  type PhysicalConstant,
} from "@/registry/default/lib/codata-constants";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

function constant(id: string): PhysicalConstant {
  const found = CODATA_CONSTANTS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Missing constant ${id}`);
  }
  return found;
}

describe("constants helpers", () => {
  it("typesets NIST values and units", () => {
    expect(formatConstantValue("299 792 458")).toBe("299 792 458");
    expect(formatConstantValue("6.626 070 15 e-34")).toBe(
      "6.626 070 15 × 10⁻³⁴",
    );
    expect(formatConstantValue("483 597.9 e9")).toBe("483 597.9 × 10⁹");
    expect(formatConstantUnit("m^3 kg^-1 s^-2")).toBe("m³ kg⁻¹ s⁻²");
    expect(formatConstantUnit("(GeV/c^2)^-2")).toBe("(GeV/c²)⁻²");
    expect(formatConstantUnit("ohm m")).toBe("Ω m");
    expect(formatConstantUnit("")).toBe("dimensionless");
  });

  it("produces machine-readable values and uncertainty labels", () => {
    expect(constantPlainValue("9.109 383 7139 e-31")).toBe("9.1093837139e-31");
    expect(
      formatConstantUncertainty(constant("newtonian-constant-of-gravitation")),
    ).toBe("± 0.000 15 × 10⁻¹¹");
    expect(
      formatConstantUncertainty(constant("speed-of-light-in-vacuum")),
    ).toBe("Exact");
  });

  it("filters the featured and SI-defining subsets", () => {
    expect(filterConstants(CODATA_CONSTANTS, "featured")).toHaveLength(20);
    expect(filterConstants(CODATA_CONSTANTS, "si")).toHaveLength(7);
    expect(filterConstants(CODATA_CONSTANTS, "all")).toHaveLength(355);
    expect(
      filterConstants(CODATA_CONSTANTS, "si").map((item) => item.symbol),
    ).toEqual(["c", "h", "e", "k_B", "N_A", "Δν_Cs", "K_cd"]);
  });

  it("searches names, symbols, values, and units", () => {
    expect(
      searchConstants(CODATA_CONSTANTS, "speed of light").map(
        (item) => item.id,
      ),
    ).toEqual(["speed-of-light-in-vacuum"]);
    expect(searchConstants(CODATA_CONSTANTS, "299792458")[0].id).toBe(
      "speed-of-light-in-vacuum",
    );
    expect(searchConstants(CODATA_CONSTANTS, "N_A")[0].id).toBe(
      "avogadro-constant",
    );
    expect(
      searchConstants(CODATA_CONSTANTS, "J Hz^-1").length,
    ).toBeGreaterThanOrEqual(2);
    expect(searchConstants(CODATA_CONSTANTS, "")).toHaveLength(355);
  });

  it("exports the complete listing with exact and subset flags", () => {
    const csv = constantCsv(CODATA_CONSTANTS);
    const rows = csv.split("\n");

    expect(rows).toHaveLength(356);
    expect(rows[0]).toBe(
      "id,name,symbol,value,uncertainty,unit,exact,featured,si_defining",
    );
    expect(rows.find((row) => row.startsWith("speed-of-light-in-vacuum"))).toBe(
      "speed-of-light-in-vacuum,speed of light in vacuum,c,299 792 458,,m s^-1,1,1,1",
    );
    expect(
      rows.find((row) => row.startsWith("newtonian-constant-of-gravitation,")),
    ).toContain(",6.674 30 e-11,0.000 15 e-11,m^3 kg^-1 s^-2,0,1,0");
  });
});

describe("ConstantsReference", () => {
  it("renders the featured list and the default detail", () => {
    render(<ConstantsReference />);

    expect(
      screen.getByRole("heading", { name: "Fundamental constants" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Constants" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Constants" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(20);

    const detail = within(
      screen.getByRole("region", { name: "Constant detail" }),
    );
    expect(detail.getByText("299 792 458")).toBeInTheDocument();
    expect(detail.getAllByText("m s⁻¹").length).toBeGreaterThan(0);
    expect(detail.getByText("Exact — no uncertainty")).toBeInTheDocument();
    expect(detail.getByText("speed of light in vacuum")).toBeInTheDocument();
  });

  it("honors an initial constant outside the default filter", () => {
    render(
      <ConstantsReference defaultConstantId="proton-mass" defaultFilter="si" />,
    );

    expect(screen.getByRole("button", { name: /^All/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: "proton mass", level: 4 }),
    ).toBeInTheDocument();
  });

  it("switches between the featured, SI, and complete lists", async () => {
    const user = userEvent.setup();
    render(<ConstantsReference defaultConstantId="fine-structure-constant" />);

    const detail = within(
      screen.getByRole("region", { name: "Constant detail" }),
    );
    expect(detail.getByText("7.297 352 5643 × 10⁻³")).toBeInTheDocument();
    expect(detail.getAllByText("dimensionless").length).toBeGreaterThan(0);
    expect(
      detail.getByText("± 0.000 000 0011 × 10⁻³ dimensionless"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^SI defining/ }));
    expect(
      within(screen.getByRole("list", { name: "Constants" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(7);

    await user.click(screen.getByRole("button", { name: /^All/ }));
    expect(
      within(screen.getByRole("list", { name: "Constants" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(355);
  });

  it("searches and selects the first matching constant", async () => {
    const user = userEvent.setup();
    render(<ConstantsReference />);

    const input = screen.getByRole("searchbox", { name: "Search constants" });
    await user.type(input, "gravitational");

    expect(
      await screen.findByRole("heading", {
        name: "Newtonian constant of gravitation",
        level: 4,
      }),
    ).toBeInTheDocument();
    const detail = within(
      screen.getByRole("region", { name: "Constant detail" }),
    );
    expect(detail.getByText("6.674 30 × 10⁻¹¹")).toBeInTheDocument();
    expect(detail.getAllByText("m³ kg⁻¹ s⁻²").length).toBeGreaterThan(0);
    expect(
      detail.getByText("± 0.000 15 × 10⁻¹¹ m³ kg⁻¹ s⁻²"),
    ).toBeInTheDocument();

    await user.clear(input);
    expect(
      within(screen.getByRole("list", { name: "Constants" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(20);
  });

  it("moves through the list from the keyboard", async () => {
    const user = userEvent.setup();
    render(<ConstantsReference defaultConstantId="fine-structure-constant" />);

    const alpha = screen.getByRole("button", {
      name: /fine-structure constant/,
    });
    alpha.focus();

    await user.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("heading", { name: "electron mass", level: 4 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /electron mass/ })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(
      screen.getByRole("heading", {
        name: "speed of light in vacuum",
        level: 4,
      }),
    ).toBeInTheDocument();

    await user.keyboard("{End}");
    expect(
      screen.getByRole("heading", {
        name: "vacuum electric permittivity",
        level: 4,
      }),
    ).toBeInTheDocument();
  });

  it("copies the value and the value with uncertainty", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<ConstantsReference defaultConstantId="fine-structure-constant" />);

    await user.click(screen.getByRole("button", { name: "Copy value" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("7.2973525643e-3");
    });

    await user.click(screen.getByRole("button", { name: "Copy ±" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        "7.2973525643e-3 ± 0.0000000011e-3",
      );
    });
  });

  it("exports only the visible constants", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<ConstantsReference onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledOnce();
    expect(onExport.mock.calls[0][0].split("\n")).toHaveLength(21);

    await user.click(screen.getByRole("button", { name: /^All/ }));
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport.mock.calls[1][0].split("\n")).toHaveLength(356);
  });

  it("renders an empty state", () => {
    render(<ConstantsReference constants={[]} />);
    expect(screen.getByText("No constants loaded.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ConstantsReference defaultConstantId="fine-structure-constant" />,
    );
    await expectNoViolations(container);
  });
});
