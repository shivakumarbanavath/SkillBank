import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import LandingPage from "@/components/landing/landing-page";

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <Footer />
    </>
  );
}
