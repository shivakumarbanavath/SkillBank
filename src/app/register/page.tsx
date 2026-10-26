"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { registerUser } from "@/actions/auth";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const result = await registerUser(data);
    if (result.success) {
      setDone(true);
      setTimeout(() => router.push("/login?registered=1"), 1500);
    } else {
      toast({ type: "error", title: "Registration failed", description: result.error });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-slate-950">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-hero-pattern opacity-40 pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Skill<span className="text-blue-400">Bank</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Start exchanging skills today. Free forever.</p>
        </div>

        <div className="card p-8">
          {done ? (
            <motion.div
              className="flex flex-col items-center gap-4 py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-semibold text-lg">Account created!</p>
              <p className="text-slate-400 text-sm text-center">
                Redirecting you to sign in...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="register-name" className="label">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Arjun Menon"
                  className={cn("input-lg", errors.name && "border-red-500/60")}
                  {...register("name")}
                />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="label">Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn("input-lg", errors.email && "border-red-500/60")}
                  {...register("email")}
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 chars, upper, lower, number"
                    className={cn("input-lg pr-10", errors.password && "border-red-500/60")}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="register-confirm" className="label">Confirm Password</label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className={cn("input-lg pr-10", errors.confirmPassword && "border-red-500/60")}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg w-full justify-center mt-2"
                id="register-submit-button"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                ) : (
                  "Create Account – It's Free"
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
