"use client";

import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";

export type LogLevel = "debug" | "info" | "warning" | "error";

export type LogEntry = {
  id: string;
  /** Display time. Keep it short: 14:02:11, not a full date. */
  time: string;
  /** Machine-readable timestamp for the time element. */
  dateTime?: string;
  level: LogLevel;
  message: React.ReactNode;
  /** Optional producer: reader, pump, worker. */
  source?: string;
};

const LEVELS: Array<{ value: "all" | LogLevel; label: string }> = [
  { value: "all", label: "All" },
  { value: "debug", label: "Debug" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warn" },
  { value: "error", label: "Error" },
];

const LEVEL_STYLE: Record<LogLevel, string> = {
  debug: "text-muted-foreground",
  info: "text-info-foreground",
  warning: "text-warning-foreground",
  error: "text-destructive-foreground",
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  debug: "Debug",
  info: "Info",
  warning: "Warn",
  error: "Error",
};

export type LogViewerProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title"
> & {
  entries: readonly LogEntry[];
  title?: React.ReactNode;
  /** Scroll to the newest entry as it arrives. */
  follow?: boolean;
  /** Show the level filter. */
  filterable?: boolean;
  /** Announce new entries. Off by default: a busy log is not a status line. */
  announce?: boolean;
  emptyLabel?: React.ReactNode;
  /** Height of the scrolling region. */
  height?: number | string;
};

export function LogViewer({
  entries,
  title = "Run log",
  follow: initialFollow = true,
  filterable = true,
  announce = false,
  emptyLabel = "No entries yet.",
  height = "18rem",
  className,
  ...props
}: LogViewerProps): React.ReactElement {
  const [level, setLevel] = React.useState<"all" | LogLevel>("all");
  const [follow, setFollow] = React.useState(initialFollow);
  const listRef = React.useRef<HTMLDivElement>(null);

  const visible =
    level === "all"
      ? entries
      : entries.filter((entry) => entry.level === level);
  const lastId = entries.at(-1)?.id;

  React.useEffect(() => {
    if (!follow || !lastId) {
      return;
    }
    const element = listRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [follow, lastId]);

  function toggleFollow() {
    const next = !follow;
    setFollow(next);
    if (next && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="log-viewer"
      {...props}
    >
      <header
        className="flex flex-wrap items-center gap-2 border-b bg-muted/32 px-3 py-2"
        data-slot="log-toolbar"
      >
        <h3 className="me-auto font-medium text-sm">{title}</h3>
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          {visible.length}
          {visible.length === entries.length ? null : ` / ${entries.length}`}
        </span>
        {filterable ? (
          <div
            aria-label="Filter by level"
            className="flex flex-wrap items-center gap-0.5"
            role="group"
          >
            {LEVELS.map((option) => (
              <Button
                aria-pressed={level === option.value}
                className="h-6 px-1.5 text-xs"
                key={option.value}
                onClick={() => setLevel(option.value)}
                size="sm"
                type="button"
                variant={level === option.value ? "secondary" : "ghost"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}
        <Button
          aria-pressed={follow}
          className="h-6 px-1.5 text-xs"
          onClick={toggleFollow}
          size="sm"
          type="button"
          variant={follow ? "secondary" : "ghost"}
        >
          Follow
        </Button>
      </header>

      <div
        aria-label={typeof title === "string" ? title : "Log"}
        aria-live={announce ? "polite" : "off"}
        className="overflow-auto overscroll-contain py-1"
        data-slot="log-list"
        ref={listRef}
        role="log"
        style={{ height }}
      >
        {visible.length === 0 ? (
          <p
            className="px-3 py-6 text-center text-muted-foreground text-sm"
            data-slot="log-empty"
          >
            {entries.length === 0 ? emptyLabel : "No entries at this level."}
          </p>
        ) : (
          <ol className="grid">
            {visible.map((entry) => (
              <li
                className="grid grid-cols-[5.25rem_3.5rem_1fr] items-baseline gap-x-2 px-3 py-1 text-xs leading-5 hover:bg-accent/40"
                data-level={entry.level}
                data-slot="log-entry"
                key={entry.id}
              >
                <time
                  className="font-mono text-muted-foreground tabular-nums"
                  dateTime={entry.dateTime}
                  data-slot="log-time"
                >
                  {entry.time}
                </time>
                <span
                  className={cn("font-mono", LEVEL_STYLE[entry.level])}
                  data-slot="log-level"
                >
                  {LEVEL_LABEL[entry.level]}
                </span>
                <span className="min-w-0 break-words" data-slot="log-message">
                  {entry.source ? (
                    <span className="me-2 font-mono text-muted-foreground">
                      {entry.source}
                    </span>
                  ) : null}
                  {entry.message}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
