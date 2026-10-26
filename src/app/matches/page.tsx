import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeMatches } from "@/lib/matching";
import Link from "next/link";
import { GitMerge, RefreshCw, Star, MapPin, Clock, BookOpen } from "lucide-react";
import { cn, getFormatLabel, getProficiencyLabel } from "@/lib/utils";

export const metadata = { title: "Your Matches" };
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matches = await computeMatches({
    learnerId: session.user.id,
    limit: 20,
  });

  const learningInterests = await prisma.learningInterest.findMany({
    where: { userId: session.user.id },
    include: { category: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <GitMerge className="w-7 h-7 text-cyan-400" />
            Your Matches
          </h1>
          <p className="text-slate-400 mt-1">
            Teachers matched to your learning interests
          </p>
        </div>
        <form>
          <button type="submit" className="btn btn-secondary btn-md">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </form>
      </div>

      {learningInterests.length === 0 ? (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <GitMerge className="w-12 h-12 text-slate-600" />
          <div>
            <p className="text-white font-semibold text-lg">No learning interests set</p>
            <p className="text-slate-400 text-sm mt-1">
              Add learning interests to get matched with teachers
            </p>
          </div>
          <Link href="/discover" className="btn btn-primary btn-md">
            Browse Skills to Add Interests
          </Link>
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <GitMerge className="w-12 h-12 text-slate-600" />
          <div>
            <p className="text-white font-semibold text-lg">No matches yet</p>
            <p className="text-slate-400 text-sm mt-1">
              No teachers are currently offering skills you want to learn.
              Check back later or{" "}
              <Link href="/discover" className="text-blue-400 hover:underline">
                browse all skills
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-sm">
              Found <span className="text-white font-semibold">{matches.length}</span> matches
            </p>
            {matches.some((m) => m.isMutual) && (
              <span className="badge badge-cyan">
                🔄 {matches.filter((m) => m.isMutual).length} mutual exchanges available
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((match, i) => (
              <div
                key={`${match.teacherId}-${match.teachingSkillId}`}
                className={cn(
                  "card p-5 hover:border-blue-500/40 transition-all duration-300 flex flex-col gap-4",
                  match.isMutual && "border-cyan-500/30 bg-cyan-500/5"
                )}
              >
                {match.isMutual && (
                  <div className="badge badge-cyan self-start">
                    🔄 Mutual Exchange
                  </div>
                )}

                {/* Teacher info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {match.profile.displayName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{match.profile.displayName}</p>
                    <p className="text-xs text-slate-400">@{match.profile.username}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 justify-end">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-white">
                        {match.rating > 0 ? match.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    {match.reviewCount > 0 && (
                      <p className="text-xs text-slate-500">{match.reviewCount} reviews</p>
                    )}
                  </div>
                </div>

                {/* Skill */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{match.skill.skillName}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="badge badge-blue">{match.skill.categoryName}</span>
                    <span className="badge badge-gray">{getProficiencyLabel(match.skill.proficiency)}</span>
                    <span className="badge badge-gray">{getFormatLabel(match.skill.format)}</span>
                  </div>
                </div>

                {/* Match reasons */}
                <div className="space-y-1">
                  {match.reasons.slice(0, 2).map((r, j) => (
                    <p key={j} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="text-green-400">✓</span> {r}
                    </p>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {match.profile.campus && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {match.profile.campus}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {match.skill.duration}min
                  </span>
                  {match.completedSessions > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {match.completedSessions} sessions
                    </span>
                  )}
                </div>

                {/* Match score */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, match.score)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{match.score}% match</span>
                </div>

                <Link
                  href={`/skills/${match.teachingSkillId}`}
                  className="btn btn-primary btn-md w-full justify-center"
                >
                  Request Session
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
