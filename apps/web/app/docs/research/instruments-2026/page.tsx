import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/registry/default/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export const metadata: Metadata = {
  title: "What researchers need",
  description:
    "The audit behind the research-record instruments: what the evidence says, the six kinds of state a research UI must carry, and the test a component has to pass.",
};

const AUDIT = [
  ["8", "Generic patterns", "Stat, Sparkline, Timeline, Status Badge, Log Viewer, Metadata Editor, File Dropzone, Data Table."],
  ["3", "Measurement primitives", "Scientific Number, Quantity Input, Uncertainty Input. These already encode a unit, a precision, or an error."],
  ["7", "Domain or workflow views", "Sequence Viewer, Growth Curve, Dose–Response, Spectrum Plot, Periodic Table, Constants Reference, Protocol Steps."],
  ["0", "Research-act records", "Nothing recorded what was excluded, calibrated, compared, approved, or used to produce a figure."],
] as const;

const EVIDENCE = [
  [
    "Spreadsheet identifiers",
    "30.9% of papers with Excel gene lists",
    "3,436 papers, 5,086 files; up from 19.6% in the original scan. Generic tables still coerce SEPT2 into a date.",
  ],
  [
    "Notebook reproducibility",
    "24.11% executed; 4.03% reproduced",
    "A large Jupyter study. Hidden state and out-of-order cells are the norm, not the exception.",
  ],
  [
    "Error bars",
    "49% SE · 42% SD · 5% unspecified · one 95% CI",
    "A review of Nature Methods articles. The bar exists; the contract for what it means does not.",
  ],
  [
    "Reporting compliance",
    "Randomization 30–40%; blinding ~20%; sample size <10%",
    "ARRIVE 2.0. The decisions were made months before the checklist was opened.",
  ],
  [
    "Sample identity",
    "4 misidentifications in 284 isolations (1.4%)",
    "One biobank, with SOPs in place. The failure was a label, an aliquot, or a handoff.",
  ],
  [
    "Data handling",
    "84% of 286 researchers; 14% had a LIMS",
    "A mixed-method study. Spreadsheets remain the lab database, and the backlog is measured in person-hours.",
  ],
] as const;

const STATES = [
  ["Identity", "What is this, exactly?", "Dataset Card"],
  ["Provenance", "Where did it come from, and what happened to it?", "Exclusion Ledger, Reproducibility Manifest"],
  ["Uncertainty", "How sure are we, and what is missing?", "Measurement Table, Missingness Map, Statistical Result"],
  ["Disposition", "What did we decide to do with it?", "Exclusion Ledger, Calibration & QC"],
  ["Comparability", "Can these be compared?", "Measurement Table, Run Comparison"],
  ["Compliance", "Does it meet the standard?", "Calibration & QC, Reproducibility Manifest"],
] as const;

const PACK = [
  ["Measurement Table", "Units, precision, missing codes, detection limits, uncertainty, and an export that keeps them.", "Ready"],
  ["Exclusion & Transformation Ledger", "Every exclusion, transformation, imputation, and conversion, with reconciled counts.", "Ready"],
  ["Statistical Result Block", "Estimate, interval, n, test, exact p-value, effect size, assumptions.", "Ready"],
  ["Missingness & Censoring Map", "Missing, censored, not applicable, and not collected kept distinct.", "Ready"],
  ["Dataset Card", "Identity, stage, license, checksum, DOI, access, relations, citation.", "Ready"],
  ["Run Comparison", "Unit-aware diffs with tolerance, missing values, and a refusal to subtract across units.", "Ready"],
  ["Calibration & QC Panel", "Standards, blanks, LOD/LOQ, Levey–Jennings, Westgard rules, release verdict.", "Preview"],
  ["Reproducibility Manifest", "Commit, command, environment, packages, seeds, and hashed inputs and outputs.", "Ready"],
] as const;

export default function ResearchMemoPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Research memo</Badge>
        <Badge variant="outline">24 November 2026</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        What researchers actually need
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The first eighteen instruments proved that a research design system can
        exist. They did not yet prove why it needs to. This is the audit that
        changed the catalog: what the evidence says, the six kinds of state
        generic UI has no representation for, and the eight instruments built
        from that finding.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        The audit
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        Eighteen instruments sounds like a lot until each one is asked what
        research invariant it encodes. Eight are generic patterns with research
        styling. Three are real measurement primitives. Seven are domain or
        workflow views. None of the eighteen record what happens between
        acquisition and publication.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-end">Count</TableHead>
              <TableHead>What it really is</TableHead>
              <TableHead className="hidden sm:table-cell">Instruments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AUDIT.map(([count, kind, detail]) => (
              <TableRow key={kind}>
                <TableCell className="text-end font-mono tabular-nums">
                  {count}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {kind}
                </TableCell>
                <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">
                  {detail}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 max-w-prose text-muted-foreground text-sm leading-relaxed">
        The count is not the problem; the semantic density is. A competent team
        can build eight of these in a sprint. A research team cannot build the
        missing layer without domain rules, standards, and edge cases. That is
        what a registry should package.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What the evidence says
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        The memo is desk research: peer-reviewed studies of data practice and
        reproducibility, reporting standards, and a review of adjacent
        libraries. No primary interviews were conducted. The numbers below are
        the ones that shaped the build.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Reported rate</TableHead>
              <TableHead className="hidden md:table-cell">Why it matters</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EVIDENCE.map(([problem, rate, detail]) => (
              <TableRow key={problem}>
                <TableCell className="align-top font-medium">{problem}</TableCell>
                <TableCell className="whitespace-normal align-top font-mono text-xs">
                  {rate}
                </TableCell>
                <TableCell className="hidden whitespace-normal align-top text-muted-foreground md:table-cell">
                  {detail}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 max-w-prose text-muted-foreground text-sm leading-relaxed">
        Read together, the failures are not statistical. They are record-keeping
        failures with statistical consequences: a typed identifier became a
        date; a run was never repeated outside one machine; an error bar had no
        stated meaning; a checklist was reconstructed after the fact; a sample
        label was lost at a handoff. A chart library cannot prevent any of them.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Six kinds of state
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        This taxonomy is the real product architecture. It applies in life
        sciences, physical sciences, social sciences, and computational
        research, which is why the instruments are not filed under a domain
        pack.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>The question it answers</TableHead>
              <TableHead className="hidden sm:table-cell">
                Built instrument
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STATES.map(([state, question, instrument]) => (
              <TableRow key={state}>
                <TableCell className="font-medium">{state}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {question}
                </TableCell>
                <TableCell className="hidden whitespace-normal sm:table-cell">
                  {instrument}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        The test
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        A candidate is an instrument only if it scores well on all six
        criteria. Score each 0–2. Shortlist at 9/12; build at 10/12 with a clear
        owner.
      </p>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Object or act.</strong> It represents
          a research object — sample, dataset, run, figure — or a research act:
          exclude, calibrate, compare, approve, publish.
        </li>
        <li>
          <strong className="font-medium">Prevents a known error.</strong> It
          blocks a documented failure mode: unit mismatch, silent exclusion,
          identifier corruption, uncorrected p-values, lost metadata.
        </li>
        <li>
          <strong className="font-medium">Cross-domain.</strong> It is useful in
          at least three disciplines, or two domain packs plus a computational
          workflow.
        </li>
        <li>
          <strong className="font-medium">Not generic.</strong> A competent team
          cannot build it correctly from a generic UI kit without domain rules
          or standards.
        </li>
        <li>
          <strong className="font-medium">Copy-paste sized.</strong> One compound
          component or a small family, with no backend required for the demo.
        </li>
        <li>
          <strong className="font-medium">Produces an artifact.</strong> CSV,
          JSON, manifest, audit trail, figure, or submission-ready text — not
          just a view.
        </li>
      </ol>
      <p className="mt-3 max-w-prose text-muted-foreground text-sm leading-relaxed">
        The companion rule: an instrument must compose at least three atoms and
        enforce at least one research invariant. If it can be assembled from
        elements in an afternoon without domain knowledge, it is an element, not
        an instrument.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What was built
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        The first pack tells one story: from instrument file to a comparable,
        documented dataset without losing the evidence. Seven are Ready;
        Calibration &amp; QC stays in Preview until a laboratory advisor reviews
        its defaults.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instrument</TableHead>
              <TableHead className="hidden sm:table-cell">Job</TableHead>
              <TableHead className="text-end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PACK.map(([name, job, status]) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell className="hidden max-w-md whitespace-normal text-muted-foreground sm:table-cell">
                  {job}
                </TableCell>
                <TableCell className="text-end">
                  <Badge
                    size="sm"
                    variant={status === "Ready" ? "success" : "outline"}
                  >
                    {status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What changed in the catalog
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Generic patterns stay in the catalog, but the memo names them for what
          they are. Eight of the founding eighteen are patterns; only the
          research records are held to the twelve-point test.
        </li>
        <li>
          The research-record group sits beside the domain packs, not inside
          them. A Measurement Table is the same instrument in a biochemistry lab,
          a materials lab, and a survey archive.
        </li>
        <li>
          The build order is by leverage, not pipeline order: the table first,
          then the ledger, then calibration, then comparison, then identity. The
          workbench recipes in the memo show how the pieces compose.
        </li>
        <li>
          The count is no longer the headline. A semantic layer that records
          identity, provenance, uncertainty, disposition, comparability, and
          compliance is worth more than another chart.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What is not built
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        The memo lists twenty instruments. This pack is eight of them,
        deliberately the ones that carry the most evidence per line of code.
        Still ahead: Import Mapper, Sample Lineage, Run Card, Provenance Graph,
        Review &amp; Curation Queue, Inter-rater Agreement, Reporting Checklist,
        Preregistration Diff, Screening Flow, Plate Layout, Ontology Picker, and
        Figure Spec. Each has a contract and a score in the full memo.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Read the memo
      </h2>
      <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
        The full document is about 5,200 words: the complete audit, twenty
        scored instruments with contracts and atom lists, the considered-and-
        rejected table, workbench recipes, the ecosystem gap, and the sources.
        It is the design record for this layer, not a marketing page.
      </p>
      <p className="mt-3 text-sm">
        <a
          className="underline underline-offset-4"
          href="https://github.com/abhinav-prabhakar/Aperture/blob/main/docs/research/instruments-2026.md"
        >
          Read “What researchers actually need from Aperture” on GitHub
        </a>
      </p>
      <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
        Start with the{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/measurement-table"
        >
          Measurement Table
        </Link>{" "}
        or the{" "}
        <Link
          className="underline underline-offset-4"
          href="/docs/instruments/exclusion-ledger"
        >
          Exclusion &amp; Transformation Ledger
        </Link>{" "}
        — the two that most often change how a team talks about its own data.
      </p>
    </article>
  );
}
