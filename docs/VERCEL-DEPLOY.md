# نشر المشروع على Vercel

## ربط المشروع (أول مرة)

1. ادخل إلى **[Vercel](https://vercel.com)** وسجّل الدخول.
2. **Add New** → **Project**.
3. اختر المستودع (GitHub/GitLab/Bitbucket) ثم المستودع الخاص بالمشروع.
4. الإعدادات تُؤخذ من `vercel.json`:
   - **Build Command:** `npm run build:client && npx prisma generate`
   - **Output Directory:** `dist/spa`
   - **API:** مجلد `api/` — كل طلبات `/api/*` تذهب إلى Express.

5. انقر **Deploy**.

بعد ذلك، كل push إلى الفرع المتصل سيُنتج نشراً تلقائياً.

---

## متغيرات البيئة (قاعدة البيانات)

لكي تعمل **تسجيل الدخول، التسجيل، المنتجات، التصنيفات** على Vercel:

- في **Project Settings** → **Environment Variables** أضف أحد المتغيرات التالية (واحد يكفي):
  - **DATABASE_URL** — رابط اتصال Neon (pooled)، أو
  - **POSTGRES_PRISMA_URL** أو **POSTGRES_URL** — نفس القيمة؛ الكود يستخدمها كبديل لـ `DATABASE_URL`.

استخدم الرابط **المجمع (pooled)** من Neon (Recommended for most uses) مع `?sslmode=require`.

---

## البنية على Vercel

- **الواجهة (SPA):** تُبنى بـ `build:client` وتُخدم من `dist/spa`. أي مسار غير `/api/*` يُعاد توجيهه إلى `index.html` (SPA fallback) لتجنّب 404.
- **الـ API:** ملف `api/index.ts` يصدّر تطبيق Express؛ طلبات `/api/*` تُعاد كتابتها إلى `/api?path=...` ويُستعاد المسار داخل Express.

---

## أوامر محلياً (CLI)

```bash
# تثبيت Vercel CLI (مرة واحدة)
npm i -g vercel

# تسجيل الدخول وربط المشروع
vercel login
vercel link

# نشر (مع البناء)
vercel --prod
```

---

## استكشاف الأخطاء

- **404 على الصفحة الرئيسية أو مسارات الواجهة:** تأكد أن `vercel.json` يحتوي على الـ rewrite الذي يوجّه المسارات غير `/api/` إلى `/index.html`.
- **503 أو خطأ من الـ API:** تأكد من وجود `DATABASE_URL` (أو `POSTGRES_URL` / `POSTGRES_PRISMA_URL`) في Environment Variables وأن الرابط صحيح (Neon pooled مع `sslmode=require`).
- **الجداول أو البيانات غير موجودة:** نفّذ `prisma db push` و`prisma db seed` على قاعدة الإنتاج (من جهازك مع `DATABASE_URL` للإنتاج)، أو أضفها إلى خطوة في CI إذا أردت أتمتة ذلك.
