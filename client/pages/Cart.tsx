import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { usdToEgp } from "@/lib/currency";

const FREE_SHIPPING_THRESHOLD_EGP = 50;
const SHIPPING_COST_EGP = 50;
const TAX_RATE = 0.1;

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const { t, formatPrice, formatPriceFromUsd } = useLanguage();

  const subtotalUsd = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const subtotalEgp = items.reduce(
    (sum, i) => sum + usdToEgp(i.price) * i.quantity,
    0
  );
  const shipping =
    subtotalEgp >= FREE_SHIPPING_THRESHOLD_EGP ? 0 : SHIPPING_COST_EGP;
  const tax = Math.round(subtotalEgp * TAX_RATE);
  const total = subtotalEgp + shipping + tax;

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-8 sm:py-12 md:py-16 border-b border-border bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("cart.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {items.length === 0
              ? t("cart.empty")
              : `${items.length} ${items.length === 1 ? t("cart.item") : t("cart.items")}`}
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-apple">
          {items.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("cart.empty")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("cart.emptySub")}
              </p>
              <Link to="/products" className="btn-primary inline-block">
                {t("cart.shopProducts")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.color ?? "default"}`}
                    className="card-premium p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      {item.color && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("color")}: {item.color}
                        </p>
                      )}
                      <p className="text-lg font-bold">
                        {formatPriceFromUsd(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-2 hover:bg-secondary rounded-lg motion-smooth"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-2 hover:bg-secondary rounded-lg motion-smooth"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.color)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg motion-smooth"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl lg:sticky lg:top-24">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    {t("cart.orderSummary")}
                  </h2>
                  <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("subtotal")}</span>
                      <span>{formatPrice(subtotalEgp)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("shipping")}</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600 font-medium">
                            {t("cart.free")}
                          </span>
                        ) : (
                          formatPrice(shipping)
                        )}
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
                  <Link
                    to="/checkout"
                    className="btn-primary w-full mb-4 flex items-center justify-center gap-2 py-4"
                  >
                    {t("cart.proceedToCheckout")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="btn-secondary w-full text-center block py-3"
                  >
                    {t("cart.continueShopping")}
                  </Link>
                  <div className="mt-6 p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground space-y-1">
                    <p>✓ {t("cart.freeShippingNote")}</p>
                    <p>✓ {t("cart.returnsNote")}</p>
                    <p>✓ {t("cart.secureCheckout")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
