import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourses } from "@/actions/courses";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { GraduationCap, Star, Clock, Users, Award, ArrowRight, BookOpen, Sparkles } from "lucide-react";

export const metadata = { title: "Masterclasses & Certifications" };
export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; level?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [coursesResult, categories, userEnrollments] = await Promise.all([
    getCourses({
      categoryId: searchParams.category,
      level: searchParams.level,
      search: searchParams.search,
    }),
    prisma.skillCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true, status: true, progress: true },
    }),
  ]);

  const courses = coursesResult.courses;
  const enrolledMap = new Map(userEnrollments.map((e) => [e.courseId, e]));

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="card p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Module B: Expert Masterclasses
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Paid Masterclasses & Certifications
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Curated, in-depth cohorts led by verified student mentors and industry alumni.
              Complete comprehensive projects and earn verified digital credentials.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{courses.length}</p>
              <p className="text-xs text-slate-400">Available</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-black text-indigo-400">{userEnrollments.length}</p>
              <p className="text-xs text-slate-400">Enrolled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => {
          const enrollment = enrolledMap.get(c.id);
          const isEnrolled = Boolean(enrollment);

          return (
            <div
              key={c.id}
              className="card overflow-hidden flex flex-col justify-between border-white/10 hover:border-indigo-500/40 transition-all group bg-slate-900/60"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {c.category.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{c.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {c.shortDesc || c.description}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {c.instructor.profile?.displayName?.[0] ?? "I"}
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-medium">
                      {c.instructor.profile?.displayName ?? "Expert Mentor"}
                    </p>
                    <p className="text-slate-500">
                      {c.instructor.profile?.institution ?? "NIT Calicut"}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                  {c.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {c.duration} hrs
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {c.enrollmentCount} enrolled
                  </span>
                  {c.hasCertificate && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium ml-auto">
                      <Award className="w-3.5 h-3.5" /> Certificate
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Enrollment Fee</span>
                  <p className="text-lg font-black text-white">
                    ₹{c.priceInr.toLocaleString("en-IN")}
                  </p>
                </div>

                <Link
                  href={`/courses/${c.slug}`}
                  className={`btn btn-sm flex items-center gap-1.5 ${
                    isEnrolled
                      ? "btn-secondary text-emerald-400 border-emerald-500/30"
                      : "btn-primary"
                  }`}
                >
                  <span>{isEnrolled ? "Continue Course" : "View Curriculum"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
