import { useLanguage } from '../contexts/LanguageContext';

export const useLanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  return { language, handleLanguageChange: setLanguage };
};
