import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Coins, BookOpen, Star, Users, ArrowRight, Plus,
  CalendarDays, Zap, TrendingUp, Bell
} from "lucide-react";
import { formatRelativeTime, getInitials, formatSessionStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

async function getDashboardData(userId: string) {
  const [
    profile,
    creditAccount,
    teachingSkills,
    learningInterests,
    upcomingSessions,
    pendingRequests,
    recentReviews,
    recentTransactions,
    unreadNotifications,
    totalCompleted,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.creditAccount.findUnique({ where: { userId } }),
    prisma.teachingSkill.findMany({
      where: { userId, isActive: true },
      include: { category: true },
      take: 5,
    }),
    prisma.learningInterest.findMany({
      where: { userId },
      include: { category: true },
      take: 5,
    }),
    prisma.skillSession.findMany({
      where: {
        OR: [{ teacherId: userId }, { learnerId: userId }],
        status: "ACCEPTED",
        scheduledDate: { gte: new Date() },
      },
      include: {
        teacher: { include: { profile: true } },
        learner: { include: { profile: true } },
        teachingSkill: true,
      },
      orderBy: { scheduledDate: "asc" },
      take: 3,
    }),
    prisma.skillSession.findMany({
      where: { teacherId: userId, status: "REQUESTED" },
      include: {
        learner: { include: { profile: true } },
        teachingSkill: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { include: { profile: true } },
        session: { include: { teachingSkill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.skillSession.count({
      where: {
        OR: [{ teacherId: userId }, { learnerId: userId }],
        status: "COMPLETED",
      },
    }),
  ]);

  // Calculate avg rating
  const allReviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    select: { rating: true },
  });
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;

  return {
    profile,
    creditAccount,
    teachingSkills,
    learningInterests,
    upcomingSessions,
    pendingRequests,
    recentReviews,
    recentTransactions,
    unreadNotifications,
    totalCompleted,
    avgRating,
    reviewCount: allReviews.length,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getDashboardData(session.user.id);
  const { profile, creditAccount } = data;

  const availableCredits =
    (creditAccount?.balance ?? 0) - (creditAccount?.reservedBalance ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {profile?.displayName?.split(" ")[0] ?? session.user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your skills
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.unreadNotifications > 0 && (
            <Link href="/notifications" className="relative btn btn-ghost btn-md">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold">
                {data.unreadNotifications}
              </span>
            </Link>
          )}
          <Link href="/skills/new" className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" /> Add Skill
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Coins}
          label="Available Credits"
          value={availableCredits}
          sub={creditAccount?.reservedBalance ? `${creditAccount.reservedBalance} reserved` : undefined}
          color="blue"
          href="/credits"
        />
        <StatCard
          icon={BookOpen}
          label="Sessions Completed"
          value={data.totalCompleted}
          color="green"
          href="/sessions"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={data.avgRating > 0 ? data.avgRating.toFixed(1) : "—"}
          sub={data.reviewCount ? `${data.reviewCount} reviews` : "No reviews yet"}
          color="yellow"
          href="/reviews"
        />
        <StatCard
          icon={Users}
          label="Skills Teaching"
          value={data.teachingSkills.length}
          color="purple"
          href="/skills"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Sessions + Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending requests */}
          {data.pendingRequests.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Pending Requests ({data.pendingRequests.length})
                </h2>
                <Link href="/sessions" className="text-sm text-blue-400 hover:text-blue-300">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {data.pendingRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/sessions/${req.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {getInitials(req.learner.profile?.displayName ?? req.learner.name ?? "U")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {req.learner.profile?.displayName ?? req.learner.name}
                      </p>
                      <p className="text-xs text-slate-400">wants to learn {req.teachingSkill.skillName}</p>
                    </div>
                    <span className="text-xs text-yellow-400 font-medium shrink-0">Respond →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming sessions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Upcoming Sessions
              </h2>
              <Link href="/sessions" className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </Link>
            </div>
            {data.upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingSessions.map((s) => {
                  const isTeacher = s.teacherId === session.user.id;
                  const other = isTeacher ? s.learner : s.teacher;
                  return (
                    <Link
                      key={s.id}
                      href={`/sessions/${s.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/10 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {getInitials(other.profile?.displayName ?? other.name ?? "U")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {isTeacher ? "Teaching" : "Learning"} {s.teachingSkill.skillName}
                        </p>
                        <p className="text-xs text-slate-400">
                          with {other.profile?.displayName ?? other.name} ·{" "}
                          {new Date(s.scheduledDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {s.startTime}
                        </p>
                      </div>
                      <span className="badge badge-blue text-xs">Upcoming</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming sessions"
                description="Explore skills to find a teacher or add your own skills to start teaching"
                action={{ href: "/discover", label: "Explore Skills" }}
              />
            )}
          </div>

          {/* Teaching skills */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Your Teaching Skills
              </h2>
              <Link href="/skills/new" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </Link>
            </div>
            {data.teachingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.teachingSkills.map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.id}`}
                    className="badge badge-blue hover:bg-blue-500/30 transition-colors cursor-pointer"
                  >
                    {skill.skillName}
                  </Link>
                ))}
                <Link href="/skills" className="badge badge-gray hover:bg-white/10 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={Zap}
                title="No teaching skills yet"
                description="Add skills you can teach to start earning credits"
                action={{ href: "/skills/new", label: "Add Your First Skill" }}
              />
            )}
          </div>
        </div>

        {/* Right: Credits + Reviews + Interests */}
        <div className="space-y-6">
          {/* Credit summary */}
          <div className="card p-6 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                Credit Balance
              </h2>
              <Link href="/credits" className="text-sm text-blue-400 hover:text-blue-300">Details</Link>
            </div>
            <div className="text-4xl font-black text-white mb-1">{availableCredits}</div>
            <p className="text-slate-400 text-sm">credits available</p>
            {creditAccount?.reservedBalance ? (
              <p className="text-xs text-yellow-400 mt-1">{creditAccount.reservedBalance} reserved</p>
            ) : null}

            {data.recentTransactions.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.recentTransactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate mr-2">{tx.description}</span>
                    <span className={cn("font-semibold shrink-0", tx.amount > 0 ? "text-green-400" : "text-red-400")}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning interests */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Learning Interests
              </h2>
              <Link href="/matches" className="text-sm text-blue-400 hover:text-blue-300">Find matches</Link>
            </div>
            {data.learningInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.learningInterests.map((interest) => (
                  <span key={interest.id} className="badge badge-purple">
                    {interest.skillName}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No learning interests"
                description="Tell us what you want to learn to get matched with teachers"
                action={{ href: "/discover", label: "Explore Skills" }}
              />
            )}
          </div>

          {/* Recent reviews */}
          {data.recentReviews.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Recent Reviews
                </h2>
                <Link href="/reviews" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
              </div>
              <div className="space-y-4">
                {data.recentReviews.map((review) => (
                  <div key={review.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(review.reviewer.profile?.displayName ?? review.reviewer.name ?? "U")}
                      </div>
                      <p className="text-sm font-medium text-white">
                        {review.reviewer.profile?.displayName ?? review.reviewer.name}
                      </p>
                      <div className="flex ml-auto">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700")}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-slate-400 line-clamp-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-slate-600">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: "blue" | "green" | "yellow" | "purple";
  href: string;
}) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <Link href={href} className="card p-5 hover:border-white/20 transition-colors block">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </Link>
  );
}

function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">{description}</p>
      </div>
      {action && (
        <Link href={action.href} className="btn btn-secondary btn-sm mt-2">
          {action.label} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
