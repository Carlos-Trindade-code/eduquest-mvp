import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AgeGroupShowcase } from '@/components/landing/AgeGroupShowcase';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A1A]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AgeGroupShowcase />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  );
}
