"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(
  data: RegisterInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const lowerEmail = email.toLowerCase();

  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: lowerEmail },
  });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: lowerEmail,
          role: "USER", // NEVER allow client to set role
        },
      });

      // Create credentials account
      await tx.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: user.id,
          password: hashedPassword,
        },
      });

      // Create credit account with welcome bonus
      await tx.creditAccount.create({
        data: {
          userId: user.id,
          balance: 20, // Welcome bonus
          totalEarned: 20,
        },
      });

      // Create welcome bonus transaction
      const creditAccount = await tx.creditAccount.findUnique({
        where: { userId: user.id },
      });
      if (creditAccount) {
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            accountId: creditAccount.id,
            type: "WELCOME_BONUS",
            amount: 20,
            balanceAfter: 20,
            description: "Welcome to SkillBank! Here are 20 credits to get started.",
            idempotencyKey: `welcome:${user.id}`,
          },
        });
      }

      // Create welcome notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "WELCOME",
          title: "Welcome to SkillBank! 🎉",
          body: "You've received 20 welcome credits. Start by completing your profile and adding your skills.",
          link: "/onboarding",
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function loginUser(
  data: { email: string; password: string },
  callbackUrl?: string
): Promise<{ success: boolean; error?: string; redirect?: string }> {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    revalidatePath("/");
    return {
      success: true,
      redirect: callbackUrl || "/dashboard",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("AccountSuspended")) {
        return { success: false, error: "Your account has been suspended. Contact support." };
      }
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await import("@/lib/auth").then((m) => m.auth());
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (data.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long" };
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "credentials" },
  });

  if (!account || !account.password) {
    return { success: false, error: "Credentials account not found" };
  }

  const passwordsMatch = await bcrypt.compare(data.currentPassword, account.password);
  if (!passwordsMatch) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.account.update({
    where: { id: account.id },
    data: { password: newHash },
  });

  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const lowerEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: lowerEmail } });

  // Return success even if user not found to prevent email enumeration
  if (!user) {
    return { success: true, message: "If an account exists, a reset link has been generated." };
  }

  const { nanoid } = await import("nanoid");
  const token = `reset_${nanoid(32)}`;
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email: lowerEmail,
      token,
      expires,
    },
  });

  // In prototype without production SMTP, provide simulated reset link
  return {
    success: true,
    message: "Password reset link generated.",
    devResetUrl: `/reset-password?token=${token}`,
  };
}

export async function resetPasswordWithToken(data: { token: string; newPassword: string }) {
  if (data.newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: data.token },
  });

  if (!resetToken || resetToken.used || new Date(resetToken.expires) < new Date()) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) return { success: false, error: "User not found" };

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "credentials" },
  });

  if (!account) return { success: false, error: "Credentials account not found" };

  const newHash = await bcrypt.hash(data.newPassword, 12);

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: { password: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}

export async function deactivateAccount() {
  const session = await import("@/lib/auth").then((m) => m.auth());
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: "DELETED" },
    }),
    prisma.teachingSkill.updateMany({
      where: { userId },
      data: { isActive: false },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "ACCOUNT_DEACTIVATED",
        targetType: "User",
        targetId: userId,
      },
    }),
  ]);

  await signOut({ redirectTo: "/" });
  return { success: true };
}
