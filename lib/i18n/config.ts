export const locales = ['pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

export function getMessages(locale: Locale) {
  // Dynamic import for translations
  switch (locale) {
    case 'pt-BR':
      return import('./translations/pt-BR.json');
    case 'en':
      return import('./translations/en.json');
    default:
      return import('./translations/pt-BR.json');
  }
}
