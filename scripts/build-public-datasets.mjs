import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { extractText, getDocumentProxy } from "unpdf";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const OUT_DIR = path.join(ROOT, "lib/server/datasets");

fs.mkdirSync(OUT_DIR, { recursive: true });

async function readPdfPages(filename) {
  const full = path.join(DATA_DIR, filename);
  const bytes = new Uint8Array(fs.readFileSync(full));
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  return { totalPages, pages: text.map((p) => String(p)) };
}

/* ---------- 1. MHRA Safety Public Assessment Reports (2006 - 2026) ---------- */

function stopWordsFilter(w) {
  return (
    w.length >= 3 &&
    ![
      "and",
      "the",
      "for",
      "with",
      "risk",
      "review",
      "update",
      "updated",
      "safety",
      "public",
      "assessment",
      "report",
      "reports",
      "use",
      "patients",
      "treatment",
      "new",
      "advice",
      "medicines",
      "medicine",
      "information",
      "associated",
      "products",
      "uk",
      "pdf",
      "pages",
    ].includes(w)
  );
}

async function buildMhraSafetyPars() {
  const { totalPages, pages } = await readPdfPages(
    "Safety Public Assessment Reports - GOV.UK.pdf",
  );
  // Strip Chrome/macOS/Linux print-to-PDF headers & page footers before joining lines
  const cleanedPages = pages.map((p) =>
    p
      .replace(
        /Safety Public Assessment Reports - GOV\.UK\s+https:\/\/www\.gov\.uk\/guidance\/safety-public-assessment-reports\s*\d+\s+of\s+\d+\s+[^\n]+/gi,
        "",
      )
      .trim(),
  );
  const rawText = cleanedPages.join("\n");
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());

  // Reconstruct linear flow starting at the first chronological year section ("2026")
  let currentYear = "2026";
  let started = false;
  const bodyLines = [];
  for (const line of lines) {
    if (!started) {
      if (/^2026$/.test(line)) started = true;
      else continue;
    }
    if (/^Last updated:/i.test(line)) break;
    bodyLines.push(line);
  }

  // Collapse lines while skipping GOV.UK print-sidebar year anchors and joining broken URLs cleanly
  let joined = "";
  for (const line of bodyLines) {
    if (!line) continue;
    // Chrome print-to-PDF overflows the left-hand "2018— ... 2008—" contents rail mid-page
    if (/^(?:19|20)\d{2}\s*[—–-]$/.test(line)) continue;
    if (/^(20\d{2}|19\d{2})$/.test(line)) {
      joined += `\n<<YEAR:${line}>>\n`;
      continue;
    }
    const cleanBullet = line.replace(/^[•\-]\s*/, "");
    if (!joined.endsWith("\n")) {
      // Join wrapped URLs cleanly without spaces; otherwise space-separate prose
      const tail = joined.slice(-160);
      const openParen = tail.lastIndexOf("(");
      const closeParen = tail.lastIndexOf(")");
      const insideUrlParens =
        openParen > closeParen && /https?:\/\//i.test(tail.slice(openParen));
      if (
        insideUrlParens ||
        joined.endsWith("/") ||
        joined.endsWith("-") ||
        joined.endsWith("_")
      ) {
        joined += cleanBullet;
      } else {
        joined += ` ${cleanBullet}`;
      }
    } else {
      joined += cleanBullet;
    }
  }

  const reports = [];
  const seenUrls = new Set();
  const tokenRe = /(?:<<YEAR:(20\d{2})>>)|(\(https?:\/\/[^\s)]+\))/g;
  let lastIndex = 0;

  for (const m of joined.matchAll(tokenRe)) {
    const matchIndex = m.index ?? 0;
    if (m[1]) {
      currentYear = m[1];
      lastIndex = matchIndex + m[0].length;
      continue;
    }

    const segment = joined.slice(lastIndex, matchIndex);
    lastIndex = matchIndex + m[0].length;

    let cleaned = segment.trim();
    let prev;
    do {
      prev = cleaned;
      cleaned = cleaned
        .replace(/^\(PDF[^)]*\)\s*/i, "")
        .replace(/^\(\d{1,2}\s+[A-Za-z]+\s+\d{4}\)\s*/i, "")
        .replace(/^[•\-—:,\s]+/, "")
        .trim();
    } while (cleaned !== prev);

    const rawTitle = cleaned.replace(/\s+/g, " ").trim();
    const url = (m[2] ?? "").slice(1, -1).replace(/\s+/g, "").trim();
    if (!rawTitle || !url.startsWith("http") || seenUrls.has(url)) continue;

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error(`Malformed MHRA PAR URL extracted: ${url}`);
    }
    if (
      !["www.gov.uk", "assets.publishing.service.gov.uk"].includes(
        parsedUrl.hostname,
      )
    ) {
      throw new Error(
        `Unexpected MHRA PAR hostname "${parsedUrl.hostname}" in ${url}`,
      );
    }
    if (
      /commission-on-human-medicines|ema\.europa\.eu|hma\.eu|products\.mhra\.gov\.uk|drug-safety-update$/i.test(
        url,
      )
    ) {
      continue;
    }
    seenUrls.add(url);
    const keywords = [
      ...new Set(
        rawTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, " ")
          .split(/\s+/)
          .filter(stopWordsFilter),
      ),
    ];
    reports.push({
      year: Number.parseInt(currentYear, 10),
      title: rawTitle,
      url,
      keywords,
    });
  }

  return {
    source: "UK MHRA Safety Public Assessment Reports (GOV.UK)",
    url: "https://www.gov.uk/guidance/safety-public-assessment-reports",
    published: "2019-01-04",
    lastUpdated: "2026-10-15",
    sourcePdfPages: totalPages,
    totalReports: reports.length,
    reports,
  };
}

/* ---------- 2. MHRA Annual Report, Leadership & Privacy Notice ---------- */

async function buildMhraReference() {
  const [annual, leadership, privacy] = await Promise.all([
    readPdfPages("MHRA_2025_2026_Annual_Report_and_Accounts.pdf"),
    readPdfPages("MHRA_Senior_Leadership_Structure_2026.pdf"),
    readPdfPages(
      "Medicines and Healthcare products Regulatory Agency privacy notice - GOV.UK.pdf",
    ),
  ]);

  // Extract concise key pharmacovigilance/safety highlights from the 186-page Annual Report
  const topicMatchers = [
    {
      topic: "Safety monitoring & Yellow Card signal detection",
      re: /Yellow Card|pharmacovigilance|signal detection|Safety Public Assessment|patient safety/i,
    },
    {
      topic: "Counterfeit, unlicensed & criminal enforcement",
      re: /criminal enforcement|illicit|falsified|counterfeit|unlicensed medicines|seiz/i,
    },
    {
      topic: "Marketing authorisations & Reliance / IRP routes",
      re: /International Recognition|marketing authori|clinical trial|regulatory approval|ILAP/i,
    },
    {
      topic: "Medical devices & post-market surveillance",
      re: /medical device|UKCA|post-market surveillance|IVD|in vitro/i,
    },
  ];
  const annualHighlights = [];
  for (const matcher of topicMatchers) {
    const snippets = [];
    for (let i = 4; i < annual.pages.length && snippets.length < 2; i++) {
      const clean = annual.pages[i].replace(/\s+/g, " ").trim();
      const idx = clean.search(matcher.re);
      if (idx !== -1) {
        const start = Math.max(0, idx - 80);
        snippets.push({
          page: i + 1,
          excerpt: clean.slice(start, start + 380).trim(),
        });
      }
    }
    annualHighlights.push({ topic: matcher.topic, snippets });
  }

  // Structure & leadership roles
  const leadershipText = leadership.pages.join(" ").replace(/\s+/g, " ").trim();

  // Extract privacy notice numbered headings & excerpts (15 sections)
  const privacyClean = privacy.pages
    .join("\n")
    .replace(
      /Medicines and Healthcare products Regulatory Agency pr[^\n]*\d+\s+of\s+\d+\s+[^\n]+/gi,
      "",
    );
  const sectionTitles = [
    "Who are we?",
    "Contact our Data Protection Officer",
    "Our commitment to you",
    "Who do we collect personal data from?",
    "Why do we process your personal data?",
    "What types of personal data do we process?",
    "Lawful basis for processing your personal data",
    "Your rights",
    "Subject access request",
    "Disclosing your data (3rd parties)",
    "Retention of your data",
    "Changes to the terms of this privacy notice",
    "Other websites",
    "Complaints about how we handle your personal data",
    "The Information Commissioner’s Office",
  ];
  const privacySections = [];
  for (let i = 0; i < sectionTitles.length; i++) {
    const num = `${i + 1}. ${sectionTitles[i]}`;
    const bodyMarker = new RegExp(
      `(?:^|\\n)\\s*${i + 1}\\.\\s+${sectionTitles[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "i",
    );
    // Find second occurrence (actual section body rather than TOC)
    const matches = [
      ...privacyClean.matchAll(new RegExp(bodyMarker.source, "gi")),
    ];
    const startIdx =
      matches.length > 1 ? matches[1].index : (matches[0]?.index ?? -1);
    const excerpt =
      startIdx >= 0
        ? privacyClean
            .slice(startIdx, startIdx + 700)
            .replace(/\s+/g, " ")
            .trim()
        : num;
    privacySections.push({
      number: i + 1,
      title: sectionTitles[i],
      excerpt,
    });
  }

  return {
    annualReport: {
      title: "MHRA Annual Report and Accounts 2025–2026",
      documentCode: "HC 516",
      isbn: "978-1-5286-6687-9",
      period: "2025-04-01 to 2026-03-31",
      orderedByHouseOfCommons: "2026-07-15",
      totalPages: annual.totalPages,
      highlights: annualHighlights,
    },
    leadershipStructure2026: {
      source: "MHRA Senior Leadership Structure 2026",
      rawSummary: leadershipText.slice(0, 1200),
      safetyDirectorates: [
        "Chief Safety Officer",
        "Patient Safety Monitoring",
        "Benefit/Risk Evaluation",
        "Criminal Enforcement",
        "CPRD (Clinical Practice Research Datalink)",
        "Science and Research",
      ],
    },
    privacyNotice: {
      source: "MHRA Privacy Notice (GOV.UK)",
      url: "https://www.gov.uk/government/publications/mhra-privacy-notice/mhra-privacy-notice",
      updated: "2026-07-14",
      legalFrameworks: [
        "UK Data Protection Act 2018 (c. 12)",
        "UK GDPR (2016/679)",
      ],
      totalPages: privacy.totalPages,
      sections: privacySections,
    },
  };
}

/* ---------- 3. UKPGA Data Protection Act 2018 + National Security Guidance ---------- */

async function buildUkpgaDpa2018() {
  const [act, ns] = await Promise.all([
    readPdfPages("ukpga_20180012_en.pdf"),
    readPdfPages(
      "Data_Protection_Act_2018_-_National_Security_Certificates_Guidance.pdf",
    ),
  ]);

  const actJoined = act.pages.join("\n");
  const specs = [
    {
      section: "Section 2",
      title: "Protection of personal data",
      anchor: "2 Protection of personal data",
      domain: "Core duty & lawful principles",
    },
    {
      section: "Section 8",
      title: "Lawfulness of processing: public interest etc",
      anchor: "8 Lawfulness of processing: public interest",
      domain: "Lawful basis",
    },
    {
      section: "Section 10",
      title:
        "Special categories of personal data and criminal convictions etc data",
      anchor: "10 Special categories of personal data",
      domain: "Health & biometric data safeguards",
    },
    {
      section: "Section 11",
      title: "Special categories of personal data etc: supplementary",
      anchor: "11 Special categories of personal data etc: supplementary",
      domain: "Health & social care confidentiality",
    },
    {
      section: "Section 14",
      title: "Automated decision-making authorised by law: safeguards",
      anchor: "14 Automated decision-making authorised by law",
      domain: "AI & clinical triage transparency",
    },
    {
      section: "Section 27",
      title: "National security: certificate by Minister",
      anchor: "27 National security:",
      domain: "National security exemptions & oversight",
    },
    {
      section: "Section 45",
      title: "Right of access by the data subject",
      anchor: "45 Right of access by the data subject",
      domain: "Subject Access Requests (SAR)",
    },
    {
      section: "Section 46",
      title: "Right to rectification",
      anchor: "46 Right to rectification",
      domain: "Correction of personal data",
    },
    {
      section: "Section 47",
      title: "Right to erasure or restriction of processing",
      anchor: "47 Right to erasure or restriction",
      domain: "Deletion & Art. 18 / s. 47 restriction",
    },
    {
      section: "Section 170",
      title: "Unlawful obtaining etc of personal data",
      anchor: "170 Unlawful obtaining etc of personal data",
      domain: "Zero-knowledge & unauthorized access prevention",
    },
    {
      section: "Schedule 1 Part 1",
      title: "Conditions relating to employment, health and research etc",
      anchor: "Health or social care purposes",
      domain: "Health & social care special-category basis",
    },
  ];

  const provisions = [];
  for (const sp of specs) {
    // Search body pages (skipping TOC first 10 pages so we capture actual statute text)
    let foundExcerpt = "";
    for (let i = 10; i < act.pages.length; i++) {
      const normPage = act.pages[i].replace(/\s+/g, " ");
      const idx = normPage.toLowerCase().indexOf(sp.anchor.toLowerCase());
      if (idx !== -1) {
        foundExcerpt = normPage.slice(idx, idx + 750).trim();
        break;
      }
    }
    if (!foundExcerpt) {
      const idx = actJoined.toLowerCase().indexOf(sp.anchor.toLowerCase());
      if (idx !== -1) {
        foundExcerpt = actJoined
          .slice(idx, idx + 700)
          .replace(/\s+/g, " ")
          .trim();
      }
    }
    provisions.push({
      section: sp.section,
      title: sp.title,
      domain: sp.domain,
      excerpt: foundExcerpt || sp.title,
    });
  }

  const nsText = ns.pages.slice(0, 6).join(" ").replace(/\s+/g, " ").trim();
  const keyGuidanceIdx = nsText.search(
    /Section 27|Ministerial certificate|Upper Tribunal/i,
  );

  return {
    statute: {
      title: "Data Protection Act 2018 (UK Public General Acts 2018 c. 12)",
      chapter: "2018 c. 12",
      sourcePdf: "ukpga_20180012_en.pdf",
      url: "https://www.legislation.gov.uk/ukpga/2018/12/contents",
      totalPages: act.totalPages,
      parts: [
        "Part 1: Preliminary",
        "Part 2: General processing (UK GDPR & Applied GDPR)",
        "Part 3: Law enforcement processing",
        "Part 4: Intelligence services processing",
        "Part 5: The Information Commissioner",
        "Part 6: Enforcement",
        "Part 7: Supplementary and final provision",
      ],
      provisions,
    },
    nationalSecurityGuidance: {
      title:
        "Data Protection Act 2018 — National Security Certificates Guidance",
      published: "2020-08",
      sourcePdf:
        "Data_Protection_Act_2018_-_National_Security_Certificates_Guidance.pdf",
      totalPages: ns.totalPages,
      relevantSections: [
        "Section 27 (Part 2)",
        "Section 79 (Part 3)",
        "Section 110 (Part 4)",
      ],
      summaryExcerpt:
        keyGuidanceIdx >= 0
          ? nsText
              .slice(Math.max(0, keyGuidanceIdx - 120), keyGuidanceIdx + 700)
              .trim()
          : nsText.slice(0, 700).trim(),
    },
  };
}

/* ---------- 4. England Adult Social Care Finance 2025-2026 ---------- */

function parseCsvRow(line) {
  if (!line.includes('"')) return line.split(",");
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const numOrZero = (raw) => {
  if (!raw || raw === "[x]" || raw === ":") return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
};

async function buildAdultSocialCare() {
  const csvPath = path.join(
    DATA_DIR,
    "adult-social-care-finance-report-2025-2026-data-pack/adult-social-care-finance-report-2025-2026-updated-november-2026.csv",
  );
  const htmlPath = path.join(
    DATA_DIR,
    "Adult social care finance report, England_ 2025 to 2026 - GOV.UK.html",
  );

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, "utf8"),
    crlfDelay: Infinity,
  });

  let header = null;
  let totalRowsParsed = 0;
  const englandTotals = {
    fyEnding: 2026,
    currency: "GBP (thousands)",
    totalGrossCurrentExpenditureK: 0,
    totalNetCurrentExpenditureK: 0,
    longTermCareGrossCurrentK: 0,
    longTermCareNetCurrentK: 0,
    bySupportReasonGrossK: {},
    byAgeBandGrossK: { "18 to 64": 0, "65 and Over": 0 },
    bySettingGrossK: {},
  };
  const regionsMap = new Map();
  const localAuthMap = new Map();

  for await (const line of rl) {
    if (!header) {
      header = parseCsvRow(line);
      continue;
    }
    if (!line.trim()) continue;
    totalRowsParsed++;
    const c = parseCsvRow(line);
    const geoLevel = c[0];
    const dataLevel = c[1];
    const geoCode = c[5] || c[7] || "";
    const dhGeoName = c[6] || "";
    const regionCode = c[7] || "";
    const geoName = c[8] || "";
    const careType = c[10] || "";
    const ageBand = c[13] || "";
    const supportReason = c[14] || "";
    const setting = c[15] || "";
    const val = numOrZero(c[23]);

    const isGrossOrNet =
      dataLevel === "Gross Current Expenditure" ||
      dataLevel === "Net Current Expenditure";
    if (!isGrossOrNet) continue;

    // 1. Official grand total rows across all Adult Social Care (CareType="99", AgeBand="99", Reason="99", Setting="99")
    const isGrandTotalRow =
      careType === "99" &&
      ageBand === "99" &&
      supportReason === "99" &&
      setting === "99";

    if (isGrandTotalRow && geoLevel === "England") {
      if (dataLevel === "Gross Current Expenditure") {
        englandTotals.totalGrossCurrentExpenditureK = Math.max(
          englandTotals.totalGrossCurrentExpenditureK,
          Math.round(val),
        );
      } else {
        englandTotals.totalNetCurrentExpenditureK = Math.max(
          englandTotals.totalNetCurrentExpenditureK,
          Math.round(val),
        );
      }
    }

    if (isGrandTotalRow && geoLevel === "Region") {
      const rec = regionsMap.get(geoName) ?? {
        regionCode,
        name: geoName,
        totalGrossCurrentK: 0,
        totalNetCurrentK: 0,
      };
      if (dataLevel === "Gross Current Expenditure") {
        rec.totalGrossCurrentK = Math.max(
          rec.totalGrossCurrentK,
          Math.round(val),
        );
      } else {
        rec.totalNetCurrentK = Math.max(rec.totalNetCurrentK, Math.round(val));
      }
      regionsMap.set(geoName, rec);
    }

    if (isGrandTotalRow && geoLevel === "Local Authority") {
      const key = `${geoCode}:${dhGeoName}`;
      const rec = localAuthMap.get(key) ?? {
        code: geoCode,
        name: dhGeoName,
        region: geoName,
        totalGrossCurrentK: 0,
        totalNetCurrentK: 0,
      };
      if (dataLevel === "Gross Current Expenditure") {
        rec.totalGrossCurrentK = Math.max(
          rec.totalGrossCurrentK,
          Math.round(val),
        );
      } else {
        rec.totalNetCurrentK = Math.max(rec.totalNetCurrentK, Math.round(val));
      }
      localAuthMap.set(key, rec);
    }

    // 2. England Long Term Care total across age bands & primary support reasons (SupportSetting="99")
    if (
      geoLevel === "England" &&
      careType === "Long Term Care" &&
      (ageBand === "18 to 64" || ageBand === "65 and Over") &&
      supportReason !== "" &&
      supportReason !== "99" &&
      setting === "99"
    ) {
      if (dataLevel === "Gross Current Expenditure") {
        englandTotals.longTermCareGrossCurrentK += val;
      } else {
        englandTotals.longTermCareNetCurrentK += val;
      }
    }

    // 3. England breakdown by PrimarySupportReason & AgeBand ("Long term care and short term care", SupportSetting="99")
    if (
      geoLevel === "England" &&
      careType === "Long term care and short term care" &&
      dataLevel === "Gross Current Expenditure" &&
      (ageBand === "18 to 64" || ageBand === "65 and Over") &&
      supportReason &&
      supportReason !== "99" &&
      setting === "99"
    ) {
      englandTotals.bySupportReasonGrossK[supportReason] = Math.round(
        (englandTotals.bySupportReasonGrossK[supportReason] ?? 0) + val,
      );
      englandTotals.byAgeBandGrossK[ageBand] = Math.round(
        (englandTotals.byAgeBandGrossK[ageBand] ?? 0) + val,
      );
    }

    // 4. England Long Term Care breakdown by SupportSetting (all individual SupportReasons summed across 18-64 and 65+)
    if (
      geoLevel === "England" &&
      careType === "Long Term Care" &&
      dataLevel === "Gross Current Expenditure" &&
      supportReason !== "" &&
      supportReason !== "99" &&
      setting &&
      setting !== "99" &&
      setting !== "Fairer Charging Income" &&
      (ageBand === "18 to 64" || ageBand === "65 and Over")
    ) {
      englandTotals.bySettingGrossK[setting] = Math.round(
        (englandTotals.bySettingGrossK[setting] ?? 0) + val,
      );
    }
  }

  englandTotals.longTermCareGrossCurrentK = Math.round(
    englandTotals.longTermCareGrossCurrentK,
  );
  englandTotals.longTermCareNetCurrentK = Math.round(
    englandTotals.longTermCareNetCurrentK,
  );

  const html = fs.readFileSync(htmlPath, "utf8");
  const nottsMatch = html.match(
    /Issue affecting Nottinghamshire[\s\S]{0,900}?<\/div>/i,
  );
  const nottsNote = nottsMatch
    ? nottsMatch[0]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500)
    : "Nottinghamshire 2025 to 2026 return carries an official DHSC data quality notice.";

  const prerelease = await readPdfPages("Pre-release access list - GOV.UK.pdf");

  const localAuthorities = [...localAuthMap.values()].sort(
    (a, b) => b.totalGrossCurrentK - a.totalGrossCurrentK,
  );
  const regions = [...regionsMap.values()].sort(
    (a, b) => b.totalGrossCurrentK - a.totalGrossCurrentK,
  );

  return {
    source:
      "Department of Health & Social Care — Adult Social Care Finance Report, England 2025–2026",
    url: "https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2025-to-2026",
    updated: "2026-11-25",
    prereleasePages: prerelease.totalPages,
    totalCsvRowsProcessed: totalRowsParsed,
    regionsCount: regions.length,
    localAuthoritiesCount: localAuthorities.length,
    dataQualityNotice: nottsNote,
    englandTotals,
    regions,
    localAuthorities,
  };
}

async function main() {
  console.log("Extracting MHRA Safety PARs...");
  const mhraPars = await buildMhraSafetyPars();
  fs.writeFileSync(
    path.join(OUT_DIR, "mhra-safety-pars.json"),
    JSON.stringify(mhraPars, null, 2),
  );

  console.log("Extracting MHRA Annual Report, Leadership & Privacy Notice...");
  const mhraRef = await buildMhraReference();
  fs.writeFileSync(
    path.join(OUT_DIR, "mhra-reference.json"),
    JSON.stringify(mhraRef, null, 2),
  );

  console.log("Extracting UKPGA Data Protection Act 2018 & Guidance...");
  const dpa = await buildUkpgaDpa2018();
  fs.writeFileSync(
    path.join(OUT_DIR, "ukpga-dpa2018.json"),
    JSON.stringify(dpa, null, 2),
  );

  console.log(
    "Streaming & aggregating England Adult Social Care 2025-2026 CSV (509k+ rows)...",
  );
  const asc = await buildAdultSocialCare();
  fs.writeFileSync(
    path.join(OUT_DIR, "adult-social-care-2025-2026.json"),
    JSON.stringify(asc, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        mhraSafetyPars: mhraPars.totalReports,
        mhraPrivacySections: mhraRef.privacyNotice.sections.length,
        ukpgaProvisions: dpa.statute.provisions.length,
        socialCareCsvRows: asc.totalCsvRowsProcessed,
        socialCareRegions: asc.regionsCount,
        socialCareLocalAuthorities: asc.localAuthoritiesCount,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
