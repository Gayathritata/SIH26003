import { en } from './en';
import { hi } from './hi';
import { as } from './as';

export type Language = 'en' | 'hi' | 'as';

export const translations = {
  en,
  hi,
  as,
};

export type TranslationKey = keyof typeof en;

export const getTranslation = (lang: Language, key: TranslationKey): string => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};

export const supportedLanguages: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া' },
];
