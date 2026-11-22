import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  elementCsv,
  findElementNeighbor,
  formatAtomicMass,
  formatDensity,
  formatKelvin,
  PERIODIC_LAYOUT,
  PeriodicTable,
  searchElements,
} from "@/registry/default/instruments/periodic-table";
import {
  type ChemicalElement,
  ELEMENTS,
} from "@/registry/default/lib/periodic-table-data";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

function element(number: number): ChemicalElement {
  const found = ELEMENTS.find((item) => item.number === number);
  if (!found) {
    throw new Error(`Missing element ${number}`);
  }
  return found;
}

describe("periodic table helpers", () => {
  it("builds a conventional 18-column layout with f-block strips", () => {
    expect(PERIODIC_LAYOUT).toHaveLength(9);
    expect(PERIODIC_LAYOUT[0][0]).toBe(1);
    expect(PERIODIC_LAYOUT[0][17]).toBe(2);
    expect(PERIODIC_LAYOUT[1][0]).toBe(3);
    expect(PERIODIC_LAYOUT[1][12]).toBe(5);
    expect(PERIODIC_LAYOUT[3][7]).toBe(26);
    expect(PERIODIC_LAYOUT[3][0]).toBe(19);
    expect(PERIODIC_LAYOUT[3][17]).toBe(36);
    expect(PERIODIC_LAYOUT[5][2]).toBeNull();
    expect(PERIODIC_LAYOUT[5][3]).toBe(72);
    expect(PERIODIC_LAYOUT[6][0]).toBe(87);
    expect(PERIODIC_LAYOUT[7][2]).toBe(57);
    expect(PERIODIC_LAYOUT[7][16]).toBe(71);
    expect(PERIODIC_LAYOUT[8][2]).toBe(89);
    expect(PERIODIC_LAYOUT[8][16]).toBe(103);
  });

  it("moves through the grid without crossing an empty cell", () => {
    expect(findElementNeighbor(PERIODIC_LAYOUT, 26, "right")).toBe(27);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 26, "left")).toBe(25);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 26, "down")).toBe(44);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 26, "home")).toBe(19);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 26, "end")).toBe(36);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 2, "right")).toBe(2);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 2, "down")).toBe(10);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 57, "right")).toBe(58);
    expect(findElementNeighbor(PERIODIC_LAYOUT, 71, "right")).toBe(71);
  });

  it("searches names, symbols, atomic numbers, categories, and blocks", () => {
    expect(searchElements(ELEMENTS, "iron").map((item) => item.symbol)).toEqual(
      ["Fe"],
    );
    expect(searchElements(ELEMENTS, "fe")[0].symbol).toBe("Fe");
    expect(searchElements(ELEMENTS, "26")[0].symbol).toBe("Fe");
    expect(
      searchElements(ELEMENTS, "noble gas").map((item) => item.symbol),
    ).toEqual(["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"]);
    expect(searchElements(ELEMENTS, "d-block")).toHaveLength(38);
    expect(searchElements(ELEMENTS, "")).toEqual([]);
  });

  it("formats mass, density, and temperature with explicit missing values", () => {
    expect(formatAtomicMass(element(26))).toBe("55.84");
    expect(
      formatAtomicMass({ ...element(26), mass: 288, standardWeight: false }),
    ).toBe("288 *");
    expect(formatDensity(element(26))).toBe("7.874 g/cm³");
    expect(formatDensity({ ...element(26), density: null })).toBe("—");
    expect(formatKelvin(273.15)).toBe("273.15 K (0 °C)");
    expect(formatKelvin(1811)).toBe("1,811 K (1,538 °C)");
    expect(formatKelvin(null)).toBe("—");
  });

  it("exports all elements with a standard-weight flag", () => {
    const csv = elementCsv(ELEMENTS);
    const rows = csv.split("\n");

    expect(rows).toHaveLength(119);
    expect(rows[0]).toContain("number,symbol,name,category,block,period,group");
    expect(rows.find((row) => row.startsWith("26,Fe,Iron"))).toContain(
      "Transition metal,d,4,8",
    );
    expect(rows.find((row) => row.startsWith("26,Fe,Iron"))).toContain(
      "55.84,1,1.83",
    );
    expect(rows.find((row) => row.startsWith("79,Au,Gold"))).toContain(
      ",196.96657,1,",
    );
  });
});

describe("PeriodicTable", () => {
  it("renders the grid, detail panel, and default selection", () => {
    render(<PeriodicTable />);

    expect(
      screen.getByRole("heading", { name: "Periodic table" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Iron, Fe, atomic number 26/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: "Iron", level: 4 }),
    ).toBeInTheDocument();
    expect(screen.getByText("55.84 u")).toBeInTheDocument();
    expect(screen.getByText("1.83 (Pauling)")).toBeInTheDocument();
    expect(screen.getByText(/group 8 · period 4/)).toBeInTheDocument();
  });

  it("selects an element and moves focus from search", async () => {
    const user = userEvent.setup();
    render(<PeriodicTable />);

    const input = screen.getByRole("searchbox", { name: "Find an element" });
    await user.type(input, "gold");

    expect(
      screen.getByRole("heading", { name: "Gold", level: 4 }),
    ).toBeInTheDocument();
    expect(screen.getByText("196.96657 u")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Gold, Au, atomic number 79/ }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("button", { name: /Gold, Au, atomic number 79/ }),
    ).toHaveFocus();
  });

  it("moves the selection from the keyboard", async () => {
    const user = userEvent.setup();
    render(<PeriodicTable />);

    const iron = screen.getByRole("button", {
      name: /Iron, Fe, atomic number 26/,
    });
    iron.focus();

    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("button", { name: /Cobalt, Co, atomic number 27/ }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("button", { name: /Rhodium, Rh, atomic number 45/ }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{Home}");
    expect(
      screen.getByRole("button", { name: /Rubidium, Rb, atomic number 37/ }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{End}");
    expect(
      screen.getByRole("button", { name: /Xenon, Xe, atomic number 54/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("switches trend properties", async () => {
    const user = userEvent.setup();
    render(<PeriodicTable />);

    expect(
      screen.getByText(/Electronegativity across period 4 ·/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "r" }));
    expect(
      screen.getByText(/Atomic radius \(pm\) across period 4 ·/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "IE₁" }));
    expect(
      screen.getByText(/First ionization energy \(eV\) across period 4 ·/),
    ).toBeInTheDocument();
  });

  it("opens the full element table and marks the selected row", async () => {
    const user = userEvent.setup();
    render(<PeriodicTable />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    expect(screen.getByText("Element table")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Gold")).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(119);
  });

  it("emits the CSV before downloading", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<PeriodicTable onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledOnce();
    expect(onExport.mock.calls[0][0].split("\n")).toHaveLength(119);
    expect(onExport.mock.calls[0][0]).toContain(
      "number,symbol,name,category,block",
    );
  });

  it("renders an empty state", () => {
    render(<PeriodicTable elements={[]} />);
    expect(screen.getByText("No elements loaded.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<PeriodicTable />);
    await expectNoViolations(container);
  });
});
