import { connection } from "next/server";
import { readWithVision } from "@/lib/ai/providers";
import { extractRegulatoryCodes, parseScannedCode } from "@/lib/barcode";
import { MAX_ATTACHMENT_BYTES } from "@/lib/chat-types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FORMS,
  type Product,
} from "@/lib/inventory-types";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireProvider,
} from "@/lib/server/api";
import { sniffChatAttachment } from "@/lib/server/file-sniff";
import {
  findExistingFacilityProduct,
  getOwnedFacility,
} from "@/lib/server/inventory";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  lookupBarcodeMetadata,
  verifyHealthProduct,
} from "@/lib/server/regulatory";
import {
  listStockScans,
  recordStockScan,
  supplierRiskFlag,
} from "@/lib/server/stock-scans";
import { searchImages, searchWebGeneral } from "@/lib/server/web-search";

export const maxDuration = 60;

interface VisionPackExtract {
  name?: string;
  genericName?: string;
  category?: string;
  form?: string;
  strength?: string;
  packSize?: string;
  batch?: string;
  expiresOn?: string | null;
  prescriptionOnly?: boolean;
  nafdacNumber?: string;
  barcode?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  foreignCodes?: string;
  rawVisibleText?: string;
}

const VISION_EXTRACT_PROMPT = `You are a pharmaceutical & healthcare supply-chain scanner reading a pack, box, bottle, blister strip, or barcode photo.
Return ONLY valid JSON with these keys (use "" or null when absent; NEVER invent or guess unseen values):
{
  "name": "Brand or commercial product name exactly as printed on pack",
  "genericName": "Active ingredient(s) printed on pack, or ''",
  "category": "One of: Medicine | Skin care and cosmetics | Pain relief and muscle care | Vitamins and supplements | Medical devices | Test kits and diagnostics | First aid | Mother and baby | Personal and sexual health | Other health products",
  "form": "One of: Tablet | Capsule | Syrup or suspension | Injection | Cream, gel or ointment | Lotion or oil | Drops | Inhaler | Spray | Powder or sachet | Device | Kit | Other | ''",
  "strength": "Dosage strength e.g. '500 mg' or ''",
  "packSize": "Pack count or volume e.g. '10 tablets', '30 g tube' or ''",
  "batch": "Batch or Lot number (LOT / B.NO / BN) or ''",
  "expiresOn": "Expiry date formatted strictly as YYYY-MM-DD (if only month/year printed, use last day of that month), or null",
  "prescriptionOnly": boolean,
  "nafdacNumber": "NAFDAC Reg. No. if printed (e.g. A4-9674, 04-1234, C4-0012, A7-0123L) or ''",
  "barcode": "Digits printed beneath the barcode if readable, or ''",
  "manufacturer": "Manufacturer or marketing authorization holder, or ''",
  "countryOfOrigin": "Country printed after 'Made in' / manufacturer address, or ''",
  "foreignCodes": "Any NDC, China Guoyao Zhunzi (国药准字...), Chinese 20-digit traceability code, UK MHRA PL, or Health Canada DIN visible, or ''",
  "rawVisibleText": "Short literal summary of prominent printed text (max 350 chars)"
}`;

function parseVisionJson(raw: string): VisionPackExtract {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return {};
  try {
    const parsed = JSON.parse(m[0]);
    return parsed && typeof parsed === "object"
      ? (parsed as VisionPackExtract)
      : {};
  } catch {
    return {};
  }
}

const cleanStr = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function normalizeCategory(raw: unknown): string {
  const s = cleanStr(raw, 80);
  if ((PRODUCT_CATEGORIES as readonly string[]).includes(s)) return s;
  const lower = s.toLowerCase();
  if (/skin|cream|cosmetic|lotion|soap/.test(lower))
    return "Skin care and cosmetics";
  if (/pain|muscle|rub|balm/.test(lower)) return "Pain relief and muscle care";
  if (/vitamin|supplement|herbal/.test(lower))
    return "Vitamins and supplements";
  if (/device|monitor|thermometer|nebulizer/.test(lower))
    return "Medical devices";
  if (/test|kit|diagnostic|strip/.test(lower))
    return "Test kits and diagnostics";
  return "Medicine";
}

function normalizeForm(raw: unknown): string {
  const s = cleanStr(raw, 60);
  if ((PRODUCT_FORMS as readonly string[]).includes(s)) return s;
  const lower = s.toLowerCase();
  if (/tab/.test(lower)) return "Tablet";
  if (/cap/.test(lower)) return "Capsule";
  if (/syrup|susp/.test(lower)) return "Syrup or suspension";
  if (/inj|amp|vial/.test(lower)) return "Injection";
  if (/cream|gel|oint/.test(lower)) return "Cream, gel or ointment";
  if (/lotion|oil/.test(lower)) return "Lotion or oil";
  if (/drop/.test(lower)) return "Drops";
  if (/inhal/.test(lower)) return "Inhaler";
  if (/spray/.test(lower)) return "Spray";
  if (/powder|sachet/.test(lower)) return "Powder or sachet";
  if (/kit/.test(lower)) return "Kit";
  if (/device/.test(lower)) return "Device";
  return "";
}

function normalizeExpiry(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))) {
    return s;
  }
  const ym = s.match(/^(\d{4})[-/](\d{1,2})$/);
  if (ym) {
    const y = Number(ym[1]);
    const m = Number(ym[2]);
    if (m >= 1 && m <= 12) {
      return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    }
  }
  return null;
}

/**
 * Authenticated Facility "Scan to Stock" endpoint.
 * Accepts camera/uploaded pack photos, live scanned barcodes (GTIN/EAN/UPC/GS1),
 * NAFDAC/FDA/NMPA numbers, or product queries; extracts structured pack fields;
 * runs real-time multi-registry authenticity verification & wider web search;
 * and checks for matching existing inventory in the owned facility.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const limit = await rateLimit(`scan:u:${user.id}`, 45, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many scans right now. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }

    const body = await readJson(req);
    const facilityId = cleanStr(body.facilityId, 64);
    if (facilityId) {
      const owned = await getOwnedFacility(facilityId, user.id);
      if (!owned) throw new HttpError("Facility not found.", 404);
    }

    const rawBarcodeInput = cleanStr(body.barcode, 180);
    const rawCodeInput = cleanStr(body.code, 180);
    const rawQueryInput = cleanStr(body.query, 180);
    const imageBase64 = cleanStr(body.imageBase64, 6_000_000);
    const imageMime = cleanStr(body.imageMime || "image/jpeg", 80);
    const forceRefresh = body.forceRefresh === true;
    const supplier = cleanStr(body.supplier, 120);

    if (!rawBarcodeInput && !rawCodeInput && !rawQueryInput && !imageBase64) {
      throw new HttpError(
        "Scan a barcode, snap a pack photo, or enter a product name or NAFDAC number.",
        400,
      );
    }

    let verifiedMime: string | null = null;
    if (imageBase64) {
      const estSize = Math.floor((imageBase64.length * 3) / 4);
      if (estSize > MAX_ATTACHMENT_BYTES) {
        throw new HttpError("Pack photo is larger than 3 MB.", 400);
      }
      const rawBuf = Buffer.from(imageBase64, "base64");
      if (!rawBuf.length || rawBuf.length > MAX_ATTACHMENT_BYTES) {
        throw new HttpError("Pack photo is larger than 3 MB.", 400);
      }
      verifiedMime = sniffChatAttachment(rawBuf, imageMime);
      if (!verifiedMime || !verifiedMime.startsWith("image/")) {
        throw new HttpError(
          "Uploaded pack file does not match a supported image format.",
          400,
        );
      }
    }

    const gs1 = rawBarcodeInput ? parseScannedCode(rawBarcodeInput) : null;
    const inlineCodes = extractRegulatoryCodes(
      [rawBarcodeInput, rawCodeInput, rawQueryInput].filter(Boolean).join(" "),
    );

    const visionPromise: Promise<VisionPackExtract> =
      verifiedMime && imageBase64
        ? readWithVision(VISION_EXTRACT_PROMPT, {
            mime: verifiedMime,
            base64: imageBase64,
          })
            .then((r) => parseVisionJson(r.text))
            .catch((err) => {
              console.warn(
                "Scan-to-stock vision failed",
                (err as Error).message,
              );
              return {};
            })
        : Promise.resolve({});

    const barcodeForMeta =
      gs1?.ean13 ??
      gs1?.upcA ??
      gs1?.gtin ??
      inlineCodes.barcode ??
      rawBarcodeInput;
    const barcodeMetaPromise = barcodeForMeta
      ? lookupBarcodeMetadata(barcodeForMeta).catch(() => null)
      : Promise.resolve(null);

    const [vision, barcodeMeta] = await Promise.all([
      visionPromise,
      barcodeMetaPromise,
    ]);

    const visionCodes = extractRegulatoryCodes(
      [
        vision.nafdacNumber,
        vision.foreignCodes,
        vision.barcode,
        vision.rawVisibleText,
      ]
        .filter(Boolean)
        .join(" "),
    );

    const name =
      cleanStr(vision.name, 160) ||
      cleanStr(barcodeMeta?.name, 160) ||
      rawQueryInput ||
      cleanStr(inlineCodes.nafdac, 64) ||
      cleanStr(barcodeForMeta, 64) ||
      "Scanned product";

    const genericName =
      cleanStr(vision.genericName, 160) ||
      cleanStr(barcodeMeta?.genericName, 160);
    const category = normalizeCategory(
      vision.category || barcodeMeta?.category || body.category,
    );
    const form = normalizeForm(vision.form);
    const strength = cleanStr(vision.strength, 60);
    const packSize =
      cleanStr(vision.packSize, 60) || cleanStr(barcodeMeta?.packSize, 60);
    const batch = gs1?.gs1Batch || cleanStr(vision.batch, 60);
    const expiresOn = gs1?.gs1Expiry || normalizeExpiry(vision.expiresOn);
    const barcode =
      gs1?.ean13 ||
      gs1?.gtin ||
      inlineCodes.barcode ||
      visionCodes.barcode ||
      cleanStr(vision.barcode, 64) ||
      cleanStr(barcodeForMeta, 64);
    const nafdacNumber = (
      inlineCodes.nafdac ||
      visionCodes.nafdac ||
      cleanStr(vision.nafdacNumber, 64)
    )
      .toUpperCase()
      .replace(/\s+/g, "");
    const manufacturer =
      cleanStr(vision.manufacturer, 160) ||
      cleanStr(barcodeMeta?.manufacturer, 160);
    const countryOfOrigin =
      cleanStr(vision.countryOfOrigin, 80) ||
      cleanStr(barcodeMeta?.countryOfOrigin, 80);
    const foreignCode = [
      inlineCodes.ndc,
      inlineCodes.guoyaoZhunzi,
      inlineCodes.chineseCosmetic,
      inlineCodes.cnTraceability20,
      inlineCodes.mhraPl,
      inlineCodes.hcDin,
      vision.foreignCodes,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 120);

    const searchName =
      name === "Scanned product" && (nafdacNumber || barcode)
        ? nafdacNumber || barcode
        : name;

    const [issuedReport, existingProduct, webSearch, images, supplierFlag] =
      await Promise.all([
        verifyHealthProduct({
          name: searchName,
          genericName: genericName || undefined,
          category,
          nafdacCode: nafdacNumber || undefined,
          barcode: barcode || undefined,
          foreignCode: foreignCode || undefined,
          manufacturer: manufacturer || undefined,
          countryOfOrigin: countryOfOrigin || undefined,
          expiresOn,
          forceRefresh,
        }),
        facilityId
          ? findExistingFacilityProduct(facilityId, {
              barcode: barcode || undefined,
              nafdacNumber: nafdacNumber || undefined,
              name: searchName,
            }).catch(() => null)
          : Promise.resolve(null),
        searchWebGeneral(
          `${searchName} ${genericName} ${nafdacNumber} manufacturer pharmacy`,
          { limit: 5, country: "NG", filterLowValue: true },
        ).catch(() => ({ results: [], errors: [] })),
        searchImages(`${searchName} ${manufacturer}`, null, 4).catch(() => []),
        facilityId && supplier
          ? supplierRiskFlag(supplier, facilityId).catch(() => null)
          : Promise.resolve(null),
      ]);

    // Supplier history is advisory context for this intake only; the issued
    // report (which a product save is checked against) stays unchanged.
    const report = supplierFlag
      ? {
          ...issuedReport,
          flags: [supplierFlag, ...issuedReport.flags],
          verdict:
            issuedReport.verdict === "verified"
              ? ("caution" as const)
              : issuedReport.verdict,
        }
      : issuedReport;

    if (facilityId) {
      await recordStockScan({
        facilityId,
        userId: user.id,
        productName: name,
        nafdacNumber,
        barcode,
        batch,
        expiresOn,
        supplier,
        report: issuedReport,
      }).catch((err) =>
        console.warn("Could not record stock scan", (err as Error).message),
      );
    }

    const draft: Omit<Product, "id" | "facilityId" | "updatedAt"> = {
      name,
      genericName,
      category,
      form,
      strength,
      packSize,
      priceNgn: existingProduct?.priceNgn ?? null,
      quantity: 1,
      lowStockAt: existingProduct?.lowStockAt ?? 5,
      batch,
      expiresOn,
      prescriptionOnly: vision.prescriptionOnly === true,
      notes: "",
      barcode,
      nafdacNumber,
      manufacturer,
      countryOfOrigin,
      regulatoryStatus: issuedReport.verdict,
      regulatorySummary: issuedReport,
      regulatoryCheckedAt: issuedReport.checkedAt,
    };

    return json({
      draft,
      report,
      existingProduct,
      webReferences: webSearch.results,
      images,
    });
  } catch (err) {
    return handle("POST /api/inventory/scan", err);
  }
}

/** Recent Scan-to-Stock intake history for a facility the provider owns. */
export async function GET(req: Request) {
  await connection();
  try {
    const user = await requireProvider();
    const facilityId = new URL(req.url).searchParams.get("facilityId") ?? "";
    const owned = facilityId
      ? await getOwnedFacility(facilityId, user.id)
      : null;
    if (!owned) throw new HttpError("Facility not found.", 404);
    return json({ scans: await listStockScans(facilityId, 50) });
  } catch (err) {
    return handle("GET /api/inventory/scan", err);
  }
}
