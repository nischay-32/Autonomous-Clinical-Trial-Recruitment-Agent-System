"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface TopHeaderProps {
  pageTitle: string;
}

export default function TopHeader({ pageTitle }: TopHeaderProps) {
  return (
    <header className="h-[56px] bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-[#0F172A] tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right: Notifications & User Name */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-[#64748B] hover:text-[#0F172A] transition-colors p-1"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#2563EB] rounded-full" />
        </button>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#1E293B] text-white flex items-center justify-center font-medium text-xs font-mono">
            CR
          </div>
          <span className="text-sm font-medium text-[#0F172A]">Dr. C. Roberts</span>
        </div>
      </div>
    </header>
  );
}
