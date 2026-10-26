"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerForWorkshop } from "@/actions/workshops";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Video,
  Check,
  CheckCircle,
  Sparkles,
  Ticket
} from "lucide-react";
import { format } from "date-fns";

interface WorkshopCardProps {
  workshop: {
    id: string;
    title: string;
    description: string;
    format: string;
    scheduledAt: Date;
    durationMinutes: number;
    capacity: number;
    registeredCount: number;
    priceInr: number;
    venue: string | null;
    meetingLink: string | null;
    status: string;
    organizer: {
      profile: {
        displayName: string;
        institution: string | null;
      } | null;
    };
    _count: {
      registrations: number;
    };
  };
  isRegistered: boolean;
}

export function WorkshopCard({ workshop, isRegistered }: WorkshopCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const spotsLeft = Math.max(0, workshop.capacity - workshop.registeredCount);
  const isFull = spotsLeft === 0;

  async function handleRegister() {
    setLoading(true);
    const res = await registerForWorkshop(workshop.id);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    } else {
      alert(res.error || "Failed to register");
    }
  }

  return (
    <div className="card overflow-hidden flex flex-col justify-between border-white/10 hover:border-blue-500/30 transition-all bg-slate-900/60">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              workshop.format === "ONLINE"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            {workshop.format === "ONLINE" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            <span>{workshop.format === "ONLINE" ? "Online Workshop" : "Campus Meetup"}</span>
          </span>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              isFull
                ? "bg-red-500/10 text-red-400"
                : spotsLeft <= 5
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isFull ? "Full" : `${spotsLeft} seats left`}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
            {workshop.title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {workshop.description}
          </p>
        </div>

        {/* Schedule & Venue */}
        <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{format(new Date(workshop.scheduledAt), "EEE, MMM dd, yyyy • h:mm a")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{workshop.durationMinutes} Minutes Duration</span>
          </div>

          {workshop.venue && (
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{workshop.venue}</span>
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            {workshop.organizer.profile?.displayName?.[0] ?? "O"}
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Organized by </span>
            <span className="text-white font-medium">
              {workshop.organizer.profile?.displayName ?? "Organizer"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500">Entry Fee</span>
          <p className="text-lg font-black text-white">
            {workshop.priceInr === 0 ? "Free" : `₹${workshop.priceInr}`}
          </p>
        </div>

        {isRegistered ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Pass Booked</span>
          </span>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            disabled={isFull}
            className={`btn btn-sm flex items-center gap-1.5 ${
              isFull ? "btn-secondary opacity-50 cursor-not-allowed" : "btn-primary"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isFull ? "Workshop Full" : "Book Seat"}</span>
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
                <h3 className="text-xl font-black text-white">Seat Confirmed!</h3>
                <p className="text-xs text-slate-300">
                  Your registration for {workshop.title} is successful. We sent you a confirmation
                  notification.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Workshop Registration
                  </span>
                  <h2 className="text-xl font-black text-white">{workshop.title}</h2>
                  <p className="text-xs text-slate-400">
                    {format(new Date(workshop.scheduledAt), "MMMM dd, yyyy @ h:mm a")}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Registration Fee</span>
                  <span className="text-xl font-black text-white">
                    {workshop.priceInr === 0 ? "FREE" : `₹${workshop.priceInr}`}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {workshop.format === "ONLINE"
                    ? "The Google Meet access link will be active 15 minutes before the session."
                    : `Please arrive at ${workshop.venue} 10 minutes early with your student ID.`}
                </p>

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
                    {loading ? "Confirming..." : "Confirm Booking"}
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
