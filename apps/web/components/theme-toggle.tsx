"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/registry/default/ui/button";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("aperture-theme", next);
    setTheme(next);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        onClick={toggle}
        size="icon-sm"
        variant="ghost"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {ready ? `${theme === "dark" ? "Dark" : "Light"} theme` : ""}
      </span>
    </div>
  );
}
