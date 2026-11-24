"use client";

import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { useCopyToClipboard } from "@/registry/default/hooks/use-copy-to-clipboard";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";

export type ManifestArtifact = {
  path: string;
  /** Content hash, e.g. sha256:9f2c… . Missing hashes are called out. */
  hash?: string;
  bytes?: number;
};

export type ManifestEnvironment = {
  language: string;
  version?: string;
  platform?: string;
  packages?: readonly { name: string; version: string }[];
};

export type ReproducibilityManifestData = {
  id: string;
  project: string;
  createdAt: string;
  commit: string;
  branch?: string;
  dirty: boolean;
  environment: ManifestEnvironment;
  command?: string;
  params?: Readonly<Record<string, string | number | boolean | null>>;
  seeds?: Readonly<Record<string, number>>;
  inputs: readonly ManifestArtifact[];
  outputs?: readonly ManifestArtifact[];
  durationSeconds?: number;
  notes?: string;
};

export type ManifestCheck = {
  label: string;
  recorded: boolean;
  detail?: string;
};

export type ManifestChecklist = {
  checks: readonly ManifestCheck[];
  recorded: number;
  total: number;
  complete: boolean;
};

export type ManifestWarning = {
  key: string;
  message: string;
};

export type ReproducibilityManifestProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  manifest: ReproducibilityManifestData;
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  onExport?: (json: string) => void;
};

export function manifestChecklist(
  manifest: ReproducibilityManifestData,
): ManifestChecklist {
  const inputsHashed =
    manifest.inputs.length > 0 &&
    manifest.inputs.every((input) => Boolean(input.hash));
  const outputs = manifest.outputs ?? [];
  const checks: ManifestCheck[] = [
    {
      label: "Commit",
      recorded: Boolean(manifest.commit && manifest.commit !== "unknown"),
      detail: manifest.commit,
    },
    {
      label: "Command",
      recorded: Boolean(manifest.command),
      detail: manifest.command,
    },
    {
      label: "Clean tree",
      recorded: !manifest.dirty,
      detail: manifest.dirty ? "Uncommitted changes present" : undefined,
    },
    {
      label: "Environment",
      recorded: Boolean(
        manifest.environment.version &&
          (manifest.environment.packages?.length ?? 0) > 0,
      ),
      detail: manifest.environment.version,
    },
    {
      label: "Input hashes",
      recorded: inputsHashed,
      detail:
        manifest.inputs.length === 0
          ? "No inputs recorded"
          : `${manifest.inputs.filter((input) => input.hash).length}/${manifest.inputs.length}`,
    },
    {
      label: "Output hashes",
      recorded: outputs.length > 0 && outputs.every((output) => output.hash),
      detail:
        outputs.length === 0
          ? "No outputs recorded"
          : `${outputs.filter((output) => output.hash).length}/${outputs.length}`,
    },
  ];
  const recorded = checks.filter((check) => check.recorded).length;
  return {
    checks,
    complete: recorded === checks.length,
    recorded,
    total: checks.length,
  };
}

export function manifestWarnings(
  manifest: ReproducibilityManifestData,
): readonly ManifestWarning[] {
  const warnings: ManifestWarning[] = [];
  if (manifest.dirty) {
    warnings.push({
      key: "dirty",
      message:
        "The working tree was dirty. The commit alone does not contain the code that produced these outputs.",
    });
  }
  if (!manifest.command) {
    warnings.push({
      key: "command",
      message: "No command recorded. The run cannot be repeated as written.",
    });
  }
  if (manifest.inputs.some((input) => !input.hash)) {
    warnings.push({
      key: "input-hash",
      message:
        "At least one input has no hash. The exact bytes fed to the run are not verifiable.",
    });
  }
  if ((manifest.outputs ?? []).some((output) => !output.hash)) {
    warnings.push({
      key: "output-hash",
      message:
        "At least one output has no hash. The artifact cannot be matched to this run.",
    });
  }
  if (!manifest.environment.version) {
    warnings.push({
      key: "environment",
      message: "The language or runtime version is missing.",
    });
  }
  return warnings;
}

export function reproduceCommand(
  manifest: ReproducibilityManifestData,
): string | null {
  if (!manifest.command || manifest.dirty || !manifest.commit) {
    return null;
  }
  return `git checkout ${manifest.commit} && ${manifest.command}`;
}

export function manifestJson(manifest: ReproducibilityManifestData): string {
  return `${JSON.stringify(
    {
      ...manifest,
      checks: manifestChecklist(manifest),
      warnings: manifestWarnings(manifest),
      reproduce: reproduceCommand(manifest),
    },
    null,
    2,
  )}\n`;
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || !Number.isFinite(bytes)) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} kB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined) {
    return "—";
  }
  if (seconds < 60) {
    return `${seconds} s`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${seconds % 60} s`;
}

function download(json: string, name: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = `manifest-${name.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.json`;
  anchor.href = href;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function ArtifactList({
  label,
  artifacts,
}: {
  label: string;
  artifacts: readonly ManifestArtifact[];
}): React.ReactElement | null {
  if (artifacts.length === 0) {
    return null;
  }
  return (
    <div>
      <h4 className="border-b bg-muted/24 px-4 py-1.5 font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      <ul className="divide-y">
        {artifacts.map((artifact) => (
          <li
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 px-4 py-1.5"
            key={artifact.path}
          >
            <div className="min-w-0">
              <p
                className="truncate font-mono text-[11px]"
                title={artifact.path}
              >
                {artifact.path}
              </p>
              {artifact.hash ? (
                <p
                  className="truncate font-mono text-[9px] text-muted-foreground"
                  title={artifact.hash}
                >
                  {artifact.hash}
                </p>
              ) : (
                <p className="text-[9px] text-warning-foreground">
                  no hash recorded
                </p>
              )}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {formatBytes(artifact.bytes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReproducibilityManifest({
  manifest,
  title,
  description,
  emptyLabel = "No manifest. Pass a run record to render it.",
  onExport,
  className,
  ...props
}: ReproducibilityManifestProps): React.ReactElement {
  const titleId = React.useId();
  const jsonCopy = useCopyToClipboard();
  const commandCopy = useCopyToClipboard();
  const checklist = manifestChecklist(manifest);
  const warnings = manifestWarnings(manifest);
  const reproduce = reproduceCommand(manifest);
  const json = manifestJson(manifest);

  if (!manifest || !manifest.id) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-xl border bg-background p-6",
          className,
        )}
        data-slot="reproducibility-manifest"
        {...props}
      >
        <p className="text-center text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      </section>
    );
  }

  function handleExport(): void {
    onExport?.(json);
    download(json, manifest.id);
  }

  const params = Object.entries(manifest.params ?? {});
  const seeds = Object.entries(manifest.seeds ?? {});

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "@container overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="reproducibility-manifest"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
            Reproducibility manifest
          </p>
          <h3
            className="font-heading font-semibold text-xl tracking-tight"
            id={titleId}
          >
            {title ?? manifest.project}
          </h3>
          {description ? (
            <p className="mt-0.5 max-w-prose text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>{manifest.id}</span>
            <span className="truncate">
              commit {manifest.commit.slice(0, 12)}
              {manifest.branch ? ` · ${manifest.branch}` : ""}
            </span>
            <span>{manifest.createdAt}</span>
            {manifest.durationSeconds !== undefined ? (
              <span>{formatDuration(manifest.durationSeconds)}</span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-1.5 print:hidden">
          <Button
            onClick={() => jsonCopy.copyToClipboard(json)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {jsonCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
            {jsonCopy.isCopied ? "Copied" : "Copy JSON"}
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            type="button"
            variant="outline"
          >
            <DownloadIcon />
            Export
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 text-[11px]",
          warnings.length > 0
            ? "bg-warning/8 text-warning-foreground"
            : "bg-muted/24 text-muted-foreground",
        )}
      >
        <span className="font-mono">
          {checklist.recorded}/{checklist.total} checks
        </span>
        <span className="min-w-0 flex-1">
          {warnings.length === 0
            ? "The run can be repeated from the commit, command, and hashed inputs."
            : warnings.map((warning) => warning.message).join(" ")}
        </span>
        <span className="inline-flex items-center gap-1">
          {warnings.length === 0 ? (
            <CheckIcon aria-hidden="true" className="size-3.5" />
          ) : (
            <TriangleAlertIcon aria-hidden="true" className="size-3.5" />
          )}
          {manifest.dirty ? "Dirty tree" : "Clean tree"}
        </span>
      </div>

      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 border-b @2xl:border-e @2xl:border-b-0">
          <div className="border-b px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Command
              </h4>
              {manifest.command ? (
                <Button
                  className="print:hidden"
                  onClick={() =>
                    commandCopy.copyToClipboard(manifest.command ?? "")
                  }
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  {commandCopy.isCopied ? <CheckIcon /> : <CopyIcon />}
                  {commandCopy.isCopied ? "Copied" : "Copy"}
                </Button>
              ) : null}
            </div>
            {manifest.command ? (
              <pre className="mt-1 overflow-x-auto rounded-md border bg-muted/24 px-2 py-1.5 font-mono text-[11px] leading-relaxed">
                {manifest.command}
              </pre>
            ) : (
              <p className="mt-1 text-warning-foreground text-xs">
                No command recorded.
              </p>
            )}
            {reproduce ? (
              <p className="mt-1.5 break-all font-mono text-[10px] text-muted-foreground">
                {reproduce}
              </p>
            ) : null}
          </div>

          <ArtifactList artifacts={manifest.inputs} label="Inputs" />
          <ArtifactList artifacts={manifest.outputs ?? []} label="Outputs" />

          {manifest.notes ? (
            <p className="border-t px-4 py-2 text-[11px] text-muted-foreground leading-relaxed">
              {manifest.notes}
            </p>
          ) : null}
        </div>

        <aside className="grid content-start">
          <div className="border-b px-4 py-2.5">
            <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
              Environment
            </h4>
            <p className="mt-1 font-mono text-[11px]">
              {manifest.environment.language}
              {manifest.environment.version
                ? ` ${manifest.environment.version}`
                : ""}
            </p>
            {manifest.environment.platform ? (
              <p className="font-mono text-[10px] text-muted-foreground">
                {manifest.environment.platform}
              </p>
            ) : null}
            {manifest.environment.packages?.length ? (
              <ul className="mt-1.5 grid max-h-48 gap-0.5 overflow-y-auto pr-1 text-[10px]">
                {manifest.environment.packages.map((pkg) => (
                  <li
                    className="flex justify-between gap-2 font-mono"
                    key={pkg.name}
                  >
                    <span className="truncate text-muted-foreground">
                      {pkg.name}
                    </span>
                    <span>{pkg.version}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[10px] text-warning-foreground">
                No package versions recorded.
              </p>
            )}
          </div>

          {params.length > 0 ? (
            <div className="border-b px-4 py-2.5">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Parameters
              </h4>
              <dl className="mt-1 grid gap-0.5 text-[10px]">
                {params.map(([key, value]) => (
                  <div className="flex justify-between gap-2" key={key}>
                    <dt className="truncate text-muted-foreground">{key}</dt>
                    <dd className="font-mono tabular-nums">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {seeds.length > 0 ? (
            <div className="border-b px-4 py-2.5">
              <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
                Seeds
              </h4>
              <dl className="mt-1 grid gap-0.5 text-[10px]">
                {seeds.map(([key, value]) => (
                  <div className="flex justify-between gap-2" key={key}>
                    <dt className="truncate text-muted-foreground">{key}</dt>
                    <dd className="font-mono tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="px-4 py-2.5">
            <h4 className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground">
              Checks
            </h4>
            <ul className="mt-1 grid gap-1 text-[10px]">
              {checklist.checks.map((check) => (
                <li
                  className="flex items-start gap-1.5"
                  key={check.label}
                  title={check.detail}
                >
                  <span
                    className={cn(
                      "mt-px inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm border font-mono text-[9px]",
                      check.recorded
                        ? "border-success/32 bg-success/8 text-success-foreground"
                        : "border-warning/32 bg-warning/8 text-warning-foreground",
                    )}
                  >
                    {check.recorded ? "✓" : "×"}
                  </span>
                  <span className="text-muted-foreground">
                    {check.label}
                    <span className="sr-only">
                      {check.recorded ? ": recorded" : ": missing"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
