import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Star, Award, Coins, CalendarDays, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Reviews & Reputation" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const activeTab = searchParams.tab === "given" ? "given" : "received";

  const [reviewsReceived, reviewsGiven, ratingAgg] = await Promise.all([
    prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { include: { profile: true } },
        session: { include: { teachingSkill: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: { include: { profile: true } },
        session: { include: { teachingSkill: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const avgRating = ratingAgg._avg.rating ? ratingAgg._avg.rating.toFixed(1) : "0.0";
  const totalReviews = ratingAgg._count;

  // Star breakdown
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsReceived.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Star className="w-7 h-7 text-yellow-400 fill-current" />
          Reviews & Reputation
        </h1>
        <p className="text-slate-400 mt-1">
          Your feedback score from peer skill exchanges and learner reviews
        </p>
      </div>

      {/* Rating Overview Card */}
      <div className="card p-6 md:p-8 bg-gradient-to-r from-yellow-950/20 via-slate-900 to-slate-900 border-yellow-500/20 grid md:grid-cols-2 gap-8 items-center">
        <div className="flex items-center gap-6">
          <div className="text-center p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-5xl font-black text-yellow-400">{avgRating}</span>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(Number(avgRating)) ? "fill-current" : "opacity-30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{totalReviews} total reviews</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">Teaching Reputation</h3>
            <p className="text-sm text-slate-400">
              Higher ratings boost your visibility in Discover search and earn you bonus credits!
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber-300 font-medium">
              <Coins className="w-4 h-4" /> 5-star sessions yield 15 credits (150% base rate)
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-2">
          {starCounts.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 text-slate-400">
                <span>{stars}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <Link
          href="/reviews?tab=received"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "received"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Reviews Received ({reviewsReceived.length})
        </Link>
        <Link
          href="/reviews?tab=given"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "given"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Reviews Given ({reviewsGiven.length})
        </Link>
      </div>

      {/* Reviews List */}
      {activeTab === "received" ? (
        reviewsReceived.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No reviews received yet</p>
            <p className="text-sm mt-1">
              Teach skill exchange sessions to start receiving learner ratings and feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsReceived.map((r) => (
              <div key={r.id} className="card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                      {r.reviewer.profile?.displayName?.[0] ?? "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${r.reviewer.profile?.username}`}
                          className="font-bold text-white hover:text-blue-400 transition-colors"
                        >
                          {r.reviewer.profile?.displayName ?? "Anonymous Learner"}
                        </Link>
                        {r.reviewer.profile?.institution && (
                          <span className="text-xs text-slate-500">
                            • {r.reviewer.profile.institution}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Reviewed for session: <span className="text-slate-300 font-medium">{r.session.title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{r.rating}.0</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {r.comment && (
                  <p className="text-sm text-slate-300 pl-4 border-l-2 border-yellow-500/40 italic">
                    &quot;{r.comment}&quot;
                  </p>
                )}

                {r.rewardAmount && (
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-slate-400">
                    <span className="flex items-center gap-1.5 text-green-400 font-medium">
                      <Coins className="w-3.5 h-3.5" /> +{r.rewardAmount} credits awarded
                    </span>
                    <Link
                      href={`/sessions/${r.sessionId}`}
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Session <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        reviewsGiven.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No reviews submitted yet</p>
            <p className="text-sm mt-1">
              After completing a session with a teacher, you can leave a review from your Sessions tab.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsGiven.map((r) => (
              <div key={r.id} className="card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {r.reviewee.profile?.displayName?.[0] ?? "T"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">To teacher:</span>
                        <Link
                          href={`/profile/${r.reviewee.profile?.username}`}
                          className="font-bold text-white hover:text-blue-400 transition-colors"
                        >
                          {r.reviewee.profile?.displayName ?? "Teacher"}
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500">
                        Session: <span className="text-slate-300 font-medium">{r.session.title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{r.rating}.0</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {r.comment && (
                  <p className="text-sm text-slate-300 pl-4 border-l-2 border-white/20 italic">
                    &quot;{r.comment}&quot;
                  </p>
                )}

                <div className="flex justify-end text-xs pt-2">
                  <Link
                    href={`/sessions/${r.sessionId}`}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View Session <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
