import { PublicShell } from "@/components/layout/public-shell";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Coins,
  BookOpen,
  Calendar,
  Star,
  Users,
  ShieldCheck,
  CheckCircle2,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "How SkillBank Works",
  description: "Learn how the hyperlocal peer skill economy works. Teach what you know, earn credits, and learn whatever you desire.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "List What You Can Teach",
      desc: "Everyone has valuable knowledge. Whether it's Python programming, Figma UI design, playing the guitar, or speaking conversational German, create a listing in under 2 minutes.",
      icon: BookOpen,
      badge: "Teach",
    },
    {
      num: "02",
      title: "Get 20 Welcome Credits Instantly",
      desc: "You don't need to teach first to start learning. When you join SkillBank, you receive a complimentary 20 credits bonus to request your first 2 peer learning sessions immediately.",
      icon: Coins,
      badge: "Join & Earn",
    },
    {
      num: "03",
      title: "Discover Compatible Peers on Campus",
      desc: "Our matching engine pairs you with peers based on mutual interests, proficiency levels, campus department, and preferred format (in-person meetups or Google Meet).",
      icon: Users,
      badge: "Match",
    },
    {
      num: "04",
      title: "Book & Attend 1:1 Sessions",
      desc: "Schedule a convenient time slot. Credits are safely reserved in an escrow ledger and only settled after you confirm the session took place.",
      icon: Calendar,
      badge: "Schedule",
    },
    {
      num: "05",
      title: "Rate Your Teacher & Award Bonus Credits",
      desc: "Leave feedback on your learning experience. Teachers earn rating-weighted bonuses: 5-star reviews reward 15 credits (150% base rate), incentivizing exceptional mentorship.",
      icon: Star,
      badge: "Reputation",
    },
    {
      num: "06",
      title: "Level Up with Masterclasses & Events",
      desc: "Beyond 1:1 exchanges, join deep-dive paid cohorts led by verified alumni, weekend hardware bootcamps, and campus-wide hackathons with cash prizes.",
      icon: GraduationCap,
      badge: "Certify",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Complete Platform Walkthrough
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Knowledge Exchange Made <span className="gradient-text">Frictionless</span>.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            SkillBank replaces the high cost of traditional tutoring with an auditable community credit
            economy. Here is how your skills unlock everything you want to learn.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="card p-6 space-y-4 bg-slate-900/60 border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-500/30">{s.num}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {s.badge}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
                  <s.icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Credit System Breakdown */}
        <div className="card p-8 md:p-12 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/20 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Auditable Tokenomics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Rating-Weighted Credit System
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Ordinary peer skill exchanges do not use cash. Instead, time and quality are tracked
              through an auditable transaction ledger that rewards great teaching.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-xs text-slate-400">Welcome Bonus</p>
              <p className="text-2xl font-black text-green-400">+20 Credits</p>
              <p className="text-[11px] text-slate-500">Credited on registration</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-xs text-slate-400">1:1 Session Cost</p>
              <p className="text-2xl font-black text-white">10 Credits</p>
              <p className="text-[11px] text-slate-500">Reserved until completion</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-xs text-slate-400">5-Star Reward</p>
              <p className="text-2xl font-black text-yellow-400">15 Credits</p>
              <p className="text-[11px] text-slate-500">150% base rate multiplier</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-xs text-slate-400">Self-Booking Check</p>
              <p className="text-2xl font-black text-blue-400">Escrow Safe</p>
              <p className="text-[11px] text-slate-500">Prevents replay attacks</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to exchange your first skill?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary btn-lg">
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/discover" className="btn btn-secondary btn-lg">
              Browse Available Skills
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
