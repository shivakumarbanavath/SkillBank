import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Star, MapPin, Clock, BookOpen, ArrowLeft, CheckCircle } from "lucide-react";
import { cn, parseJsonSafe, getProficiencyLabel, getFormatLabel } from "@/lib/utils";
import { SessionRequestForm } from "@/components/sessions/session-request-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const skill = await prisma.teachingSkill.findUnique({
    where: { id: params.id },
    include: { user: { include: { profile: true } } },
  });
  if (!skill) return { title: "Skill Not Found" };
  return { title: `${skill.skillName} — taught by ${skill.user.profile?.displayName}` };
}

export default async function SkillDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const skill = await prisma.teachingSkill.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      user: {
        include: {
          profile: true,
          reviewsReceived: {
            include: { reviewer: { include: { profile: true } }, session: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: { sessionsAsTeacher: { where: { status: "COMPLETED" } } },
          },
        },
      },
    },
  });

  if (!skill) notFound();

  const teacher = skill.user;
  const isOwner = session?.user?.id === teacher.id;
  const tags = parseJsonSafe<string[]>(skill.tags, []);

  const reviews = teacher.reviewsReceived;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Get learner's credit balance
  let userCredits = 0;
  if (session?.user?.id && !isOwner) {
    const acc = await prisma.creditAccount.findUnique({
      where: { userId: session.user.id },
    });
    userCredits = (acc?.balance ?? 0) - (acc?.reservedBalance ?? 0);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/discover" className="btn btn-ghost btn-sm mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Skill details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge badge-blue">{skill.category.name}</span>
                  <span className="badge badge-gray">{getProficiencyLabel(skill.proficiency)}</span>
                  <span className="badge badge-gray">{getFormatLabel(skill.format)}</span>
                </div>
                <h1 className="text-2xl font-black text-white">{skill.skillName}</h1>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">{skill.description}</p>

            {skill.prerequisites && (
              <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-xs font-semibold text-yellow-400 mb-1">Prerequisites</p>
                <p className="text-sm text-slate-300">{skill.prerequisites}</p>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tags.map((tag) => (
                  <span key={tag} className="badge badge-gray">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {skill.duration} minutes
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {teacher._count.sessionsAsTeacher} sessions completed
              </span>
            </div>
          </div>

          {/* Teacher info */}
          <div className="card p-6">
            <h2 className="font-bold text-white mb-4">About the Teacher</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {teacher.profile?.displayName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white">{teacher.profile?.displayName}</p>
                  <p className="text-slate-400 text-sm">@{teacher.profile?.username}</p>
                </div>
                {teacher.profile?.campus && (
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {teacher.profile.campus}
                  </p>
                )}
                {teacher.profile?.bio && (
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{teacher.profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn("w-4 h-4", i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-700")}
                        />
                      ))}
                      <span className="text-sm text-white font-semibold ml-1">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-white mb-4">Reviews</h2>
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                        {review.reviewer.profile?.displayName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{review.reviewer.profile?.displayName}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn("w-3.5 h-3.5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700")}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-300">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Request panel */}
        <div className="space-y-4">
          {isOwner ? (
            <div className="card p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold">This is your skill</p>
              <p className="text-slate-400 text-sm mt-1">Manage it from your skills page</p>
              <Link href="/skills" className="btn btn-secondary btn-md mt-4 w-full justify-center">
                Manage Skills
              </Link>
            </div>
          ) : !session?.user ? (
            <div className="card p-6 text-center">
              <p className="text-white font-semibold mb-3">Sign in to request a session</p>
              <Link href={`/login?callbackUrl=/skills/${skill.id}`} className="btn btn-primary btn-lg w-full justify-center">
                Sign In to Request
              </Link>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-white">Request a Session</p>
                <span className="badge badge-yellow">10 credits</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                You have <span className="text-white font-semibold">{userCredits}</span> credits available.
              </p>
              {userCredits < 10 ? (
                <div>
                  <p className="text-red-400 text-sm mb-3">Not enough credits for this session.</p>
                  <Link href="/credits" className="btn btn-secondary btn-md w-full justify-center">
                    Get More Credits
                  </Link>
                </div>
              ) : (
                <SessionRequestForm
                  skillId={skill.id}
                  teacherId={teacher.id}
                  teacherName={teacher.profile?.displayName ?? teacher.name ?? "Teacher"}
                  skillName={skill.skillName}
                  duration={skill.duration}
                  format={skill.format}
                  creditCost={10}
                />
              )}
            </div>
          )}

          {/* Cost breakdown */}
          <div className="card p-5 bg-blue-500/5 border-blue-500/20">
            <p className="text-sm font-semibold text-white mb-3">Session Cost Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Session fee</span>
                <span className="text-white">10 credits</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Teacher earns (5★)</span>
                <span className="text-green-400">15 credits</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Teacher earns (3★)</span>
                <span className="text-green-400">10 credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
