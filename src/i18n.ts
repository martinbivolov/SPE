import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import pt from './locales/pt/translation.json';
import hu from './locales/hu/translation.json';
import da from './locales/da/translation.json';
import bg from './locales/bg/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      hu: { translation: hu },
      da: { translation: da },
      bg: { translation: bg },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
