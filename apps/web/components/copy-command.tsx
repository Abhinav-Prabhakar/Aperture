"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/default/ui/button";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="inline-flex max-w-full items-center gap-1 rounded-lg border bg-muted/40 py-1 ps-3 pe-1">
      <code className="truncate font-mono text-muted-foreground text-xs">
        <span aria-hidden="true" className="me-2 select-none opacity-60">
          $
        </span>
        {command}
      </code>
      <Button
        aria-label={copied ? "Copied" : `Copy ${command}`}
        onClick={copy}
        size="icon-xs"
        variant="ghost"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
