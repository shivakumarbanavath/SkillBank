import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppLayout } from "@/components/layout/app-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Query database directly to confirm ADMIN role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    redirect("/dashboard");
  }

  return <AppLayout>{children}</AppLayout>;
}
