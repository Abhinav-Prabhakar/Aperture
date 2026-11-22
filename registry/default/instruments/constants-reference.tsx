"use client";

import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  SearchIcon,
  SigmaIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import {
  CODATA_CONSTANTS,
  type PhysicalConstant,
} from "@/registry/default/lib/codata-constants";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Label } from "@/registry/default/ui/label";

export type ConstantsFilter = "featured" | "si" | "all";

export type ConstantsReferenceProps = Omit<
  React.ComponentProps<"section">,
  "children" | "onSelect"
> & {
  /** Override the bundled CODATA 2022 dataset. */
  constants?: readonly PhysicalConstant[];
  /** Default "featured". */
  defaultFilter?: ConstantsFilter;
  /** Selected constant id. Defaults to the first constant in the filter. */
  defaultConstantId?: string;
  /** Called when the selection changes. */
  onConstantSelect?: (constant: PhysicalConstant) => void;
  /** Called with the CSV before the browser download starts. */
  onExport?: (csv: string) => void;
  emptyLabel?: React.ReactNode;
};

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function superscriptNumber(value: number): string {
  return String(value)
    .split("")
    .map((character) => SUPERSCRIPT[character] ?? character)
    .join("");
}

function splitExponent(value: string): {
  coefficient: string;
  exponent: number | null;
} {
  const match = /^(.*?)\s+e([+-]?\d+)$/.exec(value);
  if (!match) {
    return { coefficient: value, exponent: null };
  }
  return { coefficient: match[1], exponent: Number(match[2]) };
}

/** Turn NIST's space-grouped `e` notation into a typeset power of ten. */
export function formatConstantValue(value: string): string {
  const { coefficient, exponent } = splitExponent(value);
  return exponent === null
    ? coefficient
    : `${coefficient} × 10${superscriptNumber(exponent)}`;
}

/** Expand NIST unit shorthands such as `m^3 kg^-1 s^-2` and `ohm`. */
export function formatConstantUnit(unit: string): string {
  if (unit.length === 0) {
    return "dimensionless";
  }
  return unit
    .replace(/\bohm\b/g, "Ω")
    .replace(/\^(-?\d+)/g, (_, exponent: string) =>
      superscriptNumber(Number(exponent)),
    );
}

/** Machine-readable value: group separators removed, NIST style retained. */
export function constantPlainValue(value: string): string {
  return value.replaceAll(" ", "");
}

export function formatConstantUncertainty(constant: PhysicalConstant): string {
  if (constant.exact || constant.uncertainty === null) {
    return "Exact";
  }
  return `± ${formatConstantValue(constant.uncertainty)}`;
}

export function filterConstants(
  constants: readonly PhysicalConstant[],
  filter: ConstantsFilter,
): PhysicalConstant[] {
  if (filter === "featured") {
    return constants.filter((constant) => constant.featured);
  }
  if (filter === "si") {
    return constants.filter((constant) => constant.siDefining);
  }
  return [...constants];
}

export function searchConstants(
  constants: readonly PhysicalConstant[],
  query: string,
): PhysicalConstant[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...constants];
  }
  return constants.filter((constant) => {
    return (
      constant.name.toLowerCase().includes(needle) ||
      (constant.symbol ?? "").toLowerCase().includes(needle) ||
      constant.id.includes(needle.replaceAll(" ", "-")) ||
      constant.unit.toLowerCase().includes(needle) ||
      constant.value.includes(needle) ||
      constantPlainValue(constant.value).includes(needle.replaceAll(" ", ""))
    );
  });
}

function csvCell(value: string | number | boolean | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function constantCsv(constants: readonly PhysicalConstant[]): string {
  const header = [
    "id",
    "name",
    "symbol",
    "value",
    "uncertainty",
    "unit",
    "exact",
    "featured",
    "si_defining",
  ];
  const rows = constants.map((constant) => [
    constant.id,
    constant.name,
    constant.symbol,
    constant.value,
    constant.uncertainty,
    constant.unit,
    constant.exact ? 1 : 0,
    constant.featured ? 1 : 0,
    constant.siDefining ? 1 : 0,
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "strong";
}): React.ReactElement {
  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
        tone === "strong"
          ? "border-foreground/30 bg-foreground text-background"
          : "text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function ConstantsReference({
  constants = CODATA_CONSTANTS,
  defaultFilter = "featured",
  defaultConstantId,
  onConstantSelect,
  onExport,
  emptyLabel = "No constants loaded.",
  className,
  ...props
}: ConstantsReferenceProps): React.ReactElement {
  const baseId = React.useId().replaceAll(":", "");
  const titleId = `constants-title-${baseId}`;
  const summaryId = `constants-summary-${baseId}`;
  const inputId = `constants-search-${baseId}`;
  const [filter, setFilter] = React.useState<ConstantsFilter>(() => {
    const requested = constants.find(
      (constant) => constant.id === defaultConstantId,
    );
    if (
      requested &&
      !filterConstants(constants, defaultFilter).some(
        (constant) => constant.id === requested.id,
      )
    ) {
      return "all";
    }
    return defaultFilter;
  });
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(() => {
    return (
      constants.find((constant) => constant.id === defaultConstantId)?.id ??
      filterConstants(constants, defaultFilter)[0]?.id ??
      constants[0]?.id ??
      ""
    );
  });
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const valueCopy = useCopyToClipboard();
  const pairCopy = useCopyToClipboard();

  const counts = React.useMemo(
    () => ({
      all: constants.length,
      featured: constants.filter((constant) => constant.featured).length,
      si: constants.filter((constant) => constant.siDefining).length,
    }),
    [constants],
  );

  const visible = React.useMemo(() => {
    return searchConstants(filterConstants(constants, filter), query);
  }, [constants, filter, query]);

  const selected =
    constants.find((constant) => constant.id === selectedId) ??
    visible[0] ??
    constants[0] ??
    null;

  React.useEffect(() => {
    if (
      visible.length > 0 &&
      !visible.some((constant) => constant.id === selectedId)
    ) {
      setSelectedId(visible[0].id);
    }
  }, [selectedId, visible]);

  React.useEffect(() => {
    const container = listRef.current;
    const item = container?.querySelector<HTMLElement>(
      `[data-constant-id="${selectedId}"]`,
    );
    if (!container || !item) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - itemRect.top;
    } else if (itemRect.bottom > containerRect.bottom) {
      container.scrollTop += itemRect.bottom - containerRect.bottom;
    }
  }, [selectedId]);

  const filters: Array<{
    id: ConstantsFilter;
    label: string;
    count: number;
  }> = [
    { count: counts.featured, id: "featured", label: "Featured" },
    { count: counts.si, id: "si", label: "SI defining" },
    { count: counts.all, id: "all", label: "All" },
  ];

  if (!selected) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
        data-slot="constants-reference"
        {...props}
      >
        <div className="grid justify-items-center gap-2 px-6 py-16 text-center">
          <SigmaIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="font-medium text-sm">{emptyLabel}</p>
          <p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
            Pass constants with a name, value, uncertainty, unit, and exact
            flag. The bundled dataset is the CODATA 2022 recommended values.
          </p>
        </div>
      </section>
    );
  }

  const listItemId = (constant: PhysicalConstant) =>
    `constant-${baseId}-${constant.id}`;

  function select(constant: PhysicalConstant, focus = false): void {
    setSelectedId(constant.id);
    onConstantSelect?.(constant);
    if (focus) {
      const element = document.getElementById(listItemId(constant));
      if (typeof element?.scrollIntoView === "function") {
        element.scrollIntoView({ block: "nearest" });
      }
      element?.focus();
    }
  }

  function moveSelection(key: string): void {
    const index = visible.findIndex((constant) => constant.id === selected?.id);
    if (index === -1) {
      return;
    }
    let next = index;
    if (key === "ArrowDown") {
      next = Math.min(visible.length - 1, index + 1);
    } else if (key === "ArrowUp") {
      next = Math.max(0, index - 1);
    } else if (key === "Home") {
      next = 0;
    } else if (key === "End") {
      next = visible.length - 1;
    } else {
      return;
    }
    select(visible[next], true);
  }

  function handleExport(): void {
    const csv = constantCsv(visible);
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
    anchor.download = "codata-2022-constants.csv";
    anchor.href = href;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }

  const unit = formatConstantUnit(selected.unit);
  const displayValue = formatConstantValue(selected.value);
  const displayUncertainty =
    selected.uncertainty === null
      ? null
      : formatConstantValue(selected.uncertainty);
  const truncated = selected.value.includes("...");
  const currentFilterLabel =
    filters.find((item) => item.id === filter)?.label ?? "All";
  const summaryText = `${selected.name}. ${
    selected.symbol ? `Symbol ${selected.symbol}. ` : ""
  }Value ${displayValue} ${unit}. ${
    selected.exact
      ? "Exact, with no uncertainty."
      : `Standard uncertainty ${displayUncertainty} ${unit}.`
  }${selected.siDefining ? " One of the seven defining constants of the SI." : ""}${
    selected.featured ? " Featured constant." : ""
  } ${visible.length} constants shown in the ${currentFilterLabel} filter.${
    query ? ` Search query: ${query}.` : ""
  } Use the up and down arrow keys to move through the list.`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="constants-reference"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">CODATA 2022 · NIST</span>
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            Fundamental constants
          </h3>
          <p className="max-w-prose text-muted-foreground text-xs leading-relaxed">
            CODATA recommended values, with one-standard-deviation
            uncertainties. Exact constants are marked. Search the full listing
            or start from the curated set.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span dir="ltr">{counts.all} constants</span>
            <span dir="ltr">{counts.featured} featured</span>
            <span dir="ltr">{counts.si} SI defining</span>
            <span dir="ltr">
              {constants.filter((constant) => constant.exact).length} exact
            </span>
          </div>
        </div>
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
      </header>

      <p className="sr-only" id={summaryId}>
        {summaryText}
      </p>

      <div className="grid @4xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 border-b @4xl:border-e @4xl:border-b-0">
          <div className="grid gap-2 border-b bg-muted/24 px-3 py-2 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-48 flex-1 sm:max-w-80">
                <Label className="sr-only" htmlFor={inputId}>
                  Search constants
                </Label>
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  autoComplete="off"
                  className="ps-7"
                  id={inputId}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setQuery("");
                    }
                  }}
                  placeholder="Name, symbol, value, or unit"
                  size="sm"
                  spellCheck={false}
                  type="search"
                  value={query}
                />
              </div>
              <span
                aria-live="polite"
                className="font-mono text-[10px] text-muted-foreground tabular-nums"
                role="status"
              >
                {visible.length} shown
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

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                aria-label="Constant set"
                className="flex flex-wrap items-center gap-0.5 rounded-lg border p-0.5"
                role="group"
              >
                {filters.map((item) => (
                  <Button
                    aria-pressed={filter === item.id}
                    className="rounded-md"
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    size="xs"
                    type="button"
                    variant={filter === item.id ? "secondary" : "ghost"}
                  >
                    {item.label}
                    <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                      {item.count}
                    </span>
                  </Button>
                ))}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {currentFilterLabel}
              </span>
            </div>
          </div>

          <div
            aria-label={`${currentFilterLabel} constants`}
            className="max-h-96 overflow-auto p-1.5"
            ref={listRef}
            role="region"
          >
            {visible.length === 0 ? (
              <div className="grid justify-items-center gap-2 px-4 py-12 text-center">
                <p className="font-medium text-xs">
                  No constant matches “{query}”.
                </p>
                <Button
                  onClick={() => setQuery("")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <ul aria-label="Constants" className="grid gap-0.5">
                {visible.map((constant) => {
                  const isSelected = constant.id === selected.id;
                  return (
                    <li key={constant.id}>
                      <button
                        aria-pressed={isSelected}
                        className={cn(
                          "grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-border bg-secondary"
                            : "hover:bg-muted/64",
                        )}
                        data-constant-id={constant.id}
                        id={listItemId(constant)}
                        onClick={() => select(constant)}
                        onKeyDown={(event) => {
                          if (
                            ["ArrowDown", "ArrowUp", "Home", "End"].includes(
                              event.key,
                            )
                          ) {
                            event.preventDefault();
                            moveSelection(event.key);
                          }
                        }}
                        tabIndex={isSelected ? 0 : -1}
                        title={`${constant.name} · ${formatConstantValue(
                          constant.value,
                        )} ${formatConstantUnit(constant.unit)}`}
                        type="button"
                      >
                        <span className="truncate font-heading font-semibold text-sm">
                          {constant.symbol ?? "·"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11px]">
                            {constant.name}
                          </span>
                          <span
                            className="block truncate font-mono text-[9px] text-muted-foreground tabular-nums"
                            dir="ltr"
                          >
                            {formatConstantValue(constant.value)}{" "}
                            {formatConstantUnit(constant.unit)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          {constant.siDefining ? (
                            <Badge tone="strong">SI</Badge>
                          ) : constant.exact ? (
                            <Badge>exact</Badge>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div
          aria-label="Constant detail"
          aria-live="polite"
          className="grid content-start gap-3 p-3"
          data-slot="constant-detail"
          role="region"
        >
          <div>
            <p className="break-all font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              {selected.id}
            </p>
            <div className="mt-1 flex items-start gap-3">
              {selected.symbol ? (
                <span className="shrink-0 font-heading font-bold text-4xl leading-none tracking-tight">
                  {selected.symbol}
                </span>
              ) : null}
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-lg leading-tight tracking-tight">
                  {selected.name}
                </h4>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  CODATA 2022 recommended value
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {selected.exact ? <Badge tone="strong">Exact</Badge> : null}
              {selected.siDefining ? (
                <Badge tone="strong">SI defining</Badge>
              ) : null}
              {selected.featured ? <Badge>Featured</Badge> : null}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/24 p-3">
            <p
              className="break-words font-mono font-medium text-lg leading-snug tabular-nums"
              dir="ltr"
            >
              {displayValue}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">{unit}</p>
            <p
              className="mt-1.5 font-mono text-[11px] text-muted-foreground tabular-nums"
              dir="ltr"
            >
              {selected.exact
                ? "Exact — no uncertainty"
                : `${formatConstantUncertainty(selected)} ${unit}`}
            </p>
          </div>

          {truncated ? (
            <p className="flex items-start gap-1.5 text-[10px] text-warning-foreground leading-relaxed">
              <TriangleAlertIcon
                aria-hidden="true"
                className="mt-0.5 size-3 shrink-0"
              />
              NIST abbreviates this decimal in the complete listing. The full
              expansion is in the CODATA 2022 report.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5 print:hidden">
            <Button
              onClick={() =>
                valueCopy.copyToClipboard(constantPlainValue(selected.value))
              }
              size="xs"
              type="button"
              variant="outline"
            >
              {valueCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
              {valueCopy.isCopied ? "Copied" : "Copy value"}
            </Button>
            <Button
              onClick={() => {
                const pair =
                  selected.exact || selected.uncertainty === null
                    ? `${constantPlainValue(selected.value)} ${selected.unit} (exact)`
                    : `${constantPlainValue(selected.value)} ± ${constantPlainValue(
                        selected.uncertainty,
                      )} ${selected.unit}`;
                pairCopy.copyToClipboard(pair.trim());
              }}
              size="xs"
              type="button"
              variant="outline"
            >
              {pairCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
              {pairCopy.isCopied ? "Copied" : "Copy ±"}
            </Button>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t pt-3 text-[11px]">
            <dt className="text-muted-foreground">Symbol</dt>
            <dd className="font-mono" dir="ltr">
              {selected.symbol ?? "—"}
            </dd>
            <dt className="text-muted-foreground">Unit</dt>
            <dd className="font-mono" dir="ltr">
              {unit}
            </dd>
            <dt className="text-muted-foreground">Uncertainty</dt>
            <dd className="font-mono" dir="ltr">
              {selected.exact || selected.uncertainty === null
                ? "Exact"
                : `${formatConstantValue(selected.uncertainty)} ${unit}`}
            </dd>
            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-mono" dir="ltr">
              CODATA 2022
            </dd>
            <dt className="text-muted-foreground">Identifier</dt>
            <dd className="break-all font-mono text-[10px]" dir="ltr">
              {selected.id}
            </dd>
          </dl>

          <p className="border-t pt-3 text-[9px] text-muted-foreground leading-relaxed">
            Values from the NIST Fundamental Physical Constants complete
            listing. NIST does not endorse this component. Verify before
            publication.{" "}
            <a
              className="underline decoration-border underline-offset-2 hover:text-foreground"
              href="https://physics.nist.gov/cuu/Constants/"
              rel="noreferrer"
              target="_blank"
            >
              NIST source
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
