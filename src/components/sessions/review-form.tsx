"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { submitReview } from "@/actions/sessions";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  sessionId: string;
  teacherId: string;
  teacherName: string;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const CREDIT_REWARDS = [0, 5, 8, 10, 13, 15];

export function ReviewForm({ sessionId, teacherId, teacherName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const displayRating = hovered || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast({ type: "error", title: "Please select a rating", description: "Tap a star to rate" });
      return;
    }

    setLoading(true);
    const result = await submitReview({
      sessionId,
      revieweeId: teacherId,
      rating,
      comment: comment.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      toast({
        type: "success",
        title: "Review submitted!",
        description: `${teacherName} earned ${CREDIT_REWARDS[rating]} credits from your ${rating}★ review`,
      });
      router.refresh();
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="label">Rating for {teacherName} *</label>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label={`Rating for ${teacherName}`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={rating === star}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  star <= displayRating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                )}
              />
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className="text-sm text-yellow-400 mt-1 font-medium">
            {RATING_LABELS[displayRating]} — Teacher will earn{" "}
            <span className="text-white">{CREDIT_REWARDS[displayRating]} credits</span>
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="label">
          Comment <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-md h-24 resize-none"
          placeholder="Share your experience with this teacher..."
          maxLength={1000}
        />
        <p className="text-xs text-slate-500 mt-1">{comment.length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="btn btn-primary btn-lg w-full justify-center"
        id="submit-review-button"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
        ) : (
          `Submit ${rating > 0 ? `${rating}★` : ""} Review`
        )}
      </button>
    </form>
  );
}
