import { cn } from "@/registry/default/lib/utils";

export function CodeBlock({
  code,
  filename,
  className,
}: {
  code: string;
  filename?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "my-5 overflow-hidden rounded-xl border bg-code text-code-foreground",
        className,
      )}
    >
      {filename ? (
        <figcaption className="flex items-center gap-2 border-b px-4 py-2 font-mono text-muted-foreground text-xs">
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          {filename}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
