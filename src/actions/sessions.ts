"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { calculateCreditReward, generateIdempotencyKey } from "@/lib/utils";

// ============================================================
// SESSION ACTIONS
// ============================================================

const sessionRequestSchema = z.object({
  teacherId: z.string().cuid(),
  teachingSkillId: z.string().cuid(),
  scheduledDate: z.union([z.string(), z.date()]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().min(30).max(240).optional(),
  format: z.enum(["IN_PERSON", "ONLINE", "EITHER"]),
  description: z.string().max(500).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  creditCost: z.number().min(1).max(100).optional(),
});

export async function requestSession(data: z.infer<typeof sessionRequestSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = sessionRequestSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const learnerId = session.user.id;
  const creditCost = parsed.data.creditCost ?? 10;
  const { teacherId, teachingSkillId } = parsed.data;

  // Prevent self-booking
  if (learnerId === teacherId) {
    return { success: false, error: "You cannot book a session with yourself" };
  }

  // Get learner's credit account
  const creditAccount = await prisma.creditAccount.findUnique({
    where: { userId: learnerId },
  });
  if (!creditAccount) return { success: false, error: "Credit account not found" };

  const availableBalance = creditAccount.balance - creditAccount.reservedBalance;
  if (availableBalance < creditCost) {
    return { success: false, error: `Insufficient credits. You need ${creditCost} credits but have ${availableBalance} available.` };
  }

  // Get teaching skill to use as title
  const skill = await prisma.teachingSkill.findUnique({
    where: { id: teachingSkillId },
  });
  if (!skill) return { success: false, error: "Skill listing not found" };
  if (!skill.isActive) return { success: false, error: "This skill listing is not active" };

  const idempotencyKey = generateIdempotencyKey(learnerId, "session_request", `${teachingSkillId}:${parsed.data.scheduledDate}:${parsed.data.startTime}`);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create session
      const skillSession = await tx.skillSession.create({
        data: {
          teacherId,
          learnerId,
          teachingSkillId,
          title: `Learn ${skill.skillName}`,
          description: parsed.data.description,
          scheduledDate: new Date(parsed.data.scheduledDate),
          startTime: parsed.data.startTime,
          durationMinutes: parsed.data.durationMinutes,
          format: parsed.data.format,
          meetingLink: parsed.data.meetingLink || null,
          location: parsed.data.location || null,
          creditCost,
          status: "REQUESTED",
          idempotencyKey,
        },
      });

      // Reserve credits
      await tx.creditAccount.update({
        where: { userId: learnerId },
        data: { reservedBalance: { increment: creditCost } },
      });

      await tx.creditReservation.create({
        data: {
          userId: learnerId,
          accountId: creditAccount.id,
          sessionId: skillSession.id,
          amount: creditCost,
          status: "ACTIVE",
        },
      });

      // Notify teacher
      await tx.notification.create({
        data: {
          userId: teacherId,
          type: "SESSION_REQUEST",
          title: "New Session Request",
          body: `Someone wants to learn ${skill.skillName} from you.`,
          link: `/sessions/${skillSession.id}`,
        },
      });

      return skillSession;
    });

    revalidatePath("/sessions");
    revalidatePath("/dashboard");
    return { success: true, sessionId: result.id };
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return { success: false, error: "A session request already exists for this time slot" };
    }
    console.error("Session request error:", error);
    return { success: false, error: "Failed to create session request" };
  }
}

export async function respondToSession(
  sessionId: string,
  action: "ACCEPTED" | "DECLINED"
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const skillSession = await prisma.skillSession.findUnique({
    where: { id: sessionId },
    include: { creditReservations: { where: { status: "ACTIVE" } } },
  });

  if (!skillSession) return { success: false, error: "Session not found" };
  if (skillSession.teacherId !== session.user.id) {
    return { success: false, error: "You are not authorized to respond to this session" };
  }
  if (skillSession.status !== "REQUESTED") {
    return { success: false, error: "Session is not in a state that can be responded to" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.skillSession.update({
        where: { id: sessionId },
        data: { status: action },
      });

      if (action === "DECLINED") {
        // Release reserved credits
        const reservation = skillSession.creditReservations[0];
        if (reservation) {
          await tx.creditReservation.update({
            where: { id: reservation.id },
            data: { status: "RELEASED", settledAt: new Date() },
          });

          await tx.creditAccount.update({
            where: { userId: skillSession.learnerId },
            data: { reservedBalance: { decrement: reservation.amount } },
          });
        }
      }

      // Notify learner
      await tx.notification.create({
        data: {
          userId: skillSession.learnerId,
          type: action === "ACCEPTED" ? "SESSION_ACCEPTED" : "SESSION_DECLINED",
          title: action === "ACCEPTED" ? "Session Accepted!" : "Session Declined",
          body: action === "ACCEPTED"
            ? "Your session request has been accepted. Prepare for your learning session!"
            : "Your session request was declined. The reserved credits have been released.",
          link: `/sessions/${sessionId}`,
        },
      });
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Session response error:", error);
    return { success: false, error: "Failed to update session" };
  }
}

// Convenience wrappers used by the UI
export async function acceptSession(sessionId: string) {
  return respondToSession(sessionId, "ACCEPTED");
}

export async function declineSession(sessionId: string) {
  return respondToSession(sessionId, "DECLINED");
}

export async function cancelSession(sessionId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;
  const skillSession = await prisma.skillSession.findUnique({
    where: { id: sessionId },
    include: { creditReservations: { where: { status: "ACTIVE" } } },
  });

  if (!skillSession) return { success: false, error: "Session not found" };

  const isParticipant =
    skillSession.teacherId === userId || skillSession.learnerId === userId;
  if (!isParticipant) return { success: false, error: "Not authorized" };

  const cancellableStatuses = ["REQUESTED", "ACCEPTED"];
  if (!cancellableStatuses.includes(skillSession.status)) {
    return { success: false, error: "This session cannot be cancelled" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.skillSession.update({
        where: { id: sessionId },
        data: {
          status: "CANCELLED",
          cancelledBy: userId,
          cancelReason: reason,
        },
      });

      // Release credit reservation
      const reservation = skillSession.creditReservations[0];
      if (reservation) {
        await tx.creditReservation.update({
          where: { id: reservation.id },
          data: { status: "CANCELLED", settledAt: new Date() },
        });

        await tx.creditAccount.update({
          where: { userId: skillSession.learnerId },
          data: { reservedBalance: { decrement: reservation.amount } },
        });
      }

      // Notify the other party
      const notifyUserId =
        userId === skillSession.teacherId
          ? skillSession.learnerId
          : skillSession.teacherId;

      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: "SESSION_CANCELLED",
          title: "Session Cancelled",
          body: `A session has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
          link: `/sessions/${sessionId}`,
        },
      });
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Cancel session error:", error);
    return { success: false, error: "Failed to cancel session" };
  }
}

export async function completeSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const skillSession = await prisma.skillSession.findUnique({
    where: { id: sessionId },
    include: { creditReservations: { where: { status: "ACTIVE" } } },
  });

  if (!skillSession) return { success: false, error: "Session not found" };

  // Only learner can mark as complete
  if (skillSession.learnerId !== session.user.id) {
    return { success: false, error: "Only the learner can confirm session completion" };
  }

  if (skillSession.status !== "ACCEPTED") {
    return { success: false, error: "Session must be in ACCEPTED state to complete" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.skillSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      // Settle the credit reservation (deduct from learner)
      const reservation = skillSession.creditReservations[0];
      if (reservation) {
        await tx.creditReservation.update({
          where: { id: reservation.id },
          data: { status: "SETTLED", settledAt: new Date() },
        });

        const learnerAccount = await tx.creditAccount.findUnique({
          where: { userId: skillSession.learnerId },
        });
        if (learnerAccount) {
          const newBalance = learnerAccount.balance - reservation.amount;
          await tx.creditAccount.update({
            where: { userId: skillSession.learnerId },
            data: {
              balance: newBalance,
              reservedBalance: { decrement: reservation.amount },
              totalSpent: { increment: reservation.amount },
            },
          });

          await tx.creditTransaction.create({
            data: {
              userId: skillSession.learnerId,
              accountId: learnerAccount.id,
              type: "SESSION_SPENDING",
              amount: -reservation.amount,
              balanceAfter: newBalance,
              sessionId,
              description: `Credits spent for learning session`,
              idempotencyKey: `spend:${sessionId}`,
            },
          });
        }
      }

      // Notify learner to leave review
      await tx.notification.create({
        data: {
          userId: skillSession.learnerId,
          type: "SESSION_COMPLETED",
          title: "Session Completed!",
          body: "Please leave a review for your teacher to help them earn bonus credits.",
          link: `/sessions/${sessionId}`,
        },
      });
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Complete session error:", error);
    return { success: false, error: "Failed to complete session" };
  }
}

// ============================================================
// REVIEW ACTIONS
// ============================================================

const reviewSchema = z.object({
  sessionId: z.string().cuid(),
  revieweeId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function submitReview(data: z.infer<typeof reviewSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const reviewerId = session.user.id;
  const { sessionId, rating, comment } = parsed.data;

  const skillSession = await prisma.skillSession.findUnique({
    where: { id: sessionId },
    include: {
      reviews: { where: { reviewerId } },
    },
  });

  if (!skillSession) return { success: false, error: "Session not found" };
  if (skillSession.status !== "COMPLETED") {
    return { success: false, error: "Can only review completed sessions" };
  }

  // Only learner can review the teacher
  if (skillSession.learnerId !== reviewerId) {
    return { success: false, error: "Only the learner can review this session" };
  }

  // Prevent self-review
  if (skillSession.teacherId === reviewerId) {
    return { success: false, error: "You cannot review yourself" };
  }

  // Prevent duplicate review
  if (skillSession.reviews.length > 0) {
    return { success: false, error: "You have already reviewed this session" };
  }

  const rewardAmount = calculateCreditReward(rating, 10);
  const idempotencyKey = generateIdempotencyKey(reviewerId, "review_reward", sessionId);

  try {
    await prisma.$transaction(async (tx) => {
      // Create the review
      await tx.review.create({
        data: {
          sessionId,
          reviewerId,
          revieweeId: skillSession.teacherId,
          rating,
          comment,
          rewardIssued: true,
          rewardAmount,
        },
      });

      // Award credits to teacher
      const teacherAccount = await tx.creditAccount.findUnique({
        where: { userId: skillSession.teacherId },
      });

      if (!teacherAccount) throw new Error("Teacher credit account not found");

      // Check idempotency - prevent duplicate reward
      const existingReward = await tx.creditTransaction.findUnique({
        where: { idempotencyKey },
      });

      if (!existingReward) {
        const newBalance = teacherAccount.balance + rewardAmount;
        await tx.creditAccount.update({
          where: { userId: skillSession.teacherId },
          data: {
            balance: newBalance,
            totalEarned: { increment: rewardAmount },
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId: skillSession.teacherId,
            accountId: teacherAccount.id,
            type: "SESSION_EARNING",
            amount: rewardAmount,
            balanceAfter: newBalance,
            sessionId,
            description: `Teaching reward for ${rating}-star review (${rewardAmount} credits)`,
            idempotencyKey,
          },
        });
      }

      // Notify teacher
      await tx.notification.create({
        data: {
          userId: skillSession.teacherId,
          type: "NEW_REVIEW",
          title: `New ${rating}-Star Review!`,
          body: `You earned ${rewardAmount} credits for your teaching session.`,
          link: `/sessions/${sessionId}`,
        },
      });
    });

    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/credits");
    return { success: true, rewardAmount };
  } catch (error) {
    console.error("Submit review error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}
