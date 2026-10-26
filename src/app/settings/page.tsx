import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsView } from "@/components/settings/settings-view";
import { Settings } from "lucide-react";

export const metadata = { title: "Account Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          displayName: true,
          username: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage your security, passwords, and account preferences
        </p>
      </div>

      <SettingsView user={user} />
    </div>
  );
}
