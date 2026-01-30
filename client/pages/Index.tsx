import { useState, useEffect, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { motion } from "framer-motion";
import { ChevronRight, Wrench } from "lucide-react";
import { categories as mockCategories, getFeaturedProducts as getMockFeatured } from "@/data/mockProducts";
import { fetchCategories, fetchFeaturedProducts } from "@/lib/products-api";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { Product, Category, HomeLayoutSection } from "@shared/types";

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

const DEFAULT_LAYOUT: HomeLayoutSection[] = [
  { id: "hero", enabled: true, order: 0, config: {} },
  { id: "categories", enabled: true, order: 1, config: {} },
  { id: "featured", enabled: true, order: 2, config: {} },
  { id: "newsletter", enabled: true, order: 3, config: {} },
];

export default function Index() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [featured, setFeatured] = useState<Product[]>(getMockFeatured());
  const [layout, setLayout] = useState<HomeLayoutSection[]>(DEFAULT_LAYOUT);

  useEffect(() => {
    fetchCategories().then((list) => {
      if (Array.isArray(list) && list.length > 0) setCategories(list);
    });
    fetchFeaturedProducts().then((list) => {
      if (Array.isArray(list) && list.length > 0) setFeatured(list);
    });
  }, []);

  useEffect(() => {
    fetch("/api/settings/home-layout")
      .then((res) => (res.ok ? res.json() : { sections: [] }))
      .then((data: { sections?: HomeLayoutSection[] }) => {
        const raw = Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : [];
        const byId = new Map<string, HomeLayoutSection>();
        DEFAULT_LAYOUT.forEach((d) => byId.set(d.id, { ...d }));
        raw.forEach((s) => {
          if (s?.id) byId.set(String(s.id), { id: s.id, enabled: s.enabled ?? true, order: s.order ?? 0, config: s.config ?? {} });
        });
        const sections = Array.from(byId.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setLayout(sections);
      })
      .catch(() => setLayout(DEFAULT_LAYOUT));
  }, []);

  useEffect(() => {
    fetch("/api/settings/theme")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: { primaryColor?: string; accentColor?: string; fontFamily?: string }) => {
        const root = document.documentElement;
        if (data.primaryColor) root.style.setProperty("--theme-primary", data.primaryColor);
        if (data.accentColor) root.style.setProperty("--theme-accent", data.accentColor);
        if (data.fontFamily) root.style.setProperty("--theme-font", data.fontFamily);
      })
      .catch(() => {});
  }, []);

  const orderedSections = useMemo(
    () => layout.filter((s) => s.enabled).sort((a, b) => a.order - b.order).map((s) => s.id),
    [layout]
  );

  const heroConfig = layout.find((s) => s.id === "hero")?.config;
  const categoriesConfig = layout.find((s) => s.id === "categories")?.config;
  const featuredConfig = layout.find((s) => s.id === "featured")?.config;
  const newsletterConfig = layout.find((s) => s.id === "newsletter")?.config;

  const heroSlideImages = heroConfig?.slideImages
    ? (Array.isArray(heroConfig.slideImages)
        ? heroConfig.slideImages.filter((u): u is string => typeof u === "string" && u.length > 0)
        : typeof heroConfig.slideImages === "string" && heroConfig.slideImages
          ? [heroConfig.slideImages]
          : [])
    : undefined;
  const effectiveHeroSlides = heroSlideImages && heroSlideImages.length > 0 ? heroSlideImages : undefined;

  const sectionHero = (
    <section
      key="hero"
      className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[calc(100vh-5rem)] overflow-hidden"
      style={heroConfig?.backgroundColor ? { backgroundColor: heroConfig.backgroundColor } : undefined}
    >
      <div className="absolute inset-0">
        <HeroSlider fullHero slideImages={effectiveHeroSlides} />
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto w-full"
          style={heroConfig?.textColor ? { color: heroConfig.textColor } : undefined}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter mb-3 sm:mb-4 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            {heroConfig?.title ?? t("home.heroTitle")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-1">
            {heroConfig?.subtitle ?? t("home.heroSubtitle")}
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
              {heroConfig?.primaryButtonText ?? t("home.shopAll")}
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <Link
              to="/products?category=iphone"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 hover:border-gold/50 transition-all w-full sm:w-auto justify-center"
            >
              {heroConfig?.secondaryButtonText ?? t("nav.iphone")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const sectionCategories = (
    <section
      key="categories"
      className="section-padding border-t border-border/50 bg-secondary/20"
      style={categoriesConfig?.backgroundColor ? { backgroundColor: categoriesConfig.backgroundColor } : undefined}
    >
      <div className="container-apple" style={categoriesConfig?.textColor ? { color: categoriesConfig.textColor } : undefined}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4"
        >
          {categoriesConfig?.title ?? t("home.shopByCategory")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-12 max-w-xl"
        >
          {categoriesConfig?.subtitle ?? t("home.allProducts")}
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
                  to={cat.id === "repair" ? "/repair" : `/products?category=${cat.id}`}
                  className={cn(
                    "group block card-interactive overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60",
                    "hover:border-primary/10 dark:hover:border-primary/20",
                    "active:scale-[0.98] transition-transform"
                  )}
                >
                  <div className="relative aspect-[4/3] sm:aspect-square min-h-[120px] sm:min-h-[140px] rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-secondary/30">
                    <img
                      src={cat.image ?? "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop"}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-100"
                      loading="lazy"
                      onError={(e) => {
                        const fallback = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop";
                        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                      }}
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
  );

  const featuredList = featuredConfig?.maxItems ? featured.slice(0, featuredConfig.maxItems) : featured;

  const sectionFeatured = (
    <section
      key="featured"
      className="section-padding border-t border-border/50 bg-gradient-to-b from-background to-secondary/10"
      style={featuredConfig?.backgroundColor ? { backgroundColor: featuredConfig.backgroundColor } : undefined}
    >
      <div className="container-apple" style={featuredConfig?.textColor ? { color: featuredConfig.textColor } : undefined}>
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
              {featuredConfig?.title ?? t("home.featuredProducts")}
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
            {featuredList.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} compact />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );

  const sectionNewsletter = (
    <section
      key="newsletter"
      className="section-padding border-t border-border/50 bg-secondary/30"
      style={newsletterConfig?.backgroundColor ? { backgroundColor: newsletterConfig.backgroundColor } : undefined}
    >
      <div className="container-apple" style={newsletterConfig?.textColor ? { color: newsletterConfig.textColor } : undefined}>
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
              {newsletterConfig?.title ?? t("home.stayInLoop")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              {newsletterConfig?.subtitle ?? t("home.stayInLoopSub")}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={newsletterConfig?.placeholder ?? t("home.emailPlaceholder")}
                className="flex-1 px-5 py-3.5 rounded-2xl bg-background/90 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 smooth-transition"
              />
              <button type="submit" className="btn-primary btn-gold whitespace-nowrap px-8 py-3.5">
                {newsletterConfig?.buttonText ?? t("home.subscribe")}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const sectionsMap: Record<string, React.ReactNode> = {
    hero: sectionHero,
    categories: sectionCategories,
    featured: sectionFeatured,
    newsletter: sectionNewsletter,
  };

  return (
    <>
      {orderedSections.map((id) => (
        <Fragment key={id}>{sectionsMap[id]}</Fragment>
      ))}
    </>
  );
}
