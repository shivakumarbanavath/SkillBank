import { PublicShell } from "@/components/layout/public-shell";
import Link from "next/link";
import { Users, Heart, School, ShieldCheck, Sparkles, ArrowRight, Target, Globe } from "lucide-react";

export const metadata = {
  title: "About SkillBank",
  description: "Learn about the mission, roots, and vision behind SkillBank — the hyperlocal skill exchange platform for campuses.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="space-y-16 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" /> Our Mission & Roots
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Your Skills Are <span className="gradient-text">Worth More</span> Than You Think.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            SkillBank started with a simple observation at National Institute of Technology Calicut:
            every campus is a goldmine of unshared knowledge.
          </p>
        </div>

        {/* Story Section */}
        <div className="card p-8 md:p-10 space-y-6 bg-slate-900/60 border-white/10 leading-relaxed text-slate-300">
          <h2 className="text-2xl font-bold text-white">The SkillBank Story</h2>
          <p>
            In any engineering college hostel or campus library, you will find students struggling with
            complex algorithms, microcontrollers, or web deployment — while down the hall, a senior or
            classmate has already solved that exact problem.
          </p>
          <p>
            Meanwhile, that same senior might want to learn guitar, public speaking, video editing, or
            conversational German, but cannot afford expensive commercial bootcamps or private tutors.
          </p>
          <p>
            <strong className="text-white">SkillBank was built to close that gap.</strong> By introducing an
            auditable, double-entry credit ledger instead of money, we enable students to exchange knowledge
            freely, build lifelong peer networks, and gain verifiable teaching experience.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="card p-6 space-y-3 bg-blue-950/20 border-blue-500/30">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Hyperlocal First</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed around physical campuses and local hubs. Meet peers at the library, student lounge,
              or over Google Meet.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-purple-950/20 border-purple-500/30">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Verified & Safe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student ID verification badges, community ratings, report controls, and mutual trust keep
              exchanges respectful and productive.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-emerald-950/20 border-emerald-500/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Equitable Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No subscription paywalls to learn from peers. Your time, passion, and teaching ability are
              the only currency required.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <h2 className="text-2xl font-bold text-white">Join the SkillBank Community</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Become a part of the movement empowering the next generation of builders and learners.
          </p>
          <div className="pt-2">
            <Link href="/register" className="btn btn-primary btn-lg inline-flex items-center gap-2">
              <span>Get Started Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
