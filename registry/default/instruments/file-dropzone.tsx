"use client";

import { FileUpIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import {
  type Status,
  StatusBadge,
} from "@/registry/default/instruments/status-badge";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";

export type RejectedFile = {
  file: File;
  reason: "type" | "size";
};

export type FileDropzoneProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onDrop"
> & {
  label?: string;
  hint?: React.ReactNode;
  /** Comma-separated extensions or MIME types, like the input accept attribute. */
  accept?: string;
  multiple?: boolean;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  onFiles: (files: File[]) => void;
  onReject?: (rejected: RejectedFile[]) => void;
  disabled?: boolean;
};

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) {
    return true;
  }
  return accept.split(",").some((raw) => {
    const token = raw.trim().toLowerCase();
    if (!token) {
      return true;
    }
    if (token.startsWith(".")) {
      return file.name.toLowerCase().endsWith(token);
    }
    if (token.endsWith("/*")) {
      return file.type.toLowerCase().startsWith(token.slice(0, -1));
    }
    return file.type.toLowerCase() === token;
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1000) {
    return `${bytes} B`;
  }
  const units = ["kB", "MB", "GB", "TB"];
  let value = bytes / 1000;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(
    value,
  )} ${units[unit]}`;
}

export function FileDropzone({
  label = "Add files",
  hint = "Drop files here, or choose them from your computer.",
  accept,
  multiple = true,
  maxSize,
  onFiles,
  onReject,
  disabled = false,
  className,
  ...props
}: FileDropzoneProps): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const [rejected, setRejected] = React.useState<RejectedFile[]>([]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const files = Array.from(fileList);
    const accepted: File[] = [];
    const refused: RejectedFile[] = [];

    for (const file of files) {
      if (maxSize !== undefined && file.size > maxSize) {
        refused.push({ file, reason: "size" });
      } else if (!matchesAccept(file, accept)) {
        refused.push({ file, reason: "type" });
      } else {
        accepted.push(file);
      }
    }

    setRejected(refused);
    if (refused.length > 0) {
      onReject?.(refused);
    }
    if (accepted.length > 0) {
      onFiles(multiple ? accepted : accepted.slice(0, 1));
    }
  }

  return (
    <div
      className={cn("w-full", className)}
      data-slot="file-dropzone"
      {...props}
    >
      <input
        accept={accept}
        aria-label={label}
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        aria-label={label}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center outline-none transition-[border-color,background-color]",
          "hover:border-foreground/32 hover:bg-accent/32",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/24",
          dragging && "border-foreground/48 bg-accent/48",
          disabled && "pointer-events-none opacity-64",
        )}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragging(false);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full border bg-background"
        >
          <FileUpIcon className="size-4" />
        </span>
        <span className="font-medium text-sm">{label}</span>
        {hint ? (
          <span className="max-w-sm text-balance text-muted-foreground text-xs leading-relaxed">
            {hint}
          </span>
        ) : null}
      </button>

      {rejected.length > 0 ? (
        <div
          className="mt-2 grid gap-1 text-destructive-foreground text-xs"
          data-slot="file-dropzone-error"
          role="alert"
        >
          {rejected.map(({ file, reason }) => (
            <p key={`${file.name}-${file.size}-${reason}`}>
              <span className="font-medium">{file.name}</span>{" "}
              {reason === "size"
                ? `is larger than ${maxSize === undefined ? "the limit" : formatBytes(maxSize)}.`
                : "is not an accepted file type."}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type UploadStatus = "queued" | "uploading" | "complete" | "error";

export type UploadItem = {
  id: string;
  name: string;
  /** Size in bytes. */
  size: number;
  status: UploadStatus;
  /** 0–100. Used while uploading. */
  progress?: number;
  error?: string;
};

export type UploadQueueProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  items: readonly UploadItem[];
  title?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
};

const UPLOAD_STATUS: Record<UploadStatus, { status: Status; label: string }> = {
  queued: { status: "idle", label: "Queued" },
  uploading: { status: "running", label: "Uploading" },
  complete: { status: "success", label: "Complete" },
  error: { status: "error", label: "Failed" },
};

export function UploadQueue({
  items,
  title = "Files",
  emptyLabel = "No files yet.",
  onRemove,
  onRetry,
  className,
  ...props
}: UploadQueueProps): React.ReactElement {
  const total = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="upload-queue"
      {...props}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-3 py-2">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="font-mono text-muted-foreground text-xs tabular-nums">
          {items.length} {items.length === 1 ? "file" : "files"} ·{" "}
          {formatBytes(total)}
        </p>
      </header>

      {items.length === 0 ? (
        <p
          className="px-3 py-6 text-center text-muted-foreground text-sm"
          data-slot="upload-empty"
        >
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y">
          {items.map((item) => {
            const meta = UPLOAD_STATUS[item.status];
            const progress = Math.min(100, Math.max(0, item.progress ?? 0));

            return (
              <li
                className="px-3 py-2.5"
                data-slot="upload-item"
                data-status={item.status}
                key={item.id}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span
                    className="min-w-0 flex-1 truncate text-sm"
                    data-slot="upload-name"
                  >
                    {item.name}
                  </span>
                  <span className="font-mono text-muted-foreground text-xs tabular-nums">
                    {formatBytes(item.size)}
                  </span>
                  <StatusBadge
                    label={meta.label}
                    size="sm"
                    status={meta.status}
                  />
                  {item.status === "error" && onRetry ? (
                    <Button
                      aria-label={`Retry ${item.name}`}
                      onClick={() => onRetry(item.id)}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <RotateCcwIcon />
                    </Button>
                  ) : null}
                  {onRemove ? (
                    <Button
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemove(item.id)}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  ) : null}
                </div>

                {item.status === "uploading" ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      aria-label={`${item.name} upload`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={progress}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                    >
                      <div
                        className="h-full rounded-full bg-foreground motion-safe:transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-9 text-end font-mono text-muted-foreground text-xs tabular-nums">
                      {progress}%
                    </span>
                  </div>
                ) : null}

                {item.status === "error" && item.error ? (
                  <p className="mt-1 text-destructive-foreground text-xs">
                    {item.error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
