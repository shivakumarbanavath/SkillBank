"use client";

import { useState } from "react";
import { submitReport } from "@/actions/safety";
import { ShieldAlert, X, AlertCircle, Check } from "lucide-react";

interface ReportModalProps {
  reportedId: string;
  reportedName: string;
  type: "USER" | "REVIEW" | "MESSAGE" | "SKILL_LISTING" | "SESSION";
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Harassment or inappropriate behavior",
  "Spam, scam or commercial solicitation",
  "No-show or repeated cancellations",
  "Inaccurate skill listing or false information",
  "Safety concern or academic dishonesty",
  "Other policy violation",
];

export function ReportModal({
  reportedId,
  reportedName,
  type,
  targetId,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitReport({
      reportedId,
      type,
      targetId,
      reason,
      description: description || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } else {
      setError(res.error || "Failed to submit report");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card max-w-md w-full p-6 space-y-5 bg-slate-900 border-white/20 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Report {reportedName}</h2>
            <p className="text-xs text-slate-400">Our safety team reviews all reports within 24 hours</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <Check className="w-8 h-8 mx-auto" />
            <p className="font-semibold text-white">Report Submitted</p>
            <p className="text-xs text-slate-300">
              Thank you for keeping our community safe. We will investigate promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input w-full text-sm bg-white/5 border-white/10"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred with specific context or messages..."
                className="input w-full text-sm bg-white/5 border-white/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-sm bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
