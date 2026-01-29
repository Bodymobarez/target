import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { categories, getFeaturedProducts } from "@/data/mockProducts";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type FooterTab = "shop" | "support" | "company" | "legal";

export default function Index() {
  const { t } = useLanguage();
  const featured = getFeaturedProducts();
  const [footerTab, setFooterTab] = useState<FooterTab>("shop");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — أصغر على الموبايل */}
      <section className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[calc(100vh-5rem)] overflow-hidden">
        <div className="absolute inset-0">
          <HeroSlider fullHero />
        </div>
        {/* Overlay: الشارة + العنوان + الأزرار فوق السلايدر */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter mb-3 sm:mb-4 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
              {t("home.heroTitle")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-1">
              {t("home.heroSubtitle")}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
            >
              <Link
                to="/products"
                className="btn-primary btn-gold inline-flex items-center gap-2 text-sm sm:text-base md:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg w-full sm:w-auto justify-center"
              >
                {t("home.shopAll")}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/products?category=iphone"
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 hover:border-gold/50 transition-all w-full sm:w-auto justify-center"
              >
                {t("nav.iphone")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding border-t border-border/50 bg-secondary/20">
        <div className="container-apple">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t("home.shopByCategory")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg mb-12 max-w-xl"
          >
            {t("home.allProducts")}
          </motion.p>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={item}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className={cn(
                    "group block card-interactive overflow-hidden rounded-3xl",
                    "hover:border-primary/10 dark:hover:border-primary/20"
                  )}
                >
                  <div className="aspect-square rounded-t-3xl overflow-hidden bg-secondary/30">
                    <img
                      src={cat.image ?? ""}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary/90 smooth-transition">
                      {cat.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {cat.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold group-hover:gap-2 smooth-transition">
                      {t("shop")}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding border-t border-border/50">
        <div className="container-apple">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold"
            >
              {t("home.featuredProducts")}
            </motion.h2>
            <Link
              to="/products"
              className="text-gold font-semibold inline-flex items-center gap-1.5 hover:gap-2 hover:text-gold-light smooth-transition"
            >
              {t("seeAll")}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          >
            {featured.map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding border-t border-border/50 bg-secondary/30">
        <div className="container-apple">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-card border border-border/60 rounded-2xl sm:rounded-3xl shadow-premium" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t("home.stayInLoop")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                {t("home.stayInLoopSub")}
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t("home.emailPlaceholder")}
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-background/90 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 smooth-transition"
                />
                <button type="submit" className="btn-primary btn-gold whitespace-nowrap px-8 py-3.5">
                  {t("home.subscribe")}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 sm:py-12 md:py-16 bg-secondary/20">
        <div className="container-apple">
          {/* Mobile: tabs */}
          <div className="md:hidden mb-8">
            <div className="flex gap-1 p-1 rounded-xl bg-secondary/60 border border-border/50">
              {(["shop", "support", "company", "legal"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFooterTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 px-2 rounded-lg text-xs font-medium smooth-transition",
                    footerTab === tab
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "shop" && t("home.footerShop")}
                  {tab === "support" && t("home.footerSupport")}
                  {tab === "company" && t("home.footerCompany")}
                  {tab === "legal" && t("home.footerLegal")}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {footerTab === "shop" && (
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <Link to="/products" className="hover:text-foreground smooth-transition block py-1">
                      {t("home.allProducts")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?category=iphone" className="hover:text-foreground smooth-transition block py-1">
                      {t("nav.iphone")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?category=macbook" className="hover:text-foreground smooth-transition block py-1">
                      {t("nav.macbook")}
                    </Link>
                  </li>
                </ul>
              )}
              {footerTab === "support" && (
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.help")}</a></li>
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.contact")}</a></li>
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.shipping")}</a></li>
                </ul>
              )}
              {footerTab === "company" && (
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.about")}</a></li>
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.careers")}</a></li>
                </ul>
              )}
              {footerTab === "legal" && (
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.privacy")}</a></li>
                  <li><a href="#" className="hover:text-foreground smooth-transition block py-1">{t("home.terms")}</a></li>
                </ul>
              )}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12">
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
                  <Link to="/products?category=macbook" className="hover:text-foreground smooth-transition">
                    {t("nav.macbook")}
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
