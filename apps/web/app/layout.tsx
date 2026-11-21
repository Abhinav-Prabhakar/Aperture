import type { Metadata } from "next";
import { fontMono, fontSans } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = {
  description:
    "A copy-paste UI system for scientific software. Elements, instruments, and workbenches for labs, field teams, clinicians, and computational researchers.",
  title: {
    default: "Aperture — Building blocks for researchers",
    template: "%s — Aperture",
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("aperture-theme");var d=t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);if(localStorage.getItem("aperture-contrast")==="more"){document.documentElement.dataset.contrast="more";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: theme boot must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
