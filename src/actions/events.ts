"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getEvents(filters?: { type?: string; status?: string }) {
  try {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: { include: { profile: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { startsAt: "asc" }],
    });

    return { success: true, events };
  } catch (error) {
    console.error("getEvents error:", error);
    return { success: false, error: "Failed to load events", events: [] };
  }
}

export async function registerForEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) return { success: false, error: "Event not found" };

    if (event.capacity && event._count.registrations >= event.capacity) {
      return { success: false, error: "Event registration is at capacity" };
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "You are already registered for this event" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          status: "REGISTERED",
          paidAmount: event.priceInr,
        },
      });

      await tx.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId,
          type: "COURSE_ENROLLED",
          title: "Event Pass Confirmed! 🚀",
          body: `You are registered for "${event.title}". See venue and joining links in the Events tab.`,
          link: "/events",
        },
      });
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("registerForEvent error:", error);
    return { success: false, error: "Failed to register for event" };
  }
}
