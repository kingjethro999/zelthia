import { FAQ_DATA } from "@/components/marketing/faq-data";
import { FACILITY_KIND_LABEL, PRODUCT_CATEGORIES } from "@/lib/inventory-types";
import { SITE_URL } from "@/lib/utils";

/** One source of truth for the machine-readable descriptions of Zelthia. */
export const PAGES = [
  { path: "/", title: "Home", summary: "What Zelthia is and how it works." },
  {
    path: "/chat",
    title: "Health chat",
    summary:
      "Ask health questions or upload a doctor's note, prescription, result or product photo. No account needed.",
  },
  {
    path: "/inventory",
    title: "Find medicine",
    summary:
      "Search medicines, health products, tests and scans listed by facilities, with stock, price and directions.",
  },
  {
    path: "/doctors-note-reader",
    title: "Doctor's note reader",
    summary:
      "How Zelthia reads handwriting, explains notes and finds where to get the test or medicine.",
  },
  {
    path: "/for-facilities",
    title: "For facilities",
    summary:
      "Free inventory management and listing for pharmacies, clinics, hospitals, scan centres and health stores.",
  },
  {
    path: "/about",
    title: "About",
    summary:
      "Plain facts about Zelthia, who it is for and how data is handled.",
  },
  {
    path: "/privacy",
    title: "Privacy policy",
    summary: "What is collected, who processes it and how to delete it.",
  },
  {
    path: "/terms",
    title: "Terms of use",
    summary: "Terms for patients and facilities.",
  },
];

export function llmsText(full: boolean) {
  const lines = [
    "# Zelthia",
    "",
    "> Zelthia is a free health and care companion for Nigeria. It combines an AI health chat that accounts for a person's allergies, conditions and medicines; a reader that explains doctor's notes, prescriptions and results from a photo; a search for medicines, health products, tests and scans that facilities have listed; and a free inventory dashboard for pharmacies, clinics, hospitals, scan centres and health stores.",
    "",
    "Key facts:",
    "- Free for patients and for facilities. No account is needed to try the chat or search.",
    "- Zelthia gives guidance, not a diagnosis, and does not replace a doctor or pharmacist. Emergency number in Nigeria: 112.",
    "- Stock and services shown come only from facilities that listed them. Web results are labelled unverified and link to their sources. Zelthia does not invent facilities, prices or phone numbers.",
    "- Facilities with a confirmed licence or registration number carry a verified badge.",
    "- Integrated regulatory & public health datasets: Nigeria NAFDAC (Greenbook, Herbal, Alerts), US FDA Orange Book (EOBZIP_2026_10) & all 7 openFDA REST endpoints (drug/ndc, drug/drugsfda, drug/label, drug/event, drug/enforcement, food/enforcement, cosmetic/event), UK MHRA Safety Public Assessment Reports (2006–2026) & 2025–2026 Annual Report, Health Canada DPD, China NMPA, and DHSC England Adult Social Care Finance Report 2025–2026.",
    "- Enforced data protection & privacy compliance: Nigeria Data Protection Act 2023 (NDPA), UK Data Protection Act 2018 (UKPGA 2018 c. 12), and UK GDPR — with zero-knowledge AES-256-GCM encryption, explicit timestamped consent audit, Subject Access Request export, and runtime processing restriction.",
    `- Facility types: ${Object.values(FACILITY_KIND_LABEL).join(", ")}.`,
    `- Product categories: ${PRODUCT_CATEGORIES.join(", ")}.`,
    "",
    "## Pages",
    ...PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.summary}`),
    "",
    "## Public API for agents",
    `- [OpenAPI description](${SITE_URL}/openapi.json)`,
    `- Search listings: GET ${SITE_URL}/api/directory?q={product or service}&city={city}&inStock=1`,
    "  Returns JSON: `matches` (each with `facility` and either `product` or `service`) and `cities`. An empty `matches` array means no facility has listed it; do not present web guesses as Zelthia listings.",
    `- Verify a medicine or product: GET ${SITE_URL}/api/directory/verify?q={medicine}&barcode={gtin}&nafdac={reg}`,
    "  Cross-checks barcode/GTIN, NAFDAC, FDA Orange Book & openFDA, UK MHRA Safety PARs, Health Canada DPD, and China NMPA.",
    `- Explore indexed public datasets: GET ${SITE_URL}/api/research/datasets?source={overview|mhra|dpa|social-care|orange-book}&q={query}`,
    "  Read-only access to indexed FDA Orange Book metadata, MHRA Safety PARs, UKPGA Data Protection Act 2018 provisions, and DHSC England Adult Social Care 2025–2026 expenditure aggregates.",
    "- To point a person at a search, link to " +
      `${SITE_URL}/inventory?search={query}` +
      ". To hand a question to the chat, link to " +
      `${SITE_URL}/chat?q={question}` +
      ".",
    "",
    "## Optional",
    `- [Full text with questions and answers](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
  ];
  if (full) {
    lines.push(
      "",
      "## Questions and answers",
      ...FAQ_DATA.flatMap((f) => ["", `### ${f.question}`, f.answer]),
      "",
      "## How a chat answer is produced",
      "1. Any attached photo or PDF is read (handwriting transcribed, shorthand expanded).",
      "2. Zelthia works out whether the person needs to find a product, test or scan.",
      "3. It checks facilities listed on Zelthia, near the person's town when known.",
      "4. If nothing is listed, it searches the web and returns pages and photos with source links.",
      "5. The answer is written using only those results, with the person's allergies and medicines in mind.",
      "",
      "## For facilities",
      "Create a facility account, add the facility's details and landmark directions (typed or recorded), then add products and services. Listings are searchable immediately. Submitted licence numbers are reviewed and approved by a Zelthia administrator before receiving a verified badge.",
    );
  }
  return `${lines.join("\n")}\n`;
}
