import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-blue-400" />
          Notifications
        </h1>
        <p className="text-slate-400 mt-1">
          Stay updated on session requests, reviews, credits, and messages
        </p>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  );
}
