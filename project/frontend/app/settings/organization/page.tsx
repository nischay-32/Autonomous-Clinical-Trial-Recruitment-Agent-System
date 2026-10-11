"use client";

import { useEffect, useState } from "react";
import SettingsLayout from "@/components/SettingsLayout";
import { api, OrgSettings } from "@/lib/api";



export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<OrgSettings>({
    org_name: "Memorial Cancer & Clinical Research Institute",
    irb_number: "IRB-2026-8841-A",
    compliance_email: "compliance@memorial-cancer.org",
    data_residency: "On-Premises Local Enclave",
    retention_years: 7,
  });
  const [toast, setToast] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.orgSettings();
        setOrg(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateOrgSettings(org);
    } catch (err) {
      console.error(err);
    }
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
          <h2 className="text-base font-semibold text-[#0F172A]">Organization</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Institutional entity details, protocol approval identifiers, and data residency settings.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Organization name</label>
            <input
              type="text"
              required
              value={org.org_name}
              onChange={(e) => setOrg({ ...org, org_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">IRB approval number</label>
            <input
              type="text"
              required
              className="font-mono"
              value={org.irb_number}
              onChange={(e) => setOrg({ ...org, irb_number: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">
              Contact email for compliance
            </label>
            <input
              type="email"
              required
              value={org.compliance_email}
              onChange={(e) => setOrg({ ...org, compliance_email: e.target.value })}
            />
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
