import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Coins, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Credits" };
export const dynamic = "force-dynamic";

const TX_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  WELCOME_BONUS: { label: "Welcome Bonus", icon: Coins, color: "text-green-400" },
  SESSION_SPENDING: { label: "Session Payment", icon: ArrowDownCircle, color: "text-red-400" },
  SESSION_EARNING: { label: "Teaching Reward", icon: ArrowUpCircle, color: "text-green-400" },
  RESERVATION: { label: "Reserved", icon: ArrowDownCircle, color: "text-yellow-400" },
  RESERVATION_RELEASE: { label: "Reservation Released", icon: ArrowUpCircle, color: "text-blue-400" },
  PURCHASE: { label: "Credit Purchase", icon: ArrowUpCircle, color: "text-green-400" },
  REFUND: { label: "Refund", icon: ArrowUpCircle, color: "text-blue-400" },
  ADMIN_ADJUSTMENT: { label: "Admin Adjustment", icon: Coins, color: "text-purple-400" },
};

export default async function CreditsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [account, transactions] = await Promise.all([
    prisma.creditAccount.findUnique({ where: { userId } }),
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const available = (account?.balance ?? 0) - (account?.reservedBalance ?? 0);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Credits</h1>
        <p className="text-slate-400 mt-1">Your credit balance and transaction history</p>
      </div>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-slate-400">Available</p>
          </div>
          <p className="text-3xl font-black text-white">{available}</p>
          <p className="text-xs text-slate-400 mt-1">credits</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-sm text-slate-400">Total Earned</p>
          </div>
          <p className="text-3xl font-black text-white">{account?.totalEarned ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">credits</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <p className="text-sm text-slate-400">Total Spent</p>
          </div>
          <p className="text-3xl font-black text-white">{account?.totalSpent ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">credits</p>
        </div>
      </div>

      {/* Reserved banner if any */}
      {(account?.reservedBalance ?? 0) > 0 && (
        <div className="card p-4 border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3">
          <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="text-yellow-400 font-semibold">{account?.reservedBalance} credits</span> are reserved for
            pending sessions. They&apos;ll be settled when sessions complete.
          </p>
        </div>
      )}

      {/* How credits work */}
      <div className="card p-6">
        <h2 className="font-bold text-white mb-4">How Credits Work</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-medium text-white">Welcome Bonus</p>
              <p className="text-slate-400">20 credits when you join</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-white">Learning Sessions</p>
              <p className="text-slate-400">Spend 10 credits per session</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-medium text-white">Teaching Rewards</p>
              <p className="text-slate-400">Earn 5–15 credits based on your rating</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-medium text-white">Credit Reservation</p>
              <p className="text-slate-400">Credits reserved when session is requested, settled on completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-bold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="card p-10 text-center">
            <Coins className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y divide-white/10">
              {transactions.map((tx) => {
                const typeInfo = TX_TYPE_LABELS[tx.type] ?? {
                  label: tx.type,
                  icon: Coins,
                  color: "text-slate-400",
                };
                const Icon = typeInfo.icon;

                return (
                  <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0", typeInfo.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{typeInfo.label}</p>
                      <p className="text-xs text-slate-500 truncate">{tx.description}</p>
                      <p className="text-xs text-slate-600">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", tx.amount >= 0 ? "text-green-400" : "text-red-400")}>
                        {tx.amount >= 0 ? "+" : ""}{tx.amount}
                      </p>
                      <p className="text-xs text-slate-500">bal: {tx.balanceAfter}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
