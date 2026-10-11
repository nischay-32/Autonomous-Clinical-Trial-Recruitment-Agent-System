"use client";

import { useState } from "react";
import SettingsLayout from "@/components/SettingsLayout";



export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Dr. Christopher Roberts");
  const [jobTitle, setJobTitle] = useState("Lead Clinical Research Coordinator");
  const [email] = useState("croberts@memorial-cancer.org");
  const [language, setLanguage] = useState("English (EN)");
  const [toast, setToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <SettingsLayout>
      <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 space-y-6 relative">
        {toast && (
          <div className="toast-container">
            <div className="toast">Saved.</div>
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">Profile</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Your personal credentials and clinical role information.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Job title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Work email</label>
            <input
              type="email"
              readOnly
              value={email}
              className="bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border-[#E2E8F0]"
            />
            <p className="text-[11px] text-[#64748B] mt-1">Contact support to change.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Language preference</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English (EN)">English (EN)</option>
              <option value="Spanish (ES)">Spanish (ES)</option>
              <option value="Hindi (HI)">Hindi (HI)</option>
              <option value="Kannada (KN)">Kannada (KN)</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" className="btn btn-primary text-xs">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
