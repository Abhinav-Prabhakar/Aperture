import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { SequenceViewerDemo } from "@/registry/default/examples/sequence-viewer-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Sequence Viewer",
  description:
    "A DNA record with features, strand-aware CDS translation, motif search, GC content, and copy. The first life-sciences instrument.",
};

export default function SequenceViewerPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Life sciences</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Sequence Viewer
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A sequence record is annotations, not a string. Coordinates, strands,
        features, and translations stay visible together — from a FASTA file to
        a coding sequence you need to check.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <SequenceViewerDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        The demo is a synthetic 1,200 bp construct, not a real plasmid. Select a
        feature, search for a motif, or copy the normalized sequence. The CDS is
        selected on load so its translation and completeness check are visible.
      </p>

      <CodeBlock
        code={`import { SequenceViewer } from "@/components/instruments/sequence-viewer";

<SequenceViewer
  record={{
    id: "pAP-01",
    name: "pAP-01 reporter construct",
    sequence: fastaSequence,
    topology: "circular",
    features: [
      {
        id: "reporter-cds",
        name: "Reporter CDS",
        kind: "CDS",
        start: 121,
        end: 426,
        strand: "+",
      },
    ],
  }}
  defaultFeatureId="reporter-cds"
  onFeatureSelect={(feature) => setSelectedFeature(feature)}
  onCopy={(sequence) => track("sequence-copy")}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Coordinates are 1-based and
          inclusive.</strong>{" "}
          A feature from 121 to 426 is 306 bases. The viewer reports the length;
          it does not make you subtract in your head.
        </li>
        <li>
          <strong className="font-medium">CDS completeness is explicit.</strong>{" "}
          A coding sequence must start with ATG, end with TAA, TAG, or TGA, and
          have a length divisible by three. Anything else is a warning with the
          reason, not a silent translation.
        </li>
        <li>
          <strong className="font-medium">Strand is handled.</strong> A feature
          on the minus strand is reverse-complemented before translation. The
          sequence track still shows the bases as stored.
        </li>
        <li>
          <strong className="font-medium">Search is exact and overlapping.</strong>{" "}
          Motif search is case-insensitive, ignores whitespace, and reports
          every start position. <span className="font-mono">GCT</span> in{" "}
          <span className="font-mono">ATGGCTGCTTAA</span> has two hits.
        </li>
        <li>
          <strong className="font-medium">GC is a measurement, not a
          decoration.</strong>{" "}
          It is computed over A, C, G, and T only. Ambiguous bases are ignored,
          and a sequence with no canonical bases reports{" "}
          <span className="font-mono">—</span>.
        </li>
        <li>
          <strong className="font-medium">Unsupported bases are shown.</strong>{" "}
          The record still renders, with a warning. Hiding a bad character is
          worse than showing it.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Record in.</strong>{" "}
          <span className="font-mono text-xs">record</span> is null or an object
          with <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">name</span>,{" "}
          <span className="font-mono text-xs">sequence</span>, an optional{" "}
          <span className="font-mono text-xs">topology</span>,{" "}
          <span className="font-mono text-xs">source</span>, and{" "}
          <span className="font-mono text-xs">features</span>. Null renders the
          empty state.
        </li>
        <li>
          <strong className="font-medium">Features are annotations.</strong>{" "}
          Each has a stable <span className="font-mono text-xs">id</span>, a{" "}
          <span className="font-mono text-xs">kind</span>, a name,{" "}
          <span className="font-mono text-xs">start</span> and{" "}
          <span className="font-mono text-xs">end</span>, and an optional{" "}
          <span className="font-mono text-xs">strand</span> and note. Kinds are
          CDS, promoter, RBS, terminator, origin, primer, restriction,
          regulatory, and other.
        </li>
        <li>
          <strong className="font-medium">Selection in and out.</strong>{" "}
          <span className="font-mono text-xs">defaultFeatureId</span> sets the
          first selection;{" "}
          <span className="font-mono text-xs">onFeatureSelect(feature)</span>{" "}
          reports changes. The viewer never fetches or mutates the record.
        </li>
        <li>
          <strong className="font-medium">Copy out.</strong>{" "}
          <span className="font-mono text-xs">onCopy(sequence)</span> fires with
          the normalized sequence — uppercase, no whitespace or line numbers,
          U converted to T.
        </li>
        <li>
          <strong className="font-medium">Pure helpers are exported.</strong>{" "}
          <span className="font-mono text-xs">normalizeSequence</span>,{" "}
          <span className="font-mono text-xs">reverseComplement</span>,{" "}
          <span className="font-mono text-xs">translate</span>,{" "}
          <span className="font-mono text-xs">findMatches</span>,{" "}
          <span className="font-mono text-xs">gcContent</span>,{" "}
          <span className="font-mono text-xs">analyzeCds</span>, and{" "}
          <span className="font-mono text-xs">parseFasta</span>. Use them on the
          server, in a script, or in your own validation.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Every feature is a labeled button with{" "}
          <span className="font-mono text-xs">aria-pressed</span>; the compact
          track is a second control with the same accessible name.
        </li>
        <li>
          Search has a visible label association, and the match count is a live
          status region. An unmatched query says “No matches” instead of going
          blank.
        </li>
        <li>
          The copy button changes its label to “Copied” and back, so the state is
          available without a toast.
        </li>
        <li>
          Status is never color alone: the warning has text, and the feature
          legend uses labels alongside the tracks.
        </li>
        <li>
          Layout uses logical properties and wraps bases at narrow widths, so RTL
          and 320 px screens do not create a horizontal scroll trap.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Preview status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        The API and rendering are complete and tested. The life-sciences
        vocabulary and defaults are still awaiting a domain-advisor review, so
        this instrument is marked preview rather than ready. Treat it as usable,
        not final.
      </p>
    </article>
  );
}
