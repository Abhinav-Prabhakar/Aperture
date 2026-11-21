"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApertureMark } from "@/components/aperture-mark";
import { Button } from "@/registry/default/ui/button";
import { DataExplorer } from "@/registry/default/workbenches/data-explorer/data-explorer";
import { MOCK_SAMPLES } from "@/registry/default/workbenches/data-explorer/mock-data";

type DemoState = "ready" | "loading" | "error" | "denied" | "empty" | "offline";

const STATES: readonly DemoState[] = [
  "ready",
  "loading",
  "error",
  "denied",
  "empty",
  "offline",
];

function isDemoState(value: string | null): value is DemoState {
  return value !== null && STATES.includes(value as DemoState);
}

export default function DataExplorerPreviewPage() {
  const [demo, setDemo] = useState<DemoState>("ready");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (isDemoState(state)) {
      setDemo(state);
    }
  }, []);

  return (
    <div className="min-h-svh bg-muted/24">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <ApertureMark className="size-5" title="" />
          <span className="font-heading font-semibold text-sm">Aperture</span>
          <span className="text-muted-foreground text-xs">
            / Workbenches / Data Explorer
          </span>
          <div className="ms-auto flex items-center gap-1">
            <Button
              render={<Link href="/docs/workbenches/data-explorer" />}
              size="xs"
              variant="ghost"
            >
              Docs
            </Button>
            <Button render={<Link href="/" />} size="xs" variant="ghost">
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[110rem] p-3 sm:p-4">
        <DataExplorer
          denied={demo === "denied"}
          error={
            demo === "error"
              ? "The run service returned 503 after three retries."
              : null
          }
          loading={demo === "loading"}
          offline={demo === "offline"}
          onRetry={() => setDemo("ready")}
          samples={demo === "empty" ? [] : MOCK_SAMPLES}
          syncToUrl
        />
        <p className="mt-3 text-muted-foreground text-xs">
          Demo run with synthetic samples. Filters and the open sample are in
          the URL; the export is a real CSV of the current view.
        </p>
      </main>
    </div>
  );
}
