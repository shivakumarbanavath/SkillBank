import { PublicShell } from "@/components/layout/public-shell";
import Link from "next/link";
import { ShieldCheck, MapPin, Video, AlertTriangle, UserCheck, Flag, Lock } from "lucide-react";

export const metadata = {
  title: "Trust & Safety Policy",
  description: "SkillBank guidelines for safe, respectful, and verified peer skill exchange on campus and online.",
};

export default function SafetyPage() {
  return (
    <PublicShell>
      <div className="space-y-12 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Community Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Trust & Safety Guidelines</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            SkillBank is built on mutual respect and student safety. Here is how we protect our community
            both in-person and online.
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* In-Person Meetup Safety */}
          <div className="card p-6 md:p-8 space-y-4 border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">In-Person Campus Session Safety</h2>
            </div>
            <ul className="space-y-2.5 list-disc pl-5 text-slate-300">
              <li>
                <strong className="text-white">Meet in Public Spaces:</strong> Always choose open, well-lit campus
                locations such as central libraries, cafeteria commons, department study halls, or student centers.
              </li>
              <li>
                <strong className="text-white">Verify Student Identity:</strong> Prioritize learning from members
                displaying the <span className="text-blue-400 font-semibold">Verified Student</span> checkmark badge.
              </li>
              <li>
                <strong className="text-white">Never Share Financial Info:</strong> Skill exchanges require credits,
                never cash or UPI transfers. Anyone requesting direct money for a peer session is violating policy.
              </li>
            </ul>
          </div>

          {/* Online Session Safety */}
          <div className="card p-6 md:p-8 space-y-4 border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Online Video Session Etiquette</h2>
            </div>
            <ul className="space-y-2.5 list-disc pl-5 text-slate-300">
              <li>
                <strong className="text-white">Official Meeting Links:</strong> Use Google Meet, Zoom, or Discord
                channels provided in the session confirmation.
              </li>
              <li>
                <strong className="text-white">Keep Communication on SkillBank:</strong> Coordinate all scheduling,
                topics, and inquiries through the integrated platform messenger so records are preserved in disputes.
              </li>
              <li>
                <strong className="text-white">Screen Sharing Awareness:</strong> Close sensitive personal tabs,
                passwords, and personal documents before sharing your display.
              </li>
            </ul>
          </div>

          {/* Reporting & Blocking */}
          <div className="card p-6 md:p-8 space-y-4 border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <Flag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Reporting, Blocking & Dispute Resolution</h2>
            </div>
            <p>
              If someone behaves inappropriately, engages in academic dishonesty, or fails to show up repeatedly:
            </p>
            <ul className="space-y-2.5 list-disc pl-5 text-slate-300">
              <li>
                Click <strong className="text-white">Report</strong> on their profile, session card, or message thread.
                Our safety team investigates every report within 24 hours.
              </li>
              <li>
                Use the <strong className="text-white">Block</strong> button to immediately prevent a user from
                messaging you or viewing your listings.
              </li>
              <li>
                If a teacher did not show up or provide the promised skill, click <strong className="text-white">Raise Dispute</strong>
                in your Sessions dashboard to freeze escrow and have credits returned.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
