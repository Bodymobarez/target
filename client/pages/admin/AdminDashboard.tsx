import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { products } from "@/data/mockProducts";

export default function AdminDashboard() {
  const { t, formatPrice } = useLanguage();
  const stats = [
    { labelKey: "admin.totalRevenue", value: formatPrice(3924480), change: "+12%", icon: DollarSign, color: "text-green-600" },
    { labelKey: "admin.ordersCount", value: "1,284", change: "+8%", icon: ShoppingCart, color: "text-blue-600" },
    { labelKey: "admin.products", value: String(products.length), change: "Active", icon: Package, color: "text-amber-600" },
    { labelKey: "admin.avgOrder", value: formatPrice(3055), change: "+5%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("admin.dashboard")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.labelKey} className="card-premium p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{t(s.labelKey)}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="card-premium p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("admin.recentActivity")}</h2>
          <div className="space-y-4">
            {[
              { text: `New order #2847 — ${formatPrice(37768)}`, time: "2 min ago" },
              { text: "Product MacBook Pro 16\" updated", time: "15 min ago" },
              { text: `New order #2846 — ${formatPrice(7844)}`, time: "1 hour ago" },
              { text: "Stock alert: AirPods Pro low", time: "2 hours ago" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <span className="text-sm">{item.text}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("admin.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary motion-smooth"
            >
              <Package className="w-5 h-5 text-primary" />
              <span className="font-medium">{t("admin.manageProducts")}</span>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary motion-smooth"
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-medium">{t("admin.viewOrders")}</span>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
