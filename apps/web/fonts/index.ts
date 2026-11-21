import localFont from "next/font/local";

export const fontSans = localFont({
  display: "swap",
  src: [
    { path: "./CalSansVF.woff2", style: "normal" },
    { path: "./CalSansVF-Italic.woff2", style: "italic" },
  ],
  variable: "--font-sans",
  weight: "400 700",
});

export const fontMono = localFont({
  display: "swap",
  src: [
    { path: "./JetBrainsMono-Regular.woff2", style: "normal", weight: "400" },
    { path: "./JetBrainsMono-Medium.woff2", style: "normal", weight: "500" },
  ],
  variable: "--font-mono",
});
