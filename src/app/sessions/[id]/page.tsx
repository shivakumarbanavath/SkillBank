import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { cn, formatDate, formatDateTime, getFormatLabel, formatSessionStatus } from "@/lib/utils";
import { SessionActions } from "@/components/sessions/session-actions";
import { ReviewForm } from "@/components/sessions/review-form";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const skillSession = await prisma.skillSession.findUnique({
    where: { id: params.id },
    include: {
      teacher: { include: { profile: true } },
      learner: { include: { profile: true } },
      teachingSkill: { include: { category: true } },
      reviews: { include: { reviewer: { include: { profile: true } } } },
    },
  });

  if (!skillSession) notFound();

  // Only participants can view this session
  const isTeacher = skillSession.teacherId === userId;
  const isLearner = skillSession.learnerId === userId;
  if (!isTeacher && !isLearner) redirect("/sessions");

  const other = isTeacher ? skillSession.learner : skillSession.teacher;
  const statusInfo = formatSessionStatus(skillSession.status);
  const hasReviewed = skillSession.reviews.some((r) => r.reviewerId === userId);
  const canReview = skillSession.status === "COMPLETED" && isLearner && !hasReviewed;

  return (
    <div className="max-w-3xl">
      <Link href="/sessions" className="btn btn-ghost btn-sm mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Sessions
      </Link>

      <div className="space-y-6">
        {/* Header card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={cn(
                  "badge",
                  statusInfo.color === "green" ? "badge-green" :
                  statusInfo.color === "blue" ? "badge-blue" :
                  statusInfo.color === "yellow" ? "badge-yellow" :
                  statusInfo.color === "red" ? "badge-red" : "badge-gray"
                )}>
                  {statusInfo.label}
                </span>
                <span className="badge badge-gray">{getFormatLabel(skillSession.format)}</span>
              </div>
              <h1 className="text-xl font-black text-white">
                {isTeacher ? "Teaching" : "Learning"}: {skillSession.teachingSkill.skillName}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{skillSession.creditCost}</p>
              <p className="text-xs text-slate-400">credits</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-4 p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {formatDate(skillSession.scheduledDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Time</p>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                {skillSession.startTime} ({skillSession.durationMinutes} min)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Format</p>
              <p className="text-sm font-medium text-white">
                {getFormatLabel(skillSession.format)}
              </p>
            </div>
          </div>

          {skillSession.description && (
            <div className="mt-4 p-3 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500 mb-1">Session notes</p>
              <p className="text-sm text-slate-300">{skillSession.description}</p>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="card p-6">
          <h2 className="font-bold text-white mb-4">Participants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { role: "Teacher", user: skillSession.teacher, highlight: isTeacher },
              { role: "Learner", user: skillSession.learner, highlight: isLearner },
            ].map(({ role, user, highlight }) => (
              <div
                key={role}
                className={cn("p-4 rounded-xl border", highlight ? "border-blue-500/30 bg-blue-500/5" : "border-white/10")}
              >
                <p className="text-xs text-slate-500 mb-2">{role}{highlight && " (You)"}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">
                    {user.profile?.displayName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.profile?.displayName ?? user.name}</p>
                    <p className="text-xs text-slate-400">@{user.profile?.username}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {(skillSession.status === "REQUESTED" || skillSession.status === "ACCEPTED") && (
          <div className="card p-6">
            <h2 className="font-bold text-white mb-4">Actions</h2>
            <SessionActions
              sessionId={skillSession.id}
              status={skillSession.status}
              isTeacher={isTeacher}
              isLearner={isLearner}
            />
          </div>
        )}

        {/* Review form */}
        {canReview && (
          <div className="card p-6 border-yellow-500/30 bg-yellow-500/5">
            <h2 className="font-bold text-white mb-1">Leave a Review</h2>
            <p className="text-slate-400 text-sm mb-4">
              Your rating determines how many credits the teacher earns (5★ = 15 credits, 3★ = 10 credits)
            </p>
            <ReviewForm
              sessionId={skillSession.id}
              teacherId={skillSession.teacherId}
              teacherName={skillSession.teacher.profile?.displayName ?? skillSession.teacher.name ?? "Teacher"}
            />
          </div>
        )}

        {/* Existing reviews */}
        {skillSession.reviews.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-white mb-4">Reviews</h2>
            {skillSession.reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white">
                  {review.reviewer.profile?.displayName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{review.reviewer.profile?.displayName}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={cn("text-sm", i < review.rating ? "text-yellow-400" : "text-slate-700")}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-slate-300 mt-1">{review.comment}</p>}
                  {review.rewardAmount && (
                    <p className="text-xs text-green-400 mt-1">Teacher earned {review.rewardAmount} credits</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
