"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";

export type MetadataField = {
  id: string;
  label: string;
  value: string;
  /** Allow the key to be renamed. Schema fields should stay fixed. */
  editableKey?: boolean;
  placeholder?: string;
  /** Required fields cannot be removed. */
  required?: boolean;
};

export type MetadataEditorProps = Omit<
  React.ComponentProps<"section">,
  "children" | "title" | "onChange"
> & {
  fields: readonly MetadataField[];
  onChange: (fields: MetadataField[]) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  addLabel?: string;
  emptyLabel?: React.ReactNode;
  disabled?: boolean;
};

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `field-${Date.now().toString(36)}`;
}

export function MetadataEditor({
  fields,
  onChange,
  title = "Metadata",
  description,
  addLabel = "Add field",
  emptyLabel = "No fields yet. Add the first one below.",
  disabled = false,
  className,
  ...props
}: MetadataEditorProps): React.ReactElement {
  const [newId, setNewId] = React.useState<string | null>(null);

  function update(id: string, patch: Partial<MetadataField>) {
    onChange(
      fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  }

  function remove(id: string) {
    onChange(fields.filter((field) => field.id !== id));
  }

  function add() {
    const id = createId();
    setNewId(id);
    onChange([...fields, { editableKey: true, id, label: "", value: "" }]);
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="metadata-editor"
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-medium text-sm">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </span>
      </header>

      {fields.length === 0 ? (
        <p
          className="px-4 py-8 text-center text-muted-foreground text-sm"
          data-slot="metadata-empty"
        >
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y">
          {fields.map((field) => (
            <li
              className="grid grid-cols-[minmax(6.5rem,0.45fr)_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2"
              data-slot="metadata-row"
              key={field.id}
            >
              {field.editableKey ? (
                <Input
                  aria-label="Field name"
                  autoFocus={field.id === newId}
                  className="h-7 text-xs"
                  disabled={disabled}
                  onChange={(event) =>
                    update(field.id, { label: event.target.value })
                  }
                  placeholder="Field name"
                  value={field.label}
                />
              ) : (
                <span className="truncate ps-2.5 font-medium text-muted-foreground text-xs">
                  {field.label}
                </span>
              )}

              <Input
                aria-label={`${field.label || "Untitled field"} value`}
                className="h-7 text-xs"
                disabled={disabled}
                onChange={(event) =>
                  update(field.id, { value: event.target.value })
                }
                placeholder={field.placeholder ?? "Value"}
                value={field.value}
              />

              {field.required || disabled ? (
                <span aria-hidden="true" className="size-7" />
              ) : (
                <Button
                  aria-label={`Remove ${field.label || "field"}`}
                  onClick={() => remove(field.id)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Trash2Icon />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {disabled ? null : (
        <div className="border-t px-4 py-2">
          <Button onClick={add} size="xs" type="button" variant="ghost">
            <PlusIcon />
            {addLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
