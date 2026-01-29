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
}

export default function ProductCard({ product, className }: ProductCardProps) {
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
        className="block card-interactive rounded-2xl overflow-hidden border border-border/50 hover:border-border/80 bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card-hover)]"
      >
        <div className="relative overflow-hidden bg-secondary/30 aspect-square ring-1 ring-black/5 dark:ring-white/5">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-lg">
              {product.badge}
            </span>
          )}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(product.id);
              }}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isWishlisted
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white/90 dark:bg-black/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
              )}
            >
              <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            </button>
            {(canAdd || isComparing) && (
              <button
                type="button"
                onClick={handleCompare}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  isComparing
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-white/90 dark:bg-black/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
                )}
                title={isComparing ? t("removeFromCompare") : t("addToCompare")}
              >
                <GitCompare className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {product.categoryName}
          </p>
          <h3 className="font-semibold text-lg line-clamp-2 mb-3 group-hover:text-primary/90 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="text-yellow-500">★</span>
            <span className="font-medium text-foreground/90">{product.rating}</span>
            <span>({product.reviewCount.toLocaleString()} {t("reviews")})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-xl md:text-2xl font-bold">
                {formatPriceFromUsd(product.price)}
              </p>
              {product.originalPrice && (
                <span className="text-sm font-normal text-muted-foreground line-through">
                  {formatPriceFromUsd(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="p-2 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black dark:group-hover:text-black transition-all duration-300">
              <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
