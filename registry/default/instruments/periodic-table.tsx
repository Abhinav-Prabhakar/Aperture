"use client";

import {
  AtomIcon,
  DownloadIcon,
  SearchIcon,
  Table2Icon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import {
  type ChemicalElement,
  ELEMENTS,
} from "@/registry/default/lib/periodic-table-data";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Label } from "@/registry/default/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export type PeriodicTableProps = Omit<
  React.ComponentProps<"section">,
  "children" | "onSelect"
> & {
  /** Override the bundled 118-element dataset. */
  elements?: readonly ChemicalElement[];
  /** Selected atomic number. Default 26 (iron). */
  defaultElement?: number;
  /** Called when the selection changes. */
  onElementSelect?: (element: ChemicalElement) => void;
  /** Called with the CSV before the browser download starts. */
  onExport?: (csv: string) => void;
  emptyLabel?: React.ReactNode;
};

export type ElementTrendProperty = {
  id: string;
  label: string;
  short: string;
  unit: string;
  get: (element: ChemicalElement) => number | null;
};

export const ELEMENT_TREND_PROPERTIES: readonly ElementTrendProperty[] = [
  {
    get: (element) => element.electronegativity,
    id: "electronegativity",
    label: "Electronegativity",
    short: "χ",
    unit: "",
  },
  {
    get: (element) => element.radiusPm,
    id: "radius",
    label: "Atomic radius",
    short: "r",
    unit: "pm",
  },
  {
    get: (element) => element.ionizationEv,
    id: "ionization",
    label: "First ionization energy",
    short: "IE₁",
    unit: "eV",
  },
];

const ROWS = 9;
const COLUMNS = 18;
const LANTHANIDE_ROW = 7;
const ACTINIDE_ROW = 8;
const F_BLOCK_START = 2;
const BLOCK_COLOR: Record<ChemicalElement["block"], string> = {
  d: "var(--color-chart-5)",
  f: "var(--color-chart-7)",
  p: "var(--color-chart-3)",
  s: "var(--color-chart-1)",
};
const NUMBER = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 6,
});
const MASS = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

function buildLayout(
  elements: readonly ChemicalElement[],
): (number | null)[][] {
  const layout: (number | null)[][] = Array.from({ length: ROWS }, () =>
    Array<number | null>(COLUMNS).fill(null),
  );

  for (const element of elements) {
    if (element.block === "f" || element.group === null) {
      continue;
    }
    const row = element.period - 1;
    if (row >= 0 && row < ROWS) {
      layout[row][element.group - 1] = element.number;
    }
  }

  const lanthanides = elements
    .filter((element) => element.block === "f" && element.period === 6)
    .sort((left, right) => left.number - right.number);
  const actinides = elements
    .filter((element) => element.block === "f" && element.period === 7)
    .sort((left, right) => left.number - right.number);

  for (const [index, element] of lanthanides.entries()) {
    if (F_BLOCK_START + index < COLUMNS) {
      layout[LANTHANIDE_ROW][F_BLOCK_START + index] = element.number;
    }
  }
  for (const [index, element] of actinides.entries()) {
    if (F_BLOCK_START + index < COLUMNS) {
      layout[ACTINIDE_ROW][F_BLOCK_START + index] = element.number;
    }
  }

  return layout;
}

export const PERIODIC_LAYOUT = buildLayout(ELEMENTS);

function positionOf(
  layout: readonly (readonly (number | null)[])[],
  atomicNumber: number,
): { row: number; column: number } | null {
  for (const [row, cells] of layout.entries()) {
    const column = cells.indexOf(atomicNumber);
    if (column !== -1) {
      return { column, row };
    }
  }
  return null;
}

export function findElementNeighbor(
  layout: readonly (readonly (number | null)[])[],
  atomicNumber: number,
  direction: "left" | "right" | "up" | "down" | "home" | "end",
): number {
  const position = positionOf(layout, atomicNumber);
  if (!position) {
    return atomicNumber;
  }
  if (direction === "home" || direction === "end") {
    const row = layout[position.row];
    const columns =
      direction === "home"
        ? row.map((_, index) => index)
        : row.map((_, index) => index).reverse();
    for (const column of columns) {
      if (row[column] !== null) {
        return row[column] as number;
      }
    }
    return atomicNumber;
  }

  const step =
    direction === "left"
      ? { column: -1, row: 0 }
      : direction === "right"
        ? { column: 1, row: 0 }
        : direction === "up"
          ? { column: 0, row: -1 }
          : { column: 0, row: 1 };
  let row = position.row + step.row;
  let column = position.column + step.column;
  while (row >= 0 && row < layout.length && column >= 0 && column < COLUMNS) {
    const next = layout[row][column];
    if (next !== null) {
      return next;
    }
    row += step.row;
    column += step.column;
  }
  return atomicNumber;
}

export function searchElements(
  elements: readonly ChemicalElement[],
  query: string,
): ChemicalElement[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return elements
    .filter((element) => {
      return (
        element.name.toLowerCase().includes(needle) ||
        element.symbol.toLowerCase() === needle ||
        element.symbol.toLowerCase().startsWith(needle) ||
        String(element.number) === needle ||
        element.category.toLowerCase().includes(needle) ||
        `${element.block}-block`.includes(needle)
      );
    })
    .sort((left, right) => {
      const leftExact =
        left.symbol.toLowerCase() === needle || String(left.number) === needle
          ? 0
          : 1;
      const rightExact =
        right.symbol.toLowerCase() === needle || String(right.number) === needle
          ? 0
          : 1;
      return leftExact - rightExact || left.number - right.number;
    });
}

export function formatAtomicMass(element: ChemicalElement): string {
  return `${MASS.format(element.mass)}${element.standardWeight ? "" : " *"}`;
}

export function formatDensity(element: ChemicalElement): string {
  if (element.density === null || element.densityUnit === null) {
    return "—";
  }
  return `${NUMBER.format(element.density)} ${element.densityUnit}`;
}

export function formatKelvin(value: number | null): string {
  if (value === null) {
    return "—";
  }
  const celsius = value - 273.15;
  const rounded =
    Math.abs(celsius) >= 100
      ? Math.round(celsius)
      : Math.round(celsius * 10) / 10;
  return `${NUMBER.format(value)} K (${NUMBER.format(rounded)} °C)`;
}

function csvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function elementCsv(elements: readonly ChemicalElement[]): string {
  const header = [
    "number",
    "symbol",
    "name",
    "category",
    "block",
    "period",
    "group",
    "atomic_mass_u",
    "standard_weight",
    "electronegativity_pauling",
    "atomic_radius_pm",
    "ionization_energy_ev",
    "electron_affinity_ev",
    "oxidation_states",
    "standard_state",
    "melting_point_k",
    "boiling_point_k",
    "density",
    "density_unit",
    "year_discovered",
  ];
  const rows = [...elements]
    .sort((left, right) => left.number - right.number)
    .map((element) => [
      element.number,
      element.symbol,
      element.name,
      element.category,
      element.block,
      element.period,
      element.group,
      element.mass,
      element.standardWeight ? 1 : 0,
      element.electronegativity,
      element.radiusPm,
      element.ionizationEv,
      element.affinityEv,
      element.oxidation,
      element.standardState || null,
      element.meltK,
      element.boilK,
      element.density,
      element.densityUnit,
      element.discovered,
    ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function rowLabel(row: number): string {
  if (row === LANTHANIDE_ROW) {
    return "lanthanides";
  }
  if (row === ACTINIDE_ROW) {
    return "actinides";
  }
  return `period ${row + 1}`;
}

function TrendChart({
  elements,
  layout,
  property,
  selected,
}: {
  elements: readonly ChemicalElement[];
  layout: readonly (readonly (number | null)[])[];
  property: ElementTrendProperty;
  selected: ChemicalElement;
}): React.ReactElement {
  const position = positionOf(layout, selected.number);
  const row = position?.row ?? 0;
  const cells = layout[row] ?? [];
  const byNumber = new Map(
    elements.map((element) => [element.number, element]),
  );
  const series = cells
    .map((number, column) => {
      if (number === null) {
        return null;
      }
      const element = byNumber.get(number);
      if (!element) {
        return null;
      }
      const value = property.get(element);
      return value === null
        ? null
        : {
            column,
            number: element.number,
            symbol: element.symbol,
            value,
          };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const columns = series.map((item) => item.column);
  const minColumn = columns.length > 0 ? Math.min(...columns) : 0;
  const maxColumn = columns.length > 0 ? Math.max(...columns) : COLUMNS - 1;
  const width = 236;
  const height = 58;
  const pad = 7;
  const values = series.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue;
  const x = (column: number) =>
    span === 0 && maxColumn === minColumn
      ? width / 2
      : pad +
        ((column - minColumn) / Math.max(1, maxColumn - minColumn)) *
          (width - pad * 2);
  const y = (value: number) =>
    span === 0
      ? height / 2
      : height - pad - ((value - minValue) / span) * (height - pad * 2);

  const summary = `${property.label} across ${rowLabel(row)}: ${
    series.length === 0
      ? "no values"
      : series
          .map((item) => `${item.symbol} ${NUMBER.format(item.value)}`)
          .join(", ")
  }. ${series.length} of ${cells.filter((value) => value !== null).length} elements have a value.`;

  if (series.length < 2) {
    return (
      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        Not enough values in {rowLabel(row)} to draw a trend.
      </p>
    );
  }

  let drawing = false;
  let path = "";
  for (const item of series) {
    const point = `${x(item.column).toFixed(2)} ${y(item.value).toFixed(2)}`;
    path += drawing ? ` L ${point}` : ` M ${point}`;
    drawing = true;
  }

  return (
    <div className="mt-1.5">
      <svg
        aria-label={summary}
        className="block h-auto w-full text-foreground"
        data-slot="element-trend"
        height={height}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <title>{summary}</title>
        <line
          stroke="var(--color-border)"
          x1={pad}
          x2={width - pad}
          y1={height - pad}
          y2={height - pad}
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-chart-5)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
        {series.map((item) => (
          <circle
            cx={x(item.column)}
            cy={y(item.value)}
            fill={
              item.number === selected.number
                ? "var(--color-foreground)"
                : "var(--color-muted-foreground)"
            }
            key={item.number}
            r={item.number === selected.number ? 3 : 1.8}
            stroke="var(--color-background)"
            strokeWidth={1}
          />
        ))}
        <text
          fill="var(--color-muted-foreground)"
          fontFamily="var(--font-mono)"
          fontSize={8}
          x={pad}
          y={height - 1}
        >
          {NUMBER.format(minValue)}
        </text>
        <text
          fill="var(--color-muted-foreground)"
          fontFamily="var(--font-mono)"
          fontSize={8}
          textAnchor="end"
          x={width - pad}
          y={height - 1}
        >
          {NUMBER.format(maxValue)}
        </text>
      </svg>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {property.label}
        {property.unit ? ` (${property.unit})` : ""} across {rowLabel(row)} ·{" "}
        {series.length} of {cells.filter((value) => value !== null).length}{" "}
        values
      </p>
    </div>
  );
}

export function PeriodicTable({
  elements = ELEMENTS,
  defaultElement = 26,
  onElementSelect,
  onExport,
  emptyLabel = "No elements loaded.",
  className,
  ...props
}: PeriodicTableProps): React.ReactElement {
  const baseId = React.useId().replaceAll(":", "");
  const titleId = `periodic-title-${baseId}`;
  const summaryId = `periodic-summary-${baseId}`;
  const tableId = `periodic-table-${baseId}`;
  const inputId = `periodic-search-${baseId}`;
  const resultsId = `periodic-results-${baseId}`;
  const [query, setQuery] = React.useState("");
  const [selectedNumber, setSelectedNumber] = React.useState(() => {
    return elements.some((element) => element.number === defaultElement)
      ? defaultElement
      : (elements[0]?.number ?? 1);
  });
  const [tableOpen, setTableOpen] = React.useState(false);
  const [trendId, setTrendId] = React.useState("electronegativity");
  const layout = React.useMemo(() => buildLayout(elements), [elements]);
  const byNumber = React.useMemo(
    () => new Map(elements.map((element) => [element.number, element])),
    [elements],
  );
  const selected = byNumber.get(selectedNumber) ?? elements[0] ?? null;
  const matches = React.useMemo(
    () => searchElements(elements, query),
    [elements, query],
  );
  const matchSet = React.useMemo(
    () => new Set(matches.map((element) => element.number)),
    [matches],
  );
  const trend =
    ELEMENT_TREND_PROPERTIES.find((property) => property.id === trendId) ??
    ELEMENT_TREND_PROPERTIES[0];

  React.useEffect(() => {
    if (elements.length > 0 && !byNumber.has(selectedNumber)) {
      setSelectedNumber(elements[0].number);
    }
  }, [byNumber, elements, selectedNumber]);

  if (!selected) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
        data-slot="periodic-table"
        {...props}
      >
        <div className="grid justify-items-center gap-2 px-6 py-16 text-center">
          <AtomIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="font-medium text-sm">{emptyLabel}</p>
          <p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
            Pass an array of elements with an atomic number, symbol, name, and
            category. The bundled dataset covers all 118 elements.
          </p>
        </div>
      </section>
    );
  }

  const cellId = (number: number) => `element-${baseId}-${number}`;

  function select(number: number, focus = false): void {
    setSelectedNumber(number);
    const element = byNumber.get(number);
    if (element) {
      onElementSelect?.(element);
    }
    if (focus) {
      document.getElementById(cellId(number))?.focus();
    }
  }

  function handleSearch(value: string): void {
    setQuery(value);
    const next = searchElements(elements, value);
    if (
      next.length > 0 &&
      !next.some((element) => element.number === selectedNumber)
    ) {
      setSelectedNumber(next[0].number);
    }
  }

  function handleTrend(id: string): void {
    setTrendId(id);
  }

  function handleExport(): void {
    const csv = elementCsv(elements);
    onExport?.(csv);
    if (
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = "periodic-table.csv";
    anchor.href = href;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }

  const summaryText = `${selected.name}, symbol ${selected.symbol}, atomic number ${selected.number}. ${selected.category}, ${selected.block}-block, ${rowLabel(
    positionOf(layout, selected.number)?.row ?? 0,
  )}. Atomic weight ${formatAtomicMass(selected)} unified atomic mass units. ${
    selected.electronegativity === null
      ? "No Pauling electronegativity is listed."
      : `Pauling electronegativity ${selected.electronegativity}.`
  } ${
    selected.standardWeight
      ? ""
      : "The mass is a representative isotope mass; this element has no standard atomic weight."
  } Use the arrow keys to move through the table, or search by name, symbol, or atomic number.`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="periodic-table"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">
              118 elements · 7 periods · 18 groups · 2 f-block series
            </span>
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            Periodic table
          </h3>
          <p className="max-w-prose text-muted-foreground text-xs leading-relaxed">
            Select an element to inspect its atomic data, oxidation states, and
            a period or series trend. Color marks the block, not the chemical
            family.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span dir="ltr">
              {selected.symbol} · {selected.name} · {selected.number}
            </span>
            <span dir="ltr">{selected.category}</span>
            <span dir="ltr">{selected.block}-block</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            aria-controls={tableId}
            aria-expanded={tableOpen}
            onClick={() => setTableOpen((current) => !current)}
            size="sm"
            type="button"
            variant={tableOpen ? "secondary" : "outline"}
          >
            <Table2Icon />
            Table
          </Button>
          <Button
            className="print:hidden"
            onClick={handleExport}
            size="sm"
            type="button"
            variant="outline"
          >
            <DownloadIcon />
            Export CSV
          </Button>
        </div>
      </header>

      <p className="sr-only" id={summaryId}>
        {summaryText}
      </p>

      <div className="grid @4xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 border-b @4xl:border-e @4xl:border-b-0">
          <div className="border-b bg-muted/24 px-3 py-2 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <form
                className="min-w-48 flex-1 sm:max-w-72"
                onSubmit={(event) => {
                  event.preventDefault();
                  const first = matches[0];
                  if (first) {
                    select(first.number, true);
                  }
                }}
                role="search"
              >
                <Label className="sr-only" htmlFor={inputId}>
                  Find an element
                </Label>
                <div className="relative">
                  <SearchIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    aria-controls={query ? resultsId : undefined}
                    autoComplete="off"
                    className="ps-7"
                    id={inputId}
                    onChange={(event) => handleSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setQuery("");
                      }
                    }}
                    placeholder="Name, symbol, or number"
                    size="sm"
                    spellCheck={false}
                    type="search"
                    value={query}
                  />
                </div>
              </form>
              <span
                aria-live="polite"
                className="font-mono text-[10px] text-muted-foreground tabular-nums"
                role="status"
              >
                {query
                  ? `${matches.length} match${matches.length === 1 ? "" : "es"}`
                  : `${elements.length} elements`}
              </span>
              {query ? (
                <Button
                  onClick={() => setQuery("")}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <XIcon />
                  Clear
                </Button>
              ) : null}
            </div>

            {query && matches.length > 0 ? (
              <ul
                aria-label="Element search results"
                className="mt-2 flex flex-wrap gap-1"
                id={resultsId}
              >
                {matches.slice(0, 8).map((element) => (
                  <li key={element.number}>
                    <Button
                      aria-pressed={element.number === selected.number}
                      onClick={() => select(element.number, true)}
                      size="xs"
                      type="button"
                      variant={
                        element.number === selected.number
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {element.symbol} · {element.name}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            {query && matches.length === 0 ? (
              <p className="mt-2 text-[10px] text-muted-foreground">
                No element matches “{query}”.
              </p>
            ) : null}
          </div>

          <div
            aria-label="Periodic table scroll area"
            className="overflow-x-auto p-3"
            role="region"
          >
            <div className="min-w-[36rem]" dir="ltr">
              <div
                aria-label="Periodic table"
                className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1"
                role="group"
              >
                {layout.flatMap((row, rowIndex) =>
                  row.map((number, columnIndex) => {
                    if (number === null) {
                      return (
                        <span
                          aria-hidden="true"
                          className="aspect-square"
                          key={`gap-${rowIndex}-${columnIndex}`}
                        />
                      );
                    }
                    const element = byNumber.get(number);
                    if (!element) {
                      return (
                        <span
                          aria-hidden="true"
                          className="aspect-square"
                          key={`missing-${rowIndex}-${columnIndex}`}
                        />
                      );
                    }
                    const isSelected = number === selected.number;
                    const dimmed = query.length > 0 && !matchSet.has(number);
                    const color = BLOCK_COLOR[element.block];
                    return (
                      <button
                        aria-label={`${element.name}, ${element.symbol}, atomic number ${element.number}, ${element.category}, ${element.block}-block`}
                        aria-pressed={isSelected}
                        className={cn(
                          "relative flex aspect-square min-w-0 flex-col items-center justify-start rounded-[4px] border px-0.5 pt-0.5 pb-0.5 text-center leading-none outline-none transition-[opacity,background-color,border-color] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "text-foreground hover:border-foreground/40",
                          dimmed && "opacity-30",
                        )}
                        id={cellId(number)}
                        key={element.number}
                        onClick={() => select(element.number)}
                        onKeyDown={(event) => {
                          if (
                            ![
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                              "Home",
                              "End",
                            ].includes(event.key)
                          ) {
                            return;
                          }
                          event.preventDefault();
                          const direction =
                            event.key === "ArrowLeft"
                              ? "left"
                              : event.key === "ArrowRight"
                                ? "right"
                                : event.key === "ArrowUp"
                                  ? "up"
                                  : event.key === "ArrowDown"
                                    ? "down"
                                    : event.key === "Home"
                                      ? "home"
                                      : "end";
                          select(
                            findElementNeighbor(layout, number, direction),
                            true,
                          );
                        }}
                        style={
                          isSelected
                            ? undefined
                            : {
                                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                                borderColor: `color-mix(in srgb, ${color} 34%, transparent)`,
                              }
                        }
                        tabIndex={isSelected ? 0 : -1}
                        title={`${element.name} · ${element.category}`}
                        type="button"
                      >
                        <span className="font-mono text-[8px] text-current opacity-70 tabular-nums">
                          {element.number}
                        </span>
                        <span className="font-heading font-semibold text-[13px]">
                          {element.symbol}
                        </span>
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-3 py-2 text-[10px] text-muted-foreground">
            <span>Block</span>
            {(["s", "p", "d", "f"] as const).map((block) => (
              <span className="inline-flex items-center gap-1.5" key={block}>
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-[2px] border"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${BLOCK_COLOR[block]} 16%, transparent)`,
                    borderColor: `color-mix(in srgb, ${BLOCK_COLOR[block]} 40%, transparent)`,
                  }}
                />
                {block}-block
              </span>
            ))}
            <span className="text-muted-foreground/80">
              f-block strips: 4f La–Lu, 5f Ac–Lr
            </span>
          </div>
        </div>

        <div className="grid content-start gap-3 p-3">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              <span dir="ltr">
                {selected.number} · {selected.block}-block ·{" "}
                {selected.group === null
                  ? "f-block series"
                  : `group ${selected.group}`}{" "}
                · period {selected.period}
              </span>
            </p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-bold text-4xl leading-none tracking-tight">
                  {selected.symbol}
                </span>
                <div className="min-w-0">
                  <h4 className="font-heading font-semibold text-lg leading-tight tracking-tight">
                    {selected.name}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {selected.category}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {selected.standardState || "—"}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
              <dt className="text-muted-foreground">Atomic weight</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {formatAtomicMass(selected)} u
              </dd>
              <dt className="text-muted-foreground">Electron config.</dt>
              <dd className="break-all font-mono text-[10px]" dir="ltr">
                {selected.electronConfiguration}
              </dd>
              <dt className="text-muted-foreground">Electronegativity</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.electronegativity === null
                  ? "—"
                  : `${selected.electronegativity} (Pauling)`}
              </dd>
              <dt className="text-muted-foreground">Atomic radius</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.radiusPm === null ? "—" : `${selected.radiusPm} pm`}
              </dd>
              <dt className="text-muted-foreground">Ionization</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.ionizationEv === null
                  ? "—"
                  : `${selected.ionizationEv} eV`}
              </dd>
              <dt className="text-muted-foreground">Electron affinity</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.affinityEv === null
                  ? "—"
                  : `${selected.affinityEv} eV`}
              </dd>
              <dt className="text-muted-foreground">Oxidation states</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.oxidation ?? "—"}
              </dd>
              <dt className="text-muted-foreground">Melting point</dt>
              <dd className="font-mono text-[10px] tabular-nums" dir="ltr">
                {formatKelvin(selected.meltK)}
              </dd>
              <dt className="text-muted-foreground">Boiling point</dt>
              <dd className="font-mono text-[10px] tabular-nums" dir="ltr">
                {formatKelvin(selected.boilK)}
              </dd>
              <dt className="text-muted-foreground">Density</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {formatDensity(selected)}
              </dd>
              <dt className="text-muted-foreground">Discovered</dt>
              <dd className="font-mono tabular-nums" dir="ltr">
                {selected.discovered ?? "—"}
              </dd>
            </dl>

            {!selected.standardWeight ? (
              <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                * No standard atomic weight. The mass is a representative
                isotope mass from PubChem, not an IUPAC standard value.
              </p>
            ) : null}
          </div>

          <div className="border-t pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-medium text-xs">Trend</h4>
              <div
                aria-label="Trend property"
                className="flex items-center gap-0.5 rounded-lg border p-0.5"
                role="group"
              >
                {ELEMENT_TREND_PROPERTIES.map((property) => (
                  <Button
                    aria-pressed={trend.id === property.id}
                    className="rounded-md"
                    key={property.id}
                    onClick={() => handleTrend(property.id)}
                    size="xs"
                    type="button"
                    variant={trend.id === property.id ? "secondary" : "ghost"}
                  >
                    {property.short}
                  </Button>
                ))}
              </div>
            </div>
            <TrendChart
              elements={elements}
              layout={layout}
              property={trend}
              selected={selected}
            />
          </div>

          <p className="border-t pt-3 text-[9px] text-muted-foreground leading-relaxed">
            Reference data from PubChem via periodic-table-data (MIT). Values
            are for orientation; verify against IUPAC/CIAAW and NIST before
            publication.
          </p>
        </div>
      </div>

      <div
        className={cn("border-t", tableOpen ? "block" : "hidden print:block")}
        id={tableId}
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/24 px-3 py-2">
          <h4 className="font-medium text-xs">Element table</h4>
          <span className="font-mono text-[10px] text-muted-foreground">
            {elements.length} rows
          </span>
        </div>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-[10px]">No.</TableHead>
                <TableHead className="h-8 text-[10px]">Symbol</TableHead>
                <TableHead className="h-8 text-[10px]">Name</TableHead>
                <TableHead className="h-8 text-[10px]">Category</TableHead>
                <TableHead className="h-8 text-[10px]">Block</TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Mass (u)
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">χ</TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Melt (K)
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Boil (K)
                </TableHead>
                <TableHead className="h-8 text-end text-[10px]">
                  Density
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...elements]
                .sort((left, right) => left.number - right.number)
                .map((element) => (
                  <TableRow key={element.number}>
                    <TableCell className="py-1 font-mono text-[10px] tabular-nums">
                      {element.number}
                    </TableCell>
                    <TableCell className="py-1 font-mono text-[10px]">
                      {element.symbol}
                    </TableCell>
                    <TableCell className="py-1 text-[10px]">
                      {element.name}
                    </TableCell>
                    <TableCell className="py-1 text-[10px] text-muted-foreground">
                      {element.category}
                    </TableCell>
                    <TableCell className="py-1 font-mono text-[10px]">
                      {element.block}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatAtomicMass(element)}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {element.electronegativity ?? "—"}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {element.meltK ?? "—"}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {element.boilK ?? "—"}
                    </TableCell>
                    <TableCell
                      className="py-1 text-end font-mono text-[10px] tabular-nums"
                      dir="ltr"
                    >
                      {formatDensity(element)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
