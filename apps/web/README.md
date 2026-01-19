# Ailar

O'zbek tilidagi AI Katalog, Yangiliklar va Promptlar kutubxonasi.

## Texnologiyalar

- **Framework**: Next.js 15+ (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **Database**: Postgres (Neon) + Drizzle ORM
- **Authentication**: Clerk
- **Language**: TypeScript

## O'rnatish

1. Loyihani yuklab oling:
```bash
git clone ...
cd ailar
```

2. Kerakli paketlarni o'rnating:
```bash
npm install
```

3. `.env.local` faylini yarating va kerakli kalitlarni yozing:
```bash
cp apps/web/.env.example apps/web/.env.local
```
`.env.local` fayliga quyidagilarni kiriting:
- `DATABASE_URL`: Neon DB ulanish havolasi.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Public Key.
- `CLERK_SECRET_KEY`: Clerk Secret Key.
- `TELEGRAM_BOT_TOKEN`: Telegram bot tokeni (BotFather dan oling).
- `TELEGRAM_CHANNEL_ID`: Telegram kanal IDsi (masalan @kanalnomi).

4. Ma'lumotlar bazasini yangilang:
```bash
npm run db:push -w apps/web
```
(Eslatma: `package.json` da `db:push` skripti bo'lmasa, `npx drizzle-kit push` ishlating)

5. Loyihani ishga tushiring:
```bash
npm run dev
```

## Telegram Integratsiyasi

`apps/web/lib/telegram.ts` faylida `publishToTelegram` funksiyasi mavjud. Bu funksiyadan foydalanib yangilik yoki postlarni telegram kanalga yuborishingiz mumkin.

## Strukturasi

- `apps/web/app/catalog`: AI Katalog sahifasi
- `apps/web/app/news`: Yangiliklar sahifasi
- `apps/web/app/prompts`: Promptlar sahifasi
- `apps/web/db`: Ma'lumotlar bazasi sxemalari
