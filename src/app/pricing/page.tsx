import { PublicShell } from "@/components/layout/public-shell";
import Link from "next/link";
import { Check, Coins, Sparkles, GraduationCap, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Pricing & Credit Economics",
  description: "SkillBank pricing is built on a free credit economy for peer learning, with affordable paid cohorts for masterclasses.",
};

export default function PricingPage() {
  return (
    <PublicShell>
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5" /> Zero Cash for Peer Learning
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Fair, Transparent <span className="gradient-text">Skill Economics</span>.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            We believe money should never stand between a curious student and knowledge. Peer skill
            exchanges use credits, while professional masterclasses remain student-friendly.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Peer Exchange Tier */}
          <div className="card p-8 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-500/40 relative flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Peer Skill Exchange</h3>
                  <p className="text-xs text-blue-400 font-medium mt-0.5">Core Hyperlocal Community</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300">
                  Most Popular
                </span>
              </div>

              <div>
                <span className="text-4xl font-black text-white">₹0</span>
                <span className="text-sm text-slate-400 ml-2">Forever Free (Credit-Based)</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Exchange skills 1:1 with students across your campus. Receive 20 welcome credits on signup,
                and earn more every time you teach.
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10 text-sm text-slate-300">
                {[
                  "20 Welcome Credits on registration",
                  "1:1 In-Person & Online learning sessions",
                  "Deterministic mutual & one-way peer matching",
                  "Auditable credit ledger & escrow protection",
                  "Earn 10-15 credits per session taught",
                  "Unlimited reviews and public reputation profile",
                  "Campus student ID verification badge",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link href="/register" className="btn btn-primary btn-lg w-full">
                Get 20 Free Credits
              </Link>
            </div>
          </div>

          {/* Masterclasses & Workshops */}
          <div className="card p-8 bg-slate-900/60 border-white/10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Masterclasses & Events</h3>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">Modules B, C & D</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-400">
                  Optional Cohorts
                </span>
              </div>

              <div>
                <span className="text-4xl font-black text-white">From ₹299</span>
                <span className="text-sm text-slate-400 ml-2">per cohort</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Deep-dive multi-week cohorts and weekend hardware bootcamps led by senior engineering alumni,
                designers, and corporate partners.
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10 text-sm text-slate-300">
                {[
                  "In-depth multi-week curriculum & project reviews",
                  "Hands-on hardware labs & PCB design kits",
                  "Shareable, verifiable completion certificates",
                  "Direct Q&A office hours with industry instructors",
                  "Access to exclusive campus hackathons & expos",
                  "Full money-back guarantee if not satisfied",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link href="/courses" className="btn btn-secondary btn-lg w-full">
                Browse Masterclasses
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <h2 className="text-2xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="card p-5 space-y-2">
              <h3 className="font-bold text-white text-sm">Can I buy credits with cash?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No. To preserve the peer-learning spirit and educational equity, credits can only be
                earned by teaching skills or through initial onboarding welcome bonuses. Ordinary
                1:1 sessions cannot be bought with money.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="font-bold text-white text-sm">What happens if a session is cancelled?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you request a session, credits are placed in reservation. If the teacher declines
                or either party cancels before the session starts, reserved credits are immediately
                released back into your available balance.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="font-bold text-white text-sm">How do rating-weighted rewards work?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The base session cost is 10 credits. When the learner rates the session 5 stars, the teacher
                receives 15 credits (150% base rate). For 4 stars: 12.5 rounded to 13, 3 stars: 10,
                2 stars: 7.5 rounded to 8, 1 star: 5 credits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
