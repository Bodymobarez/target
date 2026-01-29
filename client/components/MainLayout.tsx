import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_STOP_DELAY_MS = 400;

export default function MainLayout() {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [showBack, setShowBack] = useState(true);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setShowBack(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowBack(true), SCROLL_STOP_DELAY_MS);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* زر الرجوع ثابت أسفل الشاشة — يظهر عند توقف التمرير */}
      <button
        type="button"
        onClick={handleBack}
        className={cn(
          "fixed z-30 rounded-full p-3 shadow-lg smooth-transition",
          "bg-background/95 dark:bg-background/95 backdrop-blur-xl border border-border",
          "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "bottom-20 md:bottom-6",
          dir === "rtl" ? "left-4 md:left-6" : "right-4 md:right-6",
          showBack
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        title={t("back")}
        aria-label={t("back")}
      >
        <ArrowLeft
          className={cn("w-5 h-5 md:w-6 md:h-6", dir === "rtl" && "rotate-180")}
        />
      </button>
    </div>
  );
}
