import type { Metadata } from "next";
import { Badge } from "@/registry/default/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { FileDropzoneDemo } from "@/registry/default/examples/file-dropzone-demo";

export const metadata: Metadata = {
  title: "File Dropzone",
  description:
    "A keyboard-accessible dropzone with type and size validation, plus an upload queue with real progress.",
};

export default function FileDropzonePage() {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Instrument</Badge>
        <Badge variant="outline">Data</Badge>
        <Badge variant="outline">Ready</Badge>
      </div>
      <h1 className="mt-4 font-heading font-bold text-4xl tracking-tight">
        File Dropzone
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        Files are data. A dropzone should say what it accepts, reject the rest
        with a reason, and keep the queue visible while the upload runs.
      </p>

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Live
      </h2>
      <div className="mt-4 rounded-xl border p-6">
        <FileDropzoneDemo />
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        The demo stops at <code className="font-mono">queued</code>; wire{" "}
        <code className="font-mono">onFiles</code> to your uploader and set each
        item’s status as it changes.
      </p>

      <CodeBlock
        code={`const [items, setItems] = useState<UploadItem[]>([]);

<FileDropzone
  label="Add plate exports"
  accept=".csv,.tsv"
  maxSize={25_000_000}
  hint="CSV or TSV, up to 25 MB per file."
  onFiles={(files) =>
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: file.name,
        name: file.name,
        size: file.size,
        status: "queued",
      })),
    ])
  }
/>

<UploadQueue
  items={items}
  onRemove={(id) =>
    setItems((current) => current.filter((item) => item.id !== id))
  }
/>`}
      />

      <h2 className="mt-10 font-heading font-semibold text-2xl tracking-tight">
        Rules
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
        <li>
          <code className="font-mono">accept</code> is a convenience, not
          security. Validate type, size, and content on the server as well.
        </li>
        <li>
          Name the limit in human units and show the same unit in the error.
          Sizes here use decimal units: 1 MB = 1,000,000 bytes.
        </li>
        <li>
          Reject per file, not per batch. One bad file should not discard the
          good ones.
        </li>
        <li>
          Keep the file name visible and unchanged in the queue. A checksum is
          provenance; a renamed file is not.
        </li>
        <li>
          A retry is the same file, not a new one. Remove the queue row only
          after the user can see what happened.
        </li>
      </ul>
    </article>
  );
}
