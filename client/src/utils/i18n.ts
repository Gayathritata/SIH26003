import { translations, getTranslation, Language } from '../i18n/translations';

export { translations, getTranslation };
export type { Language };

export const supportedLanguages: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া' },
];
