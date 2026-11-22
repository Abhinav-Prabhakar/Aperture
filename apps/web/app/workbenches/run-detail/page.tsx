"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_RUN } from "@/registry/default/workbenches/run-detail/mock-data";
import { RunDetail } from "@/registry/default/workbenches/run-detail/run-detail";
import type {
  RunArtifact,
  RunRecord,
} from "@/registry/default/workbenches/run-detail/types";

type DemoState =
  | "ready"
  | "loading"
  | "error"
  | "denied"
  | "missing"
  | "offline";

const STATES: readonly DemoState[] = [
  "ready",
  "loading",
  "error",
  "denied",
  "missing",
  "offline",
];

function isDemoState(value: string | null): value is DemoState {
  return value !== null && STATES.includes(value as DemoState);
}

export default function RunDetailPreviewPage() {
  const router = useRouter();
  const [demo, setDemo] = useState<DemoState>("ready");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (isDemoState(state)) {
      setDemo(state);
    }
  }, []);

  function openData(_run: RunRecord) {
    router.push("/workbenches/data-explorer/?run=RUN-2026-1120");
  }

  function openArtifact(artifact: RunArtifact) {
    const body = [
      "Aperture Run Detail — synthetic artifact",
      "",
      `Run: ${MOCK_RUN.id}`,
      `Artifact: ${artifact.name}`,
      `Kind: ${artifact.kind}`,
      `Size: ${artifact.sizeBytes} bytes`,
      `SHA-256: ${artifact.checksum}`,
      `Created: ${artifact.createdAt}`,
      "",
      artifact.description,
      "",
      "Replace onArtifactOpen with your download URL or object-store call.",
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${artifact.name}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <>
      <RunDetail
        denied={demo === "denied"}
        error={
          demo === "error"
            ? "The run service returned 503 after three retries."
            : null
        }
        loading={demo === "loading"}
        offline={demo === "offline"}
        onArtifactOpen={openArtifact}
        onOpenData={openData}
        onRetry={() => setDemo("ready")}
        run={demo === "missing" ? null : MOCK_RUN}
        syncToUrl
      />
      <p className="mt-3 text-muted-foreground text-xs print:hidden">
        One completed plate read with six artifacts. The open artifact is in the
        URL; print produces the full report.
      </p>
    </>
  );
}
