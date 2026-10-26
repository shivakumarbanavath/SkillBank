"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { ArrowLeft, KeyRound, Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    devResetUrl?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    setResult(res);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-40 pointer-events-none" />
      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="card p-8 space-y-6 bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the email address registered with your SkillBank account and we will send you a reset link.
            </p>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Processed</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{result.message}</p>
              </div>

              {result.devResetUrl && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Prototype Quick Access Link
                  </span>
                  <p className="text-xs text-slate-300">
                    Click below to open the reset form directly:
                  </p>
                  <Link
                    href={result.devResetUrl}
                    className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5 text-xs"
                  >
                    <span>Proceed to Reset Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campus.ac.in"
                    className="input w-full pl-10 text-sm bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md w-full font-bold"
              >
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
