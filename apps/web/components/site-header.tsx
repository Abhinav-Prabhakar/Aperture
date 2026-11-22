"use client";

import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/registry/default/ui/button";
import { ApertureMark } from "./aperture-mark";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/docs/elements", label: "Elements" },
  { href: "/docs/instruments", label: "Instruments" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/design/tokens", label: "Design" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-md">
      <div className="container flex h-14 items-center gap-2">
        <Link
          className="flex items-center gap-2 rounded-md font-heading font-semibold tracking-tight"
          href="/"
        >
          <ApertureMark className="size-5" title="" />
          Aperture
        </Link>

        <nav
          aria-label="Primary"
          className="ms-4 hidden items-center gap-0.5 md:flex"
        >
          {LINKS.map((link) => (
            <Button
              key={link.href}
              render={<Link href={link.href} />}
              size="sm"
              variant="ghost"
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <a
            aria-label="Aperture on GitHub"
            className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
            href="https://github.com/Abhinav-Prabhakar/Aperture"
            rel="noreferrer"
            target="_blank"
          >
            <GithubIcon aria-hidden="true" />
          </a>
          <ThemeToggle />
          <Button
            className="ms-1"
            render={<Link href="/docs" />}
            size="sm"
            variant="outline"
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
