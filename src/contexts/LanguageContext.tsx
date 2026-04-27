import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { supabase } from '../lib/supabase';
import { clearTranslationCache } from '../hooks/useTranslations';

interface LanguageContextValue {
  language: string;
  setLanguage: (code: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
});

export const LanguageProvider: React.FC<{
  userId: string;
  initialLanguage: string;
  children: React.ReactNode;
}> = ({ userId, initialLanguage, children }) => {
  const [language, setLanguageState] = useState(initialLanguage);

  // Sync i18n on mount with the profile's saved language
  useEffect(() => {
    const i18nCode = initialLanguage === 'pt' ? 'pt' : initialLanguage === 'hu' ? 'hu' : initialLanguage === 'da' ? 'da' : initialLanguage === 'bg' ? 'bg' : 'en';
    i18n.changeLanguage(i18nCode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = async (code: string) => {
    setLanguageState(code);
    clearTranslationCache();
    const i18nCode = code === 'pt' ? 'pt' : code === 'hu' ? 'hu' : code === 'da' ? 'da' : code === 'bg' ? 'bg' : 'en';
    await i18n.changeLanguage(i18nCode);
    await supabase
      .from('profiles')
      .update({ preferred_language: code })
      .eq('id', userId);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
