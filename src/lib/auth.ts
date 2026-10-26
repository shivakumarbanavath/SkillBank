import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production-abc123xyz",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
        token.onboardingDone =
          (user as { onboardingDone?: boolean }).onboardingDone ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingDone = token.onboardingDone as boolean;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Protect authenticated routes
      const protectedPaths = [
        "/dashboard",
        "/discover",
        "/matches",
        "/sessions",
        "/messages",
        "/credits",
        "/reviews",
        "/profile",
        "/skills",
        "/notifications",
        "/settings",
        "/onboarding",
        "/my-learning",
        "/instructor",
      ];

      const adminPaths = ["/admin"];

      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
      const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

      if (isAdmin) {
        if (!isLoggedIn) return false;
        return (auth?.user as { role?: string })?.role === "ADMIN";
      }

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const account = await prisma.account.findFirst({
          where: {
            provider: "credentials",
            user: { email: email.toLowerCase() },
          },
          include: {
            user: {
              include: { profile: true },
            },
          },
        });

        if (!account || !account.password) return null;

        const isValid = await bcrypt.compare(password, account.password);
        if (!isValid) return null;

        const { user } = account;

        if (user.status === "SUSPENDED") {
          throw new Error("AccountSuspended");
        }

        if (user.status === "DELETED") {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? user.profile?.avatar,
          role: user.role,
          onboardingDone: user.profile?.onboardingDone ?? false,
        };
      },
    }),
  ],
});
