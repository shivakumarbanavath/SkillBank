"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Search, GitMerge, BookOpen, MessageSquare,
  Coins, Bell, User, Settings, LogOut, Star, GraduationCap,
  Users, CalendarDays, Zap, Trophy, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/matches", label: "Matches", icon: GitMerge },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/credits", label: "Credits", icon: Coins },
  { href: "/reviews", label: "Reviews", icon: Star },
];

const secondaryNav = [
  { href: "/skills", label: "My Skills", icon: Zap },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/workshops", label: "Workshops", icon: Users },
  { href: "/events", label: "Events", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/profile", label: "My Profile", icon: User },
];

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col bg-slate-900 border-r border-white/10"
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <span className="font-bold text-lg text-white">
          Skill<span className="text-blue-400">Bank</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(item.href, item.exact)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
            aria-current={isActive(item.href, item.exact) ? "page" : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            More
          </p>
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive(item.href)
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
