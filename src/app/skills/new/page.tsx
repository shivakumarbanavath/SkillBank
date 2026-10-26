"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { createSkill } from "@/actions/skills";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const schema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  skillName: z.string().min(2, "Skill name must be at least 2 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  format: z.enum(["IN_PERSON", "ONLINE", "EITHER"]),
  duration: z.number().min(30).max(240),
  prerequisites: z.string().max(500).optional(),
  tagsInput: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewSkillPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      proficiency: "INTERMEDIATE",
      format: "EITHER",
      duration: 60,
    },
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  async function onSubmit(data: FormData) {
    const tags = data.tagsInput
      ? data.tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const result = await createSkill({
      categoryId: data.categoryId,
      skillName: data.skillName,
      description: data.description,
      proficiency: data.proficiency,
      format: data.format,
      duration: data.duration,
      prerequisites: data.prerequisites,
      tags,
    });

    if (result.success) {
      toast({ type: "success", title: "Skill created!", description: `${data.skillName} is now listed` });
      router.push("/skills");
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/skills" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Add Teaching Skill</h1>
          <p className="text-slate-400 text-sm mt-0.5">Share your expertise with the community</p>
        </div>
      </div>

      <motion.div
        className="card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category */}
          <div>
            <label htmlFor="skill-category" className="label">Category *</label>
            <select
              id="skill-category"
              className={cn("input-md", errors.categoryId && "border-red-500/60")}
              {...register("categoryId")}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="error-text">{errors.categoryId.message}</p>}
          </div>

          {/* Skill name */}
          <div>
            <label htmlFor="skill-name" className="label">Skill Name *</label>
            <input
              id="skill-name"
              className={cn("input-md", errors.skillName && "border-red-500/60")}
              placeholder="e.g., Python Programming, Acoustic Guitar"
              {...register("skillName")}
            />
            {errors.skillName && <p className="error-text">{errors.skillName.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="skill-desc" className="label">Description *</label>
            <textarea
              id="skill-desc"
              className={cn("input-md h-36 resize-none", errors.description && "border-red-500/60")}
              placeholder="Describe what you'll teach, your approach, what learners will gain..."
              {...register("description")}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* Proficiency + Format */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill-proficiency" className="label">Your Proficiency Level *</label>
              <select
                id="skill-proficiency"
                className="input-md"
                {...register("proficiency")}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label htmlFor="skill-format" className="label">Session Format *</label>
              <select
                id="skill-format"
                className="input-md"
                {...register("format")}
              >
                <option value="IN_PERSON">In Person</option>
                <option value="ONLINE">Online</option>
                <option value="EITHER">Either</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="skill-duration" className="label">Session Duration (minutes) *</label>
            <select
              id="skill-duration"
              className="input-md"
              onChange={(e) => setValue("duration", parseInt(e.target.value))}
              defaultValue="60"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>

          {/* Prerequisites */}
          <div>
            <label htmlFor="skill-prereqs" className="label">
              Prerequisites <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="skill-prereqs"
              className="input-md"
              placeholder="e.g., Basic understanding of programming"
              {...register("prerequisites")}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="skill-tags" className="label">
              Tags <span className="text-slate-500">(optional, comma-separated)</span>
            </label>
            <input
              id="skill-tags"
              className="input-md"
              placeholder="python, beginner-friendly, data-science"
              {...register("tagsInput")}
            />
            <p className="text-xs text-slate-500 mt-1">Tags help learners find your skill</p>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-300">
                Each session costs <span className="text-white font-semibold">10 credits</span>. 
                You&apos;ll earn 5–15 credits based on your learner&apos;s rating (1★–5★).
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/skills" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg flex-1 justify-center"
              id="create-skill-button"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                "Publish Skill"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
