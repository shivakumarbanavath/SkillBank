import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkshops } from "@/actions/workshops";
import { prisma } from "@/lib/db";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { Users, Sparkles, Calendar } from "lucide-react";

export const metadata = { title: "Group Workshops" };
export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [workshopsResult, userRegistrations] = await Promise.all([
    getWorkshops(),
    prisma.workshopRegistration.findMany({
      where: { userId: session.user.id },
      select: { workshopId: true },
    }),
  ]);

  const workshops = workshopsResult.workshops;
  const registeredSet = new Set(userRegistrations.map((r) => r.workshopId));

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="card p-6 md:p-8 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Module C: Group Workshops
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Hands-on Group Workshops & Bootcamps
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Collaborative, small-group cohorts focusing on practical exercises: hardware soldering,
            UI portfolio critiques, and live coding hackathons with peers.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{workshops.length}</p>
            <p className="text-xs text-slate-400">Scheduled</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-black text-blue-400">{userRegistrations.length}</p>
            <p className="text-xs text-slate-400">Booked</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {workshops.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-white font-medium text-lg">No workshops scheduled right now</p>
          <p className="text-sm">Check back soon for new campus bootcamps and review sessions.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((w) => (
            <WorkshopCard
              key={w.id}
              workshop={w as any}
              isRegistered={registeredSet.has(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
