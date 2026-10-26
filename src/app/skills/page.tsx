import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit2, ToggleLeft, ToggleRight, Trash2, Zap } from "lucide-react";
import { parseJsonSafe, getProficiencyLabel, getFormatLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SkillActions } from "@/components/skills/skill-actions";

export const metadata = { title: "My Skills" };

export default async function SkillsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const skills = await prisma.teachingSkill.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const learningInterests = await prisma.learningInterest.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">My Skills</h1>
          <p className="text-slate-400 mt-1">Manage what you teach and want to learn</p>
        </div>
        <Link href="/skills/new" className="btn btn-primary btn-md">
          <Plus className="w-4 h-4" /> Add Teaching Skill
        </Link>
      </div>

      {/* Teaching skills */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Teaching Skills ({skills.length})
        </h2>

        {skills.length === 0 ? (
          <div className="card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">No teaching skills yet</p>
              <p className="text-slate-400 text-sm mt-1">Add skills to start teaching and earning credits</p>
            </div>
            <Link href="/skills/new" className="btn btn-primary btn-md">
              <Plus className="w-4 h-4" /> Add Your First Skill
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => {
              const tags = parseJsonSafe<string[]>(skill.tags, []);
              return (
                <div
                  key={skill.id}
                  className={cn(
                    "card p-5 flex flex-col sm:flex-row sm:items-center gap-4",
                    !skill.isActive && "opacity-60"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{skill.skillName}</p>
                          <span className="badge badge-blue text-xs">{skill.category.name}</span>
                          <span className="badge badge-gray text-xs">{getProficiencyLabel(skill.proficiency)}</span>
                          {!skill.isActive && (
                            <span className="badge badge-red text-xs">Inactive</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{skill.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{getFormatLabel(skill.format)}</span>
                          <span>·</span>
                          <span>{skill.duration} min sessions</span>
                          {tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{tags.slice(0, 3).join(", ")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <SkillActions
                    skillId={skill.id}
                    isActive={skill.isActive}
                    skillName={skill.skillName}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Learning interests */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          Learning Interests ({learningInterests.length})
        </h2>
        <div className="card p-6">
          {learningInterests.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No learning interests yet.{" "}
              <Link href="/discover" className="text-blue-400 hover:underline">Browse skills</Link>{" "}
              to add interests.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {learningInterests.map((interest) => (
                <div key={interest.id} className="flex items-center gap-1.5 badge badge-purple">
                  {interest.skillName}
                  <span className="text-purple-400/60">({interest.category.name})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
