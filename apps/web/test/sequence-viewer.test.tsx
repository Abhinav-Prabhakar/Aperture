import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  analyzeCds,
  findMatches,
  gcContent,
  isValidSequence,
  normalizeSequence,
  parseFasta,
  reverseComplement,
  type SequenceRecord,
  SequenceViewer,
  translate,
} from "@/registry/default/instruments/sequence-viewer";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
}

const CDS_FEATURE = {
  end: 12,
  id: "cds",
  kind: "CDS" as const,
  name: "Reporter",
  start: 1,
  strand: "+" as const,
};

const RECORD: SequenceRecord = {
  description: "A small synthetic construct used in tests.",
  features: [
    {
      end: 4,
      id: "promoter",
      kind: "promoter",
      name: "Promoter",
      start: 1,
      strand: "+",
    },
    CDS_FEATURE,
  ],
  id: "pTEST",
  name: "Test construct",
  sequence: "ATGGCTGCTTAA",
  source: "Synthetic · test",
  topology: "circular",
};

describe("sequence helpers", () => {
  it("normalizes case, whitespace, line numbers, and uracil", () => {
    expect(normalizeSequence(" 10 atg c\n20 UUA \t")).toBe("ATGCTTA");
  });

  it("rejects an empty or unsupported sequence", () => {
    expect(isValidSequence("  ")).toBe(false);
    expect(isValidSequence("ATGZ")).toBe(false);
    expect(isValidSequence("ATGY")).toBe(true);
  });

  it("computes GC content over canonical bases only", () => {
    expect(gcContent("ATGC")).toBe(50);
    expect(gcContent("GGCC")).toBe(100);
    expect(gcContent("NNNN")).toBeNull();
    expect(gcContent("GGNN")).toBe(100);
  });

  it("reverse-complements IUPAC bases", () => {
    expect(reverseComplement("ATGGCTTAA")).toBe("TTAAGCCAT");
    expect(reverseComplement("ACGT")).toBe("ACGT");
    expect(reverseComplement("RYSWKM")).toBe("KMWSRY");
  });

  it("translates complete codons and leaves a trailing partial codon alone", () => {
    expect(translate("ATGGCTTAA")).toBe("MA*");
    expect(translate("ATGGCT")).toBe("MA");
    expect(translate("NNN")).toBe("X");
  });

  it("finds overlapping, case-insensitive matches", () => {
    expect(findMatches("AAAAA", "aaa")).toEqual([
      { length: 3, start: 0 },
      { length: 3, start: 1 },
      { length: 3, start: 2 },
    ]);
    expect(findMatches("ATGC", "")).toEqual([]);
  });

  it("parses a single-record FASTA and ignores line numbers", () => {
    const record = parseFasta(
      ">pUC19 test construct\n10 atg gct\n20 taa\n>not a second record",
    );
    expect(record).toMatchObject({
      description: "test construct",
      id: "pUC19",
      name: "pUC19",
      sequence: "ATGGCTTAA",
    });
    expect(parseFasta("ATGGCTTAA")).toBeNull();
  });

  it("checks a CDS for start, stop, and frame", () => {
    const complete = analyzeCds(RECORD.sequence, CDS_FEATURE);
    expect(complete).toMatchObject({
      complete: true,
      lengthBp: 12,
      reason: null,
      startCodon: "ATG",
      stopCodon: "TAA",
      translation: "MAA*",
    });

    const missingStop = analyzeCds("ATGGCTTAC", {
      ...CDS_FEATURE,
      end: 9,
    });
    expect(missingStop.complete).toBe(false);
    expect(missingStop.reason).toContain("Stop is TAC");

    const wrongFrame = analyzeCds("ATGGCTTA", {
      ...CDS_FEATURE,
      end: 8,
    });
    expect(wrongFrame.reason).toContain("not a multiple of three");
  });

  it("reverse-complements a feature on the minus strand before translating", () => {
    const record = {
      sequence: reverseComplement("ATGGCTTAA"),
    };
    const analysis = analyzeCds(record.sequence, {
      end: 9,
      id: "reverse",
      kind: "CDS",
      name: "Reverse CDS",
      start: 1,
      strand: "-",
    });
    expect(analysis).toMatchObject({
      complete: true,
      translation: "MA*",
    });
  });
});

describe("SequenceViewer", () => {
  it("shows length, GC content, topology, and feature count", () => {
    render(<SequenceViewer record={RECORD} />);

    expect(
      screen.getByRole("heading", { name: "Test construct", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("12 bp").length).toBeGreaterThan(0);
    expect(screen.getByText("GC 41.7%")).toBeInTheDocument();
    expect(screen.getByText("2 features")).toBeInTheDocument();
  });

  it("selects a feature and shows its coordinates and translation", async () => {
    const user = userEvent.setup();
    const onFeatureSelect = vi.fn();
    render(
      <SequenceViewer
        defaultFeatureId="cds"
        onFeatureSelect={onFeatureSelect}
        record={RECORD}
      />,
    );

    expect(screen.getByText("MAA*")).toBeInTheDocument();
    expect(screen.getByText("1–12")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Promoter" }));
    expect(onFeatureSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "promoter" }),
    );
    expect(screen.getByRole("button", { name: "Promoter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("1–4")).toBeInTheDocument();
  });

  it("searches motifs and steps through matches", async () => {
    const user = userEvent.setup();
    render(<SequenceViewer record={RECORD} />);

    const search = screen.getByLabelText("Search sequence");
    await user.type(search, "gct");
    expect(screen.getByRole("status")).toHaveTextContent("1 / 2");

    await user.click(screen.getByRole("button", { name: "Next match" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 / 2");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("1 / 2");

    fireEvent.change(search, { target: { value: "XYZ" } });
    expect(screen.getByRole("status")).toHaveTextContent("No matches");
  });

  it("clamps a very small row width to a readable minimum", () => {
    const { container } = render(
      <SequenceViewer record={RECORD} rowWidth={5} />,
    );
    const rows = container.querySelectorAll('[data-slot="sequence-bases"] li');
    expect(rows).toHaveLength(2);
    expect(rows[1]?.textContent).toContain("11");
  });

  it("copies the normalized sequence", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<SequenceViewer record={RECORD} />);
    await user.click(screen.getByRole("button", { name: "Copy sequence" }));

    expect(writeText).toHaveBeenCalledWith("ATGGCTGCTTAA");
    expect(
      await screen.findByRole("button", { name: "Copied" }),
    ).toBeInTheDocument();
  });

  it("renders an explicit empty state", () => {
    render(<SequenceViewer record={null} />);
    expect(screen.getByText("No sequence loaded.")).toBeInTheDocument();
    expect(screen.queryByText("Copy sequence")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SequenceViewer defaultFeatureId="cds" record={RECORD} />,
    );
    await expectNoViolations(container);
  });
});
