import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { User, Award, BookOpen, Star, Coins, CalendarDays, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        creditAccount: true,
        verificationRequest: true,
      },
    }),
    prisma.$transaction([
      prisma.teachingSkill.count({ where: { userId, isActive: true } }),
      prisma.learningInterest.count({ where: { userId } }),
      prisma.skillSession.count({ where: { teacherId: userId, status: "COMPLETED" } }),
      prisma.skillSession.count({ where: { learnerId: userId, status: "COMPLETED" } }),
      prisma.review.aggregate({
        where: { revieweeId: userId },
        _avg: { rating: true },
        _count: true,
      }),
    ]),
  ]);

  if (!user || !user.profile) redirect("/onboarding");

  let parsedLanguages: string[] = [];
  try {
    parsedLanguages = JSON.parse(user.profile.languages || "[]");
  } catch {
    parsedLanguages = [];
  }

  const avgRating = stats[4]._avg.rating ? stats[4]._avg.rating.toFixed(1) : "New";
  const reviewCount = stats[4]._count;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Top Header Card */}
      <div className="card p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border-blue-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20 shrink-0">
              {user.profile.displayName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.profile.displayName}</h1>
                {user.verificationRequest?.status === "VERIFIED" && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" /> Verified Student
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">@{user.profile.username}</p>
              {user.profile.institution && (
                <p className="text-xs text-blue-400 font-medium mt-1">
                  {user.profile.institution} {user.profile.campus ? `• ${user.profile.campus}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
            <Link
              href={`/profile/${user.profile.username}`}
              className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5"
            >
              Public Profile
            </Link>
            <Link
              href="/verification"
              className="btn btn-ghost btn-sm flex items-center justify-center gap-1.5 text-slate-300"
            >
              Get Verified
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400" /> Rating
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {avgRating} <span className="text-xs text-slate-500 font-normal">({reviewCount})</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" /> Taught
            </p>
            <p className="text-xl font-bold text-white mt-1">{stats[2]} sessions</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Learned
            </p>
            <p className="text-xl font-bold text-white mt-1">{stats[3]} sessions</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Balance
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {(user.creditAccount?.balance ?? 0) - (user.creditAccount?.reservedBalance ?? 0)} credits
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <ProfileEditForm
        initialProfile={{
          username: user.profile.username,
          displayName: user.profile.displayName,
          bio: user.profile.bio,
          campus: user.profile.campus,
          institution: user.profile.institution,
          city: user.profile.city,
          avatar: user.profile.avatar,
          languages: parsedLanguages,
          preferredFormat: user.profile.preferredFormat as any,
          isPublic: user.profile.isPublic,
          showEmail: user.profile.showEmail,
          showLocation: user.profile.showLocation,
        }}
        userEmail={user.email}
      />
    </div>
  );
}
