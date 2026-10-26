import { PublicShell } from "@/components/layout/public-shell";
import { Lock, EyeOff, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "SkillBank Privacy Policy explaining how your student and profile data is collected, used, and protected.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="space-y-10 max-w-4xl mx-auto">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: October 2026</p>
        </div>

        <div className="card p-8 md:p-10 space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/60 border-white/10">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you register on SkillBank, we collect your name, email address, campus or institution,
              and encrypted password. When you update your profile, you may optionally provide a biography,
              city, department, preferred languages, and skills you teach or wish to learn.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. How We Use Your Data</h2>
            <p>
              We use your information exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Power the matching engine and connect you with compatible learning partners.</li>
              <li>Maintain your auditable credit ledger and track session escrow.</li>
              <li>Send critical notifications regarding session requests, messages, and course updates.</li>
              <li>Verify student status and maintain a safe, trusted community.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Public Visibility & Privacy Controls</h2>
            <p>
              You maintain full control over your privacy settings in your profile. You may toggle whether your
              profile is discoverable, whether your campus location is visible to peers, and whether your email
              is hidden. We never sell your personal data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Security & Data Protection</h2>
            <p>
              Passwords are salted and hashed using bcrypt. Sensitive session tokens are protected using
              cryptographic JSON Web Tokens (JWT). All communications between your browser and our servers
              are encrypted via Transport Layer Security (TLS/HTTPS).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Account Deletion & Data Rights</h2>
            <p>
              You have the right to request deletion or export of your account and associated session histories
              at any time through your Account Settings or by contacting privacy@skillbank.app.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
