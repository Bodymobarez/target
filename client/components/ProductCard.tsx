import { Link } from "react-router-dom";
import { ChevronRight, Heart, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/types";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** مضغوط للموبايل وقسم المميز */
  compact?: boolean;
}

export default function ProductCard({ product, className, compact }: ProductCardProps) {
  const { t, formatPriceFromUsd } = useLanguage();
  const { has, toggle } = useWishlist();
  const { has: inCompare, add: addCompare, remove: removeCompare, canAdd } = useCompare();
  const isWishlisted = has(product.id);
  const isComparing = inCompare(product.id);
  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isComparing) removeCompare(product.id);
    else if (canAdd) addCompare(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group", className)}
    >
      <Link
        to={`/product/${product.id}`}
        className={cn(
          "block card-interactive overflow-hidden border bg-card transition-all duration-300",
          "rounded-xl sm:rounded-2xl border-border/50 hover:border-gold/30",
          "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card-hover)]",
          compact && "active:scale-[0.98]"
        )}
      >
        <div className={cn(
          "relative overflow-hidden bg-secondary/30 ring-1 ring-black/5 dark:ring-white/5",
          compact ? "aspect-square" : "aspect-square"
        )}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.badge && (
            <span className={cn(
              "absolute left-2 top-2 sm:left-4 sm:top-4 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-primary text-primary-foreground shadow-lg",
              compact && "left-2 top-2 px-2 py-0.5 text-[10px]"
            )}>
              {product.badge}
            </span>
          )}
          <div className={cn(
            "absolute right-2 top-2 sm:right-4 sm:top-4 flex flex-col gap-1 sm:gap-2",
            compact && "right-2 top-2 gap-1"
          )}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(product.id);
              }}
              className={cn(
                "rounded-lg sm:rounded-xl transition-all duration-300",
                compact ? "p-1.5 sm:p-2" : "p-2.5",
                isWishlisted
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white/90 dark:bg-black/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
              )}
            >
              <Heart className={cn(isWishlisted && "fill-current", compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5")} />
            </button>
            {(canAdd || isComparing) && (
              <button
                type="button"
                onClick={handleCompare}
                className={cn(
                  "rounded-lg sm:rounded-xl transition-all duration-300",
                  compact ? "p-1.5 sm:p-2" : "p-2.5",
                  isComparing
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-white/90 dark:bg-black/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
                )}
                title={isComparing ? t("removeFromCompare") : t("addToCompare")}
              >
                <GitCompare className={cn(compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5")} />
              </button>
            )}
          </div>
        </div>
        <div className={cn(compact ? "p-2.5 sm:p-3 md:p-5" : "p-5 md:p-6")}>
          <p className={cn(
            "font-medium uppercase tracking-wider text-muted-foreground",
            compact ? "text-[10px] sm:text-xs mb-0.5 sm:mb-1" : "text-xs mb-2"
          )}>
            {product.categoryName}
          </p>
          <h3 className={cn(
            "font-semibold group-hover:text-primary/90 transition-colors duration-300",
            compact ? "text-sm sm:text-base line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2" : "text-lg line-clamp-2 mb-3"
          )}>
            {product.name}
          </h3>
          <div className={cn(
            "flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-2 sm:mb-3 md:mb-4",
            compact ? "text-[10px] sm:text-xs" : "text-sm"
          )}>
            <span className="text-yellow-500">★</span>
            <span className="font-medium text-foreground/90">{product.rating}</span>
            <span className={compact ? "hidden sm:inline" : ""}>({product.reviewCount.toLocaleString()} {t("reviews")})</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
              <p className={cn(
                "font-bold truncate",
                compact ? "text-sm sm:text-base md:text-xl" : "text-xl md:text-2xl"
              )}>
                {formatPriceFromUsd(product.price)}
              </p>
              {product.originalPrice && (
                <span className={cn(
                  "font-normal text-muted-foreground line-through flex-shrink-0",
                  compact ? "text-[10px] sm:text-xs" : "text-sm"
                )}>
                  {formatPriceFromUsd(product.originalPrice)}
                </span>
              )}
            </div>
            <span className={cn(
              "rounded-lg sm:rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black dark:group-hover:text-black transition-all duration-300 flex-shrink-0",
              compact ? "p-1.5 sm:p-2" : "p-2"
            )}>
              <ChevronRight className={cn(compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5")} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
