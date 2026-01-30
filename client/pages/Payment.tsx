import { Link, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { EGYPT_PAYMENT_METHODS } from "@/data/egypt";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || "201061887799";

type OrderForPayment = {
  id: string;
  total: number;
  currency: string;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress?: { fullName?: string; phone?: string; email?: string };
};

export default function Payment() {
  const { t, formatPrice, locale } = useLanguage();
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const location = useLocation();
  const state = location.state as {
    order?: OrderForPayment;
    shippingAddress?: { fullName?: string; phone?: string; email?: string };
  } | null;

  const [order, setOrder] = useState<OrderForPayment | null>(state?.order ?? null);
  const [loading, setLoading] = useState(!state?.order && !!orderIdParam);
  const [error, setError] = useState<string | null>(null);

  const shippingAddress = order?.shippingAddress ?? state?.shippingAddress;
  const phone = shippingAddress?.phone?.replace(/\D/g, "") || "";

  useEffect(() => {
    if (state?.order) {
      setOrder(state.order);
      return;
    }
    if (!orderIdParam) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders/${orderIdParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setOrder({
            id: data.id,
            total: data.total,
            currency: data.currency,
            items: data.items ?? [],
            shippingAddress: (data.shippingAddress ?? {}) as OrderForPayment["shippingAddress"],
          });
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
          setError("Order not found");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderIdParam, state?.order]);

  const whatsappText = order
    ? encodeURIComponent(
        locale === "ar"
          ? `مرحباً، أنا ${shippingAddress?.fullName || ""}. أريد إتمام الدفع للطلب رقم ${order.id}. المبلغ الإجمالي: ${order.total} ${order.currency}.`
          : `Hi, I'm ${shippingAddress?.fullName || ""}. I want to complete payment for order #${order.id}. Total: ${order.total} ${order.currency}.`
      )
    : "";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}${whatsappText ? `?text=${whatsappText}` : ""}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container-apple text-center py-20">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container-apple text-center py-20">
          <h1 className="text-2xl font-bold mb-4">{t("paymentPage.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {locale === "ar" ? "لم نجد تفاصيل الطلب. استكمل من صفحة طلباتك أو افتح رابط الدفع من جديد." : "Order details not found. Continue from your orders or open the payment link again."}
          </p>
          <Link to="/profile" className="btn-primary mr-2">
            {t("profile.viewOrders")}
          </Link>
          <Link to="/products" className="btn-secondary">
            {t("paymentPage.backToShop")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-8 sm:py-12 border-b border-border bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("paymentPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("paymentPage.orderId")}: <span className="font-mono font-medium text-foreground">{order.id}</span>
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-apple max-w-3xl">
          <div className="card-premium p-6 sm:p-8 rounded-2xl mb-8">
            <h2 className="text-xl font-bold mb-4">{t("paymentPage.allMethods")}</h2>
            <div className="space-y-3">
              {EGYPT_PAYMENT_METHODS.map((pm) => {
                const name = locale === "ar" ? pm.nameAr : pm.nameEn;
                return (
                  <div
                    key={pm.id}
                    className={cn(
                      "flex gap-4 p-4 rounded-xl border border-border bg-secondary/30"
                    )}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`checkout.paymentMethodDesc.${pm.id}`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-premium p-6 sm:p-8 rounded-2xl mb-8">
            <h2 className="text-xl font-bold mb-2">{t("paymentPage.whatsappCta")}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {t("paymentPage.whatsappCtaDesc")}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto btn-primary py-4 px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white border-0"
            >
              <MessageCircle className="w-6 h-6" />
              {t("paymentPage.whatsappCta")}
            </a>
            {phone && (
              <p className="text-sm text-muted-foreground mt-3">
                {locale === "ar" ? "رقمك للمتابعة:" : "Your number for follow-up:"} {shippingAddress?.phone}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{t("paymentPage.total")}</p>
              <p className="text-2xl font-bold">{formatPrice(order.total)} {order.currency}</p>
            </div>
            <Link to="/products" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {t("paymentPage.backToShop")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
