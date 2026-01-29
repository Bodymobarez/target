import { Link } from "react-router-dom";
import { useCompare } from "@/context/CompareContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductById } from "@/data/mockProducts";
import { X } from "lucide-react";

export default function Compare() {
  const { t, formatPriceFromUsd } = useLanguage();
  const { productIds, remove, count } = useCompare();
  const products = productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (products.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="section-padding">
          <div className="container-apple text-center">
            <h1 className="text-4xl font-bold mb-4">{t("compare.title")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("compare.empty")}
            </p>
            <Link to="/products" className="btn-primary">
              {t("compare.shopProducts")}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const specsKeys = Array.from(
    new Set(products.flatMap((p) => p.specs.map((s) => s.label)))
  );

  return (
    <div className="min-h-screen">
      <section className="py-8 sm:py-12 border-b border-border bg-secondary/20">
        <div className="container-apple">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("compare.title")}</h1>
          <p className="text-muted-foreground">
            {count} {count === 1 ? t("compare.selected") : t("compare.selectedPlural")}
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 overflow-x-auto">
        <div className="container-apple min-w-0">
          <div className="min-w-[600px]">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold w-40">
                  {t("compare.feature")}
                </th>
                {products.map((p) => (
                  <th key={p.id} className="text-left py-4 px-4 w-56">
                    <div className="card-premium p-4 rounded-xl relative">
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/product/${p.id}`} className="block mt-6">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-full aspect-square object-cover rounded-lg mb-3"
                        />
                        <p className="font-semibold line-clamp-2">{p.name}</p>
                        <p className="text-lg font-bold mt-1">
                          {formatPriceFromUsd(p.price)}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specsKeys.map((label) => (
                <tr key={label} className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">
                    {label}
                  </td>
                  {products.map((p) => {
                    const spec = p.specs.find((s) => s.label === label);
                    return (
                      <td key={p.id} className="py-3 px-4">
                        {spec ? spec.value : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-border">
                <td className="py-3 px-4 font-medium text-muted-foreground">
                  {t("products.category")}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-4">{p.categoryName}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-muted-foreground">
                  {t("rating")}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    ★ {p.rating} ({p.reviewCount}{" "}
                    {p.reviewCount === 1
                      ? t("productDetail.reviewsCount")
                      : t("productDetail.reviewsCountPlural")})
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  );
}
