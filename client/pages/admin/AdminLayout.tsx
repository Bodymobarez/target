import { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const navKeys = [
  { to: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard },
  { to: "/admin/products", labelKey: "admin.products", icon: Package },
  { to: "/admin/orders", labelKey: "admin.orders", icon: ShoppingCart },
  { to: "/admin/users", labelKey: "admin.users", icon: Users },
  { to: "/admin/analytics", labelKey: "admin.analytics", icon: BarChart3 },
  { to: "/admin/settings", labelKey: "admin.settings", icon: Settings },
];

export default function AdminLayout() {
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/targ.png" alt={t("appName")} className="h-9 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="p-2 rounded-xl hover:bg-secondary smooth-transition"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar — desktop always visible; mobile as overlay below header */}
      <aside
        className={cn(
          "lg:w-64 lg:border-r lg:border-border bg-card flex flex-col",
          "fixed lg:relative inset-x-0 top-14 bottom-0 lg:inset-auto z-40 lg:z-auto lg:pt-0",
          "transition-transform duration-200 ease-out",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 lg:p-6 border-b border-border shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
            <img src="/targ.png" alt={t("appName")} className="h-10 w-auto" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">{t("nav.admin")}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navKeys.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl smooth-transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Backdrop on mobile when nav open */}
      {mobileNavOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
