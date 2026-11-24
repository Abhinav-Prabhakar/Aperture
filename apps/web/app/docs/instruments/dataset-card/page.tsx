import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DatasetCardDemo } from "@/registry/default/examples/dataset-card-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Dataset Card",
  description:
    "One dataset's identity: owner, version, stage, license, DOI, format, size, checksum, method, access, related records, and a generated citation.",
};

export default function DatasetCardPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Dataset Card
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        A card that shows fields is a card. A dataset card knows which fields are
        required, says "not recorded" when one is absent, distinguishes raw from
        derived from published, and produces a citation from the same record it
        displays.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <DatasetCardDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A raw serum export at version 1.2.0. The completeness strip counts eight
        required fields, the checksum and citation copy in one action, and the
        related records point at the run that produced the file and the analysis
        set derived from it. The warning keeps the disclosure attached to the
        data, not buried in a README.
      </p>

      <CodeBlock
        code={`import { DatasetCard } from "@/components/instruments/dataset-card";

<DatasetCard
  dataset={{
    id: "DS-COHORT12-SERUM",
    title: "Cohort 12 serum chemistry, raw export",
    description: "Fasting serum chemistry for 48 adults at two sites.",
    stage: "raw",
    version: "1.2.0",
    owner: "Prabhakar Lab",
    license: "CC BY-NC 4.0",
    access: "restricted",
    accessNote: "Data-use agreement required.",
    format: "CSV + data dictionary",
    size: "412 KB",
    checksum: { algorithm: "sha256", value: "9f2c41b7…" },
    method: "Venepuncture at 08:00; AU5800, two-point calibration.",
    doi: "10.5281/zenodo.0000000",
    repository: "Zenodo",
    createdAt: "2026-10-18",
    updatedAt: "2026-11-05",
    related: [
      { id: "RUN-118", label: "AU5800 run, 2 Nov", relation: "derivedFrom" },
    ],
  }}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Completeness is counted, not implied.</strong>{" "}
          Eight required fields are checked: title, description, owner, license,
          method, checksum, access, and version. The strip names what is missing.
        </li>
        <li>
          <strong className="font-medium">A missing checksum is a warning.</strong>{" "}
          Not a blank line. The bytes cannot be verified, and the card says so in
          the integrity column.
        </li>
        <li>
          <strong className="font-medium">Stage is explicit.</strong> Raw,
          derived, and published datasets have different obligations and
          different citations. The badge makes the difference visible before the
          title.
        </li>
        <li>
          <strong className="font-medium">Access conditions travel with the data.</strong>{" "}
          Open, restricted, embargoed, or closed, plus the note that says what a
          requester must do.
        </li>
        <li>
          <strong className="font-medium">The citation is generated.</strong>{" "}
          Owner, year, title, version, repository, and DOI become a DataCite-style
          citation. Override it when the repository has its own format.
        </li>
        <li>
          <strong className="font-medium">Relationships are directional.</strong>{" "}
          Derived from, supersedes, part of, documents. A dataset is rarely an
          island, and "derived from" is the link an auditor asks for.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it refuses to do
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          It does not upload, fetch, or mint a DOI. The card is a record of the
          identifier, not a client for the repository.
        </li>
        <li>
          It does not validate that the checksum matches the bytes; that requires
          the bytes. It records the algorithm and the value so a pipeline can.
        </li>
        <li>
          It does not decide whether a license is appropriate. It refuses to let
          the license be absent without saying so.
        </li>
        <li>
          It does not render a visibility switcher or an edit form. Pair it with
          Metadata Editor when the record is being authored.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Required.</strong>{" "}
          <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">title</span>,{" "}
          <span className="font-mono text-xs">stage</span>,{" "}
          <span className="font-mono text-xs">version</span>, and{" "}
          <span className="font-mono text-xs">owner</span>.
        </li>
        <li>
          <strong className="font-medium">Optional.</strong> Description,
          affiliation, contributors, license, DOI, repository, format, size,
          checksum, method, dates, access and access note, keywords, related
          records, a citation override, and a warning.
        </li>
        <li>
          <strong className="font-medium">Checksum.</strong>{" "}
          <span className="font-mono text-xs">{"{ algorithm, value }"}</span>. The
          full hash is displayed and copied; the completeness strip shows only a
          prefix.
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">datasetChecklist</span>,{" "}
          <span className="font-mono text-xs">datasetCitation</span>, and{" "}
          <span className="font-mono text-xs">datasetMetadataJson</span> are
          exported. The JSON contains the checks and the citation, so an archive
          can store one artifact.
        </li>
        <li>
          <strong className="font-medium">Custom requirements.</strong> Pass{" "}
          <span className="font-mono text-xs">requiredFields</span> to check a
          funder's or repository's set instead of the default eight.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          Identity is a definition list, not a grid of divs; each label is
          associated with its value.
        </li>
        <li>
          Completeness is announced as "6 of 8 required fields recorded" plus the
          missing names. The percentage is a supplement, not the message.
        </li>
        <li>
          The checksum wraps at character boundaries instead of forcing a
          horizontal scroll, and the copy action reports success in text.
        </li>
        <li>
          Badges carry words, not just tone: Raw, v1.2.0, DOI. Color is never the
          only signal.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. It is the identity layer the other instruments link to: the
        Measurement Table is a view of a dataset, the ledger explains how its
        analysis set was made, and the manifest records the runs that touched it.
      </p>
    </article>
  );
}
