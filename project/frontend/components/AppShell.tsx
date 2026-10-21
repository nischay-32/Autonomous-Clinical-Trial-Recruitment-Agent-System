"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { getToken } from "@/lib/api";

interface AppShellProps {
  pageTitle: string;
  children: React.ReactNode;
}

export default function AppShell({ pageTitle, children }: AppShellProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-[#f4f5f7]" />;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex-1 flex flex-col min-w-0">
        <TopHeader pageTitle={pageTitle} />
        <main className="flex-1 max-w-screen-xl w-full mx-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
