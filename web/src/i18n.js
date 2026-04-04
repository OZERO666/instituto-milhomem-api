// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR/translation.json';
import en   from './locales/en/translation.json';
import es   from './locales/es/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en:      { translation: en  },
      es:      { translation: es  },
    },

    // Idioma padrão e fallback
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en', 'es'],
    nonExplicitSupportedLngs: true,

    // Detecção automática — tenta localStorage primeiro, depois o navegador
    detection: {
      order:              ['localStorage', 'navigator'],
      caches:             ['localStorage'],
      lookupLocalStorage: 'im_lang',
    },

    // O React já faz escaping — não duplicar
    interpolation: { escapeValue: false },
  });

export default i18n;
