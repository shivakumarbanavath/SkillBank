"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse, updateCourseProgress } from "@/actions/courses";
import {
  CreditCard,
  CheckCircle,
  Award,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Check
} from "lucide-react";
import Link from "next/link";

interface CourseEnrollmentActionProps {
  courseId: string;
  courseTitle: string;
  priceInr: number;
  hasCertificate: boolean;
  enrollment: {
    status: string;
    progress: number;
    course: {
      certificates: { certificateNo: string }[];
    };
  } | null;
}

export function CourseEnrollmentAction({
  courseId,
  courseTitle,
  priceInr,
  hasCertificate,
  enrollment,
}: CourseEnrollmentActionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"SELECT" | "PROCESSING" | "SUCCESS">("SELECT");
  const [selectedMethod, setSelectedMethod] = useState("UPI");

  const isEnrolled = Boolean(enrollment);
  const progress = enrollment?.progress ?? 0;
  const certificateNo = enrollment?.course?.certificates?.[0]?.certificateNo;

  async function handleConfirmPayment() {
    setPaymentStep("PROCESSING");
    setLoading(true);

    // Simulate 1.2s gateway processing
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const res = await enrollInCourse(courseId);
    setLoading(false);

    if (res.success) {
      setPaymentStep("SUCCESS");
      setTimeout(() => {
        setModalOpen(false);
        router.refresh();
      }, 1500);
    } else {
      alert(res.error || "Payment failed");
      setPaymentStep("SELECT");
    }
  }

  async function handleAdvanceProgress(amount: number) {
    setProgressLoading(true);
    const newProgress = Math.min(100, progress + amount);
    await updateCourseProgress(courseId, newProgress);
    setProgressLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {isEnrolled ? (
        <div className="card p-6 bg-indigo-950/20 border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Your Course Progress
            </span>
            <span className="text-sm font-black text-white">{progress}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {progress === 100 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Masterclass Completed!</span>
              </div>
              <p className="text-xs text-slate-300">
                You have fulfilled all learning outcomes for this certification.
              </p>
              {certificateNo && (
                <Link
                  href={`/certificates/${certificateNo}`}
                  className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Award className="w-4 h-4" />
                  <span>View Verified Certificate</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => handleAdvanceProgress(25)}
                disabled={progressLoading}
                className="btn btn-secondary btn-sm flex-1 text-xs"
              >
                {progressLoading ? "Updating..." : "+25% Progress Step"}
              </button>
              <button
                onClick={() => handleAdvanceProgress(100 - progress)}
                disabled={progressLoading}
                className="btn btn-primary btn-sm flex-1 text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                {progressLoading ? "Updating..." : "Complete Course 🎓"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2 text-base font-bold shadow-xl shadow-indigo-600/20"
          >
            <CreditCard className="w-5 h-5" />
            <span>Enroll Now — ₹{priceInr.toLocaleString("en-IN")}</span>
          </button>
          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 100% Money-Back Guarantee if not satisfied
          </p>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-6 bg-slate-900 border-white/20 shadow-2xl relative">
            {paymentStep === "SELECT" && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> SkillBank Secure Checkout
                  </div>
                  <h2 className="text-xl font-black text-white">Enrollment Payment</h2>
                  <p className="text-xs text-slate-400 line-clamp-1">{courseTitle}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Total Payable Amount</span>
                  <span className="text-2xl font-black text-white">
                    ₹{priceInr.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Payment Method
                  </label>
                  {[
                    { id: "UPI", title: "UPI (Google Pay, PhonePe, Paytm)", desc: "Instant zero-fee transfer" },
                    { id: "CARD", title: "Debit / Credit Card (Visa, RuPay, MC)", desc: "Indian & International cards" },
                    { id: "NETBANKING", title: "Net Banking (All Major Banks)", desc: "HDFC, SBI, ICICI, Axis" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedMethod === m.id
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-white text-xs">{m.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                      </div>
                      {selectedMethod === m.id && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
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
                    onClick={handleConfirmPayment}
                    className="btn btn-primary btn-md flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
                  >
                    Pay ₹{priceInr} Securely
                  </button>
                </div>
              </>
            )}

            {paymentStep === "PROCESSING" && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-white">Connecting to Gateway...</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Confirming transaction and reserving masterclass seat
                  </p>
                </div>
              </div>
            )}

            {paymentStep === "SUCCESS" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Welcome to the masterclass. Your cohort materials are unlocked.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
