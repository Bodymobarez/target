import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-4">
              {t("notFound.title")}
            </h1>
            <h2 className="text-3xl font-bold mb-4">{t("notFound.heading")}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {t("notFound.message")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/" className="btn-primary">
              {t("notFound.returnHome")}
            </Link>
            <Link to="/products" className="btn-secondary">
              {t("notFound.continueShopping")}
            </Link>
          </div>

          <div className="card-premium p-8 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-4">
              {t("notFound.attemptedPath")}:{" "}
              <code className="bg-secondary/50 px-2 py-1 rounded">
                {location.pathname}
              </code>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("notFound.contactSupport")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
