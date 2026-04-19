import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import bn from './locales/bn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie']
    }
  });

// Logic for geo-based language detection if needed
const detectGeoLanguage = async () => {
  try {
    // Only detect if user hasn't manually set a language
    const savedLng = localStorage.getItem('i18nextLng');
    if (!savedLng) {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_code === 'BD' || data.country === 'Bangladesh') {
        i18n.changeLanguage('bn');
      }
    }
  } catch (error) {
    console.error('Geo detection failed:', error);
  }
};

detectGeoLanguage();

export default i18n;
