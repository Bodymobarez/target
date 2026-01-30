import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Globe, Bell, Shield, Save, LayoutDashboard, ChevronUp, ChevronDown, ChevronRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HomeLayoutSection, SectionConfig, SiteTheme } from "@shared/types";

const SECTION_IDS = ["hero", "categories", "featured", "newsletter"] as const;
const SECTION_LABEL_KEYS: Record<string, string> = {
  hero: "admin.homeLayoutHero",
  categories: "admin.homeLayoutCategories",
  featured: "admin.homeLayoutFeatured",
  newsletter: "admin.homeLayoutNewsletter",
};

const emptyConfig = (): SectionConfig => ({});

type SettingsState = {
  siteName: string;
  defaultCurrency: string;
  defaultLanguage: string;
  emailOnOrder: boolean;
  emailOnShip: boolean;
  maintenanceMode: boolean;
};

const initialSettings: SettingsState = {
  siteName: "TARGET",
  defaultCurrency: "EGP",
  defaultLanguage: "ar",
  emailOnOrder: true,
  emailOnShip: true,
  maintenanceMode: false,
};

export default function AdminSettings() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const toastHook = useToast();
  const [form, setForm] = useState<SettingsState>(initialSettings);
  const [saved, setSaved] = useState(true);
  const [homeLayout, setHomeLayout] = useState<HomeLayoutSection[]>([]);
  const [homeLayoutLoading, setHomeLayoutLoading] = useState(true);
  const [homeLayoutSaving, setHomeLayoutSaving] = useState(false);
  const [homeLayoutDirty, setHomeLayoutDirty] = useState(false);
  const [theme, setTheme] = useState<SiteTheme>({ primaryColor: "", accentColor: "", fontFamily: "" });
  const [themeLoading, setThemeLoading] = useState(true);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeDirty, setThemeDirty] = useState(false);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const handleChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toastHook.toast({
      title: t("admin.settingsSaved"),
      description: t("admin.settingsSavedDesc"),
    });
  };

  const handleReset = () => {
    setForm(initialSettings);
    setSaved(false);
  };

  useEffect(() => {
    fetch("/api/settings/home-layout")
      .then((res) => (res.ok ? res.json() : { sections: [] }))
      .then((data: { sections?: HomeLayoutSection[] }) => {
        const sections = Array.isArray(data.sections) && data.sections.length > 0
          ? [...data.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((s) => ({ ...s, config: s.config ?? emptyConfig() }))
          : SECTION_IDS.map((id, i) => ({ id, enabled: true, order: i, config: emptyConfig() }));
        setHomeLayout(sections);
      })
      .catch(() => setHomeLayout(SECTION_IDS.map((id, i) => ({ id, enabled: true, order: i, config: emptyConfig() }))))
      .finally(() => setHomeLayoutLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/settings/theme")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: SiteTheme) => setTheme({ primaryColor: data.primaryColor ?? "", accentColor: data.accentColor ?? "", fontFamily: data.fontFamily ?? "" }))
      .catch(() => {})
      .finally(() => setThemeLoading(false));
  }, []);

  const setSectionEnabled = (id: string, enabled: boolean) => {
    setHomeLayout((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    setHomeLayoutDirty(true);
  };

  const moveSection = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= homeLayout.length) return;
    setHomeLayout((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr.map((s, i) => ({ ...s, order: i }));
    });
    setHomeLayoutDirty(true);
  };

  const updateSectionConfig = (sectionId: string, key: keyof SectionConfig, value: string | number | string[] | undefined) => {
    setHomeLayout((prev) => prev.map((s) => (s.id === sectionId ? { ...s, config: { ...(s.config ?? {}), [key]: value } } : s)));
    setHomeLayoutDirty(true);
  };

  const saveHomeLayout = async () => {
    if (!token) return;
    setHomeLayoutSaving(true);
    try {
      const sections = homeLayout.map((s, i) => ({ id: s.id, enabled: s.enabled, order: i, config: s.config ?? {} }));
      const res = await fetch("/api/settings/home-layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sections }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? t("error"));
        return;
      }
      setHomeLayoutDirty(false);
      toast.success(t("admin.settingsSaved"));
    } catch {
      toast.error(t("error"));
    } finally {
      setHomeLayoutSaving(false);
    }
  };

  const saveTheme = async () => {
    if (!token) return;
    setThemeSaving(true);
    try {
      const res = await fetch("/api/settings/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(theme),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? t("error"));
        return;
      }
      setThemeDirty(false);
      toast.success(t("admin.settingsSaved"));
    } catch {
      toast.error(t("error"));
    } finally {
      setThemeSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.settings")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            {t("cancel")}
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={saved}>
            <Save className="w-4 h-4" />
            {t("save")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Card className="card-premium rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t("admin.settingsGeneral")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("admin.siteName")}</Label>
              <Input
                value={form.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                placeholder="TARGET"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.defaultCurrency")}</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={form.defaultCurrency}
                onChange={(e) => handleChange("defaultCurrency", e.target.value)}
              >
                <option value="EGP">EGP (جنيه مصري)</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.defaultLanguage")}</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={form.defaultLanguage}
                onChange={(e) => handleChange("defaultLanguage", e.target.value)}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-premium rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t("admin.settingsNotifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t("admin.emailOnOrder")}</p>
                <p className="text-sm text-muted-foreground">{t("admin.emailOnOrderDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.emailOnOrder}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  form.emailOnOrder ? "bg-primary" : "bg-muted"
                )}
                onClick={() => handleChange("emailOnOrder", !form.emailOnOrder)}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-background shadow transition-transform",
                    form.emailOnOrder ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t("admin.emailOnShip")}</p>
                <p className="text-sm text-muted-foreground">{t("admin.emailOnShipDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.emailOnShip}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  form.emailOnShip ? "bg-primary" : "bg-muted"
                )}
                onClick={() => handleChange("emailOnShip", !form.emailOnShip)}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-background shadow transition-transform",
                    form.emailOnShip ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Homepage layout */}
        <Card className="card-premium rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              {t("admin.homeLayoutTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {homeLayoutLoading ? (
              <p className="text-muted-foreground text-sm py-4">{t("loading")}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">{t("admin.homeLayoutDesc")}</p>
                {homeLayout.map((section, index) => {
                  const c = section.config ?? {};
                  return (
                    <Collapsible
                      key={section.id}
                      open={openSectionId === section.id}
                      onOpenChange={(open) => setOpenSectionId(open ? section.id : null)}
                    >
                      <div className="rounded-lg border overflow-hidden">
                        <div className="flex items-center justify-between gap-4 p-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0}
                                onClick={() => moveSection(index, -1)}
                                aria-label={t("admin.moveUp")}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === homeLayout.length - 1}
                                onClick={() => moveSection(index, 1)}
                                aria-label={t("admin.moveDown")}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="font-medium">{t(SECTION_LABEL_KEYS[section.id] ?? section.id)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Palette className="w-4 h-4" />
                                {t("admin.designAndContent")}
                                <ChevronRight className={cn("w-4 h-4 transition-transform", openSectionId === section.id && "rotate-90")} />
                              </Button>
                            </CollapsibleTrigger>
                            <Switch
                              checked={section.enabled}
                              onCheckedChange={(checked) => setSectionEnabled(section.id, checked)}
                            />
                          </div>
                        </div>
                        <CollapsibleContent>
                          <div className="border-t p-4 grid gap-4 bg-muted/30">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <Label>{t("admin.sectionTitle")}</Label>
                                <Input
                                  value={c.title ?? ""}
                                  onChange={(e) => updateSectionConfig(section.id, "title", e.target.value)}
                                  placeholder={t("admin.overrideFromBackend")}
                                />
                              </div>
                              <div>
                                <Label>{t("admin.sectionSubtitle")}</Label>
                                <Input
                                  value={c.subtitle ?? ""}
                                  onChange={(e) => updateSectionConfig(section.id, "subtitle", e.target.value)}
                                  placeholder={t("admin.overrideFromBackend")}
                                />
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <Label>{t("admin.backgroundColor")}</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    className="w-12 h-9 p-1 cursor-pointer"
                                    value={c.backgroundColor ?? "#f3f4f6"}
                                    onChange={(e) => updateSectionConfig(section.id, "backgroundColor", e.target.value)}
                                  />
                                  <Input
                                    value={c.backgroundColor ?? ""}
                                    onChange={(e) => updateSectionConfig(section.id, "backgroundColor", e.target.value)}
                                    placeholder="#f3f4f6"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>{t("admin.textColor")}</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    className="w-12 h-9 p-1 cursor-pointer"
                                    value={c.textColor ?? "#111827"}
                                    onChange={(e) => updateSectionConfig(section.id, "textColor", e.target.value)}
                                  />
                                  <Input
                                    value={c.textColor ?? ""}
                                    onChange={(e) => updateSectionConfig(section.id, "textColor", e.target.value)}
                                    placeholder="#111827"
                                  />
                                </div>
                              </div>
                            </div>
                            {section.id === "hero" && (
                              <>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <Label>{t("admin.primaryButtonText")}</Label>
                                    <Input
                                      value={c.primaryButtonText ?? ""}
                                      onChange={(e) => updateSectionConfig(section.id, "primaryButtonText", e.target.value)}
                                      placeholder={t("home.shopAll")}
                                    />
                                  </div>
                                  <div>
                                    <Label>{t("admin.secondaryButtonText")}</Label>
                                    <Input
                                      value={c.secondaryButtonText ?? ""}
                                      onChange={(e) => updateSectionConfig(section.id, "secondaryButtonText", e.target.value)}
                                      placeholder={t("nav.iphone")}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label>{t("admin.slideImages")}</Label>
                                  <Textarea
                                    value={Array.isArray(c.slideImages) ? c.slideImages.join("\n") : (c.slideImages ?? "")}
                                    onChange={(e) => updateSectionConfig(section.id, "slideImages", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                                    placeholder="https://...&#10;https://..."
                                    rows={3}
                                    className="font-mono text-sm"
                                  />
                                </div>
                              </>
                            )}
                            {section.id === "featured" && (
                              <div>
                                <Label>{t("admin.maxItems")}</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={24}
                                  value={c.maxItems ?? ""}
                                  onChange={(e) => updateSectionConfig(section.id, "maxItems", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                  placeholder="8"
                                />
                              </div>
                            )}
                            {section.id === "newsletter" && (
                              <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                  <Label>{t("admin.placeholder")}</Label>
                                  <Input
                                    value={c.placeholder ?? ""}
                                    onChange={(e) => updateSectionConfig(section.id, "placeholder", e.target.value)}
                                    placeholder={t("home.emailPlaceholder")}
                                  />
                                </div>
                                <div>
                                  <Label>{t("admin.buttonText")}</Label>
                                  <Input
                                    value={c.buttonText ?? ""}
                                    onChange={(e) => updateSectionConfig(section.id, "buttonText", e.target.value)}
                                    placeholder={t("home.subscribe")}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={saveHomeLayout}
                    disabled={!homeLayoutDirty || homeLayoutSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {homeLayoutSaving ? t("loading") : t("admin.save")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Site theme (design from backend) */}
        <Card className="card-premium rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {t("admin.siteThemeTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {themeLoading ? (
              <p className="text-muted-foreground text-sm py-4">{t("loading")}</p>
            ) : (
              <div className="grid gap-4">
                <p className="text-sm text-muted-foreground">{t("admin.siteThemeDesc")}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>{t("admin.primaryColor")}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                        value={theme.primaryColor || "#000000"}
                        onChange={(e) => { setTheme((t) => ({ ...t, primaryColor: e.target.value })); setThemeDirty(true); }}
                      />
                      <Input
                        value={theme.primaryColor}
                        onChange={(e) => { setTheme((t) => ({ ...t, primaryColor: e.target.value })); setThemeDirty(true); }}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("admin.accentColor")}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                        value={theme.accentColor || "#d4af37"}
                        onChange={(e) => { setTheme((t) => ({ ...t, accentColor: e.target.value })); setThemeDirty(true); }}
                      />
                      <Input
                        value={theme.accentColor}
                        onChange={(e) => { setTheme((t) => ({ ...t, accentColor: e.target.value })); setThemeDirty(true); }}
                        placeholder="#d4af37"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("admin.fontFamily")}</Label>
                    <Input
                      value={theme.fontFamily}
                      onChange={(e) => { setTheme((t) => ({ ...t, fontFamily: e.target.value })); setThemeDirty(true); }}
                      placeholder="system-ui, sans-serif"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveTheme} disabled={!themeDirty || themeSaving} className="gap-2">
                    <Save className="w-4 h-4" />
                    {themeSaving ? t("loading") : t("admin.save")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System */}
        <Card className="card-premium rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("admin.settingsSystem")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t("admin.maintenanceMode")}</p>
                <p className="text-sm text-muted-foreground">{t("admin.maintenanceModeDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.maintenanceMode}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  form.maintenanceMode ? "bg-primary" : "bg-muted"
                )}
                onClick={() => handleChange("maintenanceMode", !form.maintenanceMode)}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-background shadow transition-transform",
                    form.maintenanceMode ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
