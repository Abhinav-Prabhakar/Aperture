"use client";

import {
  reverseComplement,
  type SequenceRecord,
  SequenceViewer,
} from "@/registry/default/instruments/sequence-viewer";

const LENGTH = 1200;
const SENSE_CODONS = [
  "GCT",
  "GCC",
  "GCA",
  "GCG",
  "CGT",
  "CGC",
  "CGA",
  "CGG",
  "AGA",
  "AGG",
  "AAT",
  "AAC",
  "GAT",
  "GAC",
  "TGT",
  "TGC",
  "CAA",
  "CAG",
  "GAA",
  "GAG",
  "GGT",
  "GGC",
  "GGA",
  "GGG",
  "CAT",
  "CAC",
  "ATT",
  "ATC",
  "ATA",
  "TTA",
  "TTG",
  "CTT",
  "CTC",
  "CTA",
  "CTG",
  "AAA",
  "AAG",
  "TTT",
  "TTC",
  "CCT",
  "CCC",
  "CCA",
  "CCG",
  "TCT",
  "TCC",
  "TCA",
  "TCG",
  "AGT",
  "AGC",
  "ACT",
  "ACC",
  "ACA",
  "ACG",
  "TGG",
  "TAT",
  "TAC",
  "GTT",
  "GTC",
  "GTA",
  "GTG",
] as const;

function makeBackbone(): string {
  const bases = ["A", "C", "G", "T"] as const;
  let state = 0x6d2b79f5;
  let sequence = "";

  for (let index = 0; index < LENGTH; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    sequence += bases[(state >>> 16) & 3];
  }

  return sequence;
}

function patch(sequence: string, start: number, text: string): string {
  return sequence.slice(0, start) + text + sequence.slice(start + text.length);
}

function makeCds(codonCount: number, seed: number): string {
  let state = seed;
  let cds = "ATG";
  for (let index = 0; index < codonCount; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    cds += SENSE_CODONS[(state >>> 16) % SENSE_CODONS.length];
  }
  return `${cds}TAA`;
}

function makeSequence(): string {
  let sequence = makeBackbone();

  // T7 promoter, 41–76.
  sequence = patch(sequence, 40, "TAATACGACTCACTATAGGGGAATTGTGAGCGGATA");
  // Ribosome binding site, 101–107.
  sequence = patch(sequence, 100, "AGGAGGA");
  // Reporter CDS, 121–426: 306 bp, 100 codons plus start and stop.
  sequence = patch(sequence, 120, makeCds(100, 0x1f123bb5));
  // Terminator, 461–500.
  sequence = patch(
    sequence,
    460,
    "GGGGGGGGGGCCCCCCCCCC" + "TTTTTTTTTTTTTTTTTTTT",
  );
  // Unique EcoRI site, 541–546.
  sequence = patch(sequence, 540, "GAATTC");
  // Reverse-strand repressor CDS, 601–690: 90 bp, 28 codons plus start and stop.
  sequence = patch(sequence, 600, reverseComplement(makeCds(28, 0x4f1bbcdc)));
  // Unique HindIII site, 951–956.
  sequence = patch(sequence, 950, "AAGCTT");

  return sequence;
}

export const DEMO_SEQUENCE: SequenceRecord = {
  description:
    "Synthetic expression construct used in the Aperture docs. Not a real plasmid; the annotations are here to exercise the viewer.",
  features: [
    {
      end: 76,
      id: "t7",
      kind: "promoter",
      name: "T7 promoter",
      note: "Bacteriophage T7 promoter for in vitro transcription and bacterial expression.",
      start: 41,
      strand: "+",
    },
    {
      end: 107,
      id: "rbs",
      kind: "RBS",
      name: "RBS",
      start: 101,
      strand: "+",
    },
    {
      end: 426,
      id: "reporter-cds",
      kind: "CDS",
      name: "Reporter CDS",
      note: "Synthetic 100-codon coding sequence with an ATG start and TAA stop. Protein is illustrative, not a real reporter.",
      start: 121,
      strand: "+",
    },
    {
      end: 500,
      id: "terminator",
      kind: "terminator",
      name: "Terminator",
      start: 461,
      strand: "+",
    },
    {
      end: 546,
      id: "ecori",
      kind: "restriction",
      name: "EcoRI",
      note: "GAATTC. Unique site used to linearize the construct.",
      start: 541,
      strand: "+",
    },
    {
      end: 690,
      id: "repressor",
      kind: "CDS",
      name: "Repressor CDS",
      note: "Reverse-strand coding sequence. The viewer reverse-complements it before translation.",
      start: 601,
      strand: "-",
    },
    {
      end: 800,
      id: "origin",
      kind: "origin",
      name: "pUC origin",
      start: 701,
      strand: "+",
    },
    {
      end: 820,
      id: "m13-reverse",
      kind: "primer",
      name: "M13 reverse",
      start: 801,
      strand: "-",
    },
    {
      end: 956,
      id: "hindiii",
      kind: "restriction",
      name: "HindIII",
      note: "AAGCTT. Unique site in the backbone.",
      start: 951,
      strand: "+",
    },
  ],
  id: "pAP-01",
  name: "pAP-01 reporter construct",
  sequence: makeSequence(),
  source: "Synthetic · Aperture demo",
  topology: "circular",
};

export function SequenceViewerDemo() {
  return (
    <SequenceViewer defaultFeatureId="reporter-cds" record={DEMO_SEQUENCE} />
  );
}
