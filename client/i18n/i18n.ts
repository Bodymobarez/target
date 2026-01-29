/**
 * إعداد i18next - ترجمة كاملة عربي/إنجليزي
 * i18next config - full Arabic/English translation
 * @see https://react.i18next.com
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

const STORAGE_KEY = "apple-store-locale";

function getSavedLanguage(): "ar" | "en" {
  if (typeof window === "undefined") return "ar";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {}
  return "ar";
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: translations.ar as Record<string, unknown> },
    en: { translation: translations.en as Record<string, unknown> },
  },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
    defaultVariables: { query: "" },
  },
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
  returnNull: false,
});

// مزامنة اللغة المحفوظة مع الوثيقة (RTL / LTR)
function syncDocumentLanguage(lng: string) {
  if (typeof document === "undefined") return;
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng === "ar" ? "ar" : "en";
  document.documentElement.dir = dir;
}

syncDocumentLanguage(i18n.language);
i18n.on("languageChanged", (lng) => {
  syncDocumentLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {}
});

export default i18n;
