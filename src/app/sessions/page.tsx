import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { cn, formatDate, getFormatLabel, formatSessionStatus, getInitials } from "@/lib/utils";

export const metadata = { title: "My Sessions" };
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Upcoming", value: "ACCEPTED" },
  { label: "Pending", value: "REQUESTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const statusFilter = searchParams.status;

  const where: Record<string, unknown> = {
    OR: [{ teacherId: userId }, { learnerId: userId }],
  };
  if (statusFilter) where.status = statusFilter;

  const sessions = await prisma.skillSession.findMany({
    where,
    include: {
      teacher: { include: { profile: true } },
      learner: { include: { profile: true } },
      teachingSkill: { include: { category: true } },
      reviews: { where: { reviewerId: userId } },
    },
    orderBy: [
      { status: "asc" },
      { scheduledDate: "desc" },
    ],
  });

  const counts = await prisma.$transaction([
    prisma.skillSession.count({ where: { OR: [{ teacherId: userId }, { learnerId: userId }], status: "ACCEPTED" } }),
    prisma.skillSession.count({ where: { OR: [{ teacherId: userId }, { learnerId: userId }], status: "REQUESTED" } }),
    prisma.skillSession.count({ where: { OR: [{ teacherId: userId }, { learnerId: userId }], status: "COMPLETED" } }),
  ]);

  const tabCounts: Record<string, number> = {
    ACCEPTED: counts[0],
    REQUESTED: counts[1],
    COMPLETED: counts[2],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Sessions</h1>
        <p className="text-slate-400 mt-1">Manage your learning and teaching sessions</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/sessions?status=${tab.value}` : "/sessions"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              statusFilter === tab.value || (!statusFilter && !tab.value)
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
            {tab.value && tabCounts[tab.value] > 0 && (
              <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {tabCounts[tab.value]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center gap-4">
          <CalendarDays className="w-12 h-12 text-slate-600" />
          <div>
            <p className="text-white font-semibold">No sessions found</p>
            <p className="text-slate-400 text-sm mt-1">
              {!statusFilter ? "Go discover skills to request your first session" : "No sessions with this status"}
            </p>
          </div>
          <Link href="/discover" className="btn btn-primary btn-md">
            Discover Skills
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isTeacher = s.teacherId === userId;
            const other = isTeacher ? s.learner : s.teacher;
            const statusInfo = formatSessionStatus(s.status);
            const hasReviewed = s.reviews.length > 0;
            const canReview = s.status === "COMPLETED" && !isTeacher && !hasReviewed;

            return (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-blue-500/30 transition-all block"
              >
                {/* Role indicator */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                  isTeacher ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                )}>
                  {isTeacher ? "T" : "L"}
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">
                      {isTeacher ? "Teaching" : "Learning"} {s.teachingSkill.skillName}
                    </p>
                    <span className={cn(
                      "badge text-xs",
                      statusInfo.color === "green" ? "badge-green" :
                      statusInfo.color === "blue" ? "badge-blue" :
                      statusInfo.color === "yellow" ? "badge-yellow" :
                      statusInfo.color === "red" ? "badge-red" : "badge-gray"
                    )}>
                      {statusInfo.label}
                    </span>
                    {canReview && (
                      <span className="badge badge-yellow">⭐ Leave a review</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      with {other.profile?.displayName ?? other.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(s.scheduledDate)} at {s.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {s.durationMinutes}min
                    </span>
                    <span className="badge badge-gray text-xs">{getFormatLabel(s.format)}</span>
                  </div>
                </div>

                {/* Credit info */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">{s.creditCost} credits</p>
                  <p className="text-xs text-slate-500">{isTeacher ? "to earn" : "to spend"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
