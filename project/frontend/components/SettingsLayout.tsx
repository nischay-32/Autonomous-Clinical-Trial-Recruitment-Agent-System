"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const nav = [
    { label: "Profile", href: "/settings" },
    { label: "Organization", href: "/settings/organization" },
    { label: "Team", href: "/settings/team" },
  ];

  return (
    <AppShell pageTitle="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Settings</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your coordinator profile, institutional configuration, and team access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sub Navigation */}
          <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-2 space-y-1">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-xs font-medium rounded-[4px] transition-colors ${
                    isActive
                      ? "bg-[#1E293B] text-white"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
