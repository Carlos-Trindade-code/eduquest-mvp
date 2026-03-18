'use client';

import { Navbar } from '@/components/landing/Navbar';
import dynamic from 'next/dynamic';
const MusicPlayer = dynamic(() => import('@/components/landing/MusicPlayer').then(m => m.MusicPlayer), { ssr: false });
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProof } from '@/components/landing/SocialProof';
import { DemoShowcase } from '@/components/landing/DemoShowcase';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AgeGroupShowcase } from '@/components/landing/AgeGroupShowcase';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';


export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A1A]">
      <Navbar />
        <div className="flex flex-col items-center mt-4">
          <MusicPlayer />
        </div>
      <HeroSection />
      <SocialProof />
      <DemoShowcase />
      <FeaturesSection />
      <AgeGroupShowcase />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  );
}
