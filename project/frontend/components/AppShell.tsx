"use client";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

interface AppShellProps {
  pageTitle: string;
  children: React.ReactNode;
}

export default function AppShell({ pageTitle, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        <TopHeader pageTitle={pageTitle} />
        <main className="flex-1 max-w-screen-xl w-full mx-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
