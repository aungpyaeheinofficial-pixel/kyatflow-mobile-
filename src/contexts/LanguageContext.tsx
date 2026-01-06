import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';
import { haptics } from '@/lib/haptics';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('appLanguage');
        if (saved === 'en' || saved === 'my') {
          return saved as Language;
        }
      } catch (error) {
        console.warn('Failed to read language from localStorage:', error);
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    haptics.selection();
    setLanguageState(lang);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('appLanguage', lang);
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
    }
    
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // Initialize HTML lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translation function with nested key support (e.g., 'nav.dashboard')
  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if translation missing
          let fallback: any = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return key if translation not found
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

