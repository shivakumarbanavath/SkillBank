"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, CheckCircle, AlertTriangle } from "lucide-react";
import {
  acceptSession,
  declineSession,
  cancelSession,
  completeSession,
} from "@/actions/sessions";
import { useToast } from "@/components/ui/toaster";

interface SessionActionsProps {
  sessionId: string;
  status: string;
  isTeacher: boolean;
  isLearner: boolean;
}

export function SessionActions({ sessionId, status, isTeacher, isLearner }: SessionActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handle(action: string, fn: () => Promise<{ success: boolean; error?: string }>) {
    setLoading(action);
    const result = await fn();
    setLoading(null);
    if (result.success) {
      toast({ type: "success", title: `Session ${action}ed`, description: "Status updated" });
      router.refresh();
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Teacher: accept/decline a REQUESTED session */}
      {isTeacher && status === "REQUESTED" && (
        <>
          <button
            onClick={() => handle("accept", () => acceptSession(sessionId))}
            disabled={!!loading}
            className="btn btn-primary btn-md"
            id="accept-session-button"
          >
            {loading === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Accept Session
          </button>
          <button
            onClick={() => handle("declin", () => declineSession(sessionId))}
            disabled={!!loading}
            className="btn btn-danger btn-md"
            id="decline-session-button"
          >
            {loading === "declin" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Decline
          </button>
        </>
      )}

      {/* Teacher: mark complete on ACCEPTED session */}
      {isTeacher && status === "ACCEPTED" && (
        <button
          onClick={() => handle("complet", () => completeSession(sessionId))}
          disabled={!!loading}
          className="btn btn-primary btn-md"
          id="complete-session-button"
        >
          {loading === "complet" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Mark as Completed
        </button>
      )}

      {/* Learner: cancel REQUESTED session */}
      {isLearner && status === "REQUESTED" && (
        <button
          onClick={() => handle("cancel", () => cancelSession(sessionId))}
          disabled={!!loading}
          className="btn btn-danger btn-md"
          id="cancel-session-button"
        >
          {loading === "cancel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          Cancel Request
        </button>
      )}

      {/* Either: cancel an ACCEPTED session */}
      {status === "ACCEPTED" && (
        <button
          onClick={() => handle("cancel", () => cancelSession(sessionId))}
          disabled={!!loading}
          className="btn btn-danger btn-md"
        >
          {loading === "cancel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          Cancel Session
        </button>
      )}

      {status === "REQUESTED" && isTeacher && (
        <p className="text-xs text-slate-500 w-full mt-1">
          The learner&apos;s credits are reserved. They will be released if you decline.
        </p>
      )}
    </div>
  );
}
