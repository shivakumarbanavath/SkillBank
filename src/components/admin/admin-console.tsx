"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  toggleUserStatus,
  reviewVerification,
  resolveReport
} from "@/actions/admin";
import {
  Users,
  ShieldAlert,
  FileCheck,
  History,
  Coins,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Lock,
  ArrowRight,
  School,
  ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AdminConsoleProps {
  stats: {
    totalUsers: number;
    totalSkills: number;
    completedSessions: number;
    circulatingCredits: number;
    totalCreditsEarned: number;
    pendingVerifications: number;
    openReports: number;
    openDisputes: number;
  };
  users: any[];
  verifications: any[];
  reports: any[];
  auditLogs: any[];
}

export function AdminConsole({
  stats,
  users,
  verifications,
  reports,
  auditLogs,
}: AdminConsoleProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "users" | "verifications" | "reports" | "logs">("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Verification review modal
  const [rejectModalReq, setRejectModalReq] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // Report resolution modal
  const [reportModalRep, setReportModalRep] = useState<string | null>(null);
  const [reportResolution, setReportResolution] = useState("");

  async function handleToggleUser(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoading(`user-${userId}`);
    await toggleUserStatus(userId, newStatus as any);
    setActionLoading(null);
    router.refresh();
  }

  async function handleApproveVerification(reqId: string) {
    setActionLoading(`verif-${reqId}`);
    await reviewVerification(reqId, "VERIFIED");
    setActionLoading(null);
    router.refresh();
  }

  async function handleRejectVerification() {
    if (!rejectModalReq) return;
    setActionLoading(`verif-${rejectModalReq}`);
    await reviewVerification(rejectModalReq, "REJECTED", rejectNote || "Insufficient proof");
    setActionLoading(null);
    setRejectModalReq(null);
    setRejectNote("");
    router.refresh();
  }

  async function handleResolveReport(status: "RESOLVED" | "DISMISSED") {
    if (!reportModalRep) return;
    setActionLoading(`rep-${reportModalRep}`);
    await resolveReport(reportModalRep, reportResolution || "Reviewed by admin", status);
    setActionLoading(null);
    setReportModalRep(null);
    setReportResolution("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-2 pb-2 overflow-x-auto border-b border-white/10">
        {[
          { id: "overview", label: "Overview", icon: History },
          { id: "users", label: `Users (${users.length})`, icon: Users },
          { id: "verifications", label: `Verifications (${verifications.filter(v => v.status === "PENDING").length} pending)`, icon: FileCheck },
          { id: "reports", label: `Reports (${reports.filter(r => r.status === "PENDING").length} open)`, icon: ShieldAlert },
          { id: "logs", label: "Audit Logs", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === t.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-6 bg-slate-900/60 border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Total Users</span>
              <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
            </div>
            <div className="card p-6 bg-slate-900/60 border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Active Skills</span>
              <p className="text-3xl font-black text-blue-400">{stats.totalSkills}</p>
            </div>
            <div className="card p-6 bg-slate-900/60 border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Completed Sessions</span>
              <p className="text-3xl font-black text-emerald-400">{stats.completedSessions}</p>
            </div>
            <div className="card p-6 bg-slate-900/60 border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Circulating Credits</span>
              <p className="text-3xl font-black text-amber-400">{stats.circulatingCredits}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" /> Pending Campus Verifications
              </h3>
              {verifications.filter(v => v.status === "PENDING").length === 0 ? (
                <p className="text-xs text-slate-400">All student verification requests are processed.</p>
              ) : (
                <div className="space-y-3">
                  {verifications.filter(v => v.status === "PENDING").slice(0, 3).map((v) => (
                    <div key={v.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{v.user.profile?.displayName ?? v.user.name}</p>
                        <p className="text-slate-400">{v.institution}</p>
                      </div>
                      <button onClick={() => setTab("verifications")} className="text-blue-400 hover:underline">
                        Review →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" /> Pending Safety Reports
              </h3>
              {reports.filter(r => r.status === "PENDING").length === 0 ? (
                <p className="text-xs text-slate-400">No open reports at this time.</p>
              ) : (
                <div className="space-y-3">
                  {reports.filter(r => r.status === "PENDING").slice(0, 3).map((r) => (
                    <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-red-400">{r.reason}</p>
                        <p className="text-slate-400">Reported: {r.reported.profile?.displayName}</p>
                      </div>
                      <button onClick={() => setTab("reports")} className="text-blue-400 hover:underline">
                        Review →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <div className="card overflow-hidden border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Campus / City</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.profile?.displayName || u.name || "User"}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {u.profile?.institution ? `${u.profile.institution}` : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${u.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-slate-400"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {u.creditAccount?.balance ?? 0} cr
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${u.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.status)}
                          disabled={actionLoading === `user-${u.id}`}
                          className={`btn btn-xs ${u.status === "SUSPENDED" ? "btn-primary" : "btn-secondary text-red-400 border-red-500/30"}`}
                        >
                          {actionLoading === `user-${u.id}` ? "Updating..." : u.status === "SUSPENDED" ? "Activate" : "Suspend"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERIFICATIONS TAB */}
      {tab === "verifications" && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">No verification requests submitted.</div>
          ) : (
            verifications.map((v) => (
              <div key={v.id} className="card p-6 space-y-4 border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {v.user.profile?.displayName ?? v.user.name} (@{v.user.profile?.username})
                      </h4>
                      <p className="text-xs text-slate-400">
                        {v.institution} {v.campus ? `• ${v.campus}` : ""}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    v.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    v.status === "PENDING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                  <span className="text-slate-500">Student ID / Proof Document Reference:</span>
                  <p className="text-white font-mono break-all">{v.document}</p>
                </div>

                {v.status === "PENDING" && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRejectModalReq(v.id)}
                      disabled={actionLoading === `verif-${v.id}`}
                      className="btn btn-secondary btn-sm text-red-400 border-red-500/30"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveVerification(v.id)}
                      disabled={actionLoading === `verif-${v.id}`}
                      className="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {actionLoading === `verif-${v.id}` ? "Approving..." : "Approve Student Badge"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">No safety reports on record.</div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="card p-6 space-y-3 border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{r.reason}</span>
                    <h4 className="font-bold text-white text-base mt-1">
                      Report against: {r.reported.profile?.displayName ?? r.reported.email}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Submitted by {r.reporter.profile?.displayName ?? r.reporter.email} • {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    r.status === "PENDING" ? "bg-amber-500/20 text-amber-400" :
                    r.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {r.status}
                  </span>
                </div>

                {r.description && (
                  <p className="text-xs text-slate-300 p-3 rounded-xl bg-white/5 border border-white/5">
                    {r.description}
                  </p>
                )}

                {r.status === "PENDING" && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setReportModalRep(r.id);
                        setReportResolution("Dismissed - No violation detected");
                      }}
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setReportModalRep(r.id);
                        setReportResolution("Warning issued and listing reviewed");
                      }}
                      className="btn btn-primary btn-sm bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Take Action & Resolve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {tab === "logs" && (
        <div className="card overflow-hidden border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {log.user?.email ?? "System"}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-blue-400">{log.action}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {log.targetType}:{log.targetId?.slice(0, 8)}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px] truncate max-w-xs">
                      {log.metadata || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Note Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card max-w-md w-full p-6 space-y-4 bg-slate-900 border-white/20">
            <h3 className="font-bold text-white text-base">Reject Student Verification</h3>
            <p className="text-xs text-slate-400">
              Provide a clear reason so the student can resubmit with valid documents.
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. ID card photo was blurry, or institution name did not match proof."
              className="input w-full text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalReq(null)} className="btn btn-secondary btn-sm text-xs">
                Cancel
              </button>
              <button onClick={handleRejectVerification} className="btn btn-primary btn-sm bg-red-600 hover:bg-red-700 text-white text-xs">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Resolution Modal */}
      {reportModalRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card max-w-md w-full p-6 space-y-4 bg-slate-900 border-white/20">
            <h3 className="font-bold text-white text-base">Resolve Community Report</h3>
            <p className="text-xs text-slate-400">Record administrative action or reasoning.</p>
            <textarea
              rows={3}
              value={reportResolution}
              onChange={(e) => setReportResolution(e.target.value)}
              placeholder="Resolution note..."
              className="input w-full text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setReportModalRep(null)} className="btn btn-secondary btn-sm text-xs">
                Cancel
              </button>
              <button onClick={() => handleResolveReport("RESOLVED")} className="btn btn-primary btn-sm text-xs">
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
