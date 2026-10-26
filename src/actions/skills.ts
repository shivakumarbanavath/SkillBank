"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const skillSchema = z.object({
  categoryId: z.string().cuid(),
  skillName: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  format: z.enum(["IN_PERSON", "ONLINE", "EITHER"]),
  duration: z.number().min(30).max(240).default(60),
  prerequisites: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export type SkillInput = z.infer<typeof skillSchema>;

export async function createSkill(data: SkillInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = skillSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const skill = await prisma.teachingSkill.create({
      data: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        skillName: parsed.data.skillName,
        description: parsed.data.description,
        proficiency: parsed.data.proficiency,
        format: parsed.data.format,
        duration: parsed.data.duration,
        prerequisites: parsed.data.prerequisites,
        tags: JSON.stringify(parsed.data.tags),
        isActive: true,
      },
    });

    revalidatePath("/skills");
    revalidatePath("/discover");
    return { success: true, skillId: skill.id };
  } catch (error) {
    console.error("Create skill error:", error);
    return { success: false, error: "Failed to create skill" };
  }
}

export async function updateSkill(id: string, data: SkillInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const skill = await prisma.teachingSkill.findUnique({ where: { id } });
  if (!skill) return { success: false, error: "Skill not found" };
  if (skill.userId !== session.user.id) return { success: false, error: "Not authorized" };

  const parsed = skillSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await prisma.teachingSkill.update({
      where: { id },
      data: {
        ...parsed.data,
        tags: JSON.stringify(parsed.data.tags),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/skills");
    revalidatePath(`/skills/${id}`);
    revalidatePath("/discover");
    return { success: true };
  } catch (error) {
    console.error("Update skill error:", error);
    return { success: false, error: "Failed to update skill" };
  }
}

export async function toggleSkillStatus(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const skill = await prisma.teachingSkill.findUnique({ where: { id } });
  if (!skill) return { success: false, error: "Skill not found" };
  if (skill.userId !== session.user.id) return { success: false, error: "Not authorized" };

  await prisma.teachingSkill.update({
    where: { id },
    data: { isActive: !skill.isActive },
  });

  revalidatePath("/skills");
  revalidatePath("/discover");
  return { success: true, isActive: !skill.isActive };
}

export async function deleteSkill(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const skill = await prisma.teachingSkill.findUnique({ where: { id } });
  if (!skill) return { success: false, error: "Skill not found" };
  if (skill.userId !== session.user.id) return { success: false, error: "Not authorized" };

  // Check for active sessions
  const activeSessions = await prisma.skillSession.count({
    where: {
      teachingSkillId: id,
      status: { in: ["REQUESTED", "ACCEPTED"] },
    },
  });
  if (activeSessions > 0) {
    return { success: false, error: "Cannot delete skill with active sessions" };
  }

  await prisma.teachingSkill.delete({ where: { id } });
  revalidatePath("/skills");
  revalidatePath("/discover");
  return { success: true };
}

export async function addLearningInterest(data: {
  categoryId: string;
  skillName: string;
  notes?: string;
  priority?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.learningInterest.upsert({
      where: {
        userId_categoryId_skillName: {
          userId: session.user.id,
          categoryId: data.categoryId,
          skillName: data.skillName,
        },
      },
      create: {
        userId: session.user.id,
        categoryId: data.categoryId,
        skillName: data.skillName,
        notes: data.notes,
        priority: data.priority ?? 2,
      },
      update: {
        notes: data.notes,
        priority: data.priority,
      },
    });

    revalidatePath("/matches");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Add learning interest error:", error);
    return { success: false, error: "Failed to add learning interest" };
  }
}

export async function removeLearningInterest(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const interest = await prisma.learningInterest.findUnique({ where: { id } });
  if (!interest) return { success: false, error: "Learning interest not found" };
  if (interest.userId !== session.user.id) return { success: false, error: "Not authorized" };

  await prisma.learningInterest.delete({ where: { id } });
  revalidatePath("/matches");
  return { success: true };
}
