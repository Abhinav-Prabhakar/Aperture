"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApertureMark } from "@/components/aperture-mark";
import { Button } from "@/registry/default/ui/button";
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
    <div className="min-h-svh bg-muted/24 print:min-h-0 print:bg-background">
      <header className="border-b bg-background print:hidden">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <ApertureMark className="size-5" title="" />
          <span className="font-heading font-semibold text-sm">Aperture</span>
          <span className="text-muted-foreground text-xs">
            / Workbenches / Lab Dashboard
          </span>
          <div className="ms-auto flex items-center gap-1">
            <Button
              render={<Link href="/docs/workbenches/lab-dashboard" />}
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

      <main className="mx-auto max-w-[110rem] p-3 sm:p-4 print:max-w-none print:p-0">
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
          Demo lab with synthetic instruments and samples. The open instrument
          and active sample are in the URL; opening a sample continues in the
          Data Explorer.
        </p>
      </main>
    </div>
  );
}
