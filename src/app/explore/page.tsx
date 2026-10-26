import { PublicShell } from "@/components/layout/public-shell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  Users,
  Compass,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "Explore Skills & Categories",
  description: "Explore hundreds of skills offered by students and mentors across engineering, coding, design, and arts.",
};
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const [categories, featuredSkills, courses] = await Promise.all([
    prisma.skillCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { teachingSkills: true } } },
    }),
    prisma.teachingSkill.findMany({
      where: { isActive: true },
      take: 6,
      include: {
        category: true,
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      take: 3,
      include: { instructor: { include: { profile: true } }, category: true },
    }),
  ]);

  return (
    <PublicShell>
      <div className="space-y-16">
        {/* Hero header with quick search redirect */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> Discovery Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Explore Campus <span className="gradient-text">Talent & Skills</span>.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Find peers who can teach you the skills you need today. Filter by category, format, or institution.
          </p>

          <div className="pt-2">
            <Link
              href="/discover"
              className="btn btn-primary btn-lg inline-flex items-center gap-2 shadow-xl shadow-blue-600/25"
            >
              <Search className="w-4 h-4" />
              <span>Launch Full Interactive Search</span>
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" /> Browse by Category
            </h2>
            <Link href="/discover" className="text-xs text-blue-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/discover?category=${cat.id}`}
                className="card p-4 hover:border-blue-500/40 transition-all bg-slate-900/40 hover:bg-white/5 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-110 transition-transform">
                    {cat.name[0]}
                  </div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {cat._count.teachingSkills} active skills
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Skills */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Recent Community Skills
            </h2>
            <Link href="/discover" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              <span>Search All Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSkills.map((s) => (
              <div
                key={s.id}
                className="card p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all bg-slate-900/60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {s.category.name}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {s.proficiency.toLowerCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{s.skillName}</h3>
                  {s.description && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {s.user.profile?.displayName?.[0] ?? "U"}
                    </div>
                    <span>{s.user.profile?.displayName ?? "Member"}</span>
                  </div>

                  <Link
                    href={`/skills/${s.id}`}
                    className="btn btn-primary btn-xs flex items-center gap-1"
                  >
                    <span>View & Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Masterclasses Highlights */}
        {courses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" /> Featured Masterclasses
              </h2>
              <Link href="/courses" className="text-xs text-indigo-400 hover:underline">
                View all masterclasses
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className="card p-6 flex flex-col justify-between bg-slate-900/60 border-white/10 hover:border-indigo-500/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-semibold">{c.category.name}</span>
                      <span className="text-yellow-400 flex items-center gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {c.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base line-clamp-2">{c.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.shortDesc || c.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-black text-white">₹{c.priceInr}</span>
                    <Link href={`/courses/${c.slug}`} className="btn btn-secondary btn-xs">
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
