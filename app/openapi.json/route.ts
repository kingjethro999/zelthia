import { PRODUCT_CATEGORIES } from "@/lib/inventory-types";
import { SITE_URL } from "@/lib/utils";

/** OpenAPI 3.1 description of Zelthia's public, read-only endpoints. */
export function GET() {
  const facility = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      kind: {
        type: "string",
        enum: ["pharmacy", "clinic", "hospital", "diagnostic", "store"],
      },
      phone: { type: "string" },
      address: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      country: { type: "string", description: "ISO 3166-1 alpha-2 code." },
      currency: { type: "string" },
      directions: {
        type: "string",
        description: "Landmark directions written by the facility.",
      },
      openingHours: { type: "string" },
      services: { type: "array", items: { type: "string" } },
      directionsAudioUrl: {
        type: ["string", "null"],
        description: "Path to recorded directions, if any.",
      },
      verification: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["none", "pending", "verified"] },
        },
      },
    },
  };
  const product = {
    type: "object",
    properties: {
      name: { type: "string" },
      genericName: { type: "string" },
      category: { type: "string", enum: [...PRODUCT_CATEGORIES] },
      form: { type: "string" },
      strength: { type: "string" },
      packSize: { type: "string" },
      priceNgn: {
        type: ["number", "null"],
        description: "Unit price in the facility's currency.",
      },
      quantity: { type: "integer" },
      prescriptionOnly: { type: "boolean" },
      regulatoryStatus: {
        type: "string",
        enum: ["none", "matched", "unlisted", "discontinued", "recalled"],
      },
    },
  };
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Zelthia public API",
      version: "1.1.0",
      description:
        "Read-only search of facility stock and services, multi-regulator medicine/pack verification, and public regulatory and health-economics datasets. Results represent real listings and public register records only.",
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/directory": {
        get: {
          operationId: "searchDirectory",
          summary: "Search country-scoped facility listings",
          parameters: [
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Product, medicine, test or scan to look for.",
            },
            {
              name: "country",
              in: "query",
              schema: { type: "string" },
              description:
                "Optional ISO 3166-1 alpha-2 country code (defaults to request IP/header geo).",
            },
            {
              name: "city",
              in: "query",
              schema: { type: "string" },
              description: "City or state to limit results to.",
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string", enum: [...PRODUCT_CATEGORIES] },
            },
            {
              name: "inStock",
              in: "query",
              schema: { type: "string", enum: ["0", "1"] },
              description: "Set to 1 to return only products in stock.",
            },
          ],
          responses: {
            "200": {
              description: "Matching listings",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      matches: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            facility,
                            product,
                            service: {
                              type: "string",
                              description:
                                "Present when the match is a listed service rather than a product.",
                            },
                          },
                        },
                      },
                      cities: { type: "array", items: { type: "string" } },
                      country: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/directory/verify": {
        get: {
          operationId: "verifyProduct",
          summary:
            "Verify a medicine or health product against NAFDAC Greenbook, US FDA, UK MHRA, Health Canada, and China NMPA",
          parameters: [
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Product brand or search term.",
            },
            {
              name: "barcode",
              in: "query",
              schema: { type: "string" },
              description: "EAN-13, EAN-8, UPC-A, or GS1 DataMatrix string.",
            },
            {
              name: "nafdac",
              in: "query",
              schema: { type: "string" },
              description: "NAFDAC registration number (e.g. A4-9674).",
            },
            {
              name: "code",
              in: "query",
              schema: { type: "string" },
              description:
                "Foreign registration code (NDC, MHRA PL, DIN, Guoyao Zhunzi).",
            },
            {
              name: "generic",
              in: "query",
              schema: { type: "string" },
              description: "Active generic ingredient name.",
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string", enum: [...PRODUCT_CATEGORIES] },
            },
          ],
          responses: {
            "200": {
              description:
                "Server-issued verification report and local stock matches",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      query: { type: "string" },
                      parsedBarcode: { type: ["object", "null"] },
                      report: { type: "object" },
                      directoryMatches: {
                        type: "array",
                        items: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/research/datasets": {
        get: {
          operationId: "exploreDatasets",
          summary:
            "Query indexed US FDA Orange Book, UK MHRA Safety PARs, UKPGA DPA 2018, and DHSC England Adult Social Care 2025-2026 datasets",
          parameters: [
            {
              name: "source",
              in: "query",
              schema: {
                type: "string",
                enum: ["overview", "mhra", "dpa", "social-care", "orange-book"],
                default: "overview",
              },
            },
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Optional filter or search query.",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 25, default: 10 },
            },
          ],
          responses: {
            "200": {
              description: "Non-PII government dataset response",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  };
  return Response.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
