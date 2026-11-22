"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LabDashboard } from "@/registry/default/workbenches/lab-dashboard/lab-dashboard";
import {
  MOCK_ACTIVITY,
  MOCK_ALERTS,
  MOCK_AS_OF,
  MOCK_INSTRUMENTS,
  MOCK_SAMPLES,
  MOCK_SCHEDULE,
} from "@/registry/default/workbenches/lab-dashboard/mock-data";
import type { InFlightSample } from "@/registry/default/workbenches/lab-dashboard/types";

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

export default function LabDashboardPreviewPage() {
  const router = useRouter();
  const [demo, setDemo] = useState<DemoState>("ready");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (isDemoState(state)) {
      setDemo(state);
    }
  }, []);

  function openSample(sample: InFlightSample) {
    router.push(`/workbenches/data-explorer/?sample=${sample.id}`);
  }

  const empty = demo === "empty";

  return (
    <>
      <LabDashboard
        activity={empty ? [] : MOCK_ACTIVITY}
        alerts={empty ? [] : MOCK_ALERTS}
        asOf={MOCK_AS_OF}
        denied={demo === "denied"}
        error={
          demo === "error"
            ? "The lab service returned 503 after three retries."
            : null
        }
        instruments={empty ? [] : MOCK_INSTRUMENTS}
        loading={demo === "loading"}
        offline={demo === "offline"}
        onRetry={() => setDemo("ready")}
        onSampleOpen={openSample}
        samples={empty ? [] : MOCK_SAMPLES}
        schedule={empty ? [] : MOCK_SCHEDULE}
        syncToUrl
      />
      <p className="mt-3 text-muted-foreground text-xs print:hidden">
        Demo lab with synthetic instruments and samples. The open instrument and
        active sample are in the URL; opening a sample continues in the Data
        Explorer.
      </p>
    </>
  );
}
