import type { TimelineItem } from "@/registry/default/instruments/timeline";
import { Timeline } from "@/registry/default/instruments/timeline";

const ITEMS: TimelineItem[] = [
  {
    id: "prep",
    title: "Plate prepared",
    description:
      "Compound dilution series in columns 1–12; 96 wells at 100 µL.",
    time: "08:42",
    dateTime: "2026-11-21T08:42:00Z",
    meta: "Operator: A. Rao · Plate 1",
  },
  {
    id: "calibration",
    title: "Reader calibrated",
    description: "Dark current and gain checked against the reference block.",
    time: "09:05",
    dateTime: "2026-11-21T09:05:00Z",
    status: "success",
  },
  {
    id: "acquisition",
    title: "Acquisition complete",
    description: "Absorbance at 600 nm, 25 flashes per well, 24 minutes.",
    time: "09:32",
    dateTime: "2026-11-21T09:32:00Z",
    status: "success",
  },
  {
    id: "analysis",
    title: "Background subtracted",
    description: "Blank wells B1–B3 used for the per-plate correction.",
    time: "09:40",
    dateTime: "2026-11-21T09:40:00Z",
  },
  {
    id: "warning",
    title: "One well censored",
    description:
      "D7 saturated the detector. Reported as > 4.12 × 10⁶ AU, not as a value.",
    time: "09:41",
    dateTime: "2026-11-21T09:41:00Z",
    status: "warning",
  },
];

export function TimelineDemo() {
  return <Timeline items={ITEMS} label="Run 12 events" />;
}
