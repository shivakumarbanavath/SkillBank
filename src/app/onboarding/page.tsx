"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { upsertProfile, completeOnboarding } from "@/actions/profile";
import { createSkill } from "@/actions/skills";
import { addLearningInterest } from "@/actions/skills";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Your Profile", description: "Tell us about yourself" },
  { id: 2, title: "Teaching Skills", description: "What can you teach?" },
  { id: 3, title: "Learning Goals", description: "What do you want to learn?" },
  { id: 4, title: "Preferences", description: "How do you prefer to learn?" },
  { id: 5, title: "All Set!", description: "Ready to start" },
];

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "React", "Machine Learning", "Arduino",
  "Guitar", "Piano", "UI/UX Design", "Photography", "Public Speaking",
  "Hindi", "Spanish", "French", "3D Printing", "Video Editing",
  "Digital Marketing", "Finance", "DSA", "System Design",
];

const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores"),
  displayName: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  campus: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [teachingSelections, setTeachingSelections] = useState<string[]>([]);
  const [learningSelections, setLearningSelections] = useState<string[]>([]);
  const [format, setFormat] = useState<"IN_PERSON" | "ONLINE" | "EITHER">("EITHER");
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: session?.user?.name ?? "",
    },
  });

  async function handleProfileSubmit(data: ProfileFormData) {
    setLoading(true);
    const result = await upsertProfile({
      ...data,
      languages: ["English"],
      preferredFormat: format,
    });
    setLoading(false);
    if (result.success) {
      setStep(2);
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  async function handleComplete() {
    if (!session?.user?.id) return;
    setLoading(true);

    // Add teaching skill interests
    // We'll need categories — fetch them from the public endpoint
    // For onboarding simplicity, we create generic skills without category (handled in skills page)
    // Complete onboarding
    await completeOnboarding(session.user.id);
    await update({ onboardingDone: true });
    setLoading(false);
    setStep(5);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="fixed inset-0 bg-hero-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-black">S</span>
            </div>
            <span className="text-xl font-bold text-white">SkillBank</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            Let&apos;s set up your profile
          </h1>
          <p className="text-slate-400 mt-2">Takes about 2 minutes</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className="flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  s.id < step ? "bg-blue-500" : s.id === step ? "bg-blue-500/60" : "bg-white/10"
                )}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-6">
                  {STEPS[0].title}
                </h2>
                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ob-displayName" className="label">Display Name *</label>
                      <input
                        id="ob-displayName"
                        className={cn("input-md", errors.displayName && "border-red-500/60")}
                        placeholder="Arjun Menon"
                        {...register("displayName")}
                      />
                      {errors.displayName && <p className="error-text">{errors.displayName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="ob-username" className="label">Username *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                        <input
                          id="ob-username"
                          className={cn("input-md pl-7", errors.username && "border-red-500/60")}
                          placeholder="arjun_menon"
                          {...register("username")}
                        />
                      </div>
                      {errors.username && <p className="error-text">{errors.username.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ob-bio" className="label">Bio <span className="text-slate-500">(optional)</span></label>
                    <textarea
                      id="ob-bio"
                      className="input-md h-24 resize-none"
                      placeholder="Tell the community a bit about yourself..."
                      {...register("bio")}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ob-campus" className="label">Campus / Institution <span className="text-slate-500">(optional)</span></label>
                      <input
                        id="ob-campus"
                        className="input-md"
                        placeholder="NIT Calicut"
                        {...register("campus")}
                      />
                    </div>
                    <div>
                      <label htmlFor="ob-city" className="label">City <span className="text-slate-500">(optional)</span></label>
                      <input
                        id="ob-city"
                        className="input-md"
                        placeholder="Calicut"
                        {...register("city")}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-full justify-center"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">{STEPS[1].title}</h2>
                <p className="text-slate-400 text-sm mb-6">Select skills you can teach others (choose any)</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SKILL_SUGGESTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        setTeachingSelections((prev) =>
                          prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
                        );
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                        teachingSelections.includes(skill)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                      )}
                    >
                      {teachingSelections.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                      {skill}
                    </button>
                  ))}
                </div>
                {teachingSelections.length > 0 && (
                  <p className="text-xs text-blue-400 mb-4">
                    Selected: {teachingSelections.join(", ")}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary btn-lg"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-primary btn-lg flex-1 justify-center"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">{STEPS[2].title}</h2>
                <p className="text-slate-400 text-sm mb-6">What would you like to learn? (choose any)</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SKILL_SUGGESTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        setLearningSelections((prev) =>
                          prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
                        );
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                        learningSelections.includes(skill)
                          ? "bg-cyan-600 border-cyan-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                      )}
                    >
                      {learningSelections.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                      {skill}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-secondary btn-lg"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn btn-primary btn-lg flex-1 justify-center"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">{STEPS[3].title}</h2>
                <p className="text-slate-400 text-sm mb-6">How do you prefer to have sessions?</p>
                <div className="grid gap-3 mb-8">
                  {([
                    { value: "IN_PERSON", label: "In Person", desc: "Meet face-to-face at a location" },
                    { value: "ONLINE", label: "Online", desc: "Video call or virtual session" },
                    { value: "EITHER", label: "Either works", desc: "Open to both formats" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormat(opt.value)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        format === opt.value
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          format === opt.value ? "border-blue-500" : "border-slate-600"
                        )}>
                          {format === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{opt.label}</p>
                          <p className="text-xs text-slate-400">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-secondary btn-lg"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading}
                    className="btn btn-primary btn-lg flex-1 justify-center"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Complete Setup <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8 gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white">You&apos;re all set!</h2>
                <p className="text-slate-400">Redirecting to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
