import type { LogEntry } from "@/registry/default/instruments/log-viewer";
import { LogViewer } from "@/registry/default/instruments/log-viewer";

const ENTRIES: LogEntry[] = [
  {
    id: "1",
    time: "14:02:03",
    dateTime: "2026-11-21T14:02:03Z",
    level: "info",
    source: "reader",
    message: "Plate 1 loaded (96 wells).",
  },
  {
    id: "2",
    time: "14:02:04",
    dateTime: "2026-11-21T14:02:04Z",
    level: "debug",
    source: "reader",
    message: "Gain 1.00; integration 0.10 s; 25 flashes.",
  },
  {
    id: "3",
    time: "14:02:11",
    dateTime: "2026-11-21T14:02:11Z",
    level: "info",
    source: "reader",
    message: "A1–H12 acquisition started.",
  },
  {
    id: "4",
    time: "14:03:42",
    dateTime: "2026-11-21T14:03:42Z",
    level: "warning",
    source: "reader",
    message: "Well D7 saturated at 4.12 × 10⁶ AU; result censored.",
  },
  {
    id: "5",
    time: "14:05:08",
    dateTime: "2026-11-21T14:05:08Z",
    level: "info",
    source: "analysis",
    message: "Background subtracted; 96 wells retained.",
  },
  {
    id: "6",
    time: "14:05:09",
    dateTime: "2026-11-21T14:05:09Z",
    level: "error",
    source: "export",
    message: "Write failed: /data/run-12.csv is read-only.",
  },
];

export function LogViewerDemo() {
  return <LogViewer entries={ENTRIES} title="Plate reader · run 12" />;
}
