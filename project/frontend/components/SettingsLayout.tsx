"use client";

import AppShell from "@/components/AppShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell pageTitle="Settings">
      <div className="space-y-6">
        <p className="text-[13px] text-[#4d5663]">Account profile for this coordinator session.</p>
        {children}
      </div>
    </AppShell>
  );
}
