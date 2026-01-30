import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function Footer() {
  const { t } = useLanguage();
  const location = useLocation();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  type QuickTab = { to: string; icon: typeof Home; label: string; count?: number };
  const quickTabs: QuickTab[] = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/cart", icon: ShoppingCart, label: t("nav.cart"), count: cartCount },
    { to: "/wishlist", icon: Heart, label: t("nav.wishlist"), count: wishlistCount },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  const pathname = location.pathname;

  return (
    <div className="footer-root">
      {/* Mobile: fixed bottom nav bar */}
      <nav
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-40",
          "bg-background/95 dark:bg-background/95 backdrop-blur-xl border-t border-border/50"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14">
          {quickTabs.map(({ to, icon: Icon, label, count }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 smooth-transition",
                  "active:scale-95",
                  isActive ? "text-gold" : "text-muted-foreground"
                )}
              >
                <span className="relative inline-flex">
                  <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                  {count !== undefined && count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gold text-background text-[10px] font-bold rounded-full flex items-center justify-center">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: full footer */}
      <footer className="hidden md:block border-t border-border/50 py-10 sm:py-12 lg:py-16 bg-secondary/20">
        <div className="container-apple">
          <div className="grid grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
            <div>
            <h4 className="font-semibold text-foreground mb-4">{t("home.footerShop")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-foreground smooth-transition">
                  {t("home.allProducts")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=iphone" className="hover:text-foreground smooth-transition">
                  {t("nav.iphone")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=macbook-m4" className="hover:text-foreground smooth-transition">
                  {t("nav.mac")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=imac" className="hover:text-foreground smooth-transition">
                  {t("nav.imac")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=mac-mini" className="hover:text-foreground smooth-transition">
                  {t("nav.macMini")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=mac-studio" className="hover:text-foreground smooth-transition">
                  {t("nav.macStudio")}
                </Link>
              </li>
              <li>
                <Link to="/products?category=mac-pro" className="hover:text-foreground smooth-transition">
                  {t("nav.macPro")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("home.footerSupport")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.help")}</a></li>
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.contact")}</a></li>
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.shipping")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("home.footerCompany")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.about")}</a></li>
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.careers")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("home.footerLegal")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.privacy")}</a></li>
              <li><a href="#" className="hover:text-foreground smooth-transition">{t("home.terms")}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-6 sm:pt-8 md:pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <img src="/targ.png" alt="" className="h-9 w-auto opacity-95" />
            <p>© {new Date().getFullYear()} {t("home.footerRights")}</p>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
