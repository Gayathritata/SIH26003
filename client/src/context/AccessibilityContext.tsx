import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, TranslationKey } from '../i18n';
import { voiceService } from '../services/voiceService';
import { fetchUserPreferencesApi, updateUserPreferencesApi } from '../services/api';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  lang: Language;
  textSize: TextSize;
  voiceEnabled: boolean;
  highContrast: boolean;
  isSpeaking: boolean;
  setLang: (lang: Language) => void;
  setTextSize: (size: TextSize) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setHighContrast: (contrast: boolean) => void;
  speak: (keyOrText: string, isDirectText?: boolean) => void;
  stopVoice: () => void;
  t: (key: TranslationKey) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('mindmate_lang') as Language) || 'en';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('mindmate_text_size') as TextSize) || 'large';
  });

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem('mindmate_voice_enabled');
    return stored !== null ? stored === 'true' : true;
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    const stored = localStorage.getItem('mindmate_high_contrast');
    return stored !== null ? stored === 'true' : true;
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Subscribe to voiceService speaking updates
  useEffect(() => {
    const unsubscribe = voiceService.subscribeSpeaking(setIsSpeaking);
    return unsubscribe;
  }, []);

  // Fetch initial preferences from backend on load
  useEffect(() => {
    const loadBackendPreferences = async () => {
      try {
        const res = await fetchUserPreferencesApi();
        if (res && res.success && res.preferences) {
          const pref = res.preferences;
          if (pref.preferredLanguage) {
            setLangState(pref.preferredLanguage as Language);
            localStorage.setItem('mindmate_lang', pref.preferredLanguage);
          }
          if (pref.textSize) {
            setTextSizeState(pref.textSize as TextSize);
            localStorage.setItem('mindmate_text_size', pref.textSize);
          }
          if (pref.voiceEnabled !== undefined) {
            setVoiceEnabledState(pref.voiceEnabled);
            localStorage.setItem('mindmate_voice_enabled', String(pref.voiceEnabled));
          }
          if (pref.highContrast !== undefined) {
            setHighContrastState(pref.highContrast);
            localStorage.setItem('mindmate_high_contrast', String(pref.highContrast));
          }
        }
      } catch (err) {
        console.warn('[ACCESSIBILITY CONTEXT] Preference load warning:', err);
      }
    };
    loadBackendPreferences();
  }, []);

  // Sync DOM attributes when text size or high contrast changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-size', textSize);
      document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    }
  }, [textSize, highContrast]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('mindmate_lang', newLang);
    updateUserPreferencesApi({ preferredLanguage: newLang });
  };

  const setTextSize = (newSize: TextSize) => {
    setTextSizeState(newSize);
    localStorage.setItem('mindmate_text_size', newSize);
    updateUserPreferencesApi({ textSize: newSize });
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    localStorage.setItem('mindmate_voice_enabled', String(enabled));
    if (!enabled) {
      voiceService.stop();
    }
    updateUserPreferencesApi({ voiceEnabled: enabled });
  };

  const setHighContrast = (contrast: boolean) => {
    setHighContrastState(contrast);
    localStorage.setItem('mindmate_high_contrast', String(contrast));
    updateUserPreferencesApi({ highContrast: contrast });
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(lang, key);
  };

  const speak = (keyOrText: string, isDirectText: boolean = false) => {
    if (!voiceEnabled) return;
    const message = isDirectText ? keyOrText : getTranslation(lang, keyOrText as TranslationKey);
    voiceService.speak(message, lang);
  };

  const stopVoice = () => {
    voiceService.stop();
  };

  return (
    <AccessibilityContext.Provider
      value={{
        lang,
        textSize,
        voiceEnabled,
        highContrast,
        isSpeaking,
        setLang,
        setTextSize,
        setVoiceEnabled,
        setHighContrast,
        speak,
        stopVoice,
        t,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
