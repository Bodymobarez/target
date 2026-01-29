import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { formatPrice, formatPriceFromUsd } from "@/lib/currency";
import type { TFunction } from "i18next";

export type Locale = "ar" | "en";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  dir: "rtl" | "ltr";
  formatPrice: (amount: number, compact?: boolean) => string;
  formatPriceFromUsd: (usd: number) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === "ar" || i18n.language === "en"
    ? i18n.language
    : "ar") as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const setLocale = useCallback(
    (next: Locale) => {
      i18n.changeLanguage(next);
    },
    [i18n]
  );

  const formatPriceLocal = useCallback(
    (amount: number, compact?: boolean) =>
      formatPrice(amount, { locale, compact }),
    [locale]
  );

  const formatUsdToEgp = useCallback(
    (usd: number) => formatPriceFromUsd(usd, locale),
    [locale]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      dir,
      formatPrice: formatPriceLocal,
      formatPriceFromUsd: formatUsdToEgp,
    }),
    [
      locale,
      setLocale,
      t,
      dir,
      formatPriceLocal,
      formatUsdToEgp,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
