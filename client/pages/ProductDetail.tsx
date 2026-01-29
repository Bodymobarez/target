import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProductById, products } from "@/data/mockProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart, Heart, Share2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, formatPriceFromUsd } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-apple py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("productDetail.notFound")}</h1>
          <Link to="/products" className="btn-primary">
            {t("productDetail.backToProducts")}
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.length ? product.images : [product.images[0] ?? ""];
  const isWishlisted = has(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      color: selectedColor,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  const accessories = products
    .filter((p) => p.categoryId === "accessories")
    .slice(0, 4);

  const mockReviews = [
    { author: "Alex M.", rating: 5, date: "2025-01-20", text: "Exactly what I expected. Fast delivery, perfect packaging. Best phone I've ever owned." },
    { author: "Jordan K.", rating: 5, date: "2025-01-15", text: "Worth every penny. The camera is incredible and battery life is solid." },
    { author: "Sam T.", rating: 4, date: "2025-01-10", text: "Great device. Only minor complaint is the weight, but you get used to it." },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-6 sm:py-8 md:py-12 border-b border-border">
        <div className="container-apple">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl bg-secondary/50 overflow-hidden">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((i) =>
                          i === 0 ? images.length - 1 : i - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center motion-smooth hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((i) =>
                          i === images.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center motion-smooth hover:scale-105"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 motion-smooth",
                        selectedImageIndex === idx
                          ? "border-primary"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.categoryName}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount.toLocaleString()} {product.reviewCount === 1 ? t("productDetail.reviewsCount") : t("productDetail.reviewsCountPlural")})
                </span>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {formatPriceFromUsd(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPriceFromUsd(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-8">
                {product.description}
              </p>

              {product.colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">{t("color")}</h3>
                  <div className="flex gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 motion-smooth",
                          selectedColor === c.name
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-semibold mb-3">{t("quantity")}</h3>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border border-border hover:bg-secondary motion-smooth"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl border border-border hover:bg-secondary motion-smooth"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[140px] btn-primary flex items-center justify-center gap-2 py-3 sm:py-4"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t("addedToCart")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {t("addToCart")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className={cn(
                    "btn-secondary p-4",
                    isWishlisted && "bg-primary text-primary-foreground"
                  )}
                >
                  <Heart
                    className={cn("w-5 h-5", isWishlisted && "fill-current")}
                  />
                </button>
                <button type="button" className="btn-secondary p-4">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {product.inStock && (
                <p className="mt-6 text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ {t("productDetail.inStockDelivery")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      {product.specs.length > 0 && (
        <section className="py-8 sm:py-12 border-t border-border">
          <div className="container-apple">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("productDetail.technicalSpecs")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="card-premium p-6 rounded-xl flex justify-between items-start gap-4"
                >
                  <span className="font-medium text-muted-foreground">
                    {spec.label}
                  </span>
                  <span className="text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Accessories */}
      {accessories.length > 0 && (
        <section className="py-8 sm:py-12 border-t border-border bg-secondary/20">
          <div className="container-apple">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("productDetail.recommendedAccessories")}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {accessories.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-8 sm:py-12 border-t border-border">
        <div className="container-apple">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("productDetail.customerReviews")}</h2>
          <div className="space-y-6 max-w-2xl">
            {mockReviews.map((review, i) => (
              <div key={i} className="card-premium p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? "text-yellow-500" : "text-muted-foreground/30"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-8 sm:py-12 border-t border-border">
          <div className="container-apple">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("productDetail.youMightLike")}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
