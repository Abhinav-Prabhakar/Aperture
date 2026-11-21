import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/registry/default/ui/button";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        <PlusIcon />
        New sample
      </Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="outline">
        Export
        <ArrowRightIcon />
      </Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
