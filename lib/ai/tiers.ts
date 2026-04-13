export type PlanTier = 'free' | 'basic' | 'premium';

export const MODEL_TIERS: Record<PlanTier, { model: string; label: string; description: string }> = {
  free: {
    model: 'gemini-2.0-flash-lite',
    label: 'Edu Lite',
    description: 'Tutor rapido e acessivel',
  },
  basic: {
    model: 'gemini-2.5-flash-lite',
    label: 'Edu Plus',
    description: 'Respostas mais detalhadas',
  },
  premium: {
    model: 'gemini-2.5-flash',
    label: 'Edu Premium',
    description: 'Raciocinio avancado e profundo',
  },
};

export const DEFAULT_TIER: PlanTier = 'free';

export function getModelForTier(tier?: PlanTier | null): string {
  return MODEL_TIERS[tier || DEFAULT_TIER].model;
}
