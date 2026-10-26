"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function getWorkshops() {
  try {
    const workshops = await prisma.workshop.findMany({
      include: {
        organizer: { include: { profile: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return { success: true, workshops };
  } catch (error) {
    console.error("getWorkshops error:", error);
    return { success: false, error: "Failed to load workshops", workshops: [] };
  }
}

export async function registerForWorkshop(workshopId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!workshop) return { success: false, error: "Workshop not found" };

    if (workshop._count.registrations >= workshop.capacity) {
      return { success: false, error: "Workshop is fully booked" };
    }

    const existing = await prisma.workshopRegistration.findUnique({
      where: {
        workshopId_userId: {
          workshopId,
          userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "You are already registered for this workshop" };
    }

    const orderId = `order_${nanoid(10)}`;
    const paymentId = `pay_${nanoid(12)}`;

    await prisma.$transaction(async (tx) => {
      let createdPaymentId = null;
      if (workshop.priceInr > 0) {
        const payment = await tx.payment.create({
          data: {
            userId,
            type: "WORKSHOP",
            targetId: workshopId,
            amountInr: workshop.priceInr * 100,
            currency: "INR",
            status: "COMPLETED",
            provider: "MOCK_GATEWAY",
            externalOrderId: orderId,
            externalId: paymentId,
            completedAt: new Date(),
          },
        });
        createdPaymentId = payment.id;
      }

      await tx.workshopRegistration.create({
        data: {
          workshopId,
          userId,
          status: "REGISTERED",
          paidAmount: workshop.priceInr,
          paymentId: createdPaymentId,
        },
      });

      await tx.workshop.update({
        where: { id: workshopId },
        data: { registeredCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId,
          type: "WORKSHOP_REGISTERED",
          title: "Workshop Spot Confirmed! 🎟️",
          body: `You are confirmed for "${workshop.title}". Check details in your workshops dashboard.`,
          link: "/workshops",
        },
      });
    });

    revalidatePath("/workshops");
    return { success: true };
  } catch (error) {
    console.error("registerForWorkshop error:", error);
    return { success: false, error: "Failed to register for workshop" };
  }
}
