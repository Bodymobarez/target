import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Settings, Globe, Bell, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsState>(initialSettings);
  const [saved, setSaved] = useState(true);

  const handleChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toast({
      title: t("admin.settingsSaved"),
      description: t("admin.settingsSavedDesc"),
    });
  };

  const handleReset = () => {
    setForm(initialSettings);
    setSaved(false);
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
