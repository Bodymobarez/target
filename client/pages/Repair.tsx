import { useState } from "react";
import { Wrench, Check, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DEVICE_TYPES = [
  "iphone",
  "ipad",
  "macbook",
  "imac",
  "watch",
  "airpods",
  "appletv",
  "accessories",
] as const;

const ISSUE_TYPES = [
  "screen_damage",
  "battery",
  "software",
  "water_damage",
  "charging",
  "speaker",
  "camera",
  "other",
] as const;

export default function Repair() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    deviceType: "",
    issueType: "",
    fullName: "",
    phone: "",
    email: "",
    deviceModel: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call; replace with actual endpoint when backend is ready
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/10">
        <div className="container-apple py-16 sm:py-24">
          <Card className="max-w-lg mx-auto border-gold/20 shadow-lg">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                {t("repair.successTitle")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("repair.successMessage")}
              </p>
              <Button
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    deviceType: "",
                    issueType: "",
                    fullName: "",
                    phone: "",
                    email: "",
                    deviceModel: "",
                    notes: "",
                  });
                }}
              >
                {t("repair.submitAnother")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10">
      <section className="py-10 sm:py-16 border-b border-border/50 bg-gradient-to-b from-background to-secondary/20">
        <div className="container-apple text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/15 text-gold mb-4">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {t("repair.title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            {t("repair.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-apple max-w-2xl">
          <Card className="border-border/60 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-card">
              <CardTitle className="text-xl sm:text-2xl">
                {t("repair.formTitle")}
              </CardTitle>
              <CardDescription>{t("repair.formDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deviceType" className="text-sm font-medium">
                    {t("repair.deviceType")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.deviceType}
                    onValueChange={(v) => handleChange("deviceType", v)}
                    required
                  >
                    <SelectTrigger id="deviceType" className="w-full">
                      <SelectValue placeholder={t("repair.deviceTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPES.map((id) => (
                        <SelectItem key={id} value={id}>
                          {t(`repair.devices.${id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueType" className="text-sm font-medium">
                    {t("repair.issueType")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.issueType}
                    onValueChange={(v) => handleChange("issueType", v)}
                    required
                  >
                    <SelectTrigger id="issueType" className="w-full">
                      <SelectValue placeholder={t("repair.issueTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((id) => (
                        <SelectItem key={id} value={id}>
                          {t(`repair.issues.${id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("repair.fullName")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={t("repair.fullNamePlaceholder")}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("repair.phone")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder={t("repair.phonePlaceholder")}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("repair.email")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={t("repair.emailPlaceholder")}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceModel">{t("repair.deviceModel")}</Label>
                  <Input
                    id="deviceModel"
                    value={form.deviceModel}
                    onChange={(e) => handleChange("deviceModel", e.target.value)}
                    placeholder={t("repair.deviceModelPlaceholder")}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("repair.notes")}</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder={t("repair.notesPlaceholder")}
                    rows={4}
                    className="resize-none w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "w-full sm:w-auto min-w-[180px] btn-gold",
                    submitting && "opacity-70 pointer-events-none"
                  )}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("repair.submitting")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t("repair.submit")}
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
