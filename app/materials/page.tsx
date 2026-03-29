'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { MaterialLibrary } from '@/components/materials/MaterialLibrary';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { fadeInUp } from '@/lib/design/animations';
import type { AgeGroup, Material } from '@/lib/auth/types';

export default function MaterialsPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login?redirect=/materials');
    }
    if (profile?.age_group) {
      setAgeGroup(profile.age_group);
    }
  }, [profile, loading, router]);

  const handleStudy = (material: Material) => {
    // Navigate to tutor with material context
    const params = new URLSearchParams();
    if (material.subject) params.set('subject', material.subject);
    params.set('material_id', material.id);
    params.set('material_title', material.title);
    if (material.content_text) {
      // Store in sessionStorage to avoid URL length limits
      sessionStorage.setItem('studdo_material_text', material.content_text);
      sessionStorage.setItem('studdo_material_title', material.title);
    }
    router.push(`/tutor?${params}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E1046 0%, #3B0764 100%)' }}>
        <div className="animate-pulse text-white/40">Carregando...</div>
      </div>
    );
  }

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      <div
        className="min-h-screen p-4 sm:p-6"
        style={{ background: 'linear-gradient(135deg, var(--eq-bg) 0%, var(--eq-bg-end) 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            variants={fadeInUp('high')}
            initial="hidden"
            animate="visible"
          >
            <Link
              href="/tutor"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <FolderOpen size={20} className="text-purple-400" />
              <h1 className="text-white text-xl font-bold">Meus Materiais</h1>
            </div>
          </motion.div>

          {/* Library */}
          <MaterialLibrary
            kidId={profile?.user_type === 'kid' ? undefined : undefined}
            ownerType={profile?.user_type === 'parent' ? 'parent' : 'kid'}
            onStudy={handleStudy}
          />
        </div>
      </div>
    </AgeThemeProvider>
  );
}
