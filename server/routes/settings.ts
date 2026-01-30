import { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middleware/auth";
import type { HomeLayoutSection, SectionConfig, SiteTheme } from "@shared/types";

const DEFAULT_SECTIONS: HomeLayoutSection[] = [
  { id: "hero", enabled: true, order: 0, config: {} },
  { id: "categories", enabled: true, order: 1, config: {} },
  { id: "featured", enabled: true, order: 2, config: {} },
  { id: "newsletter", enabled: true, order: 3, config: {} },
];

const DEFAULT_THEME: SiteTheme = {
  primaryColor: "",
  accentColor: "",
  fontFamily: "",
};

function normalizeSectionConfig(c: unknown): SectionConfig | undefined {
  if (c == null || typeof c !== "object") return undefined;
  const o = c as Record<string, unknown>;
  const config: SectionConfig = {};
  if (typeof o.title === "string") config.title = o.title;
  if (typeof o.subtitle === "string") config.subtitle = o.subtitle;
  if (typeof o.primaryButtonText === "string") config.primaryButtonText = o.primaryButtonText;
  if (typeof o.secondaryButtonText === "string") config.secondaryButtonText = o.secondaryButtonText;
  if (typeof o.placeholder === "string") config.placeholder = o.placeholder;
  if (typeof o.buttonText === "string") config.buttonText = o.buttonText;
  if (typeof o.backgroundColor === "string") config.backgroundColor = o.backgroundColor;
  if (typeof o.backgroundImage === "string") config.backgroundImage = o.backgroundImage;
  if (typeof o.textColor === "string") config.textColor = o.textColor;
  if (typeof o.accentColor === "string") config.accentColor = o.accentColor;
  if (typeof o.paddingTop === "string") config.paddingTop = o.paddingTop;
  if (typeof o.paddingBottom === "string") config.paddingBottom = o.paddingBottom;
  if (Array.isArray(o.slideImages)) config.slideImages = o.slideImages.filter((u): u is string => typeof u === "string");
  else if (typeof o.slideImages === "string") config.slideImages = o.slideImages.split("\n").map((s) => s.trim()).filter(Boolean);
  if (typeof o.maxItems === "number" && o.maxItems > 0) config.maxItems = o.maxItems;
  return Object.keys(config).length > 0 ? config : undefined;
}

/** GET home layout (public) — sections + per-section config */
export async function getHomeLayout(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "home_layout" },
    });
    const value = row?.value as { sections?: HomeLayoutSection[] } | null;
    const sections = Array.isArray(value?.sections) && value.sections.length > 0
      ? value.sections.map((s) => ({
          id: String(s?.id ?? ""),
          enabled: Boolean(s?.enabled ?? true),
          order: Number(s?.order ?? 0),
          config: normalizeSectionConfig(s?.config),
        }))
      : DEFAULT_SECTIONS;
    sections.sort((a, b) => a.order - b.order);
    res.json({ sections });
  } catch (e) {
    console.error("getHomeLayout", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** PATCH home layout (admin only) — sections + config */
export async function updateHomeLayout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as { sections?: HomeLayoutSection[] };
    const sections = body.sections;
    if (!Array.isArray(sections) || sections.length === 0) {
      res.status(400).json({ error: "Bad request", message: "sections array required" });
      return;
    }
    const value = {
      sections: sections.map((s, i) => ({
        id: String(s?.id ?? ""),
        enabled: Boolean(s?.enabled ?? true),
        order: Number(s?.order ?? i),
        config: normalizeSectionConfig(s?.config) ?? {},
      })),
    };
    await prisma.siteSetting.upsert({
      where: { key: "home_layout" },
      create: { key: "home_layout", value },
      update: { value },
    });
    res.json({ sections: value.sections });
  } catch (e) {
    console.error("updateHomeLayout", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** GET site theme (public) */
export async function getSiteTheme(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "site_theme" },
    });
    const value = (row?.value ?? DEFAULT_THEME) as SiteTheme;
    res.json({
      primaryColor: value.primaryColor ?? "",
      accentColor: value.accentColor ?? "",
      fontFamily: value.fontFamily ?? "",
    });
  } catch (e) {
    console.error("getSiteTheme", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** PATCH site theme (admin only) */
export async function updateSiteTheme(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as SiteTheme;
    const value = {
      primaryColor: typeof body.primaryColor === "string" ? body.primaryColor : "",
      accentColor: typeof body.accentColor === "string" ? body.accentColor : "",
      fontFamily: typeof body.fontFamily === "string" ? body.fontFamily : "",
    };
    await prisma.siteSetting.upsert({
      where: { key: "site_theme" },
      create: { key: "site_theme", value },
      update: { value },
    });
    res.json(value);
  } catch (e) {
    console.error("updateSiteTheme", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
