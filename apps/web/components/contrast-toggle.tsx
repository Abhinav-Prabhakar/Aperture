"use client";

import { ContrastIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/registry/default/ui/button";

export function ContrastToggle() {
  const [more, setMore] = useState(false);

  useEffect(() => {
    setMore(document.documentElement.dataset.contrast === "more");
  }, []);

  function toggle() {
    const next = !more;
    if (next) {
      document.documentElement.dataset.contrast = "more";
      localStorage.setItem("aperture-contrast", "more");
    } else {
      delete document.documentElement.dataset.contrast;
      localStorage.setItem("aperture-contrast", "default");
    }
    setMore(next);
  }

  return (
    <Button
      aria-pressed={more}
      onClick={toggle}
      size="sm"
      variant={more ? "secondary" : "outline"}
    >
      <ContrastIcon />
      {more ? "Contrast: more" : "Contrast: default"}
    </Button>
  );
}
