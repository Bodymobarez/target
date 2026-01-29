import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { User, ShoppingBag, Heart, Settings, LogOut, Truck, ExternalLink } from "lucide-react";
import { mockUserOrders } from "@/data/mockOrders";
import { cn } from "@/lib/utils";

const statusColorKeys: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default function Profile() {
  const { t, formatPriceFromUsd } = useLanguage();
  const statusLabels: Record<string, string> = {
    pending: t("admin.pending"),
    confirmed: t("admin.processing"),
    shipped: t("admin.shipped"),
    delivered: t("admin.delivered"),
    cancelled: t("admin.cancelled"),
  };

  const menuItems = [
    { icon: User, labelKey: "profile.title", href: "#", badge: null },
    {
      icon: ShoppingBag,
      labelKey: "profile.orderHistory",
      href: "#orders",
      badge: String(mockUserOrders.length),
    },
    { icon: Heart, labelKey: "profile.wishlist", href: "/wishlist", badge: null },
    { icon: Settings, labelKey: "profile.settings", href: "#", badge: null },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-8 sm:py-12 border-b border-border bg-secondary/30">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("profile.title")}</h1>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-apple">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Sidebar */}
            <div>
              <div className="card-premium p-4 sm:p-6 md:p-8 rounded-2xl mb-4 sm:mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">John Doe</h2>
                <p className="text-center text-muted-foreground text-sm">
                  john@example.com
                </p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.labelKey}
                      to={item.href as string}
                      className="card-premium p-4 rounded-xl flex items-center justify-between hover:shadow-premium motion-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{t(item.labelKey)}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <button className="w-full card-premium p-4 rounded-xl flex items-center gap-3 text-destructive hover:bg-destructive/10 motion-smooth mt-6">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t("profile.signOut")}</span>
              </button>
            </div>

            {/* Main: Order History */}
            <div className="md:col-span-2" id="orders">
              <h2 className="text-2xl font-bold mb-6">
                {t("profile.orderHistory")}
              </h2>
              <div className="space-y-4">
                {mockUserOrders.map((order) => (
                  <div key={order.id} className="card-premium p-6 rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.createdAt} · {order.itemCount}{" "}
                          {order.itemCount === 1 ? t("cart.item") : t("cart.items")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            statusColorKeys[order.status]
                          )}
                        >
                          {statusLabels[order.status]}
                        </span>
                        <p className="text-lg font-bold">
                          {formatPriceFromUsd(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium">
                            {item.name} × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {t("profile.tracking")}: {order.trackingNumber}
                        </span>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary font-medium inline-flex items-center gap-1"
                          >
                            {t("profile.track")}{" "}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10">
                <div className="card-premium p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">{t("profile.addresses")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage shipping and billing addresses
                  </p>
                  <button className="btn-secondary text-sm">
                    {t("profile.manage")}
                  </button>
                </div>
                <div className="card-premium p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">
                    {t("profile.paymentMethods")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add and manage payment cards
                  </p>
                  <button className="btn-secondary text-sm">
                    {t("profile.manage")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
