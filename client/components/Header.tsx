import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, Sun, Moon, Heart, GitCompare, LogOut, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useLanguage();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { label: t("nav.iphone"), href: "/products?category=iphone" },
    { label: t("nav.ipad"), href: "/products?category=ipad" },
    { label: t("nav.macbook"), href: "/products?category=macbook" },
    { label: t("nav.accessories"), href: "/products?category=accessories" },
    { label: t("nav.repair"), href: "/repair", icon: Wrench },
  ];

  const iconBtnClass =
    "p-2 sm:p-2.5 rounded-xl hover:bg-secondary/80 smooth-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Link
              to="/"
              className="flex items-center justify-start rounded-xl p-1.5 -m-1.5 hover:bg-secondary/50 smooth-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-0"
            >
              <img src="/targ.png" alt={t("appName")} className="h-20 w-auto sm:h-24 md:h-28" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = "icon" in link ? link.icon : null;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-gold smooth-transition",
                    "hover:bg-gold/5",
                    "after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-gold after:scale-x-0 after:origin-center hover:after:scale-x-100 after:transition-transform after:duration-300"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  {link.label}
                </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                className={cn(
                  "relative px-4 py-2.5 rounded-xl text-sm font-medium text-gold hover:bg-gold/10 smooth-transition",
                  "after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-gold after:scale-x-100"
                )}
              >
                {t("nav.admin")}
              </Link>
            )}
          </nav>

          {/* أيقونات: مخفية على الموبايل (تظهر كتابس في الفوتر) */}
          <div className="hidden md:flex relative items-center gap-1">
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.form
                  key="search-form"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 280 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSearch}
                  className="overflow-hidden flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/80 px-2 sm:px-3 py-2 shadow-lg min-w-0 max-w-[min(280px,calc(100vw-7rem))]"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setShowSearch(false)}
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className={iconBtnClass}
                  title={t("search")}
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className={cn(
                "px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold smooth-transition",
                "bg-secondary/60 hover:bg-secondary text-foreground/90"
              )}
              title={locale === "ar" ? "English" : "العربية"}
            >
              {locale === "ar" ? "EN" : "ع"}
            </button>

            <button onClick={toggleDarkMode} className={iconBtnClass}>
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {compareCount > 0 && (
              <Link to="/compare" className={cn(iconBtnClass, "relative")} title={t("nav.compare")}>
                <GitCompare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              </Link>
            )}

            <Link to="/wishlist" className={cn(iconBtnClass, "relative")} title={t("nav.wishlist")}>
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className={cn(iconBtnClass, "relative")} title={t("nav.cart")}>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/profile" className={iconBtnClass} title={t("nav.profile")}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={cn(iconBtnClass, "text-muted-foreground hover:text-destructive")}
                  title={t("auth.signOut")}
                  aria-label={t("auth.signOut")}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-semibold smooth-transition",
                  "bg-gold/15 text-gold hover:bg-gold hover:text-black dark:hover:text-black"
                )}
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>

          {/* موبايل: زر اللغة + قائمة */}
          <div className="flex md:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className={cn(
                "px-2.5 py-2 rounded-xl text-xs font-semibold smooth-transition",
                "bg-secondary/60 hover:bg-secondary text-foreground/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              title={locale === "ar" ? "English" : "العربية"}
              aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              {locale === "ar" ? "EN" : "ع"}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={iconBtnClass}
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" aria-hidden />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = "icon" in link ? link.icon : null;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary smooth-transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                      {link.label}
                    </Link>
                  );
                })}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary smooth-transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("nav.profile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary smooth-transition text-muted-foreground hover:text-destructive"
                    >
                      {t("auth.signOut")}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary smooth-transition text-gold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("nav.signIn")}
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary smooth-transition text-gold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("nav.admin")}
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
