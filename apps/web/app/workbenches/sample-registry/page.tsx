"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MOCK_AS_OF,
  MOCK_SAMPLES,
} from "@/registry/default/workbenches/sample-registry/mock-data";
import { SampleRegistry } from "@/registry/default/workbenches/sample-registry/sample-registry";

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

export default function SampleRegistryPreviewPage() {
  const router = useRouter();
  const [demo, setDemo] = useState<DemoState>("ready");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (isDemoState(state)) {
      setDemo(state);
    }
  }, []);

  const empty = demo === "empty";

  return (
    <>
      <SampleRegistry
        asOf={MOCK_AS_OF}
        denied={demo === "denied"}
        error={
          demo === "error"
            ? "The registry service returned 503 after three retries."
            : null
        }
        loading={demo === "loading"}
        offline={demo === "offline"}
        onRetry={() => setDemo("ready")}
        onRunOpen={() => router.push("/workbenches/run-detail/")}
        samples={empty ? [] : MOCK_SAMPLES}
        syncToUrl
      />
      <p className="mt-3 text-muted-foreground text-xs print:hidden">
        Twelve synthetic samples across four studies. Filters and the open
        sample are in the URL; a linked run continues in Run Detail.
      </p>
    </>
  );
}
