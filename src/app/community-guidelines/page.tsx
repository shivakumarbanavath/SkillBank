import { PublicShell } from "@/components/layout/public-shell";
import { Users, HeartHandshake, Shield, Sparkles, BookOpen, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Community Guidelines",
  description: "Standards of respect, academic integrity, and collaboration for the SkillBank peer learning network.",
};

export default function CommunityGuidelinesPage() {
  return (
    <PublicShell>
      <div className="space-y-12 max-w-4xl mx-auto">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" /> Code of Conduct
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Community Guidelines</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Our mission is to create a welcoming, empowering space where every student can teach and learn without fear or judgment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3 bg-slate-900/60 border-white/10">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-base">Be Patient & Respectful</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Everyone learns at their own pace. Encourage your learners, explain fundamental concepts
              clearly, and never belittle someone for asking beginner questions.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-slate-900/60 border-white/10">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-base">Honor Your Commitments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show up on time for scheduled sessions. If an emergency arises, message your partner at least
              2 hours in advance to reschedule or cancel courteously.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-slate-900/60 border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-base">Academic Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SkillBank is for skill development, conceptual tutoring, and project mentorship. Do not ask
              peers to complete your university exams, graded homework, or assignments on your behalf.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-slate-900/60 border-white/10">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-base">Zero Tolerance for Harassment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discriminatory remarks, hate speech, sexual advances, or unsolicited commercial pitches will
              result in an immediate permanent ban and reporting to campus authorities where appropriate.
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
