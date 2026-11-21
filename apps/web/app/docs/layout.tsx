import type { ReactNode } from "react";
import { DocsNav } from "@/components/docs-nav";
import { SiteHeader } from "@/components/site-header";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="container grid gap-10 py-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16 lg:py-14">
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <DocsNav />
        </aside>
        <div className="min-w-0 max-w-3xl">
          <div className="mb-8 lg:hidden">
            <DocsNav />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
