"use client";

import { useState } from "react";
import {
  FileDropzone,
  type UploadItem,
  UploadQueue,
} from "@/registry/default/instruments/file-dropzone";

const INITIAL: UploadItem[] = [
  {
    id: "run-12",
    name: "run-12.csv",
    size: 1_240_000,
    status: "uploading",
    progress: 64,
  },
  {
    id: "run-11",
    name: "run-11.csv",
    size: 1_180_000,
    status: "complete",
  },
];

export function FileDropzoneDemo() {
  const [items, setItems] = useState<UploadItem[]>(INITIAL);

  return (
    <div className="grid w-full gap-4">
      <FileDropzone
        accept=".csv,.tsv"
        hint="CSV or TSV, up to 25 MB per file. Files stay local until you upload them."
        label="Add plate exports"
        maxSize={25_000_000}
        onFiles={(files) =>
          setItems((current) => [
            ...current,
            ...files.map((file) => ({
              id: `${file.name}-${file.size}-${file.lastModified}`,
              name: file.name,
              size: file.size,
              status: "queued" as const,
            })),
          ])
        }
      />
      <UploadQueue
        items={items}
        onRemove={(id) =>
          setItems((current) => current.filter((item) => item.id !== id))
        }
        title="Plate exports"
      />
    </div>
  );
}
