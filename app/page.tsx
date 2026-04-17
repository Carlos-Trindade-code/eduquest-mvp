'use client';

import { Navbar } from '@/components/landing/Navbar';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/HeroSection';

const MusicPlayer = dynamic(() => import('@/components/landing/MusicPlayer').then(m => m.MusicPlayer), { ssr: false });

const SectionSkeleton = () => (
  <div className="w-full py-20 px-4">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-10 w-1/3 mx-auto rounded-lg bg-gray-200 animate-pulse" />
      <div className="h-4 w-2/3 mx-auto rounded bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const ParentTestimonials = dynamic(() => import('@/components/landing/ParentTestimonials').then(m => m.ParentTestimonials), {
  loading: () => <SectionSkeleton />,
});
const SocialProof = dynamic(() => import('@/components/landing/SocialProof').then(m => m.SocialProof), {
  loading: () => <SectionSkeleton />,
});
const DemoShowcase = dynamic(() => import('@/components/landing/DemoShowcase').then(m => m.DemoShowcase), {
  loading: () => <SectionSkeleton />,
});
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(m => m.FeaturesSection), {
  loading: () => <SectionSkeleton />,
});
const AgeGroupShowcase = dynamic(() => import('@/components/landing/AgeGroupShowcase').then(m => m.AgeGroupShowcase), {
  loading: () => <SectionSkeleton />,
});
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks').then(m => m.HowItWorks), {
  loading: () => <SectionSkeleton />,
});
const ParentDashboardPreview = dynamic(() => import('@/components/landing/ParentDashboardPreview').then(m => m.ParentDashboardPreview), {
  loading: () => <SectionSkeleton />,
});
const SchoolsSection = dynamic(() => import('@/components/landing/SchoolsSection').then(m => m.SchoolsSection), {
  loading: () => <SectionSkeleton />,
});
const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(m => m.FAQSection), {
  loading: () => <SectionSkeleton />,
});
const Footer = dynamic(() => import('@/components/landing/Footer').then(m => m.Footer), {
  loading: () => <div className="w-full h-32 bg-gray-200 animate-pulse" />,
});


export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <HeroSection />
      <ParentTestimonials />
      <SocialProof />
      <DemoShowcase />
      <FeaturesSection />
      <AgeGroupShowcase />
      <HowItWorks />
      <ParentDashboardPreview />
      <SchoolsSection />
      <FAQSection />
      <Footer />
      <MusicPlayer />
    </main>
  );
}
