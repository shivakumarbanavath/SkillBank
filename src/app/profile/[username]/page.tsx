import { notFound } from "next/navigation";
import { getPublicProfile } from "@/actions/profile";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  Star,
  MapPin,
  School,
  Building2,
  CalendarDays,
  Clock,
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const result = await getPublicProfile(params.username);
  if (!result) return { title: "User Not Found" };
  return {
    title: `${result.profile.displayName} (@${result.profile.username})`,
    description: result.profile.bio || `Learn skills from ${result.profile.displayName} on SkillBank.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const result = await getPublicProfile(params.username);

  if (!result) notFound();

  const { profile, avgRating } = result;
  const isOwnProfile = session?.user?.id === profile.userId;

  let languages: string[] = [];
  try {
    languages = JSON.parse(profile.languages || "[]");
  } catch {
    languages = [];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card p-6 md:p-8 bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20 shrink-0">
              {profile.displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{profile.displayName}</h1>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Community Member
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">@{profile.username}</p>

              {(profile.showLocation && (profile.institution || profile.campus || profile.city)) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                  {profile.institution && (
                    <span className="flex items-center gap-1 text-blue-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" /> {profile.institution}
                    </span>
                  )}
                  {profile.campus && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <School className="w-3.5 h-3.5" /> {profile.campus}
                    </span>
                  )}
                  {profile.city && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" /> {profile.city}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
            {isOwnProfile ? (
              <Link href="/profile" className="btn btn-primary btn-sm">
                Edit Profile
              </Link>
            ) : (
              <>
                <Link
                  href={`/messages?userId=${profile.userId}`}
                  className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-slate-300 text-sm mt-6 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400" /> Rating
            </p>
            <p className="text-lg font-bold text-white mt-1">
              {avgRating > 0 ? avgRating.toFixed(1) : "New"}{" "}
              <span className="text-xs text-slate-500 font-normal">
                ({profile.user._count.reviewsReceived} reviews)
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" /> Sessions Taught
            </p>
            <p className="text-lg font-bold text-white mt-1">
              {profile.user._count.sessionsAsTeacher} completed
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Skills Offered
            </p>
            <p className="text-lg font-bold text-white mt-1">
              {profile.user.teachingSkills.length} skills
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Format
            </p>
            <p className="text-lg font-bold text-white mt-1 capitalize">
              {profile.preferredFormat.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap">
            <span className="text-xs text-slate-400">Languages:</span>
            {languages.map((lang) => (
              <span key={lang} className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Teaching Skills Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" /> Skills Offered by {profile.displayName}
        </h2>

        {profile.user.teachingSkills.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">
            No active teaching skills listed yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {profile.user.teachingSkills.map((skill) => (
              <div key={skill.id} className="card p-5 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {skill.category.name}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{skill.skillName}</h3>
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                      {skill.proficiency}
                    </span>
                  </div>

                  {skill.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                      {skill.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {skill.duration} mins
                    </span>
                    <span className="capitalize">
                      {skill.format.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>

                {!isOwnProfile && (
                  <Link
                    href={`/skills/${skill.id}`}
                    className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2"
                  >
                    <span>Request 1:1 Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Interests Section */}
      {profile.user.learningInterests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> Wants to Learn
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.user.learningInterests.map((interest) => (
              <span
                key={interest.id}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm flex items-center gap-1.5"
              >
                <span>{interest.skillName}</span>
                <span className="text-xs text-purple-400/60">({interest.category.name})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Received Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> Reviews ({profile.user._count.reviewsReceived})
        </h2>

        {profile.user.reviewsReceived.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">
            No reviews yet. Complete a session to earn the first review!
          </div>
        ) : (
          <div className="space-y-3">
            {profile.user.reviewsReceived.map((review) => (
              <div key={review.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {review.reviewer.profile?.displayName?.[0] ?? "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {review.reviewer.profile?.displayName ?? "Anonymous"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{review.rating}.0</span>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-slate-300 pt-1 italic">
                    &quot;{review.comment}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
