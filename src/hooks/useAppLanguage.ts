import { useEffect } from 'react';
import i18n from '../i18n';
import { clearTranslationCache } from './useTranslations';

export const useAppLanguage = (language: string | undefined) => {
  useEffect(() => {
    if (!language) return;
    const i18nLang = language === 'pt' ? 'pt' : language === 'hu' ? 'hu' : language === 'da' ? 'da' : language === 'bg' ? 'bg' : 'en';
    clearTranslationCache();
    i18n.changeLanguage(i18nLang);
  }, [language]);
};
