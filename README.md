# Zelthia

Inventory for pharmacies, clinics and hospitals in Nigeria, with a health companion on the patient side.

Facilities keep their stock, prices, batches, expiry dates and landmark directions up to date. Patients search what is listed and see what is available nearby before they travel. The health companion answers questions with a person's allergies, conditions and medicines in mind, and explains doctor's notes from a photo. Zelthia is free to use. Paid add-ons for specific features, such as verified facility listings, are planned.

Zelthia gives guidance, not a diagnosis, and does not replace a doctor or pharmacist. It does not sell or dispense medicine.

## What is in the app

**For facilities** (`/provider`, `/for-facilities`)

- Stock, price and batch per product, with one-tap quantity changes
- Low-stock level per product and a 90-day expiry view
- Services such as scans and tests
- Landmark directions, including recorded voice directions
- Verified badge for facilities with a confirmed licence or registration number

**For patients** (`/inventory`, `/chat`, `/doctors-note-reader`)

- Public search of facility listings with price, stock, hours and directions
- Health chat with an optional profile, and a doctor's note reader for photos and PDFs
- Web search fallback when nothing is listed, with sources and an "unverified" label

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, PostgreSQL (`pg`), Zustand, lucide-react, pnpm. Tables are created on first use.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:3000.

| Script        | What it does               |
| ------------- | -------------------------- |
| `pnpm dev`    | Development server         |
| `pnpm build`  | Production build           |
| `pnpm start`  | Serve the production build |
| `pnpm lint`   | ESLint                     |
| `pnpm format` | Prettier                   |

## Environment

Copy `.env.example` to `.env`. The main groups are:

- `DATABASE_URL`: accounts, sessions, health profiles and listings
- `NEXT_PUBLIC_SITE_URL`: canonical links, sitemap and Open Graph
- `AI_PROVIDER_ORDER` plus the provider keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `NVIDIA_API_KEY`, `APMIX_API_KEY`, `OPENAI_API_KEY`): providers are tried in order and unset keys are skipped
- `FIRECRAWL_API_KEY`, `TAVILY_API_KEY`, `JINA_API_KEY`: web search and photos for "where can I get this" answers
- `CLOUDINARY_*`: private storage for chat uploads and recorded directions

Never commit `.env`.

## Layout

```
app/          routes: chat, inventory, provider, for-facilities, doctors-note-reader, account, setup, legal pages
components/   ui kit, marketing, chat, inventory, profile
lib/          ai, server (db, auth, inventory), motion, site facts
mobile/       native Android and iOS work, see mobile/README.md
scripts/      SEO and route checks
```

Agent-facing text is served at `/llms.txt`, `/llms-full.txt` and `/openapi.json`.
