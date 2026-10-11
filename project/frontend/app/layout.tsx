import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | TrialScreen",
    default: "TrialScreen — Autonomous Clinical Trial Recruitment System",
  },
  description:
    "Autonomous multi-agent system for clinical trial patient recruitment, EHR criteria matching, and HIPAA-compliant outreach.",
  icons: {
    icon: "/favicon.svg",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
