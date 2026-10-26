import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VerificationForm } from "@/components/safety/verification-form";
import { ShieldCheck, Award, Users, CheckCircle } from "lucide-react";

export const metadata = { title: "Campus Verification" };
export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, verificationRequest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    }),
    prisma.verificationRequest.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          Campus Verification
        </h1>
        <p className="text-slate-400 mt-1">
          Verify your student status to unlock campus trust badges and institutional events
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 space-y-2 bg-emerald-950/10 border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">Verified Badge</h3>
          <p className="text-xs text-slate-400">
            Displays a blue verification checkmark on your profile, skill listings, and chat.
          </p>
        </div>

        <div className="card p-5 space-y-2 bg-blue-950/10 border-blue-500/20">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">Hyperlocal Trust</h3>
          <p className="text-xs text-slate-400">
            Peers from your campus can easily find and trust you for in-person study sessions.
          </p>
        </div>

        <div className="card p-5 space-y-2 bg-purple-950/10 border-purple-500/20">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">Institutional Events</h3>
          <p className="text-xs text-slate-400">
            Exclusive registration access to campus hackathons, corporate workshops, and certificates.
          </p>
        </div>
      </div>

      {/* Form */}
      <VerificationForm
        currentRequest={verificationRequest}
        userInstitution={user?.profile?.institution}
        userCampus={user?.profile?.campus}
      />
    </div>
  );
}
