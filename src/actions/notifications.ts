"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated", notifications: [] };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { success: false, error: "Failed to fetch notifications", notifications: [] };
  }
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    return await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("markAsRead error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}
