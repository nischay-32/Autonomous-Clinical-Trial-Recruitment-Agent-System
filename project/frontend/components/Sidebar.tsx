"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import { clearSession, getStoredUser, type AuthUser } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trials", href: "/trials", icon: FlaskConical },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Review Queue", href: "/review", icon: GitPullRequest },
  { label: "Outreach", href: "/outreach", icon: Mail },
  { label: "Audit Trail", href: "/audit", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const signOut = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <aside
      style={{ width: "var(--sidebar-width)" }}
      className="flex-shrink-0 flex flex-col fixed top-0 left-0 h-screen z-40 bg-[#1a2332] text-white"
      aria-label="Main navigation"
    >
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-white/10">
        <Image src="/logo.png" alt="" width={28} height={28} />
        <span className="font-serif text-[16px]">TrialScreen</span>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto" aria-label="App navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] ${
                isActive ? "bg-white/10 text-white" : "text-[#c5cad3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold truncate">{user?.full_name || "Coordinator"}</p>
          <p className="text-[11px] text-[#8b93a1] truncate">{user?.role || "Signed in"}</p>
        </div>
        <button type="button" onClick={signOut} title="Sign out" aria-label="Sign out" className="p-2 text-[#c5cad3] hover:text-white">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
