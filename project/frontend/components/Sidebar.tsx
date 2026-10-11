"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  GitPullRequest,
  Mail,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trials", href: "/trials", icon: FlaskConical },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Review Queue", href: "/review", icon: GitPullRequest, badge: 3 },
  { label: "Outreach", href: "/outreach", icon: Mail },
  { label: "Audit Trail", href: "/audit", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[#0F172A] text-white flex flex-col fixed top-0 left-0 h-screen border-r border-[#1E293B] z-40 select-none">
      {/* Brand Header */}
      <div className="h-[56px] px-5 flex items-center gap-2.5 border-b border-[#1E293B]">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
          <rect width="32" height="32" rx="4" fill="#1E293B" />
          <rect x="5" y="5" width="9" height="9" rx="2" fill="#334155" />
          <rect x="18" y="5" width="9" height="9" rx="2" fill="#334155" />
          <rect x="5" y="18" width="9" height="9" rx="2" fill="#334155" />
          <rect x="18" y="18" width="9" height="9" rx="2" fill="#2563EB" />
          <path d="M20.5 22.5L22 24L25 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-semibold text-[16px] text-white tracking-tight">TrialScreen</span>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-between px-3 py-2 text-sm font-medium rounded-[4px] transition-colors ${
                isActive
                  ? "bg-[#1E293B] text-white"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60"
              }`}
            >
              {/* Active left-accent bar (2px wide #2563EB) */}
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#2563EB] rounded-r" />
              )}

              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2563EB]" : "text-[#94A3B8]"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-mono font-medium rounded-[4px] bg-[#FEF3C7] text-[#D97706]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile + Sign Out */}
      <div className="p-3 border-t border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-[4px] bg-[#1E293B] text-white flex items-center justify-center font-medium text-xs font-mono flex-shrink-0">
            CR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">Dr. C. Roberts</p>
            <p className="text-[11px] text-[#64748B] truncate">Lead Coordinator</p>
          </div>
        </div>

        <Link
          href="/login"
          title="Sign out"
          aria-label="Sign out"
          className="text-[#64748B] hover:text-[#DC2626] transition-colors p-1.5 rounded-[4px]"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
