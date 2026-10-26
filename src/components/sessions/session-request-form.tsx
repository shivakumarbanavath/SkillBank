"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, Clock } from "lucide-react";
import { requestSession } from "@/actions/sessions";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const schema = z.object({
  scheduledDate: z.string().min(1, "Pick a date"),
  startTime: z.string().min(1, "Pick a time"),
  format: z.enum(["IN_PERSON", "ONLINE", "EITHER"]),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  skillId: string;
  teacherId: string;
  teacherName: string;
  skillName: string;
  duration: number;
  format: string;
  creditCost: number;
}

export function SessionRequestForm({
  skillId, teacherId, teacherName, skillName, duration, format, creditCost,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      format: format as "IN_PERSON" | "ONLINE" | "EITHER",
    },
  });

  // Min date: tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  // Max date: 60 days out
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  async function onSubmit(data: FormData) {
    const result = await requestSession({
      teachingSkillId: skillId,
      teacherId,
      scheduledDate: new Date(data.scheduledDate),
      startTime: data.startTime,
      format: data.format,
      description: data.description,
      creditCost,
    });

    if (result.success) {
      toast({
        type: "success",
        title: "Session requested!",
        description: `${teacherName} will be notified and can accept or decline.`,
      });
      router.push("/sessions");
    } else {
      toast({ type: "error", title: "Request failed", description: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date */}
      <div>
        <label htmlFor="session-date" className="label">
          <Calendar className="w-3.5 h-3.5 inline mr-1" />
          Preferred Date *
        </label>
        <input
          id="session-date"
          type="date"
          min={minDateStr}
          max={maxDateStr}
          className={cn("input-md", errors.scheduledDate && "border-red-500/60")}
          {...register("scheduledDate")}
        />
        {errors.scheduledDate && <p className="error-text">{errors.scheduledDate.message}</p>}
      </div>

      {/* Time */}
      <div>
        <label htmlFor="session-time" className="label">
          <Clock className="w-3.5 h-3.5 inline mr-1" />
          Preferred Start Time *
        </label>
        <input
          id="session-time"
          type="time"
          className={cn("input-md", errors.startTime && "border-red-500/60")}
          {...register("startTime")}
        />
        {errors.startTime && <p className="error-text">{errors.startTime.message}</p>}
      </div>

      {/* Format — only show if teacher offers EITHER */}
      {format === "EITHER" && (
        <div>
          <label className="label">Session Format *</label>
          <div className="flex gap-2">
            {[
              { value: "IN_PERSON", label: "In Person" },
              { value: "ONLINE", label: "Online" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex-1 cursor-pointer"
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register("format")}
                />
                <div className="p-2.5 rounded-xl border border-white/10 text-center text-sm font-medium text-slate-300 hover:border-blue-500/40 transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-500">
                  {opt.label}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div>
        <label htmlFor="session-note" className="label">
          Note to teacher <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          id="session-note"
          className="input-md h-20 resize-none"
          placeholder="What do you want to learn? Any specific topics?"
          {...register("description")}
        />
      </div>

      <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
        <span className="text-slate-400">Credits to spend</span>
        <span className="font-bold text-white">{creditCost} credits</span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-lg w-full justify-center"
        id="request-session-button"
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending Request...</>
        ) : (
          `Request Session (${creditCost} credits)`
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Credits are reserved now and settled when the session is completed.
        You won&apos;t be charged if the teacher declines.
      </p>
    </form>
  );
}
