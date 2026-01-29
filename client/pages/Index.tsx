import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { motion } from "framer-motion";
import { ChevronRight, Wrench } from "lucide-react";
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

export default function Index() {
  const { t } = useLanguage();
  const featured = getFeaturedProducts();

  return (
    <>

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
                className="btn-primary btn-gold inline-flex items-center gap-1.5 text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md w-full sm:w-auto justify-center"
              >
                {t("home.shopAll")}
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link
                to="/products?category=iphone"
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 hover:border-gold/50 transition-all w-full sm:w-auto justify-center"
              >
                {t("nav.iphone")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories — محسّن للموبايل */}
      <section className="section-padding border-t border-border/50 bg-secondary/20">
        <div className="container-apple">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4"
          >
            {t("home.shopByCategory")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-12 max-w-xl"
          >
            {t("home.allProducts")}
          </motion.p>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6"
          >
            {categories.map((cat) => {
              const name = cat.id === "repair" ? t("categories.repair.name") : cat.name;
              const description = cat.id === "repair" ? t("categories.repair.description") : cat.description;
              return (
              <motion.div key={cat.id} variants={item}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className={cn(
                    "group block card-interactive overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60",
                    "hover:border-primary/10 dark:hover:border-primary/20",
                    "active:scale-[0.98] transition-transform"
                  )}
                >
                  <div className="relative aspect-[4/3] sm:aspect-square rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-secondary/30">
                    <img
                      src={cat.image ?? ""}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-100"
                    />
                    {cat.id === "repair" && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gold/90 text-white shadow-lg" aria-hidden>
                        <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold mb-0.5 sm:mb-1 md:mb-2 group-hover:text-primary/90 smooth-transition line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 line-clamp-2 hidden sm:block">
                      {description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gold group-hover:gap-1.5 smooth-transition">
                      {t("shop")}
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Products — تصميم محدّث */}
      <section className="section-padding border-t border-border/50 bg-gradient-to-b from-background to-secondary/10">
        <div className="container-apple">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gold"
              >
                {t("shop")}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-1"
              >
                {t("home.featuredProducts")}
              </motion.h2>
            </div>
            <Link
              to="/products"
              className="text-gold font-semibold inline-flex items-center gap-1.5 hover:gap-2 hover:text-gold-light smooth-transition text-sm sm:text-base"
            >
              {t("seeAll")}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {featured.map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} compact />
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
    </>
  );
}
