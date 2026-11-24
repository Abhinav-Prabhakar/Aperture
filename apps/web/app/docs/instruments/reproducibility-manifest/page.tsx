import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { ReproducibilityManifestDemo } from "@/registry/default/examples/reproducibility-manifest-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Reproducibility Manifest",
  description:
    "A portable record of the commit, command, environment, packages, parameters, seeds, and hashed inputs and outputs behind a result.",
};

export default function ReproducibilityManifestPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Research records</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Reproducibility Manifest
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        "It ran on my machine" is not a record. A manifest is: the exact commit,
        the command, the environment, the package versions, the seeds, and a hash
        for every input and output. It is the difference between a result someone
        can repeat and a screenshot someone has to trust.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <ReproducibilityManifestDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        A clean run of a mixed-model script: commit, command, R version, six
        pinned packages, parameters, a seed, three hashed inputs, and two hashed
        outputs. The checks panel shows six of six. Copy the JSON, export it next
        to the results, or copy the reproduce command.
      </p>

      <CodeBlock
        code={`import { ReproducibilityManifest } from "@/components/instruments/reproducibility-manifest";

<ReproducibilityManifest
  manifest={{
    id: "MAN-2026-11-09-1422",
    project: "Cohort 12 — mixed models",
    createdAt: "2026-11-09T14:22:08Z",
    commit: "8c41d9e2b7f0a6d3c5e8b1a4f7d0c3e6b9a2f5d8",
    branch: "main",
    dirty: false,
    durationSeconds: 184,
    environment: {
      language: "R", version: "4.4.2",
      platform: "linux-x86_64, Ubuntu 24.04",
      packages: [{ name: "lme4", version: "1.1-37" }],
    },
    command: "Rscript analysis/04_mixed_models.R --config config/cohort12.yml",
    params: { method: "lmer", missing: "complete-case", alpha: 0.05 },
    seeds: { bootstrap: 20261109 },
    inputs: [
      { path: "data/cohort12/serum_analysis.csv",
        hash: "sha256:41c9a7e2…", bytes: 42112 },
    ],
    outputs: [
      { path: "results/cohort12_model.rds",
        hash: "sha256:9f2c41b7…", bytes: 186240 },
    ],
  }}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it checks
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">A dirty tree is called out.</strong>{" "}
          Uncommitted changes mean the commit does not contain the code that ran.
          The manifest says so before the command.
        </li>
        <li>
          <strong className="font-medium">Every input and output needs a hash.</strong>{" "}
          A path alone identifies a name, not bytes. Missing hashes are listed,
          and the reproduce command is withheld when the tree is dirty.
        </li>
        <li>
          <strong className="font-medium">The environment is pinned.</strong>{" "}
          Language, version, platform, and package versions. A manifest with no
          package list is marked incomplete.
        </li>
        <li>
          <strong className="font-medium">Seeds are part of the result.</strong>{" "}
          A stochastic analysis without a seed is not reproducible, even if the
          command is. Seeds render as their own block.
        </li>
        <li>
          <strong className="font-medium">The command is shown, not summarized.</strong>{" "}
          The exact string, with a copy action and a{" "}
          <span className="font-mono text-xs">git checkout … &amp;&amp; …</span>{" "}
          recipe when the tree is clean.
        </li>
        <li>
          <strong className="font-medium">One artifact holds it all.</strong> The
          export is a JSON document with the record, the checks, the warnings,
          and the reproduce command.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        What it cannot do
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          It does not compute hashes, inspect the repository, or read the
          environment. Your runner produces the facts; the manifest records and
          validates them.
        </li>
        <li>
          It does not guarantee that a checkout will rebuild the environment.
          Pinning versions is necessary, not sufficient; containers and lockfiles
          still matter.
        </li>
        <li>
          It does not prove the result is correct. It proves the result is
          traceable, which is a lower and more achievable bar.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Data contract
      </h2>
      <ol className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <strong className="font-medium">Identity.</strong>{" "}
          <span className="font-mono text-xs">id</span>,{" "}
          <span className="font-mono text-xs">project</span>,{" "}
          <span className="font-mono text-xs">createdAt</span>,{" "}
          <span className="font-mono text-xs">commit</span>, optional{" "}
          <span className="font-mono text-xs">branch</span>, and{" "}
          <span className="font-mono text-xs">dirty</span>.
        </li>
        <li>
          <strong className="font-medium">Environment.</strong> Language, optional
          version and platform, and an optional package list of name and version.
        </li>
        <li>
          <strong className="font-medium">Execution.</strong> Optional command,
          params record, seeds record, and duration in seconds.
        </li>
        <li>
          <strong className="font-medium">Artifacts.</strong> Inputs are required
          (an empty array is allowed); outputs are optional. Each has a path, an
          optional hash, and optional bytes.
        </li>
        <li>
          <strong className="font-medium">Helpers.</strong>{" "}
          <span className="font-mono text-xs">manifestChecklist</span>,{" "}
          <span className="font-mono text-xs">manifestWarnings</span>,{" "}
          <span className="font-mono text-xs">reproduceCommand</span>, and{" "}
          <span className="font-mono text-xs">manifestJson</span> are exported.
        </li>
      </ol>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Accessibility
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          The command is a <span className="font-mono text-xs">pre</span> block
          with a copy button; long lines scroll inside the block, not the page.
        </li>
        <li>
          Check status is a glyph plus a screen-reader word ("recorded" or
          "missing"), with the detail in a title.
        </li>
        <li>
          Hashes and paths use monospace and truncate with a title rather than
          wrapping mid-token.
        </li>
        <li>
          Warnings are one sentence in the status strip and repeated item by item
          in the checks list.
        </li>
      </ul>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Status
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Ready. Pair it with the{" "}
        <span className="font-mono text-xs">Run Card</span> workbench pattern:
        the card says what ran, the manifest says how to run it again.
      </p>
    </article>
  );
}
