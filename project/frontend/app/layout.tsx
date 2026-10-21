import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trialscreen.org"),
  title: {
    template: "%s | TrialScreen",
    default: "TrialScreen | Clinical trial eligibility screening",
  },
  description:
    "TrialScreen evaluates electronic health records against clinical trial inclusion and exclusion criteria, then queues coordinator-approved outreach drafts.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.png" }],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
