/**
 * SkillBank Matching Engine
 *
 * Deterministic matching algorithm that computes compatibility scores
 * between a learner's interests and available teachers.
 *
 * Scoring weights (total 100 points):
 * - Skill name match: 40 points
 * - Mutual skill exchange: 30 points (bonus if teacher wants what learner teaches)
 * - Format compatibility: 10 points
 * - Proficiency appropriateness: 10 points
 * - Rating quality: 5 points
 * - Campus proximity: 5 points
 */

import { prisma } from "@/lib/db";
import { parseJsonSafe } from "@/lib/utils";

export interface MatchResult {
  userId: string;
  teachingSkillId: string;
  teacherId: string;
  score: number;
  reasons: string[];
  isMutual: boolean;
  profile: {
    username: string;
    displayName: string;
    avatar?: string | null;
    campus?: string | null;
    city?: string | null;
  };
  skill: {
    skillName: string;
    categoryName: string;
    proficiency: string;
    format: string;
    duration: number;
  };
  rating: number;
  reviewCount: number;
  completedSessions: number;
}

interface MatchOptions {
  learnerId: string;
  limit?: number;
  categoryId?: string;
  format?: string;
  campus?: string;
}

export async function computeMatches(options: MatchOptions): Promise<MatchResult[]> {
  const { learnerId, limit = 20, categoryId, format, campus } = options;

  // Get learner's interests and teaching skills
  const learner = await prisma.user.findUnique({
    where: { id: learnerId },
    include: {
      learningInterests: { include: { category: true } },
      teachingSkills: { where: { isActive: true } },
      profile: true,
      blocksGiven: true,
    },
  });

  if (!learner) return [];

  const blockedIds = learner.blocksGiven.map((b) => b.blockedId);
  const learnerTeachesNames = learner.teachingSkills.map((s) =>
    s.skillName.toLowerCase()
  );

  if (learner.learningInterests.length === 0) return [];

  // Build where clause for skill discovery
  const whereClause: Record<string, unknown> = {
    isActive: true,
    userId: { notIn: [learnerId, ...blockedIds] },
    user: { status: "ACTIVE" },
  };

  if (categoryId) whereClause.categoryId = categoryId;
  if (format && format !== "EITHER") {
    whereClause.format = { in: [format, "EITHER"] };
  }

  // Fetch all potential teaching skills
  const teachingSkills = await prisma.teachingSkill.findMany({
    where: whereClause,
    include: {
      category: true,
      user: {
        include: {
          profile: true,
          reviewsReceived: { select: { rating: true } },
          _count: {
            select: {
              sessionsAsTeacher: { where: { status: "COMPLETED" } },
            },
          },
          learningInterests: true,
        },
      },
    },
  });

  const results: MatchResult[] = [];

  for (const skill of teachingSkills) {
    const teacher = skill.user;
    if (!teacher.profile) continue;

    // Campus filter (if specified)
    if (campus && teacher.profile.campus !== campus) continue;

    let score = 0;
    const reasons: string[] = [];

    // Find matching learning interests
    const matchingInterests = learner.learningInterests.filter(
      (interest) =>
        interest.skillName.toLowerCase() === skill.skillName.toLowerCase() ||
        interest.categoryId === skill.categoryId
    );

    if (matchingInterests.length === 0) continue;

    // Skill name match (40 points for exact, 20 for category)
    const exactMatch = learner.learningInterests.some(
      (i) => i.skillName.toLowerCase() === skill.skillName.toLowerCase()
    );
    if (exactMatch) {
      score += 40;
      reasons.push(`You want to learn ${skill.skillName}`);
    } else {
      score += 20;
      reasons.push(`Matches your interest in ${skill.category.name}`);
    }

    // Mutual skill exchange bonus (30 points)
    const teacherWantsFromLearner = teacher.learningInterests.some((interest) =>
      learnerTeachesNames.includes(interest.skillName.toLowerCase())
    );
    let isMutual = false;
    if (teacherWantsFromLearner) {
      score += 30;
      isMutual = true;
      const mutualSkill = teacher.learningInterests.find((i) =>
        learnerTeachesNames.includes(i.skillName.toLowerCase())
      );
      reasons.push(
        `Mutual exchange opportunity: they want to learn ${mutualSkill?.skillName}`
      );
    }

    // Format compatibility (10 points)
    const learnerFormat = learner.profile?.preferredFormat ?? "EITHER";
    if (
      skill.format === "EITHER" ||
      learnerFormat === "EITHER" ||
      skill.format === learnerFormat
    ) {
      score += 10;
      reasons.push(`Session format matches your preference`);
    }

    // Proficiency level appropriate (10 points)
    // Assume learner is beginner; reward teachers who can teach at appropriate levels
    if (skill.proficiency === "ADVANCED" || skill.proficiency === "EXPERT") {
      score += 10;
      reasons.push(`Expert-level teaching (${skill.proficiency.toLowerCase()})`);
    } else if (skill.proficiency === "INTERMEDIATE") {
      score += 7;
    } else {
      score += 5;
    }

    // Rating quality (5 points)
    const reviews = teacher.reviewsReceived;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    if (avgRating >= 4.5) {
      score += 5;
      reasons.push(`Highly rated teacher (${avgRating.toFixed(1)}★)`);
    } else if (avgRating >= 3.5) {
      score += 3;
    }

    // Campus proximity (5 points)
    if (
      teacher.profile.campus &&
      learner.profile?.campus &&
      teacher.profile.campus === learner.profile.campus
    ) {
      score += 5;
      reasons.push(`On the same campus as you`);
    }

    results.push({
      userId: teacher.id,
      teachingSkillId: skill.id,
      teacherId: teacher.id,
      score,
      reasons,
      isMutual,
      profile: {
        username: teacher.profile.username,
        displayName: teacher.profile.displayName,
        avatar: teacher.profile.avatar,
        campus: teacher.profile.campus,
        city: teacher.profile.city,
      },
      skill: {
        skillName: skill.skillName,
        categoryName: skill.category.name,
        proficiency: skill.proficiency,
        format: skill.format,
        duration: skill.duration,
      },
      rating: avgRating,
      reviewCount: reviews.length,
      completedSessions: teacher._count.sessionsAsTeacher,
    });
  }

  // Sort by score descending, then by mutual matches first
  results.sort((a, b) => {
    if (a.isMutual && !b.isMutual) return -1;
    if (!a.isMutual && b.isMutual) return 1;
    return b.score - a.score;
  });

  return results.slice(0, limit);
}

export async function getDiscoverSkills(options: {
  search?: string;
  categoryId?: string;
  proficiency?: string;
  format?: string;
  campus?: string;
  page?: number;
  pageSize?: number;
  excludeUserId?: string;
}) {
  const {
    search,
    categoryId,
    proficiency,
    format,
    campus,
    page = 1,
    pageSize = 12,
    excludeUserId,
  } = options;

  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    isActive: true,
    user: { status: "ACTIVE" },
  };

  if (excludeUserId) {
    where.userId = { not: excludeUserId };
  }

  if (search) {
    where.OR = [
      { skillName: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (proficiency) where.proficiency = proficiency;
  if (format && format !== "ALL") {
    where.format = format === "EITHER" ? { in: ["IN_PERSON", "ONLINE", "EITHER"] } : { in: [format, "EITHER"] };
  }

  const [skills, total] = await Promise.all([
    prisma.teachingSkill.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ createdAt: "desc" }],
      include: {
        category: true,
        user: {
          include: {
            profile: true,
            reviewsReceived: { select: { rating: true } },
            _count: {
              select: {
                sessionsAsTeacher: { where: { status: "COMPLETED" } },
              },
            },
          },
        },
      },
    }),
    prisma.teachingSkill.count({ where }),
  ]);

  // Filter by campus after fetch (SQLite limitation with nested filters)
  const filtered = campus
    ? skills.filter((s) => s.user.profile?.campus === campus)
    : skills;

  return {
    skills: filtered.map((skill) => {
      const reviews = skill.user.reviewsReceived;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : 0;
      return {
        ...skill,
        tags: parseJsonSafe<string[]>(skill.tags, []),
        avgRating,
        reviewCount: reviews.length,
        completedSessions: skill.user._count.sessionsAsTeacher,
      };
    }),
    total,
    pages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}
