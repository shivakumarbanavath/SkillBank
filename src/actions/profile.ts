"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  displayName: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  campus: z.string().max(100).optional(),
  institution: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  languages: z.array(z.string()).default([]),
  preferredFormat: z.enum(["IN_PERSON", "ONLINE", "EITHER"]).default("EITHER"),
  isPublic: z.boolean().optional().default(true),
  showEmail: z.boolean().optional().default(false),
  showLocation: z.boolean().optional().default(true),
});

export type ProfileInput = z.input<typeof profileSchema>;

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      creditAccount: true,
      teachingSkills: {
        include: { category: true },
        where: { isActive: true },
      },
      learningInterests: {
        include: { category: true },
      },
    },
  });

  return user;
}

export async function upsertProfile(data: ProfileInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { username, ...rest } = parsed.data;
  const userId = session.user.id;

  // Check username uniqueness (excluding own profile)
  const existing = await prisma.profile.findFirst({
    where: { username, NOT: { userId } },
  });
  if (existing) {
    return { success: false, error: "Username is already taken" };
  }

  try {
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        username,
        displayName: rest.displayName,
        bio: rest.bio,
        campus: rest.campus,
        institution: rest.institution,
        city: rest.city,
        avatar: rest.avatar || null,
        languages: JSON.stringify(rest.languages),
        preferredFormat: rest.preferredFormat,
        isPublic: rest.isPublic,
        showEmail: rest.showEmail,
        showLocation: rest.showLocation,
        onboardingStep: 1,
      },
      update: {
        username,
        displayName: rest.displayName,
        bio: rest.bio,
        campus: rest.campus,
        institution: rest.institution,
        city: rest.city,
        avatar: rest.avatar || null,
        languages: JSON.stringify(rest.languages),
        preferredFormat: rest.preferredFormat,
        isPublic: rest.isPublic,
        showEmail: rest.showEmail,
        showLocation: rest.showLocation,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error) {
    console.error("Profile upsert error:", error);
    return { success: false, error: "Failed to save profile" };
  }
}

export async function completeOnboarding(userId: string) {
  await prisma.profile.update({
    where: { userId },
    data: {
      onboardingDone: true,
      onboardingStep: 5,
    },
  });
  revalidatePath("/dashboard");
}

export async function getPublicProfile(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          teachingSkills: {
            include: { category: true },
            where: { isActive: true },
          },
          learningInterests: {
            include: { category: true },
          },
          reviewsReceived: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              reviewer: {
                include: { profile: true },
              },
            },
          },
          _count: {
            select: {
              sessionsAsTeacher: {
                where: { status: "COMPLETED" },
              },
              reviewsReceived: true,
            },
          },
        },
      },
    },
  });

  if (!profile || !profile.isPublic) return null;

  // Calculate average rating
  const reviews = profile.user.reviewsReceived;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { profile, avgRating };
}
