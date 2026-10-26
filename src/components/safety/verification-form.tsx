"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitVerificationRequest } from "@/actions/safety";
import { School, Building2, FileCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";

interface VerificationFormProps {
  currentRequest: {
    status: string;
    institution: string | null;
    campus: string | null;
    document: string | null;
    reviewNote: string | null;
    submittedAt: Date;
  } | null;
  userInstitution?: string | null;
  userCampus?: string | null;
}

export function VerificationForm({
  currentRequest,
  userInstitution,
  userCampus,
}: VerificationFormProps) {
  const router = useRouter();
  const [institution, setInstitution] = useState(
    currentRequest?.institution || userInstitution || ""
  );
  const [campus, setCampus] = useState(
    currentRequest?.campus || userCampus || ""
  );
  const [document, setDocument] = useState(
    currentRequest?.document || ""
  );
  const [type, setType] = useState<"CAMPUS" | "INSTITUTION" | "EMAIL">("CAMPUS");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await submitVerificationRequest({
      institution,
      campus: campus || undefined,
      document,
      type,
    });

    setLoading(false);

    if (res.success) {
      setStatus({
        type: "success",
        text: "Verification request submitted! Our campus moderators will verify your details.",
      });
      router.refresh();
    } else {
      setStatus({
        type: "error",
        text: res.error || "Failed to submit request",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status Banner */}
      {currentRequest && (
        <div
          className={`card p-6 border ${
            currentRequest.status === "VERIFIED"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              : currentRequest.status === "PENDING"
              ? "bg-amber-950/20 border-amber-500/30 text-amber-400"
              : "bg-red-950/20 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
              {currentRequest.status === "VERIFIED" && <CheckCircle2 className="w-6 h-6" />}
              {currentRequest.status === "PENDING" && <Clock className="w-6 h-6" />}
              {currentRequest.status === "REJECTED" && <AlertTriangle className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Verification Status: {currentRequest.status}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {currentRequest.status === "VERIFIED" &&
                  `You are a verified member of ${currentRequest.institution}. Your profile and listings display the verification checkmark.`}
                {currentRequest.status === "PENDING" &&
                  `Your request submitted for ${currentRequest.institution} is under review. Usually verified within 12-24 hours.`}
                {currentRequest.status === "REJECTED" &&
                  `Your verification was not approved. ${currentRequest.reviewNote ? `Note: ${currentRequest.reviewNote}` : "You may resubmit with clearer proof."}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form */}
      {currentRequest?.status !== "VERIFIED" && (
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Submit Campus Proof</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Provide your college name and student ID or institutional email to get verified
            </p>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              <span>{status.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" /> College / University Name *
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. National Institute of Technology Calicut"
                className="input w-full text-sm bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <School className="w-4 h-4 text-cyan-400" /> Campus / Branch / Department (Optional)
              </label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="e.g. Main Campus, Computer Science"
                className="input w-full text-sm bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Proof Document / Student ID Card *
              </label>
              <input
                type="text"
                required
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Link to Student ID photo (Google Drive, Imgur, or roll number: B21CS101)"
                className="input w-full text-sm bg-white/5 border-white/10"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can paste an image URL, institutional cloud drive link, or your valid roll number.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary min-w-[180px]"
            >
              {loading ? "Submitting..." : currentRequest ? "Resubmit Verification" : "Request Verification"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
