import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductById } from "@/data/mockProducts";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { t } = useLanguage();
  const { productIds } = useWishlist();
  const ids = Array.from(productIds);
  const products = ids
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  return (
    <div className="min-h-screen">
      <section className="section-padding border-b border-border bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            {t("wishlist.title")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {products.length === 0
              ? t("wishlist.emptySub")
              : `${products.length} ${products.length === 1 ? t("wishlist.item") : t("wishlist.items")} ${t("wishlist.saved")}`}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-apple">
          {products.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("wishlist.empty")}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t("wishlist.emptySub")}
              </p>
              <Link to="/products" className="btn-primary inline-block">
                {t("wishlist.exploreProducts")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
