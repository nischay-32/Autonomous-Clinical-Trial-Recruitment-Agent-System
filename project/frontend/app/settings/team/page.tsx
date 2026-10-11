"use client";

import { useEffect, useState } from "react";
import SettingsLayout from "@/components/SettingsLayout";
import { api, TeamMember } from "@/lib/api";
import { UserPlus, X } from "lucide-react";



export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Coordinator" | "Viewer" | "Admin">("Coordinator");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await api.teamMembers();
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: inviteEmail.split("@")[0].replace(".", " "),
      email: inviteEmail,
      role: inviteRole,
      joined: new Date().toISOString().split("T")[0],
    };
    setMembers([...members, newMember]);
    setShowModal(false);
    setInviteEmail("");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
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

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Team</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Authorized clinical investigators, research coordinators, and compliance auditors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite team member
          </button>
        </div>

        {/* Members Table */}
        <div className="border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="h-4 w-48 skeleton mx-auto" />
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium text-xs text-[#0F172A]">{m.name}</td>
                    <td className="font-mono text-xs text-[#64748B]">{m.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          m.role === "Admin"
                            ? "bg-[#0F172A] text-white"
                            : m.role === "Coordinator"
                            ? "badge-accent"
                            : "badge-muted"
                        } text-[10px]`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="text-xs text-[#64748B]">{m.joined}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemove(m.id)}
                        className="text-xs text-[#DC2626] hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Role Explanation */}
        <p className="text-[12px] text-[#64748B] leading-relaxed">
          Coordinator — can review and approve cases. Viewer — read-only access. Admin — full access including settings.
        </p>

        {/* Invite Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0F172A]">Invite team member</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    Institutional email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coordinator@hospital.org"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "Coordinator" | "Viewer" | "Admin")
                    }
                  >
                    <option value="Coordinator">Coordinator</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs">
                    Send invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
