import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { ExclusionLedgerDemo } from "@/registry/default/examples/exclusion-ledger-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Exclusion & Transformation Ledger",
  description:
    "An append-only record of every exclusion, transformation, imputation, and unit conversion, with reconciled counts and an export.",
};

export default function ExclusionLedgerPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Exclusion &amp; Transformation Ledger
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Every analysis set is the result of decisions. This instrument records
        them in order — what left, what changed, who decided, and why — and
        refuses to print an <span className="font-mono">n</span> that does not
        reconcile.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <ExclusionLedgerDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Forty-eight raw records become forty included. Two duplicates and two
        haemolysed samples leave first, then two withdrawn consents, one
        outlier, and one exhausted aliquot. The imputation and the unit
        conversion change values without changing the row count. Filter by kind
        and note that the export stays chronological.
      </p>

      <CodeBlock
        code={`import { ExclusionLedger } from "@/components/instruments/exclusion-ledger";

<ExclusionLedger
  title="Cohort 12 analysis set"
  entries={[
    {
      id: "L-001", kind: "exclusion",
      action: "Excluded haemolysed samples",
      target: "cohort-12/serum.csv",
      reason: "Haemolysis index above the assay's 3+ threshold",
      reasonCode: "HEM", actor: "R. Iyer",
      at: "2026-11-02T14:03:00Z",
      rowsBefore: 46, rowsAfter: 44, reversible: false,
    },
    {
      id: "L-002", kind: "imputation",
      action: "Imputed two missing glucose values",
      reason: "Analyser consumed the sample before the glucose channel ran",
      reasonCode: "IMPUTE_MEDIAN", actor: "R. Iyer",
      at: "2026-11-04T10:02:00Z",
      rowsBefore: 44, rowsAfter: 44, reversible: true,
      note: "Run median; sensitivity analysis in the supplement.",
    },
  ]}
  onExport={({ csv, json }) => archive({ csv, json })}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">The chain is continuous.</strong> Each
          entry must start where the previous one ended. A gap is a missing
          step, and the header says so instead of quietly reporting the last
          count.
        </li>
        <li>
          <strong className="font-medium">The arithmetic is shown.</strong>{" "}
          <span className="font-mono text-xs">raw − removed + added = included</span>{" "}
          is printed with the actual numbers. A reader can check it without
          trusting the component.
        </li>
        <li>
          <strong className="font-medium">Exclusions are counted by reason.</strong>{" "}
          The "why rows left" panel groups removals by reason code, so the
          methods paragraph writes itself: four haemolysed, two withdrawn
          consents, one outlier.
        </li>
        <li>
          <strong className="font-medium">Transformations are distinct from exclusions.</strong>{" "}
          A log transform, an imputation, and a unit conversion appear as their
          own kinds. They matter even when the row count does not move.
        </li>
        <li>
          <strong className="font-medium">Reversibility is explicit.</strong>{" "}
          "Yes" means the step can be undone from the recorded inputs; "No"
          means the sample or the consent is gone. Reviewers ask this.
        </li>
        <li>
          <strong className="font-medium">The export is the record.</strong> CSV
          for a supplement, JSON for the archive. Both carry every entry, not
          the filtered view.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        How reconciliation works
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Entries are sorted by <span className="font-mono text-xs">at</span> and
        read as a sequence. The first{" "}
        <span className="font-mono text-xs">rowsBefore</span> is the raw count;
        the last <span className="font-mono text-xs">rowsAfter</span> is the
        included count. Every negative delta is a removal and every positive
        delta an addition. If two adjacent entries disagree, the component
        reports the first disagreement by index, expected count, and found
        count.
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">This is a review aid, not a database constraint.</strong>{" "}
          The component cannot stop a team from editing its own source data. It
          can make an inconsistent ledger impossible to miss.
        </li>
        <li>
          <strong className="font-medium">One target per ledger.</strong>{" "}
          Counts only reconcile when every entry applies to the same record set.
          Use a separate ledger for a separate table.
        </li>
        <li>
          <strong className="font-medium">Reason codes are yours.</strong>{" "}
          <span className="font-mono text-xs">HEM</span>,{" "}
          <span className="font-mono text-xs">CONSENT</span>, and{" "}
          <span className="font-mono text-xs">OUTLIER_4SD</span> are strings;
          Aperture does not impose a taxonomy.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Entry.</strong>{" "}
          <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">kind</span> (exclusion,
          transformation, imputation, conversion),{" "}
          <span className="font-mono text-xs">action</span>,{" "}
          <span className="font-mono text-xs">target</span>,{" "}
          <span className="font-mono text-xs">reason</span>,{" "}
          <span className="font-mono text-xs">reasonCode</span>,{" "}
          <span className="font-mono text-xs">actor</span>,{" "}
          <span className="font-mono text-xs">at</span>,{" "}
          <span className="font-mono text-xs">rowsBefore</span>,{" "}
          <span className="font-mono text-xs">rowsAfter</span>,{" "}
          <span className="font-mono text-xs">reversible</span>, optional{" "}
          <span className="font-mono text-xs">linkedRun</span> and{" "}
          <span className="font-mono text-xs">note</span>.
        </li>
        <li>
          <strong className="font-medium">Timestamps.</strong> ISO 8601 strings.
          They are displayed as day, month, and time, and sorted lexically, which
          is correct for ISO.
        </li>
        <li>
          <strong className="font-medium">Counts.</strong> Non-negative integers.
          Values are clamped for the summary, but the table shows what was
          recorded.
        </li>
        <li>
          <strong className="font-medium">Export.</strong>{" "}
          <span className="font-mono text-xs">onExport</span> receives{" "}
          <span className="font-mono text-xs">{"{ csv, json }"}</span>.{" "}
          <span className="font-mono text-xs">ledgerCsv</span>,{" "}
          <span className="font-mono text-xs">ledgerJson</span>, and{" "}
          <span className="font-mono text-xs">summarizeLedger</span> are
          exported as pure helpers.
        </li>
        <li>
          <strong className="font-medium">Display order.</strong> Newest first on
          screen; chronological in every export. The footer says so.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The ledger is a table with a caption and a row header per entry; the
          step, reason, code, and actor are all text.
        </li>
        <li>
          Reconciliation state is announced as text, not only as a tint. The
          warning icon has an accessible label through the sentence beside it.
        </li>
        <li>
          Kind filters are buttons with{" "}
          <span className="font-mono text-xs">aria-pressed</span>, and the
          current filter is visible.
        </li>
        <li>
          The horizontal layout collapses at 640 px; actor and kind move into
          the step cell rather than forcing a sideways scroll.
        </li>
        <li>
          No motion beyond a hover tint. The ledger is a record, not a feed.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. It is the smallest instrument in the pack and the one that most
        often changes a conversation: the first time a team sees{" "}
        <span className="font-mono text-xs">n = 40</span> next to the eight
        records that left, the methods paragraph gets written from the ledger
        instead of from memory.
      </p>
    </article>
  );
}
