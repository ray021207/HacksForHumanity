import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kin&d",
  description: "Conversation-starter cards for parents of teens and adult children.",
  // Favicon comes from src/app/icon.png (Next.js auto-detects this
  // filename as the app icon, no explicit `icons` field needed).
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
