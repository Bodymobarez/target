import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const DEFAULT_SLIDES = [
  { id: "iphone", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=85" },
  { id: "macbook", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=85" },
  { id: "imac", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=85" },
  { id: "ipad", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&q=85" },
  { id: "airpods", image: "https://images.unsplash.com/photo-1587523459887-e669248cf666?w=1200&q=85" },
  { id: "macbookAir", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=85" },
];

const DURATION_MS = 5000;

interface HeroSliderProps {
  fullHero?: boolean;
  /** Override slides from backend (image URLs) */
  slideImages?: string[];
}

export default function HeroSlider({ fullHero, slideImages }: HeroSliderProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = slideImages && slideImages.length > 0
    ? slideImages.map((image, i) => ({ id: `img-${i}`, image }))
    : DEFAULT_SLIDES;

  const safeIndex = slides.length > 0 ? Math.min(index, slides.length - 1) : 0;
  const slide = slides[safeIndex];

  useEffect(() => {
    if (slides.length > 0 && index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  const go = useCallback((next: number) => {
    setDirection(next);
    setIndex((i) => (i + next + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => go(1), DURATION_MS);
    return () => clearInterval(id);
  }, [isPaused, go]);

  const isCustomSlides = slideImages != null && slideImages.length > 0;
  const title = slide ? (isCustomSlides ? t("home.heroTitle") : t(`home.heroSlider.${slide.id}.title`)) : "";
  const subtitle = slide ? (isCustomSlides ? t("home.heroSubtitle") : t(`home.heroSlider.${slide.id}.subtitle`)) : "";
  const category = slide && !isCustomSlides ? t(`home.heroSlider.${slide.id}.category`) : "";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fullHero
          ? "h-full min-h-[55vh] sm:min-h-[65vh] md:min-h-[70vh] rounded-none"
          : "max-w-7xl mx-auto rounded-3xl shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_25px_60px_-12px_rgba(0,0,0,0.12),0_40px_80px_-20px_rgba(0,0,0,0.08)]"
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide image + overlay */}
      <div className={cn("relative w-full bg-secondary/30", fullHero ? "h-full min-h-[55vh] sm:min-h-[65vh] md:min-h-[70vh]" : "aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[380px]")}>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {slide && (
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          </motion.div>
          )}
        </AnimatePresence>

        {/* Caption overlay */}
        <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-6 md:p-10">
          <AnimatePresence mode="wait">
            {slide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-center"
            >
              {category && (
                <p className="text-gold/90 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1">
                  {category}
                </p>
              )}
              <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                {title}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base mt-1">
                {subtitle}
              </p>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          className={cn(
            "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl",
            "bg-white/10 backdrop-blur-md border border-white/20 text-white",
            "hover:bg-gold/20 hover:border-gold/40 hover:text-gold",
            "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className={cn(
            "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl",
            "bg-white/10 backdrop-blur-md border border-white/20 text-white",
            "hover:bg-gold/20 hover:border-gold/40 hover:text-gold",
            "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
          )}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setDirection(i > safeIndex ? 1 : -1);
                setIndex(i);
              }}
              className={cn(
                "rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-transparent",
                i === safeIndex
                  ? "w-8 h-2.5 bg-gold"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80 hover:w-6"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Elite border highlight */}
      {!fullHero && <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-white/10" />}
    </div>
  );
}
