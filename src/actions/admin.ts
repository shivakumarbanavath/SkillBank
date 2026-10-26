"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  // Always query database directly to verify admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    throw new Error("Unauthorized: Platform administrator access required");
  }

  return user;
}

export async function getAdminStats() {
  try {
    await ensureAdmin();

    const [
      totalUsers,
      totalSkills,
      completedSessions,
      creditAgg,
      pendingVerifications,
      openReports,
      openDisputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.teachingSkill.count({ where: { isActive: true } }),
      prisma.skillSession.count({ where: { status: "COMPLETED" } }),
      prisma.creditAccount.aggregate({
        _sum: { balance: true, totalEarned: true },
      }),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.sessionDispute.count({ where: { status: "OPEN" } }),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        totalSkills,
        completedSessions,
        circulatingCredits: creditAgg._sum.balance ?? 0,
        totalCreditsEarned: creditAgg._sum.totalEarned ?? 0,
        pendingVerifications,
        openReports,
        openDisputes,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminUsers() {
  try {
    await ensureAdmin();

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        creditAccount: true,
        verificationRequest: true,
        _count: {
          select: {
            teachingSkills: true,
            sessionsAsTeacher: true,
            sessionsAsLearner: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message, users: [] };
  }
}

export async function toggleUserStatus(userId: string, newStatus: "ACTIVE" | "SUSPENDED") {
  try {
    const admin = await ensureAdmin();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
      }),
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
          targetType: "User",
          targetId: userId,
          metadata: JSON.stringify({ newStatus }),
        },
      }),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminReports() {
  try {
    await ensureAdmin();

    const reports = await prisma.report.findMany({
      include: {
        reporter: { include: { profile: true } },
        reported: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, reports };
  } catch (error: any) {
    return { success: false, error: error.message, reports: [] };
  }
}

export async function resolveReport(
  reportId: string,
  resolution: string,
  status: "RESOLVED" | "DISMISSED"
) {
  try {
    const admin = await ensureAdmin();

    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status,
          resolution,
          reviewedById: admin.id,
          resolvedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: "REPORT_RESOLVED",
          targetType: "Report",
          targetId: reportId,
          metadata: JSON.stringify({ resolution, status }),
        },
      }),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminVerifications() {
  try {
    await ensureAdmin();

    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    });

    return { success: true, requests };
  } catch (error: any) {
    return { success: false, error: error.message, requests: [] };
  }
}

export async function reviewVerification(
  requestId: string,
  status: "VERIFIED" | "REJECTED",
  reviewNote?: string
) {
  try {
    const admin = await ensureAdmin();

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new Error("Verification request not found");

    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewNote,
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: "VERIFICATION_UPDATE",
          title: status === "VERIFIED" ? "Campus Verification Approved! 🎓" : "Verification Update",
          body:
            status === "VERIFIED"
              ? "Your student identity is verified. Your profile now features the official campus trust badge."
              : `Your verification request was not approved: ${reviewNote || "Proof was insufficient."}`,
          link: "/profile",
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: `VERIFICATION_${status}`,
          targetType: "VerificationRequest",
          targetId: requestId,
          metadata: JSON.stringify({ status, reviewNote }),
        },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/verification");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminAuditLogs() {
  try {
    await ensureAdmin();

    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message, logs: [] };
  }
}
