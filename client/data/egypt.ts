/**
 * بيانات مصر - شركات الشحن وطرق الدفع
 * Egypt data - Shipping carriers & payment methods
 */

export const EGYPT_SHIPPING_CARRIERS = [
  { id: "aramex", nameAr: "أرامكس", nameEn: "Aramex" },
  { id: "bosta", nameAr: "بوستا", nameEn: "Bosta" },
  { id: "dhl", nameAr: "DHL مصر", nameEn: "DHL Egypt" },
  { id: "fedex", nameAr: "فيديكس مصر", nameEn: "FedEx Egypt" },
  { id: "mex", nameAr: "MEX", nameEn: "MEX (Mira Express)" },
  { id: "tdg", nameAr: "ذا ديلفري جاي", nameEn: "The Delivery Guy" },
  { id: "cargo", nameAr: "كارجو", nameEn: "Cargo" },
  { id: "rakan", nameAr: "ركان", nameEn: "RAKAN" },
  { id: "b2b", nameAr: "B2B ديلفري", nameEn: "B2B Delivery" },
  { id: "yellow", nameAr: "يلو", nameEn: "Yellow" },
  { id: "shiphub", nameAr: "شيب هب", nameEn: "ShipHub" },
  { id: "el7orria", nameAr: "الحرية", nameEn: "El7orria" },
  { id: "one", nameAr: "ون ديلفري", nameEn: "One Delivery" },
  { id: "other", nameAr: "أخرى", nameEn: "Other" },
] as const;

export type EgyptCarrierId = (typeof EGYPT_SHIPPING_CARRIERS)[number]["id"];

export const EGYPT_PAYMENT_METHODS = [
  { id: "cod", nameAr: "الدفع عند الاستلام", nameEn: "Cash on Delivery", icon: "💵" },
  { id: "fawry", nameAr: "فوري", nameEn: "Fawry", icon: "🟢" },
  { id: "vodafone_cash", nameAr: "فودافون كاش", nameEn: "Vodafone Cash", icon: "📱" },
  { id: "orange_cash", nameAr: "أورنج كاش", nameEn: "Orange Cash", icon: "📱" },
  { id: "etisalat_cash", nameAr: "اتصالات كاش", nameEn: "Etisalat Cash", icon: "📱" },
  { id: "instapay", nameAr: "انستاباي", nameEn: "Instapay", icon: "⚡" },
  { id: "aman", nameAr: "أمان", nameEn: "Aman", icon: "🔒" },
  { id: "bank_transfer", nameAr: "تحويل بنكي", nameEn: "Bank Transfer", icon: "🏦" },
  { id: "visa_mastercard", nameAr: "فيزا / ماستركارد", nameEn: "Visa / Mastercard", icon: "💳" },
] as const;

export type EgyptPaymentId = (typeof EGYPT_PAYMENT_METHODS)[number]["id"];

export const EGYPT_DEFAULT_COUNTRY = "Egypt";
export const EGYPT_DEFAULT_COUNTRY_AR = "مصر";
