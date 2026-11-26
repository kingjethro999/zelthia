import "server-only";
import mhraParsJson from "./datasets/mhra-safety-pars.json";
import mhraRefJson from "./datasets/mhra-reference.json";

export interface MhraSafetyPar {
  year: number;
  title: string;
  url: string;
  keywords: string[];
  matchedReason?: string;
}

/** Expands specific generic drugs to UK MHRA Safety PAR therapeutic classes. */
const CLINICAL_CLASS_TRIGGERS: Array<{
  trigger: RegExp;
  matchTerms: string[];
  reason: string;
}> = [
  {
    trigger:
      /\b(ciprofloxacin|levofloxacin|moxifloxacin|ofloxacin|norfloxacin|fluoroquinolone)\b/i,
    matchTerms: ["fluoroquinolone"],
    reason: "Fluoroquinolone antibiotic safety restrictions",
  },
  {
    trigger:
      /\b(pregabalin|gabapentin|lyrica|neurontin|diazepam|lorazepam|clonazepam|alprazolam|zopiclone|zolpidem)\b/i,
    matchTerms: ["gabapentinoids", "pregabalin", "gabapentin", "benzodiazepines"],
    reason: "Gabapentinoid / Benzodiazepine / Z-drug safety guidance",
  },
  {
    trigger:
      /\b(valproate|sodium valproate|epilim|depakote|depakin)\b/i,
    matchTerms: ["valproate"],
    reason: "Valproate teratogenicity & reproductive safety review",
  },
  {
    trigger: /\b(isotretinoin|roaccutane|accutane)\b/i,
    matchTerms: ["isotretinoin"],
    reason: "Isotretinoin prescribing safety review",
  },
  {
    trigger:
      /\b(sertraline|fluoxetine|citalopram|escitalopram|paroxetine|venlafaxine|duloxetine|amitriptyline|mirtazapine|antidepressant)\b/i,
    matchTerms: ["antidepressants", "ssri"],
    reason: "Antidepressants updated MHRA safety communication",
  },
  {
    trigger:
      /\b(oxybutynin|tolterodine|solifenacin|mirabegron|trospium|anticholinergic)\b/i,
    matchTerms: ["anticholinergics", "bladder"],
    reason: "Bladder anticholinergics dementia risk review",
  },
  {
    trigger:
      /\b(morphine|oxycodone|fentanyl|tramadol|buprenorphine|tapentadol|opioid)\b/i,
    matchTerms: ["opioids"],
    reason: "Modified release opioids post-operative pain safety review",
  },
  {
    trigger: /\b(codeine|dihydrocodeine)\b/i,
    matchTerms: ["codeine", "dihydrocodeine"],
    reason: "Codeine/dihydrocodeine addiction & paediatric risk assessment",
  },
  {
    trigger: /\b(pseudoephedrine|ephedrine)\b/i,
    matchTerms: ["pseudoephedrine", "ephedrine"],
    reason: "Pseudoephedrine / ephedrine safety & misuse review",
  },
  {
    trigger: /\b(finasteride|propecia|proscar)\b/i,
    matchTerms: ["finasteride"],
    reason: "Finasteride safety Public Assessment Report",
  },
  {
    trigger: /\b(atorvastatin|rosuvastatin|simvastatin|pravastatin|statin)\b/i,
    matchTerms: ["statins"],
    reason: "Statins product safety information update",
  },
  {
    trigger: /\b(paracetamol|acetaminophen|panadol|emzor paracetamol)\b/i,
    matchTerms: ["paracetamol"],
    reason: "UK MHRA PAR archive on intravenous/oral paracetamol dosing",
  },
  {
    trigger: /\b(topiramate|montelukast|methotrexate|metoclopramide|domperidone|diclofenac|celecoxib|etoricoxib|pioglitazone|rosiglitazone|methylphenidate|atomoxetine)\b/i,
    matchTerms: [
      "topiramate",
      "montelukast",
      "methotrexate",
      "metoclopramide",
      "domperidone",
      "diclofenac",
      "pioglitazone",
      "rosiglitazone",
      "methylphenidate",
      "atomoxetine",
    ],
    reason: "Active UK MHRA Public Assessment Report",
  },
];

/**
 * Searches all 45 indexed UK MHRA Safety Public Assessment Reports (2006–2026)
 * extracted from `data/Safety Public Assessment Reports - GOV.UK.pdf`.
 */
export function searchMhraSafetyPars(
  query: string,
  genericName?: string,
): MhraSafetyPar[] {
  const combined = `${query} ${genericName ?? ""}`.toLowerCase().trim();
  if (combined.length < 3) return [];

  const tokens = combined
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4);

  const triggeredTerms = new Map<string, string>();
  for (const c of CLINICAL_CLASS_TRIGGERS) {
    if (c.trigger.test(combined)) {
      for (const term of c.matchTerms) {
        triggeredTerms.set(term, c.reason);
      }
    }
  }

  const hits: Array<{ par: MhraSafetyPar; score: number }> = [];
  for (const rawPar of mhraParsJson.reports) {
    const titleLower = rawPar.title.toLowerCase();
    let score = 0;
    let reason = "";

    for (const [term, r] of triggeredTerms) {
      if (titleLower.includes(term) || rawPar.keywords.includes(term)) {
        score += 5;
        reason = r;
      }
    }
    for (const tok of tokens) {
      if (titleLower.includes(tok)) {
        score += 4;
        reason = reason || `Matches "${tok}" in MHRA Safety PAR`;
      } else if (rawPar.keywords.some((k) => k.includes(tok))) {
        score += 2;
      }
    }

    if (score >= 4) {
      hits.push({
        par: {
          year: rawPar.year,
          title: rawPar.title,
          url: rawPar.url,
          keywords: rawPar.keywords,
          matchedReason: reason,
        },
        score,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || b.par.year - a.par.year);
  return hits.slice(0, 4).map((h) => h.par);
}

export function getMhraAgencyOverview() {
  return {
    parsCatalog: {
      source: mhraParsJson.source,
      url: mhraParsJson.url,
      lastUpdated: mhraParsJson.lastUpdated,
      totalReports: mhraParsJson.totalReports,
      latestReports: mhraParsJson.reports.slice(0, 6),
    },
    annualReport: mhraRefJson.annualReport,
    leadershipStructure2026: mhraRefJson.leadershipStructure2026,
    privacyNotice: {
      url: mhraRefJson.privacyNotice.url,
      updated: mhraRefJson.privacyNotice.updated,
      sectionsCount: mhraRefJson.privacyNotice.sections.length,
    },
  };
}
