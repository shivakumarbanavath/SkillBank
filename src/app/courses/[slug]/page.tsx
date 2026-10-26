import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourseBySlug, getCourseEnrollment } from "@/actions/courses";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";
import {
  GraduationCap,
  Star,
  Clock,
  Users,
  Award,
  CheckCircle2,
  Building2,
  BookOpen,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CalendarDays
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.shortDesc || course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const enrollment = await getCourseEnrollment(course.id);

  let learningOutcomes: string[] = [];
  try {
    learningOutcomes = JSON.parse(course.learningOutcomes || "[]");
  } catch {
    learningOutcomes = [];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/courses"
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Masterclasses</span>
        </Link>
      </div>

      {/* Main Hero Card */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6 md:p-8 space-y-4 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border-indigo-500/20">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {course.category.name}
              </span>
              <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                Level: {course.level}
              </span>
              {course.hasCertificate && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Verified Certificate
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating.toFixed(1)} / 5.0</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{course.duration} Hours of Content</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{course.enrollmentCount} Enrolled Students</span>
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          {learningOutcomes.length > 0 && (
            <div className="card p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> What You Will Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && (
            <div className="card p-6 space-y-2">
              <h3 className="font-bold text-white text-sm">Prerequisites & Target Audience</h3>
              <p className="text-sm text-slate-400">{course.prerequisites}</p>
            </div>
          )}

          {/* Instructor Bio */}
          <div className="card p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" /> Led by Masterclass Instructor
            </h2>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0">
                {course.instructor.profile?.displayName?.[0] ?? "I"}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {course.instructor.profile?.displayName ?? "Instructor"}
                </h3>
                <p className="text-xs text-blue-400 font-medium">
                  {course.instructor.profile?.institution ?? "NIT Calicut"} • {course.instructor.profile?.campus ?? "Main Campus"}
                </p>
                {course.instructor.profile?.bio && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {course.instructor.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Checkout Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-6 sticky top-24 border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Investment
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white">
                  ₹{course.priceInr.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-400">one-time cohort fee</span>
              </div>
            </div>

            <CourseEnrollmentAction
              courseId={course.id}
              courseTitle={course.title}
              priceInr={course.priceInr}
              hasCertificate={course.hasCertificate}
              enrollment={enrollment as any}
            />

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Full lifetime access to course lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Direct Q&A access to verified instructor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Shareable, verifiable completion certificate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
