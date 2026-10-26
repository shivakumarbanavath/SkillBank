"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Zap, Users, Star, Shield, BookOpen, Coins,
  GitMerge, Globe, Check, ChevronDown, Code2, Music, Palette,
  Camera, Cpu, MessageSquare, Briefcase, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// HERO SECTION
// ============================================================
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Now live at NIT Calicut & beyond
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight text-balance mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Skills Are{" "}
              <span className="gradient-text">Worth More</span>{" "}
              Than You Think.
            </motion.h1>

            <motion.p
              className="text-xl text-slate-300 leading-relaxed mb-10 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover people around you, exchange knowledge, and turn what you
              know into opportunities to learn something new — without money
              getting in the way.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/register"
                className="btn btn-primary btn-xl group"
                id="hero-cta-primary"
              >
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explore"
                className="btn btn-secondary btn-xl"
                id="hero-cta-secondary"
              >
                Explore Skills
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center gap-6 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex -space-x-2">
                {["A", "P", "R", "S", "D"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white"
                    style={{ zIndex: 5 - i }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Trusted by <span className="text-white font-semibold">500+</span> learners
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right — Skill exchange illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ExchangeIllustration />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-xs tracking-wider uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}

function ExchangeIllustration() {
  const skillCards = [
    { skill: "Python", user: "Arjun", icon: Code2, color: "from-blue-500 to-indigo-600", teaches: true },
    { skill: "Arduino", user: "Priya", icon: Cpu, color: "from-orange-500 to-red-600", teaches: false },
    { skill: "UI/UX Design", user: "Rahul", icon: Palette, color: "from-purple-500 to-pink-600", teaches: true },
    { skill: "Guitar", user: "Priya", icon: Music, color: "from-green-500 to-emerald-600", teaches: false },
    { skill: "Photography", user: "Sneha", icon: Camera, color: "from-yellow-500 to-amber-600", teaches: true },
    { skill: "ML Basics", user: "Arjun", icon: Brain, color: "from-cyan-500 to-blue-600", teaches: false },
  ];

  return (
    <div className="relative h-[520px] flex items-center justify-center">
      {/* Center exchange icon */}
      <div className="absolute z-20 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-float">
        <GitMerge className="w-8 h-8 text-white" />
      </div>

      {/* Skill cards orbiting */}
      {skillCards.map((card, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const radius = 185;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            className={cn(
              "absolute z-10 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl w-44",
              "hover:border-blue-500/40 hover:shadow-blue-500/10 transition-all duration-300"
            )}
            style={{ left: `calc(50% + ${x}px - 88px)`, top: `calc(50% + ${y}px - 40px)` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05, zIndex: 30 }}
          >
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2", card.color)}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-white">{card.skill}</p>
            <p className="text-xs text-slate-400">{card.teaches ? "Teaching" : "Learning"}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">
                {card.user[0]}
              </div>
              <span className="text-xs text-slate-500">{card.user}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 600 520">
        {skillCards.map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x = 300 + Math.cos(angle) * 185;
          const y = 260 + Math.sin(angle) * 185;
          return (
            <line
              key={i}
              x1="300" y1="260"
              x2={x} y2={y}
              stroke="#3b82f6" strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "List Your Skills",
      description: "Tell the community what you know and what you'd like to learn. Create detailed skill listings with your proficiency level.",
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      step: "02",
      title: "Get Matched",
      description: "Our matching engine finds compatible learners and teachers based on your skills, interests, location, and availability.",
      icon: GitMerge,
      color: "text-cyan-400",
    },
    {
      step: "03",
      title: "Exchange Skills",
      description: "Request sessions, connect with your match, teach and learn. Sessions can be in-person or online.",
      icon: Users,
      color: "text-purple-400",
    },
    {
      step: "04",
      title: "Earn Credits",
      description: "Teaching earns you credits. Use credits to learn new skills from others. Ratings influence your credit rewards.",
      icon: Coins,
      color: "text-yellow-400",
    },
  ];

  return (
    <section className="section bg-slate-950" aria-labelledby="how-it-works-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.span
            className="badge badge-blue mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Simple Process
          </motion.span>
          <motion.h2
            id="how-it-works-heading"
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How SkillBank <span className="gradient-text">Works</span>
          </motion.h2>
          <motion.p
            className="text-slate-400 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Four simple steps to start exchanging skills and building your knowledge
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="card-hover p-6 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-6xl font-black text-white/5 absolute top-4 right-4">
                {step.step}
              </div>
              <div className={cn("w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4", step.color)}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FEATURED CATEGORIES
// ============================================================
const categories = [
  { name: "Programming", icon: Code2, count: 42, color: "from-blue-500 to-indigo-600" },
  { name: "Music", icon: Music, count: 28, color: "from-green-500 to-emerald-600" },
  { name: "Design", icon: Palette, count: 35, color: "from-purple-500 to-pink-600" },
  { name: "AI & ML", icon: Brain, count: 19, color: "from-cyan-500 to-blue-600" },
  { name: "Electronics", icon: Cpu, count: 24, color: "from-orange-500 to-red-600" },
  { name: "Photography", icon: Camera, count: 16, color: "from-yellow-500 to-amber-600" },
  { name: "Communication", icon: MessageSquare, count: 31, color: "from-teal-500 to-cyan-600" },
  { name: "Career", icon: Briefcase, count: 22, color: "from-pink-500 to-rose-600" },
];

function CategoriesSection() {
  return (
    <section className="section bg-slate-900/30" aria-labelledby="categories-heading">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <span className="badge badge-cyan mb-2">Explore</span>
            <h2 id="categories-heading" className="text-3xl sm:text-4xl font-black text-white">
              Featured <span className="gradient-text">Categories</span>
            </h2>
          </div>
          <Link href="/explore" className="btn btn-secondary btn-md shrink-0">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/explore?category=${cat.name.toLowerCase().replace(/\s/g, "-")}`}
                className="group card-hover p-5 block"
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform", cat.color)}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-white text-sm mb-1">{cat.name}</p>
                <p className="text-xs text-slate-400">{cat.count} teachers</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CREDIT SYSTEM
// ============================================================
function CreditSystemSection() {
  const rewards = [
    { stars: 5, multiplier: "1.5×", credits: 15, label: "Excellent" },
    { stars: 4, multiplier: "1.25×", credits: 13, label: "Great" },
    { stars: 3, multiplier: "1.0×", credits: 10, label: "Good" },
    { stars: 2, multiplier: "0.75×", credits: 8, label: "Fair" },
    { stars: 1, multiplier: "0.5×", credits: 5, label: "Poor" },
  ];

  return (
    <section className="section bg-slate-950" aria-labelledby="credits-heading">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="badge badge-yellow mb-4">
              <Coins className="w-3 h-3" />
              Credit Economy
            </span>
            <h2 id="credits-heading" className="text-4xl sm:text-5xl font-black text-white mb-6">
              Teach to Earn.{" "}
              <span className="gradient-text">Learn to Grow.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              SkillBank uses a credit system that rewards quality teaching.
              The better your teaching, the more credits you earn. Use credits
              to learn any skill from any teacher — no cash required for peer sessions.
            </p>
            <div className="space-y-4">
              {[
                "Welcome bonus of 20 credits when you join",
                "Earn 5–15 credits per teaching session based on ratings",
                "Spend credits to learn from any teacher",
                "Credits never expire",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <p className="text-slate-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="card p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">Base Reward per Session</p>
                <span className="text-2xl font-black text-white">10 credits</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </div>
            </div>

            {rewards.map((reward, i) => (
              <motion.div
                key={i}
                className="card p-4 flex items-center gap-4"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-0.5 shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={cn("w-4 h-4", j < reward.stars ? "text-yellow-400 fill-yellow-400" : "text-slate-700")}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 w-12">{reward.label}</span>
                <span className="text-sm text-slate-400 font-mono">{reward.multiplier}</span>
                <div className="flex-1">
                  <div
                    className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${(reward.credits / 15) * 100}%` }}
                  />
                </div>
                <span className="text-base font-black text-white shrink-0">{reward.credits}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TRUST AND SAFETY
// ============================================================
function TrustSection() {
  const features = [
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Campus verification and email verification to ensure you know who you're connecting with.",
    },
    {
      icon: Star,
      title: "Ratings & Reviews",
      description: "Honest feedback system keeps teachers accountable and helps learners make informed choices.",
    },
    {
      icon: Globe,
      title: "Community Guidelines",
      description: "Clear rules about respectful interaction, private meeting safety, and appropriate content.",
    },
    {
      icon: Users,
      title: "Report & Block",
      description: "Easy reporting tools and user blocking to keep the community safe and respectful.",
    },
  ];

  return (
    <section className="section bg-slate-900/50" aria-labelledby="trust-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="badge badge-green mb-4">
            <Shield className="w-3 h-3" />
            Safety First
          </span>
          <h2 id="trust-heading" className="text-4xl sm:text-5xl font-black text-white mb-4">
            A Community You Can <span className="gradient-text">Trust</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            We take the safety and wellbeing of our members seriously.
            Learn in a secure, verified community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              className="card-hover p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <feat.icon className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 card p-6 bg-green-500/5 border-green-500/20 text-center">
          <p className="text-slate-300">
            <span className="text-green-400 font-semibold">Safe Meetup Tips:</span> For in-person sessions, we recommend meeting in public
            places like libraries, campus common areas, or cafeterias. Never share your personal
            address directly.
          </p>
          <Link href="/safety" className="text-green-400 hover:text-green-300 text-sm font-medium mt-2 inline-block">
            Read our full Safety Guidelines →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRICING
// ============================================================
function PricingSection() {
  return (
    <section className="section bg-slate-950" aria-labelledby="pricing-heading">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-16">
          <span className="badge badge-purple mb-4">Pricing</span>
          <h2 id="pricing-heading" className="text-4xl sm:text-5xl font-black text-white mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-slate-400 text-xl max-w-xl mx-auto">
            Start for free. Upgrade for advanced features when you need them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            className="card p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-400 mb-2">FREE</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">₹0</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited skill listings",
                "Standard discovery",
                "Skill matching",
                "Messaging",
                "Standard credits",
                "Public rating profile",
                "20 welcome credits",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-secondary btn-lg w-full justify-center">
              Get Started Free
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            className="card p-8 border-blue-500/30 bg-blue-500/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute top-4 right-4">
              <span className="badge badge-blue">Most Popular</span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-400 mb-2">PREMIUM</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">₹99</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Premium badge on profile",
                "Priority in matching",
                "Advanced discovery filters",
                "Group session discovery",
                "Learning analytics",
                "Enhanced profile customization",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing/upgrade" className="btn btn-primary btn-lg w-full justify-center">
              Upgrade to Premium
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQSection() {
  const faqs = [
    {
      q: "How does skill exchange work without money?",
      a: "SkillBank uses a credit system. When you teach someone, you earn credits based on their rating of your session. Use those credits to learn from others. No cash changes hands for peer skill swaps.",
    },
    {
      q: "What if I can't find a direct skill exchange match?",
      a: "One-way teaching is always available. You can teach someone a skill, earn credits, and spend those credits learning from a completely different teacher. You don't need to find the perfect mutual match.",
    },
    {
      q: "How are teachers verified?",
      a: "Users can submit campus or institutional verification requests. Our team reviews and approves verified badges. Email verification is also available. Ratings and reviews from real sessions build trust over time.",
    },
    {
      q: "Can I use SkillBank if I'm not a student?",
      a: "Absolutely! While SkillBank started in student communities, it's open to anyone who wants to teach or learn skills. Young professionals, self-taught learners, and creative people are all welcome.",
    },
    {
      q: "What happens if a teacher doesn't show up?",
      a: "You can report a no-show through the session page. Reported credits (reserved for that session) are released back to you. We have dispute resolution for contested situations.",
    },
    {
      q: "Are masterclasses and paid courses different?",
      a: "Yes. Peer skill swaps use the credit system. Masterclasses and premium courses by verified instructors use direct payment (INR). The credit economy and monetary economy are kept separate.",
    },
  ];

  return (
    <section className="section bg-slate-900/30" aria-labelledby="faq-heading">
      <div className="container-custom max-w-3xl">
        <div className="text-center mb-16">
          <h2 id="faq-heading" className="text-4xl font-black text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              className="card group"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer text-white font-semibold list-none select-none">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CTA
// ============================================================
function CTASection() {
  return (
    <section className="section" aria-labelledby="cta-heading">
      <div className="container-custom max-w-4xl text-center">
        <motion.div
          className="relative card p-16 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 id="cta-heading" className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to Start Your{" "}
              <span className="gradient-text">Skill Exchange</span>?
            </h2>
            <p className="text-slate-300 text-xl mb-10">
              Join hundreds of learners and teachers in your community.
              Your first 20 credits are free.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn btn-primary btn-xl" id="final-cta-button">
                Create Your Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/explore" className="btn btn-secondary btn-xl">
                Browse Skills First
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// PAGE EXPORT
// ============================================================
export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <CreditSystemSection />
      <TrustSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
