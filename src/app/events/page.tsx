import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEvents } from "@/actions/events";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/events/event-card";
import { Trophy, Sparkles, Building } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Institutional Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [eventsResult, userRegistrations] = await Promise.all([
    getEvents({ type: searchParams.type }),
    prisma.eventRegistration.findMany({
      where: { userId: session.user.id },
      select: { eventId: true },
    }),
  ]);

  const events = eventsResult.events;
  const registeredSet = new Set(userRegistrations.map((r) => r.eventId));

  const typeFilter = searchParams.type || "";

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="card p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Module D: Institutional Events
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Campus Hackathons & Corporate Events
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Institutional collaborations, college tech fests, industry showcase summits, and
            campus-wide skill expos. Claim free student delegate passes.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{events.length}</p>
            <p className="text-xs text-slate-400">Events</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-black text-amber-400">{userRegistrations.length}</p>
            <p className="text-xs text-slate-400">Your Passes</p>
          </div>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {[
          { id: "", label: "All Events" },
          { id: "HACKATHON", label: "Hackathons" },
          { id: "CORPORATE", label: "Corporate Summits" },
          { id: "SHOWCASE", label: "Campus Expos" },
        ].map((t) => (
          <Link
            key={t.id}
            href={t.id ? `/events?type=${t.id}` : "/events"}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === t.id
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {events.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-white font-medium text-lg">No events found in this category</p>
          <p className="text-sm">Check back soon as new campus partnerships are announced.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e as any}
              isRegistered={registeredSet.has(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
