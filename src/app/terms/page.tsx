import { PublicShell } from "@/components/layout/public-shell";

export const metadata = {
  title: "Terms of Service",
  description: "SkillBank Terms of Service governing platform usage, credit economy integrity, and community standards.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="space-y-10 max-w-4xl mx-auto">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
          <p className="text-sm text-slate-400">Effective Date: October 2026</p>
        </div>

        <div className="card p-8 md:p-10 space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/60 border-white/10">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using SkillBank, you agree to be bound by these Terms of Service. If you do not
              agree, please discontinue using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Eligibility & Student Accounts</h2>
            <p>
              SkillBank is designed primarily for students, young professionals, and community educators. You
              must provide truthful information during registration. Misrepresenting your identity, academic
              institution, or qualifications is grounds for immediate suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Credit System Integrity & Prohibited Transactions</h2>
            <p>
              The SkillBank credit system is an educational reciprocity mechanism, not legal tender.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Credits cannot be redeemed for fiat currency, sold, or transferred outside the platform.</li>
              <li>Attempting to manipulate balances, execute duplicate reviews, create bot accounts, or falsify session completions will result in immediate permanent account termination.</li>
              <li>Ordinary peer-to-peer 1:1 sessions must remain credit-based. Demanding cash, UPI, or off-platform payment for peer exchanges is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Masterclasses, Workshops & Purchases</h2>
            <p>
              Paid expert masterclasses, group workshops, and institutional events use transparent INR pricing.
              All cohort fees are processed through authorized payment channels. Refund requests may be made
              up to 24 hours prior to the first scheduled cohort session.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              SkillBank serves as a technology platform connecting community peers. While we enforce strict
              safety controls, verification badges, and reporting mechanisms, participants are responsible for
              their conduct during in-person and remote sessions.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
