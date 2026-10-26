import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillBank – Your Skills Are Worth More Than You Think",
    template: "%s | SkillBank",
  },
  description:
    "Teach what you know. Learn what you love. Exchange skills with people around you without money getting in the way.",
  keywords: [
    "skill exchange",
    "peer learning",
    "skill sharing",
    "learn programming",
    "teach skills",
    "skill bank",
    "community learning",
    "NIT Calicut",
  ],
  authors: [{ name: "SkillBank Team" }],
  creator: "SkillBank",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "SkillBank – Your Skills Are Worth More Than You Think",
    description:
      "Teach what you know. Learn what you love. Exchange skills with people around you.",
    siteName: "SkillBank",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBank – Skill Exchange Platform",
    description:
      "Teach what you know. Learn what you love. Exchange skills with people around you.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
