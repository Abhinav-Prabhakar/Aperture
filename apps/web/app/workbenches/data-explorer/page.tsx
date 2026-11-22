"use client";

import { useEffect, useState } from "react";
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
    <>
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
        Demo run with synthetic samples. Filters and the open sample are in the
        URL; the export is a real CSV of the current view.
      </p>
    </>
  );
}
