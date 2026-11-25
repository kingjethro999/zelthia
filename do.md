Analyzed route.ts:L1-15
Analyzed InfoPage.tsx:L1-233
Analyzed LegalPage.tsx:L1-34
Analyzed index.ts:L1-4
Analyzed route.ts:L1-11
Analyzed route.ts:L1-11
Analyzed page.tsx:L1-132
Analyzed page.tsx:L1-83
Analyzed AndroidManifest.xml:L1-22
Analyzed offline.html:L1-29
Ran scan codebase for security-sensitive patterns and tracked files
Ran check git history for env files and run dependency audit
Analyzed page.tsx:L1-11
Analyzed page.tsx:L1-27
Analyzed page.tsx:L1-16
Analyzed page.tsx:L1-16
Analyzed page.tsx:L1-3
Analyzed page.tsx:L1-8
Analyzed page.tsx:L1-16

Here is a security audit of the Zelthia repository, ordered by severity with exact file references and recommended fixes.

---

### High Severity

#### 1. Automated Facility Licence Verification Can Be Spoofed (Indirect & Direct Prompt Injection)
- **Where:** [lib/server/verify.ts](file:///home/japheth/Desktop/zelthia/lib/server/verify.ts#L15-L75), [app/api/facilities/route.ts](file:///home/japheth/Desktop/zelthia/app/api/facilities/route.ts#L30-L34)
- **Issue:** `verifyFacility()` grants the trusted green **Verified** badge based on open-web Firecrawl results plus an LLM verdict, with three compounding weaknesses:
  1. **No authoritative domain allowlist:** Searches run across the open web (`country: "NG"`), not restricted to official regulatory registries (e.g., PCN, MDCN, HEFAMAA, state ministries). Anyone can publish a public web page containing a fake facility name and fabricated licence number.
  2. **No minimum format/length validation on `licenseNumber`:** A short token (e.g., `"2026"` or `"NG"`) passes `squash(...).includes(licence)` against almost any web hit.
  3. **Prompt injection surface:** Untrusted registrant inputs (`name`, `address`, `licenseNumber`) and untrusted third-party web snippets (`title`, `description`) are concatenated directly into the verification prompt.
- **Impact:** Unlicensed sellers can self-grant the **"Licence verified"** badge shown to patients in search and health chat.
- **Fix:**
  - Restrict automated verification to an explicit allowlist of authoritative registry domains/APIs (or official datasets), never arbitrary web pages.
  - Enforce strict format/minimum-length checks on `licenseNumber` before running verification.
  - Default unknown/unmatched registries strictly to `pending` human review rather than letting an LLM grant `verified` from open web snippets.

#### 2. PostgreSQL TLS Certificate Validation Disabled
- **Where:** [lib/server/db.ts](file:///home/japheth/Desktop/zelthia/lib/server/db.ts#L15-L20)
- **Issue:** Non-local Postgres connections set `ssl: { rejectUnauthorized: false }`.
- **Impact:** Disables TLS certificate/hostname verification, exposing all database traffic — password hashes, session tokens, health profiles, chat histories, and extracted medical documents — to Man-in-the-Middle interception.
- **Fix:** Use `ssl: { rejectUnauthorized: true }` (supplying the database provider's root CA cert via `ca` / env var if needed).

#### 3. Missing Rate Limiting & Timing Side-Channel on Authentication Endpoints
- **Where:** [app/api/auth/signin/route.ts](file:///home/japheth/Desktop/zelthia/app/api/auth/signin/route.ts#L10-L47), [app/api/auth/signup/route.ts](file:///home/japheth/Desktop/zelthia/app/api/auth/signup/route.ts#L11-L71)
- **Issue:** Neither `/api/auth/signin` nor `/api/auth/signup` applies `rateLimit()` or account lockout. In `signin`, `verifyPassword` (`scrypt`) is skipped when the email doesn't exist ([line 30](file:///home/japheth/Desktop/zelthia/app/api/auth/signin/route.ts#L29-L31)), creating a measurable timing difference for account enumeration.
- **Impact:** Enables online password brute-forcing / credential stuffing against accounts storing medical data, mass account creation, and CPU exhaustion via repeated `scrypt` derivations.
- **Fix:**
  - Enforce strict rate limiting per IP and per normalized email (backed by a shared store like Redis/Upstash or Postgres — see #6).
  - Always run a dummy `scrypt` verification against a constant hash when `!row` so response timing stays uniform.

#### 4. Privacy Policy Contradicts Actual Data Storage & Sub-Processors (NDPA 2023 / GDPR Risk)
- **Where:** [app/privacy/page.tsx](file:///home/japheth/Desktop/zelthia/app/privacy/page.tsx#L28-L32) & [L55-L62](file:///home/japheth/Desktop/zelthia/app/privacy/page.tsx#L55-L62) vs. [app/api/chat/route.ts](file:///home/japheth/Desktop/zelthia/app/api/chat/route.ts#L91-L177)
- **Issue:** The privacy policy explicitly claims: *"Conversations are kept in your browser tab and are not saved to our database."* In practice, signed-in non-temporary chats, AI metadata, uploaded medical files, and extracted transcripts are persisted in PostgreSQL and Cloudinary. The sub-processor list also omits **Cloudinary**, **OpenAI**, **Firecrawl**, **Tavily**, and **Jina**.
- **Impact:** Material compliance/legal risk under the Nigeria Data Protection Act 2023 and GDPR for sensitive health data.
- **Fix:** Update [app/privacy/page.tsx](file:///home/japheth/Desktop/zelthia/app/privacy/page.tsx) to accurately document saved vs. guest/temporary chats, file storage, retention, deletion, and all active sub-processors.

---

### Medium Severity

#### 5. Missing Global HTTP Security Headers (Clickjacking, CSP, HSTS)
- **Where:** [next.config.ts](file:///home/japheth/Desktop/zelthia/next.config.ts), [proxy.ts](file:///home/japheth/Desktop/zelthia/proxy.ts)
- **Issue:** No `headers()` configuration exists in `next.config.ts`. Responses lack `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, and global `X-Content-Type-Options: nosniff`.
- **Impact:** Sensitive pages (`/account` delete-account flow, `/provider`, `/chat?q=...`) can be framed for clickjacking; no CSP defense-in-depth against script injection; URL query parameters (`/inventory?search=...`) and chat IDs lack a global `Referrer-Policy`.
- **Fix:** Add `headers()` in `next.config.ts` setting `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Permissions-Policy` (allowing `microphone=(self), camera=(self)` and denying unused sensors), and a strict CSP (`frame-ancestors 'none'`).

#### 6. Bypassable Rate Limiter (In-Memory Map + Spoofable `X-Forwarded-For`) & Unthrottled Paid Endpoints
- **Where:** [lib/server/rate-limit.ts](file:///home/japheth/Desktop/zelthia/lib/server/rate-limit.ts#L3-L34), [app/api/facilities/route.ts](file:///home/japheth/Desktop/zelthia/app/api/facilities/route.ts), [app/api/facilities/[id]/route.ts](file:///home/japheth/Desktop/zelthia/app/api/facilities/[id]/route.ts)
- **Issue:**
  1. `clientIp()` takes the **leftmost** IP from `x-forwarded-for`, which a caller can forge on every request to bypass IP-based limits on guest `/api/chat`, `/api/directory`, and `/api/directory/web`.
  2. `buckets` is process-local memory, which resets across serverless instances on Vercel.
  3. `POST /api/facilities` and `PUT /api/facilities/[id]` have no rate limit despite invoking paid Firecrawl + LLM calls (`verifyFacility`).
- **Impact:** Quota/cost exhaustion across Groq, Gemini, Firecrawl, Tavily, Jina, and database/directory spam.
- **Fix:** Prefer platform-verified IP headers (`x-real-ip` / `x-vercel-forwarded-for`, or the rightmost untrusted proxy hop), move rate-limiting state to Redis/Upstash or PostgreSQL for production, and add rate limits to facility create/update endpoints.

#### 7. Auto-Submitted GET Query Parameter in `/chat?q=...` (Prompt/Action CSRF)
- **Where:** [components/chat/ChatApp.tsx](file:///home/japheth/Desktop/zelthia/components/chat/ChatApp.tsx#L62-L69)
- **Issue:** Navigating to `/chat?q=<text>` automatically fires `POST /api/chat` on mount with no user confirmation. Because top-level `GET` navigations include `SameSite=Lax` cookies, an external link can force a signed-in user's browser to create saved chats, process their private health profile against an attacker-chosen prompt, trigger web searches, and inject arbitrary topics into their medical history.
- **Fix:** Pre-fill the `Composer` input with `q` instead of auto-submitting, requiring the user to press Send (or require a same-origin navigation token/state).

#### 8. Role Escalation & Unchecked Attachment Binding on Facilities (`directions_audio_id`)
- **Where:** [lib/server/inventory.ts](file:///home/japheth/Desktop/zelthia/lib/server/inventory.ts#L213-L243), [app/api/facilities/[id]/audio/route.ts](file:///home/japheth/Desktop/zelthia/app/api/facilities/[id]/audio/route.ts#L6-L35)
- **Issue:**
  1. `POST /api/facilities` does not require `user.role === "provider"` — despite `ProviderDashboard` displaying `PatientGate` to personal accounts — and silently upgrades any patient account via `update users set role = 'provider'`.
  2. `directions_audio_id` accepts **any** attachment ID owned by the user without verifying `mime LIKE 'audio/%'` and `message_id IS NULL`. Because `GET /api/facilities/[id]/audio` is **public** and cached (`public, max-age=3600`), any private chat document/photo/PDF owned by that user can be bound as facility audio and served publicly with its original `Content-Type`.
- **Fix:**
  - Enforce `user.role === "provider"` in facility mutation routes (or make upgrading an explicit opt-in action).
  - Constrain the SQL subquery for `directions_audio_id` to `where id = $13 and user_id = $1 and message_id is null and mime like 'audio/%'`, and verify `a.mime.startsWith("audio/")` in `/api/facilities/[id]/audio`.

#### 9. Indirect Prompt Injection into the System Prompt (`POST /api/chat`)
- **Where:** [lib/ai/agent.ts](file:///home/japheth/Desktop/zelthia/lib/ai/agent.ts#L263-L309)
- **Issue:** Untrusted data from third-party facilities (`name`, `directions`, `product.name`), untrusted open-web search snippets (`places`), and OCR/vision output from uploaded files are embedded directly into the `system` message alongside clinical safety rules.
- **Impact:** A malicious facility listing or poisoned web page could attempt to override grounding rules, inject phishing Markdown links into assistant replies, or interfere with clinical warnings.
- **Fix:** Move retrieved directory/web context out of the `system` prompt into a clearly delimited data block inside the user turn (e.g., XML/JSON data tags), instruct the model to treat all retrieved fields strictly as untrusted data, and strip control/markdown link syntax from facility fields passed to the prompt.

#### 10. File Upload Validation, Same-Origin Inline PDFs & Storage Orphans
- **Where:** [app/api/chat/route.ts](file:///home/japheth/Desktop/zelthia/app/api/chat/route.ts#L46-L55), [app/api/audio/route.ts](file:///home/japheth/Desktop/zelthia/app/api/audio/route.ts#L31-L50), [app/api/attachments/[id]/route.ts](file:///home/japheth/Desktop/zelthia/app/api/attachments/[id]/route.ts#L35-L42)
- **Issue:**
  1. Uploads trust client-declared `mime` strings without inspecting binary magic bytes.
  2. `GET /api/attachments/[id]` serves `application/pdf` with `Content-Disposition: inline` on the primary app origin without a `Content-Security-Policy: sandbox` header.
  3. `POST /api/audio` decodes the full base64 buffer *before* checking `MAX_BYTES` ([line 35](file:///home/japheth/Desktop/zelthia/app/api/audio/route.ts#L35-L38)), and re-recording/removing audio or deleting a facility orphans the Cloudinary file until account deletion.
- **Fix:** Validate magic bytes for images/PDFs/audio, add `Content-Security-Policy: default-src 'none'; sandbox` (or serve PDFs with `Content-Disposition: attachment`) on attachment download responses, check `base64.length` prior to `Buffer.from`, and delete replaced/orphaned Cloudinary recordings on facility update/delete.

#### 11. Lack of Defense-in-Depth CSRF Checks (`Origin` & `Content-Type`)
- **Where:** All mutating routes under `app/api/`
- **Issue:** Session cookies rely solely on `SameSite=Lax`. Route handlers call `req.json()` without checking `Content-Type: application/json` or validating `Origin`/`Sec-Fetch-Site` headers.
- **Fix:** Add a shared middleware/helper check on mutating API routes verifying `Origin` matches `SITE_URL` (or `Sec-Fetch-Site: same-origin`) and enforcing `Content-Type: application/json`.

---

### Low Severity & Hardening

1. **Plaintext Health Profile in `localStorage` & Incomplete Client Cleanup on Sign-Out** ([lib/store/session.ts](file:///home/japheth/Desktop/zelthia/lib/store/session.ts#L136-L142), [components/shared/Header.tsx](file:///home/japheth/Desktop/zelthia/components/shared/Header.tsx#L106-L110), [components/profile/AccountView.tsx](file:///home/japheth/Desktop/zelthia/components/profile/AccountView.tsx#L97-L100)):
   - Signed-in users' medical profiles (allergies, conditions, medications, notes) are persisted in plaintext `localStorage` under `zelthia-session`, exposing sensitive health data on shared computers. Only persist guest profiles in `localStorage` (not signed-in server profiles), and call `useChat.getState().reset()` inside `signOut()` and `deleteAccount()` centrally so chat history isn't left in memory when signing out from `/account` or the header.
2. **Protocol-Relative URLs in Markdown & Unchecked External URL Schemes** ([components/chat/Markdown.tsx](file:///home/japheth/Desktop/zelthia/components/chat/Markdown.tsx#L5), [components/chat/ResultCards.tsx](file:///home/japheth/Desktop/zelthia/components/chat/ResultCards.tsx#L158)):
   - `Markdown.tsx`'s link regex accepts `//evil.example` and treats it as an internal link (same tab, no `rel="noopener noreferrer nofollow"`). Change `(?:https?:\/\/|\/)` to `(?:https?:\/\/|\/(?!\/))`.
   - Explicitly enforce `/^https?:\/\//i` on `WebSources` (`p.url`) and `ImageGallery` (`img.sourceUrl`, `img.imageUrl`) before rendering `href`/`src`.
   - Escape `<` as `\u003c` in JSON-LD `dangerouslySetInnerHTML` calls ([app/page.tsx](file:///home/japheth/Desktop/zelthia/app/page.tsx#L81), [components/marketing/InfoPage.tsx](file:///home/japheth/Desktop/zelthia/components/marketing/InfoPage.tsx#L85)).
3. **Large Client-Supplied Guest History** ([app/api/chat/route.ts](file:///home/japheth/Desktop/zelthia/app/api/chat/route.ts#L108-L113)):
   - Unauthenticated requests can pass up to 20 turns × 12,000 chars (~240 KB of text) directly to paid LLMs. Cap total guest history characters (e.g., 16k–24k chars total).
4. **Expired Sessions Never Pruned** ([lib/server/auth.ts](file:///home/japheth/Desktop/zelthia/lib/server/auth.ts)):
   - Expired rows accumulate in `sessions`, and there is no "sign out all devices" / password-reset session invalidation flow. Periodically prune `where expires_at <= now()`.
5. **Dev Dependency Advisory & Mobile Manifest**:
   - `pnpm audit` reports 1 moderate dev-only advisory (`minimatch` `GHSA-g3hv-75wg-m249` via `eslint-config-next`).
   - [mobile/kotlin/app/src/main/AndroidManifest.xml](file:///home/japheth/Desktop/zelthia/mobile/kotlin/app/src/main/AndroidManifest.xml#L5) sets `android:allowBackup="true"` — disable (`false`) or exclude sensitive data before storing user health profiles/tokens on Android.
   - Add `.periderm/` to [.gitignore](file:///home/japheth/Desktop/zelthia/.gitignore) to prevent accidental commits.

---

### Positive Controls Already in Place
- **Parameterized SQL throughout** (`$1, $2...`) plus proper `LIKE` wildcard escaping (`escapeLike`) — no SQL injection vectors found.
- **Strong password & session cryptography:** `scrypt` with random 16-byte salts + `timingSafeEqual`; 256-bit random session tokens stored only as SHA-256 hashes in `httpOnly` cookies.
- **Strict ownership checks on tenant data:** `conversations`, `attachments`, `facilities`, and `products` mutations all scope queries by `user_id` / `owner_id` (no IDOR found across account/chat/facility endpoints).
- **Safe redirect handling:** `safeNext()` in [AuthForm.tsx](file:///home/japheth/Desktop/zelthia/components/auth/AuthForm.tsx#L20) and [SetupWizard.tsx](file:///home/japheth/Desktop/zelthia/components/profile/SetupWizard.tsx#L57) prevents open redirects (`startsWith("/") && !startsWith("//")`).
- **Clean secret hygiene:** No `.env` files or hardcoded API keys in tracked files or git history; Cloudinary assets use `authenticated` delivery proxied via server routes; account/chat deletions clean up Cloudinary storage.

Would you like me to put together an implementation plan to remediate the High and Medium findings?