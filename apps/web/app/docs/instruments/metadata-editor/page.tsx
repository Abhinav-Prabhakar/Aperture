import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { MetadataEditorDemo } from "@/registry/default/examples/metadata-editor-demo";
import { Badge } from "@/registry/default/ui/badge";

export const metadata: Metadata = {
  title: "Metadata Editor",
  description:
    "A controlled key/value editor for run metadata and provenance, with fixed schema keys and removable custom fields.",
};

export default function MetadataEditorPage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Provenance</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        Metadata Editor
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        The result is only half the record. Metadata says which instrument,
        which protocol, and who ran it — the part that makes the result
        reproducible.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <MetadataEditorDemo />
      </div>
      <CodeBlock
        code={`const [fields, setFields] = useState<MetadataField[]>([
  {
    id: "instrument",
    label: "Instrument",
    value: "Plate reader · BMG FLUOstar",
    required: true,
  },
  {
    id: "operator",
    label: "Operator",
    value: "A. Rao",
  },
]);

<MetadataEditor
  title="Run metadata"
  description="Stored with every export."
  fields={fields}
  onChange={setFields}
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          A key is a schema promise. Keep required keys fixed; let people add
          custom keys instead of renaming the ones your analysis reads.
        </li>
        <li>
          Values stay strings. Preserve leading zeros in IDs and use ISO 8601
          for dates; do not let a display format become the stored value.
        </li>
        <li>
          Empty is not unknown. Use an explicit “Not recorded” value when the
          field applies but the answer is missing.
        </li>
        <li>
          The editor does not validate or save. Validate on submit and keep the
          last saved copy so a failed save cannot destroy metadata.
        </li>
        <li>
          Removing a custom field is not deletion of the record. Confirm before
          discarding provenance.
        </li>
      </ul>
    </article>
  );
}
