import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getDiscoverSkills } from "@/lib/matching";
import { DiscoverClient } from "@/components/discover/discover-client";

export const metadata = { title: "Discover Skills" };
export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; format?: string; page?: string };
}) {
  const session = await auth();

  const [categories, result] = await Promise.all([
    prisma.skillCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    getDiscoverSkills({
      search: searchParams.search,
      categoryId: searchParams.category,
      format: searchParams.format,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: 12,
      excludeUserId: session?.user?.id,
    }),
  ]);

  // Map to the shape expected by DiscoverClient
  const skills = result.skills.map((skill) => ({
    id: skill.id,
    skillName: skill.skillName,
    description: skill.description,
    proficiency: skill.proficiency,
    format: skill.format,
    duration: skill.duration,
    tags: skill.tags,
    avgRating: skill.avgRating,
    reviewCount: skill.reviewCount,
    completedSessions: skill.completedSessions,
    category: { id: skill.category.id, name: skill.category.name },
    user: {
      id: skill.user.id,
      profile: skill.user.profile
        ? {
            username: skill.user.profile.username,
            displayName: skill.user.profile.displayName,
            campus: skill.user.profile.campus,
            avatar: skill.user.profile.avatar,
          }
        : null,
    },
  }));

  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading skills...</div>}>
      <DiscoverClient
        initialSkills={skills}
        total={result.total}
        pages={result.pages}
        currentPage={result.currentPage}
        categories={categories}
        currentUserId={session?.user?.id}
      />
    </Suspense>
  );
}
