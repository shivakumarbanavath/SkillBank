import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function calculateCreditReward(
  rating: number,
  baseReward: number = 10
): number {
  const multipliers: Record<number, number> = {
    1: 0.5,
    2: 0.75,
    3: 1.0,
    4: 1.25,
    5: 1.5,
  };
  const multiplier = multipliers[rating] ?? 1.0;
  // Round to nearest integer (consistent rounding policy)
  return Math.round(baseReward * multiplier);
}

export function generateIdempotencyKey(
  userId: string,
  action: string,
  entityId: string
): string {
  return `${userId}:${action}:${entityId}`;
}

export function parseJsonSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatSessionStatus(status: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    REQUESTED: { label: "Requested", color: "yellow" },
    ACCEPTED: { label: "Accepted", color: "blue" },
    DECLINED: { label: "Declined", color: "red" },
    CANCELLED: { label: "Cancelled", color: "gray" },
    COMPLETED: { label: "Completed", color: "green" },
    NO_SHOW: { label: "No Show", color: "red" },
    DISPUTED: { label: "Disputed", color: "purple" },
  };
  return map[status] ?? { label: status, color: "gray" };
}

export function getProficiencyLabel(level: string): string {
  const map: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    EXPERT: "Expert",
  };
  return map[level] ?? level;
}

export function getFormatLabel(format: string): string {
  const map: Record<string, string> = {
    IN_PERSON: "In Person",
    ONLINE: "Online",
    EITHER: "In Person or Online",
  };
  return map[format] ?? format;
}

export function avatarUrl(name: string): string {
  // Use UI Avatars as fallback
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=1d4ed8&color=fff&bold=true`;
}
