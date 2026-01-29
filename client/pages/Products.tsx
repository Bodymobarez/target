import { useSearchParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products as mockProducts, categories as mockCategories } from "@/data/mockProducts";
import { fetchProducts, fetchCategories } from "@/lib/products-api";
import { SlidersHorizontal, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { Product, Category } from "@shared/types";

export default function Products() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const [priceSort, setPriceSort] = useState<"default" | "asc" | "desc">("default");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  useEffect(() => {
    if (categoryParam === "repair") navigate("/repair", { replace: true });
  }, [categoryParam, navigate]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchProducts({ category: categoryParam || undefined, q: searchQuery || undefined }).then((d) => setProducts(d.products));
  }, [categoryParam, searchQuery]);

  if (categoryParam === "repair") return null;

  const filtered = products.filter((p) => {
    const matchCategory = !categoryParam || p.categoryId === categoryParam;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const sorted =
    priceSort === "asc"
      ? [...filtered].sort((a, b) => a.price - b.price)
      : priceSort === "desc"
        ? [...filtered].sort((a, b) => b.price - a.price)
        : filtered;

  const pageTitle = searchQuery
    ? t("products.searchTitle", { query: searchQuery })
    : categoryParam === "repair"
      ? t("categories.repair.name")
      : categoryParam
        ? categories.find((c) => c.id === categoryParam)?.name ?? t("products.title")
        : t("products.title");

  return (
    <div className="min-h-screen bg-background">
      <section className="py-10 sm:py-14 md:py-20 border-b border-border/50 bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? t("products.count") : t("products.countPlural")}
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-8 md:py-12">
        <div className="container-apple flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters sidebar - desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card-premium p-6 rounded-2xl sticky top-24 border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t("products.filters")}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">{t("products.category")}</p>
                  <div className="space-y-1">
                    <Link
                      to="/products"
                      className={cn(
                        "block text-sm py-2 px-3 rounded-lg motion-smooth",
                        !categoryParam
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {t("products.all")}
                    </Link>
                    {categories.map((cat) => {
                      const label = cat.id === "repair" ? t("categories.repair.name") : cat.name;
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          className={cn(
                            "flex items-center gap-2 text-sm py-2 px-3 rounded-lg motion-smooth",
                            categoryParam === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-secondary"
                          )}
                        >
                          {cat.id === "repair" && <Wrench className="w-4 h-4 flex-shrink-0" />}
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">{t("products.sortByPrice")}</p>
                  <select
                    value={priceSort}
                    onChange={(e) =>
                      setPriceSort(e.target.value as "default" | "asc" | "desc")
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="default">{t("products.default")}</option>
                    <option value="asc">{t("products.lowToHigh")}</option>
                    <option value="desc">{t("products.highToLow")}</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="lg:hidden flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center justify-center gap-2 py-2.5 sm:py-3"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("products.filters")}
            </button>
            <select
              value={priceSort}
              onChange={(e) =>
                setPriceSort(e.target.value as "default" | "asc" | "desc")
              }
              className="w-full sm:flex-1 min-w-0 px-3 py-2.5 sm:py-2 rounded-lg bg-background border border-border text-sm"
            >
              <option value="default">{t("products.default")}</option>
              <option value="asc">{t("products.lowToHigh")}</option>
              <option value="desc">{t("products.highToLow")}</option>
            </select>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {showFilters && (
              <div className="lg:hidden card-premium p-5 rounded-2xl mb-6">
                <p className="text-sm font-medium mb-2">{t("products.category")}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/products"
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm motion-smooth",
                      !categoryParam
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    )}
                  >
                    {t("products.all")}
                  </Link>
                  {categories.map((cat) => {
                    const label = cat.id === "repair" ? t("categories.repair.name") : cat.name;
                    return (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm motion-smooth",
                          categoryParam === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        )}
                      >
                        {cat.id === "repair" && <Wrench className="w-3.5 h-3.5" />}
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
