import type { Metadata } from "next";
import { api } from "@/lib/api";

export const instant = false;

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  let report;
  let trials;
  let backendOnline = true;

  try {
    [report, trials] = await Promise.all([api.report(), api.trials()]);
  } catch {
    backendOnline = false;
    report = null;
    trials = [];
  }

  const f = report?.funnel;

  const stats = [
    {
      label: "Patients Screened",
      value: f?.screened ?? 0,
      sub: "total runs this session",
    },
    {
      label: "Eligible",
      value: f?.eligible ?? 0,
      sub: f ? `${(f.eligibility_rate * 100).toFixed(1)}% rate` : "–",
    },
    {
      label: "Pending Review",
      value: f?.review_required ?? 0,
      sub: f && f.review_required > 0 ? "action required" : "none pending",
    },
    {
      label: "Outreach Drafted",
      value: f?.outreach_drafted ?? 0,
      sub: "pending coordinator approval",
    },
  ];

  const funnelRows = f
    ? [
        { label: "Screened",  count: f.screened,         total: f.screened },
        { label: "Eligible",  count: f.eligible,         total: f.screened },
        { label: "Review",    count: f.review_required,  total: f.screened },
        { label: "Outreach",  count: f.outreach_drafted, total: f.screened },
      ]
    : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          {backendOnline
            ? "Live data from the recruitment pipeline."
            : "Backend offline. Start the FastAPI server to see live data."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Funnel */}
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
            Recruitment Funnel
          </h2>
          {funnelRows.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: 13 }}>
              No screening runs yet. Use the Screen Patient view to run the pipeline.
            </p>
          ) : (
            funnelRows.map(({ label, count, total }) => (
              <div className="funnel-row" key={label}>
                <span className="funnel-label">{label}</span>
                <div className="funnel-track">
                  <div
                    className="funnel-fill"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="funnel-count">{count}</span>
              </div>
            ))
          )}
        </div>

        {/* Active trials */}
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
            Active Trials
          </h2>
          {trials.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: 13 }}>No trials loaded.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {trials.map((t) => (
                <li
                  key={t.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{t.medicine}</div>
                  <div style={{ color: "var(--color-muted)", fontSize: 11, marginTop: 2 }}>
                    {t.id} &middot; {t.total_criteria} criteria
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Report metadata */}
      {report && (
        <p style={{ marginTop: 16, fontSize: 11, color: "var(--color-muted)" }}>
          Report {report.report_id} &middot; Generated{" "}
          {new Date(report.generated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
