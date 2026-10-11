import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | TrialRecruit",
    default: "TrialRecruit — Autonomous Clinical Trial Recruitment",
  },
  description:
    "Autonomous multi-agent system for clinical trial patient recruitment and eligibility screening.",
  robots: { index: false, follow: false }, // internal tool — do not index
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
