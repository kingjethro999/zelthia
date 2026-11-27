import { connection } from "next/server";
import { readWithVision } from "@/lib/ai/providers";
import { extractRegulatoryCodes, parseScannedCode } from "@/lib/barcode";
import { MAX_ATTACHMENT_BYTES } from "@/lib/chat-types";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
} from "@/lib/server/api";
import { sniffChatAttachment } from "@/lib/server/file-sniff";
import { searchDirectory } from "@/lib/server/inventory";
import { resolveCountry } from "@/lib/server/geo";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import {
  lookupBarcodeMetadata,
  verifyHealthProduct,
} from "@/lib/server/regulatory";
import {
  searchImages,
  searchPlaces,
  searchWebGeneral,
} from "@/lib/server/web-search";

export const maxDuration = 60;

const PUBLIC_PACK_PROMPT = `Read this healthcare product, medicine carton, cosmetic cream, herbal product, or barcode photo.
Return ONLY valid JSON:
{
  "name": "Product name as printed",
  "genericName": "Active ingredient(s) or ''",
  "category": "Medicine | Skin care and cosmetics | Pain relief and muscle care | Vitamins and supplements | Medical devices | Test kits and diagnostics | Other health products",
  "nafdacNumber": "NAFDAC number if visible or ''",
  "barcode": "Barcode digits if visible or ''",
  "manufacturer": "Manufacturer or brand holder or ''",
  "countryOfOrigin": "Country of origin if printed or ''",
  "foreignCodes": "NDC, Guoyao Zhunzi, MHRA PL, or Health Canada DIN if printed or ''",
  "expiresOn": "YYYY-MM-DD or null"
}`;

function parseVision(raw: string): Record<string, string | null | undefined> {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return {};
  try {
    return JSON.parse(m[0]) as Record<string, string | null | undefined>;
  } catch {
    return {};
  }
}

async function runVerification(opts: {
  query: string;
  genericName?: string;
  category?: string;
  nafdacCode?: string;
  barcode?: string;
  foreignCode?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  expiresOn?: string | null;
  city?: string | null;
  forceRefresh?: boolean;
  /** Country of the person checking: picks the home register and keeps results local. */
  userCountry: string;
}) {
  const cleanName = opts.query.trim().slice(0, 120);
  const terms = cleanName
    ? [
        ...new Set([
          cleanName,
          ...cleanName.split(/\s+/).filter((w) => w.length >= 3),
        ]),
      ].slice(0, 5)
    : [];

  const [report, matches, placesRes, wideWeb, images] = await Promise.all([
    verifyHealthProduct({
      name: cleanName,
      genericName: opts.genericName,
      category: opts.category,
      nafdacCode: opts.nafdacCode,
      barcode: opts.barcode,
      foreignCode: opts.foreignCode,
      manufacturer: opts.manufacturer,
      countryOfOrigin: opts.countryOfOrigin,
      expiresOn: opts.expiresOn,
      forceRefresh: opts.forceRefresh,
      userCountry: opts.userCountry,
    }),
    terms.length
      ? searchDirectory({
          terms,
          country: opts.userCountry,
          city: opts.city ?? null,
          inStockOnly: false,
          limit: 20,
        })
      : Promise.resolve([]),
    searchPlaces(cleanName, opts.city ?? null, 6, opts.userCountry),
    searchWebGeneral(
      `${cleanName} ${opts.nafdacCode ?? ""} authentic OR registered OR recall`,
      {
        limit: 6,
        country: opts.userCountry,
        filterLowValue: true,
      },
    ),
    searchImages(cleanName, opts.city ?? null, 6, opts.userCountry),
  ]);

  const seenUrls = new Set<string>();
  const places = [...placesRes.places, ...wideWeb.results].filter((p) => {
    if (seenUrls.has(p.url)) return false;
    seenUrls.add(p.url);
    return true;
  });

  return {
    extractedQuery: cleanName,
    report,
    matches,
    places: places.slice(0, 10),
    images,
  };
}

/** Public real-time product & regulatory verification alongside directory/web search. */
export async function GET(req: Request) {
  await connection();
  try {
    const limit = await rateLimit(
      `dir-verify:${clientIp(req)}`,
      30,
      10 * 60_000,
    );
    if (!limit.ok) {
      throw new HttpError(
        `Too many verification requests. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
    // `nafdac` is the documented name (llms.txt, openapi.json); `code` is kept for older clients.
    const code = (
      url.searchParams.get("nafdac") ??
      url.searchParams.get("code") ??
      ""
    )
      .trim()
      .slice(0, 80);
    const barcode = (url.searchParams.get("barcode") ?? "").trim().slice(0, 80);
    const category = url.searchParams.get("category")?.trim() || undefined;
    const city = url.searchParams.get("city")?.trim() || null;
    const refresh = url.searchParams.get("refresh") === "1";

    if (q.length < 2 && code.length < 3 && barcode.length < 6) {
      throw new HttpError(
        "Enter a product name, NAFDAC number, or barcode to verify.",
        400,
      );
    }

    const gs1 = barcode ? parseScannedCode(barcode) : null;
    const bMeta = barcode
      ? await lookupBarcodeMetadata(gs1?.ean13 ?? barcode).catch(() => null)
      : null;
    const inlineCodes = extractRegulatoryCodes(`${q} ${code} ${barcode}`);

    const resolvedName =
      q || bMeta?.name || inlineCodes.nafdac || gs1?.ean13 || barcode || code;

    const payload = await runVerification({
      query: resolvedName,
      genericName: bMeta?.genericName,
      category: category && category !== "ALL" ? category : bMeta?.category,
      nafdacCode: code || inlineCodes.nafdac,
      barcode: gs1?.ean13 ?? gs1?.gtin ?? (barcode || inlineCodes.barcode),
      manufacturer: bMeta?.manufacturer,
      countryOfOrigin: bMeta?.countryOfOrigin,
      expiresOn: gs1?.gs1Expiry ?? null,
      city,
      forceRefresh: refresh,
      userCountry: await resolveCountry(req, url.searchParams.get("country")),
    });

    return json(payload);
  } catch (err) {
    return handle("GET /api/directory/verify", err);
  }
}

/** Public camera/photo product & regulatory authenticity check. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const limit = await rateLimit(
      `dir-verify-post:${clientIp(req)}`,
      20,
      10 * 60_000,
    );
    if (!limit.ok) {
      throw new HttpError(
        `Too many photo verification requests. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }

    const body = await readJson(req);
    const q =
      typeof body.query === "string" ? body.query.trim().slice(0, 120) : "";
    const barcodeInput =
      typeof body.barcode === "string" ? body.barcode.trim().slice(0, 120) : "";
    const codeInput =
      typeof body.code === "string" ? body.code.trim().slice(0, 80) : "";
    const city =
      typeof body.city === "string" ? body.city.trim().slice(0, 80) : null;
    const imageBase64 =
      typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
    const imageMime =
      typeof body.imageMime === "string"
        ? body.imageMime.trim().slice(0, 80)
        : "image/jpeg";

    if (!q && !barcodeInput && !codeInput && !imageBase64) {
      throw new HttpError(
        "Provide a product name, barcode, registration number, or pack photo.",
        400,
      );
    }

    let vision: Record<string, string | null | undefined> = {};
    if (imageBase64) {
      const est = Math.floor((imageBase64.length * 3) / 4);
      if (est > MAX_ATTACHMENT_BYTES) {
        throw new HttpError("Photo is larger than 3 MB.", 400);
      }
      const rawBuf = Buffer.from(imageBase64, "base64");
      if (!rawBuf.length || rawBuf.length > MAX_ATTACHMENT_BYTES) {
        throw new HttpError("Photo is larger than 3 MB.", 400);
      }
      const mime = sniffChatAttachment(rawBuf, imageMime);
      if (!mime || !mime.startsWith("image/")) {
        throw new HttpError("Unsupported image format.", 400);
      }
      try {
        const res = await readWithVision(PUBLIC_PACK_PROMPT, {
          mime,
          base64: imageBase64,
        });
        vision = parseVision(res.text);
      } catch (err) {
        console.warn("Public verify vision failed", (err as Error).message);
      }
    }

    const gs1 = barcodeInput ? parseScannedCode(barcodeInput) : null;
    const extracted = extractRegulatoryCodes(
      [
        q,
        codeInput,
        barcodeInput,
        vision.nafdacNumber,
        vision.foreignCodes,
        vision.barcode,
      ]
        .filter(Boolean)
        .join(" "),
    );
    const barcode =
      gs1?.ean13 ?? gs1?.gtin ?? extracted.barcode ?? barcodeInput;
    const bMeta = barcode
      ? await lookupBarcodeMetadata(barcode).catch(() => null)
      : null;

    const resolvedName =
      String(vision.name ?? "").trim() ||
      q ||
      bMeta?.name ||
      extracted.nafdac ||
      barcode ||
      codeInput ||
      "Scanned product";

    const payload = await runVerification({
      query: resolvedName,
      genericName:
        String(vision.genericName ?? "").trim() || bMeta?.genericName,
      category: String(vision.category ?? "").trim() || bMeta?.category,
      nafdacCode:
        codeInput ||
        extracted.nafdac ||
        String(vision.nafdacNumber ?? "").trim(),
      barcode: barcode || undefined,
      foreignCode: String(vision.foreignCodes ?? "").trim() || undefined,
      manufacturer:
        String(vision.manufacturer ?? "").trim() || bMeta?.manufacturer,
      countryOfOrigin:
        String(vision.countryOfOrigin ?? "").trim() || bMeta?.countryOfOrigin,
      expiresOn:
        gs1?.gs1Expiry ||
        (typeof vision.expiresOn === "string" ? vision.expiresOn : null),
      city,
      userCountry: await resolveCountry(req, body.country),
    });

    return json(payload);
  } catch (err) {
    return handle("POST /api/directory/verify", err);
  }
}
