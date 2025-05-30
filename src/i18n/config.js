import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    // Backend options
    backend: {
      loadPath: '/src/i18n/locales/{{lng}}/{{ns}}.json',
    },
  });

// Function to change language and update document direction
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

export default i18n; 