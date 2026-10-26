import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
