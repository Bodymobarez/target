import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usdToEgp } from "@/lib/currency";
import { EGYPT_PAYMENT_METHODS } from "@/data/egypt";
import { ArrowRight, ArrowLeft, CreditCard, Truck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD_EGP = 50;
const SHIPPING_COST_EGP = 50;
const TAX_RATE = 0.1;
type Step = "shipping" | "payment" | "review";

const PHONE_REGEX = /^01[0125]\d{8}$/;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { token } = useAuth();
  const { t, formatPrice, formatPriceFromUsd, locale } = useLanguage();
  const [step, setStep] = useState<Step>("shipping");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("cod");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({ fullName: "", email: "", phone: "", address: "", governorate: "", zip: "" });

  const subtotalUsd = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const subtotalEgp = items.reduce(
    (s, i) => s + usdToEgp(i.price) * i.quantity,
    0
  );
  const shipping =
    subtotalEgp >= FREE_SHIPPING_THRESHOLD_EGP ? 0 : SHIPPING_COST_EGP;
  const tax = Math.round(subtotalEgp * TAX_RATE);
  const total = subtotalEgp + shipping + tax;

  const steps: { id: Step; labelKey: string; icon: typeof Truck }[] = [
    { id: "shipping", labelKey: "checkout.shipping", icon: Truck },
    { id: "payment", labelKey: "checkout.payment", icon: CreditCard },
    { id: "review", labelKey: "checkout.review", icon: Check },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  const handlePlaceOrder = async () => {
    setPlaceError(null);
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, name: i.name, price: usdToEgp(i.price), quantity: i.quantity, image: i.image, color: i.color })),
          subtotal: subtotalEgp,
          shipping,
          tax,
          total,
          currency: "EGP",
          shippingAddress: { ...shippingAddress, country: "Egypt" },
          paymentMethod: selectedPaymentId,
          phone: shippingAddress.phone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPlaceError(data?.message ?? t("error"));
        setPlacing(false);
        return;
      }
      const orderData = await res.json();
      clearCart();
      navigate(`/payment/${orderData.id}`, { state: { order: orderData, shippingAddress } });
    } catch {
      setPlaceError(t("error"));
    }
    setPlacing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container-apple py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("cart.empty")}</h1>
          <Link to="/products" className="btn-primary">
            {t("cart.shopProducts")}
          </Link>
        </div>
      </div>
    );
  }

  const canGoToPayment =
    shippingAddress.fullName.trim() &&
    shippingAddress.email.trim() &&
    PHONE_REGEX.test(shippingAddress.phone.trim());

  return (
    <div className="min-h-screen">
      <section className="py-8 sm:py-12 border-b border-border bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t("checkout.title")}
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = step === s.id;
              const done = i < stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl motion-smooth text-sm sm:text-base",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-primary/20 text-primary",
                    !active && !done && "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(s.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-apple">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {step === "shipping" && (
                <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6">
                    {t("checkout.shippingAddress")}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("checkout.shippingEgyptNote")}
                  </p>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      placeholder={t("checkout.fullName")}
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, fullName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                    />
                    <input
                      type="email"
                      placeholder={t("checkout.email")}
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                    />
                    <input
                      type="tel"
                      placeholder={t("checkout.phone")}
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                    />
                    <input
                      type="text"
                      placeholder={t("checkout.address")}
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, address: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t("checkout.governorate")}
                        value={shippingAddress.governorate}
                        onChange={(e) => setShippingAddress((s) => ({ ...s, governorate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                      />
                      <input
                        type="text"
                        placeholder={t("checkout.zip")}
                        value={shippingAddress.zip}
                        onChange={(e) => setShippingAddress((s) => ({ ...s, zip: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>
                  {!canGoToPayment && (
                    <p className="text-sm text-amber-600 mt-2">
                      {t("checkout.phoneRequired")}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => canGoToPayment && setStep("payment")}
                    disabled={!canGoToPayment}
                    className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-60"
                  >
                    {t("checkout.continueToPayment")}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === "payment" && (
                <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6">
                    {t("checkout.payment")}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("checkout.paymentEgyptNote")}
                  </p>
                  <div className="space-y-3">
                    {EGYPT_PAYMENT_METHODS.map((pm) => {
                      const name = locale === "ar" ? pm.nameAr : pm.nameEn;
                      const isSelected = selectedPaymentId === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedPaymentId(pm.id)}
                          className={cn(
                            "w-full flex gap-4 p-4 rounded-xl border text-left smooth-transition",
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border bg-secondary/30 hover:bg-secondary/50"
                          )}
                        >
                          <span className="text-2xl">{pm.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t(`checkout.paymentMethodDesc.${pm.id}`)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep("shipping")}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      {t("checkout.back")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("review")}
                      className="btn-primary flex items-center gap-2"
                    >
                      {t("checkout.reviewOrder")}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === "review" && (
                <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6">
                    {t("checkout.reviewOrder")}
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.color ?? ""}`}
                        className="flex gap-4 py-4 border-b border-border last:border-0"
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          {item.color && (
                            <p className="text-sm text-muted-foreground">{item.color}</p>
                          )}
                        </div>
                        <p className="font-semibold">
                          {formatPrice(usdToEgp(item.price) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep("payment")}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      {t("checkout.back")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl lg:sticky lg:top-24">
                <h2 className="text-xl font-bold mb-6">
                  {t("cart.orderSummary")}
                </h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(subtotalEgp)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("shipping")}</span>
                    <span>
                      {shipping === 0 ? t("cart.free") : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.taxEst")}</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>{t("total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {step === "review" && (
                  <>
                    {placeError && <p className="text-destructive text-sm mb-2">{placeError}</p>}
                    <button
                      type="button"
                      disabled={placing}
                      onClick={handlePlaceOrder}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {placing ? t("loading") : t("checkout.placeOrder")}
                      <Check className="w-5 h-5" />
                    </button>
                  </>
                )}
                <Link
                  to="/cart"
                  className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground"
                >
                  {t("checkout.editCart")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
