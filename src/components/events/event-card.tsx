"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerForEvent } from "@/actions/events";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Building,
  Sparkles,
  CheckCircle,
  Video,
  Ticket,
  Check
} from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    format: string;
    startsAt: Date;
    endsAt: Date | null;
    venue: string | null;
    meetingLink: string | null;
    capacity: number | null;
    registeredCount: number;
    priceInr: number;
    campus: string | null;
    institution: string | null;
    isFeatured: boolean;
    status: string;
    organizer: {
      profile: {
        displayName: string;
        institution: string | null;
      } | null;
    };
  };
  isRegistered: boolean;
}

export function EventCard({ event, isRegistered }: EventCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    setLoading(true);
    const res = await registerForEvent(event.id);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    } else {
      alert(res.error || "Failed to register for event");
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "HACKATHON":
        return { label: "Hackathon", icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "CORPORATE":
        return { label: "Corporate Partnership", icon: Building, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      default:
        return { label: "Campus Showcase", icon: Sparkles, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    }
  }

  const badge = getTypeBadge(event.type);
  const BadgeIcon = badge.icon;

  return (
    <div
      className={`card overflow-hidden flex flex-col justify-between transition-all ${
        event.isFeatured
          ? "border-amber-500/40 bg-gradient-to-br from-amber-950/10 via-slate-900 to-slate-900 shadow-xl shadow-amber-500/5"
          : "border-white/10 hover:border-white/20 bg-slate-900/60"
      }`}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </span>

          {event.isFeatured && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              ★ Featured
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Schedule & Location */}
        <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{format(new Date(event.startsAt), "EEEE, MMMM dd, yyyy • h:mm a")}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            {event.format === "ONLINE" ? (
              <Video className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{event.venue || "Virtual Event"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.registeredCount} students attending</span>
          </div>
        </div>

        {/* Institution sponsor badge */}
        {event.institution && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-xs text-slate-300">
            <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{event.institution}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500">Student Entry</span>
          <p className="text-lg font-black text-white">
            {event.priceInr === 0 ? "FREE" : `₹${event.priceInr}`}
          </p>
        </div>

        {isRegistered ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Pass Registered</span>
          </span>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Claim Student Pass</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-6 bg-slate-900 border-white/20 shadow-2xl relative">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">Event Pass Issued! 🚀</h3>
                <p className="text-xs text-slate-300">
                  You are registered for {event.title}. Access instructions have been added to your
                  notifications.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Institutional Pass Confirmation
                  </span>
                  <h2 className="text-xl font-black text-white">{event.title}</h2>
                  <p className="text-xs text-slate-400">
                    {format(new Date(event.startsAt), "MMMM dd, yyyy @ h:mm a")}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Type:</span>
                    <span className="font-semibold text-white">{badge.label} Student Pass</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee:</span>
                    <span className="font-bold text-emerald-400">₹0.00 (Sponsored)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-right truncate">{event.venue || "Virtual"}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-secondary btn-md flex-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn btn-primary btn-md flex-1 text-xs font-bold"
                  >
                    {loading ? "Registering..." : "Confirm Free Pass"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
