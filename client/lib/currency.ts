/**
 * العملة: الجنيه المصري (EGP)
 * Currency: Egyptian Pound (EGP)
 */

const CURRENCY_CODE = "EGP";
const LOCALE_AR = "ar-EG";
const LOCALE_EN = "en-US";

/**
 * Format price in Egyptian Pounds.
 * Uses Arabic numerals when locale is ar.
 */
export function formatPrice(
  amount: number,
  options?: { locale?: "ar" | "en"; compact?: boolean }
): string {
  const locale = options?.locale === "ar" ? LOCALE_AR : LOCALE_EN;
  if (options?.compact && amount >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY_CODE,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert stored USD price to EGP for display.
 * Rate can be updated from API or env.
 */
const USD_TO_EGP_RATE = 31.5;

export function usdToEgp(usd: number): number {
  return Math.round(usd * USD_TO_EGP_RATE);
}

export function formatPriceFromUsd(usd: number, locale?: "ar" | "en"): string {
  return formatPrice(usdToEgp(usd), { locale });
}

export { CURRENCY_CODE, USD_TO_EGP_RATE };
