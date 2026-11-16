import { PRODUCT_CATEGORIES } from "@/lib/inventory-types";
import { SITE_URL } from "@/lib/utils";

/** OpenAPI description of the public, read-only directory search. */
export function GET() {
  const facility = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      kind: { type: "string", enum: ["pharmacy", "clinic", "hospital", "diagnostic", "store"] },
      phone: { type: "string" },
      address: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      directions: { type: "string", description: "Landmark directions written by the facility." },
      openingHours: { type: "string" },
      services: { type: "array", items: { type: "string" } },
      directionsAudioUrl: { type: ["string", "null"], description: "Path to recorded directions, if any." },
      verification: {
        type: "object",
        properties: { status: { type: "string", enum: ["none", "pending", "verified"] } },
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
      priceNgn: { type: ["number", "null"], description: "Price in Nigerian naira." },
      quantity: { type: "integer" },
      prescriptionOnly: { type: "boolean" },
    },
  };
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Zelthia directory",
      version: "1.0.0",
      description:
        "Read-only search of medicines, health products, tests and scans that Nigerian health facilities have listed on Zelthia. Results are real listings only; an empty list means nothing is listed.",
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/directory": {
        get: {
          operationId: "searchDirectory",
          summary: "Search facility listings",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" }, description: "Product, medicine, test or scan to look for." },
            { name: "city", in: "query", schema: { type: "string" }, description: "City or state to limit results to." },
            { name: "category", in: "query", schema: { type: "string", enum: [...PRODUCT_CATEGORIES] } },
            { name: "inStock", in: "query", schema: { type: "string", enum: ["0", "1"] }, description: "Set to 1 to return only products in stock." },
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
                            service: { type: "string", description: "Present when the match is a listed service rather than a product." },
                          },
                        },
                      },
                      cities: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return Response.json(spec, { headers: { "Cache-Control": "public, max-age=3600" } });
}
