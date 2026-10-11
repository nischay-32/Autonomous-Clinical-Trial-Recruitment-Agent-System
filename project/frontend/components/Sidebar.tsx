"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  AlertTriangle,
  Mail,
  Shield,
  BarChart2,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",  label: "Overview",      Icon: LayoutDashboard },
  { href: "/trials",     label: "Trials",        Icon: FlaskConical    },
  { href: "/patients",   label: "Screen Patient", Icon: Users           },
  { href: "/review",    label: "Review Queue",   Icon: AlertTriangle   },
  { href: "/outreach",  label: "Outreach",       Icon: Mail            },
  { href: "/audit",     label: "Audit Trail",    Icon: Shield          },
  { href: "/report",    label: "Reports",        Icon: BarChart2       },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo / wordmark */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
          TrialRecruit
        </span>
        <span
          style={{
            display: "block",
            fontSize: 11,
            color: "var(--color-muted)",
            marginTop: 2,
            fontWeight: 400,
          }}
        >
          Clinical Recruitment System
        </span>
      </div>

      {/* Nav links */}
      <div style={{ padding: "12px 0", flex: 1 }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Footer links */}
      <div style={{ padding: "12px 0", borderTop: "1px solid var(--color-border)" }}>
        <Link href="/privacy" className="nav-link" style={{ fontSize: 12 }}>
          Privacy Policy
        </Link>
        <Link href="/terms" className="nav-link" style={{ fontSize: 12 }}>
          Terms of Service
        </Link>
      </div>
    </nav>
  );
}
