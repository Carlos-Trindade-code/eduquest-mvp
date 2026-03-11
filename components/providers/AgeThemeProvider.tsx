'use client';

import { createContext, useContext, useMemo } from 'react';
import type { AgeGroup } from '@/lib/auth/types';
import { getThemeTokens, tokensToCSSVars, type AgeThemeTokens } from '@/lib/design/tokens';

interface AgeThemeContextValue {
  ageGroup: AgeGroup;
  tokens: AgeThemeTokens;
}

const defaultTokens = getThemeTokens('10-12');

const AgeThemeContext = createContext<AgeThemeContextValue>({
  ageGroup: '10-12',
  tokens: defaultTokens,
});

export function useAgeTheme() {
  return useContext(AgeThemeContext);
}

export function AgeThemeProvider({
  ageGroup = '10-12',
  children,
}: {
  ageGroup?: AgeGroup;
  children: React.ReactNode;
}) {
  const tokens = useMemo(() => getThemeTokens(ageGroup), [ageGroup]);
  const cssVars = useMemo(() => tokensToCSSVars(tokens), [tokens]);

  return (
    <AgeThemeContext.Provider value={{ ageGroup, tokens }}>
      <div style={cssVars as React.CSSProperties} className="contents">
        {children}
      </div>
    </AgeThemeContext.Provider>
  );
}
