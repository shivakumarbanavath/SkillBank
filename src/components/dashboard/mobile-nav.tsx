"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, LayoutDashboard, Search, GitMerge,
  CalendarDays, MessageSquare, Coins, Star, Zap,
  User, Settings, Bell, LogOut, GraduationCap, Users, Trophy, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const allNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/matches", label: "Matches", icon: GitMerge },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/credits", label: "Credits", icon: Coins },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/skills", label: "My Skills", icon: Zap },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/workshops", label: "Workshops", icon: Users },
  { href: "/events", label: "Events", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/profile", label: "Profile", icon: User },
];

interface MobileNavProps {
  user: { name?: string | null; email: string };
}

export function DashboardMobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile header bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="font-bold text-white">SkillBank</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="p-2 text-slate-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-72 bg-slate-900 border-l border-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {allNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="p-3 border-t border-white/10">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
