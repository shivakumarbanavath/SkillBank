"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const reportSchema = z.object({
  reportedId: z.string().cuid(),
  type: z.enum(["USER", "REVIEW", "MESSAGE", "SKILL_LISTING", "SESSION"]),
  targetId: z.string(),
  reason: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
});

export async function submitReport(data: z.infer<typeof reportSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const reporterId = session.user.id;
  if (reporterId === parsed.data.reportedId) {
    return { success: false, error: "You cannot report yourself" };
  }

  try {
    await prisma.report.create({
      data: {
        reporterId,
        reportedId: parsed.data.reportedId,
        type: parsed.data.type,
        targetId: parsed.data.targetId,
        reason: parsed.data.reason,
        description: parsed.data.description,
        status: "PENDING",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("submitReport error:", error);
    return { success: false, error: "Failed to submit report" };
  }
}

export async function blockUser(blockedId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const blockerId = session.user.id;
  if (blockerId === blockedId) {
    return { success: false, error: "You cannot block yourself" };
  }

  try {
    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
      create: {
        blockerId,
        blockedId,
        reason,
      },
      update: {
        reason,
      },
    });

    revalidatePath("/messages");
    revalidatePath("/discover");
    return { success: true };
  } catch (error) {
    console.error("blockUser error:", error);
    return { success: false, error: "Failed to block user" };
  }
}

export async function unblockUser(blockedId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.userBlock.deleteMany({
      where: {
        blockerId: session.user.id,
        blockedId,
      },
    });

    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("unblockUser error:", error);
    return { success: false, error: "Failed to unblock user" };
  }
}

const verificationSchema = z.object({
  type: z.enum(["EMAIL", "CAMPUS", "INSTITUTION"]).default("CAMPUS"),
  institution: z.string().min(2).max(100),
  campus: z.string().max(100).optional(),
  document: z.string().min(3, "Please provide document URL or student ID reference"),
});

export async function submitVerificationRequest(data: z.infer<typeof verificationSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = verificationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const userId = session.user.id;

  try {
    await prisma.verificationRequest.upsert({
      where: { userId },
      create: {
        userId,
        type: parsed.data.type,
        institution: parsed.data.institution,
        campus: parsed.data.campus,
        document: parsed.data.document,
        status: "PENDING",
        submittedAt: new Date(),
      },
      update: {
        type: parsed.data.type,
        institution: parsed.data.institution,
        campus: parsed.data.campus,
        document: parsed.data.document,
        status: "PENDING",
        submittedAt: new Date(),
        reviewedAt: null,
        reviewNote: null,
      },
    });

    revalidatePath("/verification");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("submitVerificationRequest error:", error);
    return { success: false, error: "Failed to submit verification request" };
  }
}
