<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Zelthia Codebase Conventions & Guardrails

- **Next.js 16 `cacheComponents: true` (`next.config.ts`):**
  - Dynamic `GET` route handlers reading request headers, IP addresses, or un-cached Postgres state must call `await connection()` from `next/server` before branching on request-time data.
  - Read-only public helpers cached across requests (`lib/server/public-facility.ts`) use `"use cache"`, `cacheLife(...)`, and `cacheTag(...)`.
- **Security & Privacy Invariants:**
  - Never prefix `ADMIN_ROUTE_SLUG` or `ADMIN_EMAIL` with `NEXT_PUBLIC_`. Keep `/admin` returning `notFound()` and route moderation strictly through `app/(adm)/[portal]/`.
  - Route all external HTTP calls through `fetchService()` / `assertSafeExternalUrl()` in `lib/server/http.ts` so private, loopback, link-local, and metadata IPs stay blocked.
  - Keep user health profiles, conversations, messages, and private attachments encrypted via `lib/server/crypto.ts` (`AES-256-GCM` + `ZENC\x01`). Enforce `users.processing_restricted` in write/chat paths (`DPA 2018 s. 47` / `UK GDPR Art. 18`).
- **Regulatory & Inventory Integrity:**
  - Distinguish exact registration code matches, product name matches, post-market safety signals (FAERS/MHRA PARs), and upstream outages (`could not check`). Never cache an unreachable regulator lookup or downgrade an outage into "unlisted".
  - Product saves in `app/api/facilities/[id]/products/route.ts` / `lib/server/inventory.ts` must only accept a regulatory verdict backed by a matching record in `regulatory_reports`.
- **Schema & Datasets:**
  - `lib/server/db.ts` (`SCHEMA`) applies additive DDL idempotently on first DB query (`ensureSchema()`). Keep new columns/tables idempotent (`if not exists`).
  - Regenerate static JSON datasets (`lib/server/datasets/*.json`) from `data/` with `node scripts/build-public-datasets.mjs`.
- **Verification before committing:**
  - `pnpm exec next typegen && pnpm exec tsc --noEmit && pnpm lint && node scripts/verify-seo-and-routes.mjs`
  - Touch web (`app/`, `components/`, `lib/`, `scripts/`) unless the task explicitly includes `mobile/`. Never commit `.env` or print secret values.
