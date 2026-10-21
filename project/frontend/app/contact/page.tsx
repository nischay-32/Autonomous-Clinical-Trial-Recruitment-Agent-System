"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    jobTitle: "",
    trialType: "Oncology",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#1a2332]">
      <PublicHeader action="home" />
      <main className="flex-1 max-w-[640px] w-full mx-auto px-6 py-16">
        <div className="card">
          <h1 className="font-serif text-2xl">Contact</h1>
          <p className="text-sm text-[#4d5663] mt-1.5">
            For a deployment discussion, write to compliance@trialscreen.org. This form keeps a copy in this browser session for the academic demonstration.
          </p>

          {submitted ? (
            <div className="mt-8 p-6 border border-[#d5d9e0] bg-[#f4f5f7]">
              <h2 className="font-serif text-base">Request recorded in this session</h2>
              <p className="text-sm text-[#4d5663] mt-1">
                Email compliance@trialscreen.org with the same details if you need a reply.
              </p>
              <Link href="/" className="btn btn-secondary mt-4 inline-block text-xs">Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="cName" className="block text-xs font-semibold mb-1">Full name</label>
                <input id="cName" type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div>
                <label htmlFor="cEmail" className="block text-xs font-semibold mb-1">Work email</label>
                <input id="cEmail" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cOrg" className="block text-xs font-semibold mb-1">Organization</label>
                  <input id="cOrg" type="text" required value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="cTitle" className="block text-xs font-semibold mb-1">Job title</label>
                  <input id="cTitle" type="text" required value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="cArea" className="block text-xs font-semibold mb-1">Primary therapeutic area</label>
                <select id="cArea" value={formData.trialType} onChange={(e) => setFormData({ ...formData, trialType: e.target.value })}>
                  <option value="Oncology">Oncology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Immunology">Immunology / Rheumatology</option>
                  <option value="Rare Diseases">Rare Diseases</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="cMsg" className="block text-xs font-semibold mb-1">Notes</label>
                <textarea id="cMsg" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary w-full">Submit</button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
