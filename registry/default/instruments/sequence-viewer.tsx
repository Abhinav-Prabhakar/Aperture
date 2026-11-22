"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  DnaIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import { StatusBadge } from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";

export type SequenceFeatureKind =
  | "CDS"
  | "promoter"
  | "RBS"
  | "terminator"
  | "origin"
  | "primer"
  | "restriction"
  | "regulatory"
  | "other";

export type SequenceFeature = {
  id: string;
  name: string;
  kind: SequenceFeatureKind;
  /** 1-based, inclusive. */
  start: number;
  /** 1-based, inclusive. */
  end: number;
  strand?: "+" | "-";
  note?: string;
};

export type SequenceRecord = {
  id: string;
  name: string;
  description?: string;
  /** DNA sequence; whitespace, digits, and lowercase are normalized. */
  sequence: string;
  topology?: "linear" | "circular";
  features?: readonly SequenceFeature[];
  source?: string;
};

export type SequenceViewerProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  record: SequenceRecord | null;
  /** Select a feature on first render, for example the coding sequence. */
  defaultFeatureId?: string;
  /** Bases per row. Default 60. */
  rowWidth?: number;
  emptyLabel?: React.ReactNode;
  onFeatureSelect?: (feature: SequenceFeature) => void;
  onCopy?: (sequence: string) => void;
};

export const SEQUENCE_FEATURE_KIND_LABEL: Record<SequenceFeatureKind, string> =
  {
    CDS: "CDS",
    RBS: "RBS",
    origin: "Origin",
    other: "Other",
    primer: "Primer",
    promoter: "Promoter",
    regulatory: "Regulatory",
    restriction: "Restriction site",
    terminator: "Terminator",
  };

const IUPAC = new Set("ACGTURYSWKMBDHVN");

const COMPLEMENT: Record<string, string> = {
  A: "T",
  B: "V",
  C: "G",
  D: "H",
  G: "C",
  H: "D",
  K: "M",
  M: "K",
  N: "N",
  R: "Y",
  S: "S",
  T: "A",
  U: "A",
  V: "B",
  W: "W",
  Y: "R",
};

const CODON_TABLE: Record<string, string> = {
  AAA: "K",
  AAC: "N",
  AAG: "K",
  AAT: "N",
  ACA: "T",
  ACC: "T",
  ACG: "T",
  ACT: "T",
  AGA: "R",
  AGC: "S",
  AGG: "R",
  AGT: "S",
  ATA: "I",
  ATC: "I",
  ATG: "M",
  ATT: "I",
  CAA: "Q",
  CAC: "H",
  CAG: "Q",
  CAT: "H",
  CCA: "P",
  CCC: "P",
  CCG: "P",
  CCT: "P",
  CGA: "R",
  CGC: "R",
  CGG: "R",
  CGT: "R",
  CTA: "L",
  CTC: "L",
  CTG: "L",
  CTT: "L",
  GAA: "E",
  GAC: "D",
  GAG: "E",
  GAT: "D",
  GCA: "A",
  GCC: "A",
  GCG: "A",
  GCT: "A",
  GGA: "G",
  GGC: "G",
  GGG: "G",
  GGT: "G",
  GTA: "V",
  GTC: "V",
  GTG: "V",
  GTT: "V",
  TAA: "*",
  TAC: "Y",
  TAG: "*",
  TAT: "Y",
  TCA: "S",
  TCC: "S",
  TCG: "S",
  TCT: "S",
  TGA: "*",
  TGC: "C",
  TGG: "W",
  TGT: "C",
  TTA: "L",
  TTC: "F",
  TTG: "L",
  TTT: "F",
};

const NUMBER = new Intl.NumberFormat("en-US");

/** Uppercase, remove whitespace and line numbers, and treat U as T. */
export function normalizeSequence(value: string): string {
  return value
    .toUpperCase()
    .replace(/[\s\d]/g, "")
    .replace(/U/g, "T");
}

export function isValidSequence(value: string): boolean {
  const normalized = normalizeSequence(value);
  return (
    normalized.length > 0 && [...normalized].every((base) => IUPAC.has(base))
  );
}

export function gcContent(sequence: string): number | null {
  const normalized = normalizeSequence(sequence);
  let canonical = 0;
  let gc = 0;

  for (const base of normalized) {
    if (base === "G" || base === "C") {
      gc += 1;
      canonical += 1;
    } else if (base === "A" || base === "T") {
      canonical += 1;
    }
  }

  return canonical === 0 ? null : (gc / canonical) * 100;
}

export function reverseComplement(sequence: string): string {
  return [...normalizeSequence(sequence)]
    .reverse()
    .map((base) => COMPLEMENT[base] ?? "N")
    .join("");
}

export function translate(sequence: string): string {
  const normalized = normalizeSequence(sequence);
  let protein = "";

  for (let index = 0; index + 3 <= normalized.length; index += 3) {
    const codon = normalized.slice(index, index + 3);
    protein += CODON_TABLE[codon] ?? "X";
  }

  return protein;
}

export type SequenceMatch = {
  /** 0-based start. */
  start: number;
  length: number;
};

export function findMatches(sequence: string, query: string): SequenceMatch[] {
  const text = normalizeSequence(sequence);
  const needle = normalizeSequence(query);
  if (!needle || needle.length > text.length) {
    return [];
  }

  const matches: SequenceMatch[] = [];
  for (let index = 0; index <= text.length - needle.length; index += 1) {
    if (text.startsWith(needle, index)) {
      matches.push({ length: needle.length, start: index });
    }
  }
  return matches;
}

export function featureLength(feature: SequenceFeature): number {
  return feature.end - feature.start + 1;
}

export function featureSequence(
  sequence: string,
  feature: SequenceFeature,
): string {
  const slice = normalizeSequence(sequence).slice(
    Math.max(0, feature.start - 1),
    Math.max(0, feature.end),
  );
  return feature.strand === "-" ? reverseComplement(slice) : slice;
}

export type CdsAnalysis = {
  complete: boolean;
  lengthBp: number;
  reason: string | null;
  startCodon: string;
  stopCodon: string;
  translation: string;
};

export function analyzeCds(
  sequence: string,
  feature: SequenceFeature,
): CdsAnalysis {
  const coding = featureSequence(sequence, feature);
  const translation = translate(coding);
  const startCodon = coding.slice(0, 3);
  const stopCodon = coding.slice(-3);
  const reasons: string[] = [];

  if (startCodon !== "ATG") {
    reasons.push(`Start is ${startCodon || "missing"}, not ATG`);
  }
  if (!["TAA", "TAG", "TGA"].includes(stopCodon)) {
    reasons.push(`Stop is ${stopCodon || "missing"}`);
  }
  if (coding.length % 3 !== 0) {
    reasons.push("Length is not a multiple of three");
  }

  return {
    complete: reasons.length === 0,
    lengthBp: coding.length,
    reason: reasons.length > 0 ? reasons.join(". ") : null,
    startCodon,
    stopCodon,
    translation,
  };
}

export function parseFasta(text: string): SequenceRecord | null {
  const lines = text.split(/\r?\n/);
  const header = lines.find((line) => line.startsWith(">"));
  if (!header) {
    return null;
  }

  const label = header.slice(1).trim();
  const [name = "Untitled sequence", ...description] = label.split(/\s+/);
  const sequence = normalizeSequence(
    lines.filter((line) => !line.startsWith(">")).join(""),
  );
  if (!sequence) {
    return null;
  }

  return {
    description: description.length > 0 ? description.join(" ") : undefined,
    id: name,
    name,
    sequence,
  };
}

function formatProtein(protein: string): string {
  return protein.match(/.{1,10}/g)?.join(" ") ?? protein;
}

function buildSegments(
  text: string,
  start: number,
  selectedRange: { start: number; end: number } | null,
  matchPositions: ReadonlySet<number>,
  activePositions: ReadonlySet<number>,
): React.ReactNode {
  const segments: Array<{
    active: boolean;
    match: boolean;
    selected: boolean;
    text: string;
  }> = [];

  for (let offset = 0; offset < text.length; offset += 1) {
    const position = start + offset;
    const selected =
      selectedRange !== null &&
      position >= selectedRange.start &&
      position <= selectedRange.end;
    const match = matchPositions.has(position);
    const active = activePositions.has(position);
    const last = segments.at(-1);

    if (
      last &&
      last.selected === selected &&
      last.match === match &&
      last.active === active
    ) {
      last.text += text[offset];
    } else {
      segments.push({ active, match, selected, text: text[offset] });
    }
  }

  return segments.map((segment, index) => (
    <span
      className={cn(
        segment.active && "bg-foreground text-background",
        !segment.active && segment.match && "bg-foreground/16 font-semibold",
        !segment.active && !segment.match && segment.selected && "bg-accent",
      )}
      data-active-match={segment.active ? "" : undefined}
      data-match={segment.match ? "" : undefined}
      data-selected={segment.selected ? "" : undefined}
      key={`${start}-${index}`}
    >
      {segment.text}
    </span>
  ));
}

function EmptyState({ label }: { label: React.ReactNode }): React.ReactElement {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-16 text-center">
      <DnaIcon aria-hidden="true" className="size-5 text-muted-foreground" />
      <p className="font-medium text-sm">{label}</p>
      <p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
        Pass a record with a DNA sequence and optional features. Coordinates are
        1-based and inclusive.
      </p>
    </div>
  );
}

export function SequenceViewer({
  record,
  defaultFeatureId,
  rowWidth = 60,
  emptyLabel = "No sequence loaded.",
  onFeatureSelect,
  onCopy,
  className,
  ...props
}: SequenceViewerProps): React.ReactElement {
  const sequence = React.useMemo(
    () => (record ? normalizeSequence(record.sequence) : ""),
    [record],
  );
  const features = record?.features ?? [];
  const length = sequence.length;
  const gc = gcContent(sequence);
  const valid = isValidSequence(sequence);

  const [selectedId, setSelectedId] = React.useState<string | null>(
    defaultFeatureId ?? null,
  );
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  React.useEffect(() => {
    setSelectedId(defaultFeatureId ?? null);
  }, [defaultFeatureId, record?.id]);

  const selectedFeature =
    features.find((feature) => feature.id === selectedId) ?? null;
  const selectedRange = selectedFeature
    ? { end: selectedFeature.end - 1, start: selectedFeature.start - 1 }
    : null;

  const normalizedQuery = normalizeSequence(query);
  const matches = React.useMemo(
    () => findMatches(sequence, normalizedQuery),
    [sequence, normalizedQuery],
  );

  React.useEffect(() => {
    setActiveIndex(0);
  }, [normalizedQuery]);

  const safeIndex =
    matches.length === 0 ? 0 : Math.min(activeIndex, matches.length - 1);
  const activeMatch = matches[safeIndex] ?? null;

  const matchPositions = React.useMemo(() => {
    const positions = new Set<number>();
    for (const match of matches) {
      for (let index = 0; index < match.length; index += 1) {
        positions.add(match.start + index);
      }
    }
    return positions;
  }, [matches]);

  const activePositions = React.useMemo(() => {
    const positions = new Set<number>();
    if (!activeMatch) {
      return positions;
    }
    for (let index = 0; index < activeMatch.length; index += 1) {
      positions.add(activeMatch.start + index);
    }
    return positions;
  }, [activeMatch]);

  const rowSize = Math.max(10, Math.floor(rowWidth));

  const rows = React.useMemo(() => {
    const chunks: string[] = [];
    for (let index = 0; index < sequence.length; index += rowSize) {
      chunks.push(sequence.slice(index, index + rowSize));
    }
    return chunks;
  }, [sequence, rowSize]);

  const analysis =
    selectedFeature?.kind === "CDS"
      ? analyzeCds(sequence, selectedFeature)
      : null;

  function selectFeature(feature: SequenceFeature): void {
    setSelectedId(feature.id);
    onFeatureSelect?.(feature);
  }

  function stepMatch(direction: 1 | -1): void {
    if (matches.length === 0) {
      return;
    }
    setActiveIndex(
      (current) => (current + direction + matches.length) % matches.length,
    );
  }

  if (!record || length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
        data-slot="sequence-viewer"
        {...props}
      >
        <EmptyState label={emptyLabel} />
      </section>
    );
  }

  const matchLabel =
    normalizedQuery.length === 0
      ? null
      : matches.length === 0
        ? "No matches"
        : `${safeIndex + 1} / ${matches.length}`;

  return (
    <section
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="sequence-viewer"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            <span dir="ltr">
              {record.id} · {record.topology ?? "linear"} ·{" "}
              {NUMBER.format(length)} bp
            </span>
          </p>
          <h3 className="font-heading font-semibold text-xl tracking-tight">
            {record.name}
          </h3>
          {record.description ? (
            <p className="max-w-prose text-muted-foreground text-xs leading-relaxed">
              {record.description}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-mono" dir="ltr">
              {NUMBER.format(length)} bp
            </span>
            <span className="font-mono" dir="ltr">
              GC {gc === null ? "—" : `${gc.toFixed(1)}%`}
            </span>
            <span className="font-mono" dir="ltr">
              {features.length} feature{features.length === 1 ? "" : "s"}
            </span>
            {!valid ? (
              <StatusBadge
                label="Unsupported bases"
                size="sm"
                status="warning"
              />
            ) : null}
          </div>
        </div>
        <Button
          onClick={() => {
            copyToClipboard(sequence);
            onCopy?.(sequence);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? "Copied" : "Copy sequence"}
        </Button>
      </header>

      <div className="grid @4xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 border-b @4xl:col-start-1 @4xl:row-start-1">
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/24 px-3 py-2">
            <div className="relative w-full min-w-0 sm:w-auto sm:max-w-72 sm:flex-1">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search sequence"
                autoCapitalize="characters"
                dir="ltr"
                className="h-8 ps-7 font-mono text-xs uppercase"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    stepMatch(event.shiftKey ? -1 : 1);
                  }
                }}
                placeholder="Find motif…"
                spellCheck={false}
                value={query}
              />
              {query ? (
                <button
                  aria-label="Clear search"
                  className="absolute end-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <XIcon aria-hidden="true" className="size-3.5" />
                </button>
              ) : null}
            </div>
            <span
              aria-live="polite"
              className="min-w-16 font-mono text-[10px] text-muted-foreground tabular-nums"
              dir="ltr"
              role="status"
            >
              {matchLabel ?? `${NUMBER.format(length)} bp`}
              {matches.length > 0 ? (
                <span className="sr-only"> matches</span>
              ) : null}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                aria-label="Previous match"
                disabled={matches.length < 2}
                onClick={() => stepMatch(-1)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <ChevronUpIcon />
              </Button>
              <Button
                aria-label="Next match"
                disabled={matches.length < 2}
                onClick={() => stepMatch(1)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <ChevronDownIcon />
              </Button>
            </div>
          </div>

          <div className="px-3 py-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-xs">Features</h4>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {features.length}
                </span>
              </div>
              {features.length > 0 ? (
                <>
                  <ol className="mt-2 grid gap-1">
                    {features.map((feature) => {
                      const active = feature.id === selectedId;
                      const left = ((feature.start - 1) / length) * 100;
                      const width = Math.max(
                        (featureLength(feature) / length) * 100,
                        0.6,
                      );
                      return (
                        <li
                          className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2"
                          key={feature.id}
                        >
                          <button
                            aria-pressed={active}
                            className={cn(
                              "truncate text-start text-[11px] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                              active
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                            )}
                            onClick={() => selectFeature(feature)}
                            title={`${feature.name} · ${feature.start}–${feature.end}${feature.strand === "-" ? " · reverse" : ""}`}
                            type="button"
                          >
                            {feature.name}
                          </button>
                          <span
                            className="relative block h-4 rounded-sm bg-muted/32"
                            dir="ltr"
                          >
                            <button
                              aria-label={`Select ${feature.name}, ${feature.start} to ${feature.end}`}
                              className={cn(
                                "absolute inset-y-0.5 rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                  ? "bg-foreground"
                                  : "bg-muted-foreground/32 hover:bg-muted-foreground/56",
                              )}
                              onClick={() => selectFeature(feature)}
                              style={{
                                insetInlineStart: `${left}%`,
                                width: `${width}%`,
                              }}
                              title={`${feature.name} · ${feature.start}–${feature.end}${feature.strand === "-" ? " · reverse" : ""}`}
                              type="button"
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-1 grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                    <span />
                    <span
                      className="flex justify-between font-mono text-[9px] text-muted-foreground"
                      dir="ltr"
                    >
                      <span>1</span>
                      <span>{NUMBER.format(Math.round(length / 2))}</span>
                      <span>{NUMBER.format(length)}</span>
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-1 text-muted-foreground text-xs">
                  No features annotated.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside
          aria-label="Feature details"
          className="grid content-start gap-4 border-b p-3 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1 @4xl:border-s @4xl:border-b-0"
        >
          <section>
            <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Selected feature
            </h4>
            {selectedFeature ? (
              <>
                <div className="mt-1.5 flex items-start justify-between gap-2">
                  <p className="font-medium text-sm leading-snug">
                    {selectedFeature.name}
                  </p>
                  <Badge size="sm" variant="outline">
                    {SEQUENCE_FEATURE_KIND_LABEL[selectedFeature.kind]}
                  </Badge>
                </div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-mono" dir="ltr">
                    {NUMBER.format(selectedFeature.start)}–
                    {NUMBER.format(selectedFeature.end)}
                  </dd>
                  <dt className="text-muted-foreground">Length</dt>
                  <dd className="font-mono" dir="ltr">
                    {NUMBER.format(featureLength(selectedFeature))} bp
                  </dd>
                  <dt className="text-muted-foreground">Strand</dt>
                  <dd>
                    {selectedFeature.strand === "-"
                      ? "Reverse (−)"
                      : "Forward (+)"}
                  </dd>
                </dl>
                {selectedFeature.note ? (
                  <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                    {selectedFeature.note}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                Select a feature track to inspect its coordinates and
                translation.
              </p>
            )}
          </section>

          {selectedFeature?.kind === "CDS" && analysis ? (
            <section className="border-t pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-medium text-xs">Translation</h4>
                <StatusBadge
                  label={analysis.complete ? "Complete CDS" : "Check CDS"}
                  size="sm"
                  status={analysis.complete ? "success" : "warning"}
                />
              </div>
              <p
                className="mt-2 break-all font-mono text-[10px] leading-relaxed"
                dir="ltr"
              >
                {formatProtein(analysis.translation)}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                <span dir="ltr">
                  {NUMBER.format(analysis.lengthBp)} bp ·{" "}
                  {NUMBER.format(
                    analysis.translation.replace(/\*$/, "").length,
                  )}{" "}
                  aa · {analysis.startCodon} → {analysis.stopCodon}
                </span>
              </p>
              {analysis.reason ? (
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
                  {analysis.reason}.
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="border-t pt-3">
            <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Sequence
            </h4>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
              <dt className="text-muted-foreground">Length</dt>
              <dd className="font-mono" dir="ltr">
                {NUMBER.format(length)} bp
              </dd>
              <dt className="text-muted-foreground">GC content</dt>
              <dd className="font-mono" dir="ltr">
                {gc === null ? "—" : `${gc.toFixed(1)}%`}
              </dd>
              <dt className="text-muted-foreground">Topology</dt>
              <dd className="capitalize">{record.topology ?? "linear"}</dd>
              <dt className="text-muted-foreground">Features</dt>
              <dd className="font-mono">{features.length}</dd>
            </dl>
            {record.source ? (
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                {record.source}
              </p>
            ) : null}
          </section>
        </aside>

        <div className="min-w-0 @4xl:col-start-1 @4xl:row-start-2">
          <div className="px-3 py-3">
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-xs">Bases</h4>
                <span
                  className="font-mono text-[10px] text-muted-foreground"
                  dir="ltr"
                >
                  {NUMBER.format(length)} bp
                </span>
              </div>
              <ol
                className="mt-1.5 grid gap-0.5 font-mono text-[11px] leading-5"
                data-slot="sequence-bases"
                dir="ltr"
              >
                {rows.map((row, rowIndex) => {
                  const rowStart = rowIndex * rowSize;
                  const groups: string[] = [];
                  for (let index = 0; index < row.length; index += 10) {
                    groups.push(row.slice(index, index + 10));
                  }
                  return (
                    <li
                      className="flex items-start gap-2"
                      key={`row-${rowStart}`}
                    >
                      <span
                        aria-hidden="true"
                        className="w-9 shrink-0 select-none text-end text-[9px] text-muted-foreground tabular-nums"
                      >
                        {NUMBER.format(rowStart + 1)}
                      </span>
                      <span className="flex flex-wrap gap-x-1.5 whitespace-pre">
                        {groups.map((group, groupIndex) => (
                          <span key={`group-${rowStart + groupIndex * 10}`}>
                            {buildSegments(
                              group,
                              rowStart + groupIndex * 10,
                              selectedRange,
                              matchPositions,
                              activePositions,
                            )}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              1-based, inclusive coordinates. Click a feature to highlight it.
              Search is exact and case-insensitive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
