"use client";

import { Award, CheckCircle, Printer, Share2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface CertificateViewProps {
  cert: {
    certificateNo: string;
    issuedAt: Date;
    user: {
      name: string | null;
      profile: {
        displayName: string;
        institution: string | null;
        campus: string | null;
      } | null;
    };
    course: {
      title: string;
      level: string;
      duration: number | null;
      category: { name: string };
      instructor: {
        profile: {
          displayName: string;
          institution: string | null;
        } | null;
      };
    };
  };
}

export function CertificateView({ cert }: CertificateViewProps) {
  const studentName = cert.user.profile?.displayName || cert.user.name || "Student";
  const instructorName = cert.course.instructor.profile?.displayName || "Lead Instructor";
  const formattedDate = format(new Date(cert.issuedAt), "MMMM dd, yyyy");

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${studentName}'s SkillBank Certificate`,
        text: `Check out my verified certification in ${cert.course.title} on SkillBank!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Certificate URL copied to clipboard!");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/courses"
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Masterclasses</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Credential</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-8 border-double border-amber-500/30 shadow-2xl shadow-amber-500/5 text-center overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/40" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/40" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/40" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/40" />

        {/* Certificate Emblem */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Skill<span className="text-amber-400">Bank</span>
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400/80">
              Certificate of Achievement
            </p>
            <h1 className="text-sm uppercase tracking-widest text-slate-400">
              This credential is proud to verify that
            </h1>
          </div>

          {/* Recipient Name */}
          <div className="py-2 border-b-2 border-amber-400/30 inline-block px-12">
            <p className="text-3xl sm:text-4xl font-serif font-black text-white italic tracking-wide">
              {studentName}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
            has successfully fulfilled all academic lectures, assignments, and practical project
            evaluations for the expert masterclass in
          </p>

          {/* Course Name */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-300">
              {cert.course.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Field of Study: {cert.course.category.name} • {cert.course.level} Level
            </p>
          </div>

          {/* Footer details: Instructor signature, Date, Verification seal */}
          <div className="grid grid-cols-3 gap-6 pt-10 items-end border-t border-white/10 text-xs">
            <div className="text-center space-y-1">
              <p className="font-serif italic text-base text-slate-200 border-b border-white/20 pb-1">
                {instructorName}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Instructor Signature
              </p>
            </div>

            {/* Central Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20">
                <ShieldCheck className="w-8 h-8 text-slate-950" />
              </div>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest mt-1.5 font-bold">
                Verified Official
              </span>
            </div>

            <div className="text-center space-y-1">
              <p className="text-slate-200 font-medium border-b border-white/20 pb-1">
                {formattedDate}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Date of Issue
              </p>
            </div>
          </div>

          {/* Serial Number & Registry */}
          <div className="pt-4 text-center">
            <p className="text-[11px] font-mono text-slate-500">
              Certificate No: <span className="text-slate-300 font-semibold">{cert.certificateNo}</span> • Verified in SkillBank National Ledger
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
