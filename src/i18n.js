import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import faTranslation from "./locales/fa/translation.json";
import enTranslation from "./locales/en/translation.json";

const savedLanguage = localStorage.getItem("language") || "fa";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fa: {
        translation: faTranslation
      },
      en: {
        translation: enTranslation
      }
    },

    lng: savedLanguage,
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

document.documentElement.lang = savedLanguage;
document.documentElement.dir = savedLanguage === "fa" ? "rtl" : "ltr";

export default i18n;