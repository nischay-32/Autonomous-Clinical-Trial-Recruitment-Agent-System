"use client";

import { useEffect, useState } from "react";
import SettingsLayout from "@/components/SettingsLayout";
import { getStoredUser, getToken, setSession } from "@/lib/api";

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("English (EN)");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    setFullName(user.full_name);
    setJobTitle(user.job_title);
    setEmail(user.email);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      setSession(token, { ...user, full_name: fullName, job_title: jobTitle });
    }
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <SettingsLayout>
      <div className="card space-y-6 relative">
        {toast && (
          <div className="toast-container">
            <div className="toast">Saved in this browser session.</div>
          </div>
        )}

        <div>
          <h2 className="font-serif text-[18px]">Profile</h2>
          <p className="text-[12px] text-[#4d5663] mt-0.5">Name and title used on outreach approvals.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-[12px] font-semibold mb-1.5">Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1.5">Job title</label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1.5">Work email</label>
            <input type="email" readOnly value={email} className="bg-[#f4f5f7] text-[#4d5663] cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1.5">Language preference</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English (EN)">English (EN)</option>
              <option value="Spanish (ES)">Spanish (ES)</option>
              <option value="Hindi (HI)">Hindi (HI)</option>
              <option value="Kannada (KN)">Kannada (KN)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
}
