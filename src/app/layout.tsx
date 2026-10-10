import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

// next/font self-hosts both faces at build time: no request to
// fonts.googleapis.com at runtime, and no layout shift while they load.
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kin&d",
  description: "Conversation-starter cards for parents of teens and adult children.",
  // Favicon comes from src/app/icon.png (Next.js auto-detects this
  // filename as the app icon, no explicit `icons` field needed).
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-primary-bg text-primary-fg">{children}</body>
    </html>
  );
}
