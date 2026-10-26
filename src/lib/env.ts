import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required for session cryptographic security"),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Optional integrations (gracefully fallback if omitted)
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    const isProduction = process.env.NODE_ENV === "production";
    const errors = parsed.error.format();
    
    if (isProduction) {
      console.error("❌ CRITICAL: Missing or invalid production environment variables:", JSON.stringify(errors, null, 2));
      throw new Error(
        "Application cannot start due to invalid or missing production environment variables. Check server logs."
      );
    } else {
      console.warn("⚠️ [DEV WARNING] Missing optional environment variables or non-fatal configuration issues:", errors);
    }
  }
  
  return parsed.data;
}

export const env = validateEnv();
