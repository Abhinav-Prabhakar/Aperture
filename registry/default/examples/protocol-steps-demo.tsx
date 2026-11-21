import type { ProtocolStep } from "@/registry/default/instruments/protocol-steps";
import { ProtocolSteps } from "@/registry/default/instruments/protocol-steps";

const STEPS: ProtocolStep[] = [
  {
    id: "lyse",
    title: "Lyse cells",
    description: "Resuspend the pellet in 200 µL ice-cold RIPA buffer.",
    duration: "10 min",
    status: "complete",
  },
  {
    id: "denature",
    title: "Reduce and denature",
    description: "Add loading dye and heat the sample to 95 °C.",
    duration: "5 min at 95 °C",
    status: "complete",
  },
  {
    id: "load",
    title: "Load the gel",
    description: "Load 20 µg total protein per lane; include the ladder.",
    duration: "15 min",
    status: "active",
    note: {
      kind: "caution",
      text: "Do not overfill the wells; sample will spill into the running buffer.",
    },
  },
  {
    id: "run",
    title: "Run the gel",
    description:
      "Run at constant voltage until the dye front reaches the base.",
    duration: "45 min at 120 V",
    status: "pending",
  },
  {
    id: "transfer",
    title: "Transfer to membrane",
    description: "Wet transfer inTowbin buffer with 20% methanol.",
    duration: "60 min at 100 V",
    status: "pending",
    note: {
      kind: "note",
      text: "Keep the membrane methanol-wet throughout the transfer.",
    },
  },
];

export function ProtocolStepsDemo() {
  return <ProtocolSteps label="Western blot · day 1" steps={STEPS} />;
}
