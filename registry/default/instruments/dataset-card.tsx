"use client";

import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import { cn } from "@/registry/default/lib/utils";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";

export type DatasetStage = "raw" | "derived" | "published";

export type DatasetAccess = "open" | "restricted" | "embargoed" | "closed";

export type DatasetRelationType =
  | "derivedFrom"
  | "supersedes"
  | "partOf"
  | "documents";

export type DatasetRelation = {
  id: string;
  label: string;
  relation: DatasetRelationType;
  href?: string;
};

export type DatasetRecord = {
  id: string;
  title: string;
  description?: string;
  stage: DatasetStage;
  version: string;
  owner: string;
  ownerAffiliation?: string;
  contributors?: readonly string[];
  license?: string;
  doi?: string;
  repository?: string;
  format?: string;
  /** Human-readable size, e.g. "2.4 GB". */
  size?: string;
  checksum?: { algorithm: string; value: string };
  method?: string;
  createdAt?: string;
  updatedAt?: string;
  access?: DatasetAccess;
  accessNote?: string;
  keywords?: readonly string[];
  related?: readonly DatasetRelation[];
  /** Override the generated citation. */
  citation?: string;
  /** A caveat that must stay visible, e.g. "Contains re-identifiable dates." */
  warning?: string;
};

export type DatasetCheckItem = {
  field: string;
  label: string;
  recorded: boolean;
  detail?: string;
};

export type DatasetChecklist = {
  items: readonly DatasetCheckItem[];
  recorded: number;
  total: number;
  missing: readonly string[];
};

export type DatasetCardProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  dataset: DatasetRecord;
  /** Required fields to check. Defaults to identity, method, and integrity. */
  requiredFields?: readonly (keyof DatasetRecord)[];
  title?: React.ReactNode;
  emptyLabel?: React.ReactNode;
};

const REQUIRED: readonly (keyof DatasetRecord)[] = [
  "title",
  "description",
  "owner",
  "license",
  "method",
  "checksum",
  "access",
  "version",
];

const FIELD_LABEL: Partial<Record<keyof DatasetRecord, string>> = {
  access: "Access conditions",
  checksum: "Checksum",
  description: "Description",
  license: "License",
  method: "Method",
  owner: "Owner",
  title: "Title",
  version: "Version",
};

const STAGE_LABEL: Record<DatasetStage, string> = {
  derived: "Derived",
  published: "Published",
  raw: "Raw",
};

const ACCESS_LABEL: Record<DatasetAccess, string> = {
  closed: "Closed",
  embargoed: "Embargoed",
  open: "Open",
  restricted: "Restricted",
};

const RELATION_LABEL: Record<DatasetRelationType, string> = {
  derivedFrom: "Derived from",
  documents: "Documents",
  partOf: "Part of",
  supersedes: "Supersedes",
};

function isRecorded(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    if ("value" in value) {
      return isRecorded((value as { value?: unknown }).value);
    }
    return Object.keys(value).length > 0;
  }
  return true;
}

export function datasetChecklist(
  dataset: DatasetRecord,
  requiredFields: readonly (keyof DatasetRecord)[] = REQUIRED,
): DatasetChecklist {
  const items = requiredFields.map((field) => ({
    detail:
      field === "checksum" && dataset.checksum
        ? `${dataset.checksum.algorithm}: ${dataset.checksum.value.slice(0, 12)}…`
        : undefined,
    field: String(field),
    label: FIELD_LABEL[field] ?? String(field),
    recorded: isRecorded(dataset[field]),
  }));
  return {
    items,
    missing: items.filter((item) => !item.recorded).map((item) => item.label),
    recorded: items.filter((item) => item.recorded).length,
    total: items.length,
  };
}

function citationYear(dataset: DatasetRecord): string {
  const date = dataset.updatedAt ?? dataset.createdAt;
  if (!date) {
    return "n.d.";
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "n.d."
    : String(parsed.getUTCFullYear());
}

export function datasetCitation(dataset: DatasetRecord): string {
  if (dataset.citation) {
    return dataset.citation;
  }
  const parts = [
    `${dataset.owner} (${citationYear(dataset)}).`,
    dataset.title,
    `(Version ${dataset.version}) [Data set].`,
  ];
  if (dataset.repository) {
    parts.push(dataset.repository);
  }
  if (dataset.doi) {
    parts.push(
      dataset.doi.startsWith("http")
        ? dataset.doi
        : `https://doi.org/${dataset.doi.replace(/^doi:\s*/i, "")}`,
    );
  }
  return parts.join(" ");
}

export function datasetMetadataJson(
  dataset: DatasetRecord,
  checklist: DatasetChecklist = datasetChecklist(dataset),
): string {
  return `${JSON.stringify(
    {
      ...dataset,
      checks: {
        completeness: `${checklist.recorded}/${checklist.total}`,
        missing: checklist.missing,
      },
      citation: datasetCitation(dataset),
    },
    null,
    2,
  )}\n`;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function DatasetCard({
  dataset,
  requiredFields = REQUIRED,
  title,
  emptyLabel = "No dataset. Pass a dataset record to render the card.",
  className,
  ...props
}: DatasetCardProps): React.ReactElement {
  const titleId = React.useId();
  const checksumCopy = useCopyToClipboard();
  const citationCopy = useCopyToClipboard();
  const checklist = datasetChecklist(dataset, requiredFields);

  if (!dataset || !dataset.id || !dataset.title) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="dataset-card"
        {...props}
      >
        <p className="text-center text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      </section>
    );
  }

  const citation = datasetCitation(dataset);
  const rows: Array<[string, React.ReactNode]> = [
    ["Owner", dataset.owner],
    ...(dataset.ownerAffiliation
      ? ([["Affiliation", dataset.ownerAffiliation]] as Array<
          [string, React.ReactNode]
        >)
      : []),
    [
      "Contributors",
      dataset.contributors?.length ? dataset.contributors.join(", ") : "—",
    ],
    ["License", dataset.license ?? "—"],
    ["Access", dataset.access ? ACCESS_LABEL[dataset.access] : "—"],
    ["DOI", dataset.doi ?? "—"],
    ["Format", dataset.format ?? "—"],
    ["Size", dataset.size ?? "—"],
    ["Created", formatDate(dataset.createdAt)],
    ["Updated", formatDate(dataset.updatedAt)],
    ["Repository", dataset.repository ?? "—"],
  ];

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="dataset-card"
      {...props}
    >
      <header className="border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Dataset
          </p>
          <Badge size="sm" variant="outline">
            {STAGE_LABEL[dataset.stage]}
          </Badge>
          <Badge size="sm" variant="secondary">
            v{dataset.version}
          </Badge>
          {dataset.doi ? (
            <Badge size="sm" variant="outline">
              DOI
            </Badge>
          ) : null}
          <span className="ms-auto font-mono text-[10px] text-muted-foreground">
            {dataset.id}
          </span>
        </div>
        <h3
          className="mt-1 font-heading font-semibold text-xl tracking-tight"
          id={titleId}
        >
          {title ?? dataset.title}
        </h3>
        {title ? (
          <p className="text-muted-foreground text-sm">{dataset.title}</p>
        ) : null}
        {dataset.description ? (
          <p className="mt-1 max-w-prose text-muted-foreground text-xs leading-relaxed">
            {dataset.description}
          </p>
        ) : null}
      </header>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-[11px]",
          checklist.missing.length > 0
            ? "bg-warning/8 text-warning-foreground"
            : "bg-muted/24 text-muted-foreground",
        )}
      >
        <p className="flex items-center gap-1.5">
          {checklist.missing.length > 0 ? (
            <TriangleAlertIcon aria-hidden="true" className="size-3.5" />
          ) : (
            <CheckIcon aria-hidden="true" className="size-3.5" />
          )}
          {checklist.recorded} of {checklist.total} required fields recorded
          {checklist.missing.length > 0
            ? ` · missing ${checklist.missing.join(", ")}`
            : " · nothing missing"}
        </p>
        <span className="font-mono text-[10px]">
          {Math.round((checklist.recorded / checklist.total) * 100)}%
        </span>
      </div>

      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 border-b px-4 py-3 @2xl:border-e @2xl:border-b-0">
          <h4 className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
            Identity
          </h4>
          <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div className="min-w-0" key={label}>
                <dt className="text-[10px] text-muted-foreground">{label}</dt>
                <dd
                  className="truncate"
                  title={typeof value === "string" ? value : undefined}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {dataset.keywords?.length ? (
            <p className="mt-3 flex flex-wrap gap-1">
              {dataset.keywords.map((keyword) => (
                <span
                  className="rounded-sm border bg-muted/32 px-1.5 py-0.5 font-mono text-[10px]"
                  key={keyword}
                >
                  {keyword}
                </span>
              ))}
            </p>
          ) : null}

          {dataset.method ? (
            <div className="mt-3 border-t pt-2">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Method
              </h4>
              <p className="mt-0.5 max-w-prose text-xs leading-relaxed">
                {dataset.method}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid content-start gap-3 px-4 py-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Integrity
              </h4>
              {dataset.checksum ? (
                <Button
                  className="print:hidden"
                  onClick={() =>
                    checksumCopy.copyToClipboard(
                      `${dataset.checksum?.algorithm}:${dataset.checksum?.value}`,
                    )
                  }
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  {checksumCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
                  {checksumCopy.isCopied ? "Copied" : "Copy"}
                </Button>
              ) : null}
            </div>
            {dataset.checksum ? (
              <p className="mt-1 break-all font-mono text-[10px] leading-relaxed">
                <span className="text-muted-foreground">
                  {dataset.checksum.algorithm}:
                </span>
                {dataset.checksum.value}
              </p>
            ) : (
              <p className="mt-1 text-warning-foreground text-xs">
                No checksum recorded. The bytes are not verifiable.
              </p>
            )}
          </div>

          <div className="border-t pt-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Cite
              </h4>
              <Button
                className="print:hidden"
                onClick={() => citationCopy.copyToClipboard(citation)}
                size="xs"
                type="button"
                variant="ghost"
              >
                {citationCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
                {citationCopy.isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-1 rounded-md border bg-muted/24 p-2 text-[11px] leading-relaxed">
              {citation}
            </p>
          </div>

          {dataset.related?.length ? (
            <div className="border-t pt-2">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Related
              </h4>
              <ul className="mt-1 grid gap-1 text-[11px]">
                {dataset.related.map((relation) => (
                  <li
                    className="flex gap-1.5"
                    key={`${relation.relation}-${relation.id}`}
                  >
                    <span className="shrink-0 text-muted-foreground">
                      {RELATION_LABEL[relation.relation]}
                    </span>
                    {relation.href ? (
                      <a
                        className="min-w-0 truncate underline underline-offset-4"
                        href={relation.href}
                      >
                        {relation.label}
                      </a>
                    ) : (
                      <span className="min-w-0 truncate">{relation.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {dataset.accessNote || dataset.warning ? (
        <footer className="grid gap-1 border-t px-4 py-2.5 text-[11px] leading-relaxed">
          {dataset.accessNote ? (
            <p className="text-muted-foreground">
              Access: {dataset.accessNote}
            </p>
          ) : null}
          {dataset.warning ? (
            <p className="flex items-start gap-1.5 text-warning-foreground">
              <TriangleAlertIcon
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              {dataset.warning}
            </p>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
