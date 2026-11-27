import {
  BiometricProfile,
  hasActiveBiometrics,
  TriageLevel,
  CareReferral,
} from "./types";

interface FallbackResult {
  message: string;
  triageLevel: TriageLevel;
  referral?: CareReferral;
}

export function generateClinicalFallback(
  userQuery: string,
  biometrics?: BiometricProfile,
): FallbackResult {
  const query = userQuery.toLowerCase();
  const hasBio = hasActiveBiometrics(biometrics);

  // 1. Critical Emergency Red Flags check
  const urgentKeywords = [
    "chest pain",
    "heart attack",
    "shortness of breath",
    "difficulty breathing",
    "cannot breathe",
    "can't breathe",
    "choking",
    "stroke",
    "slurred speech",
    "facial droop",
    "numbness one side",
    "paralysis",
    "unconscious",
    "passed out",
    "severe bleeding",
    "coughing blood",
    "anaphylaxis",
    "throat swelling",
    "swollen tongue",
    "suicide",
    "kill myself",
    "overdose",
    "seizure",
    "convulsion",
    "stiff neck with fever",
  ];

  for (const kw of urgentKeywords) {
    if (query.includes(kw)) {
      return {
        triageLevel: "urgent",
        referral: {
          recommended: true,
          facilityType: "emergency",
          searchQuery: "Emergency Care Center",
          actionText: "Find Nearest Emergency Facility",
          reason: "Immediate in-person emergency evaluation is required.",
        },
        message: `### Urgent Medical Alert: Immediate Emergency Evaluation Required

**Your safety is the absolute priority.** The symptoms you described (${kw}) can be indicators of a life-threatening acute emergency.

**What to do right now**
1. **Call local emergency services immediately**:
   - In Nigeria, dial **112** (or your local emergency response hotline).
   - In the US/International, dial **911** or your regional medical dispatch.
2. **Alert someone near you**: Tell a family member, neighbor, or colleague immediately so you are not alone.
3. **Do not drive yourself**: Have an ambulance or trusted person transport you to the nearest hospital emergency room.
4. **Sit upright and rest**: Loosen tight clothing around the neck and chest while awaiting emergency assistance.

> **Important Safety Notice**: AI companions cannot diagnose or stabilize acute medical emergencies. Please seek immediate professional medical attention without delay.`,
      };
    }
  }

  // 2. Biometric Contraindication Warnings
  const bioAlerts: string[] = [];
  if (hasBio && biometrics) {
    const allergies = (biometrics.allergies || []).map((a) => a.toLowerCase());
    const conditions = (biometrics.chronicConditions || []).map((c) =>
      c.toLowerCase(),
    );
    const meds = (biometrics.currentMedications || []).map((m) =>
      m.toLowerCase(),
    );

    // Allergy checks
    if (allergies.some((a) => a.includes("penicillin"))) {
      if (
        query.includes("amoxicillin") ||
        query.includes("augmentin") ||
        query.includes("ampicillin") ||
        query.includes("penicillin")
      ) {
        bioAlerts.push(
          "**Severe Allergy Contraindication**: You have a documented **Penicillin allergy**. Amoxicillin, Ampicillin, and Augmentin belong to the beta-lactam penicillin family and pose a high risk of anaphylaxis. Do not take these without direct allergist/physician clearance.",
        );
      }
    }

    if (allergies.some((a) => a.includes("sulfa"))) {
      if (
        query.includes("bactrim") ||
        query.includes("septrin") ||
        query.includes("co-trimoxazole") ||
        query.includes("sulfa")
      ) {
        bioAlerts.push(
          "**Sulfa Allergy Contraindication**: Your profile lists a **Sulfa allergy**. Sulfonamide antibiotics like Septrin/Bactrim must be avoided to prevent hypersensitivity reactions or severe cutaneous drug reactions.",
        );
      }
    }

    if (
      allergies.some(
        (a) =>
          a.includes("nsaid") ||
          a.includes("aspirin") ||
          a.includes("ibuprofen"),
      )
    ) {
      if (
        query.includes("ibuprofen") ||
        query.includes("aspirin") ||
        query.includes("diclofenac") ||
        query.includes("naproxen")
      ) {
        bioAlerts.push(
          "**NSAID Allergy Alert**: Your profile lists an **NSAID / Aspirin allergy**. Avoid Ibuprofen, Diclofenac, and Naproxen. Consider Paracetamol (Acetaminophen) for analgesia instead.",
        );
      }
    }

    // Condition checks
    if (
      conditions.some(
        (c) => c.includes("hypertension") || c.includes("high blood pressure"),
      )
    ) {
      if (
        query.includes("cold") ||
        query.includes("decongestant") ||
        query.includes("pseudoephedrine") ||
        query.includes("sinus")
      ) {
        bioAlerts.push(
          "**Hypertension Precaution**: Many OTC multi-symptom cold/sinus remedies contain **pseudoephedrine or phenylephrine**, which can dangerously elevate blood pressure. Look for decongestant-free cold formulas or consult your pharmacist.",
        );
      }
    }

    if (conditions.some((c) => c.includes("asthma"))) {
      if (
        query.includes("ibuprofen") ||
        query.includes("aspirin") ||
        query.includes("diclofenac")
      ) {
        bioAlerts.push(
          "**Asthma Precaution**: NSAIDs (Ibuprofen, Aspirin) can trigger bronchospasm in up to 10-20% of asthmatic individuals (aspirin-exacerbated respiratory disease). Exercise caution and prioritize Paracetamol.",
        );
      }
    }

    if (conditions.some((c) => c.includes("diabetes"))) {
      if (query.includes("cough syrup") || query.includes("syrup")) {
        bioAlerts.push(
          "**Diabetes Precaution**: Standard liquid cough syrups frequently contain high concentrations of sucrose or corn syrup. Request sugar-free formulation at the pharmacy to avoid glycemic spikes.",
        );
      }
    }

    // Drug-Drug interactions
    if (
      meds.some(
        (m) =>
          m.includes("lisinopril") ||
          m.includes("enalapril") ||
          m.includes("ramipril"),
      )
    ) {
      if (
        query.includes("potassium") ||
        query.includes("ibuprofen") ||
        query.includes("pain relief")
      ) {
        bioAlerts.push(
          "**Medication Interaction**: You are taking an ACE inhibitor. Combining ACE inhibitors with regular NSAIDs can reduce antihypertensive efficacy and increase renal strain.",
        );
      }
    }
  }

  const bioSection =
    bioAlerts.length > 0
      ? `\n\n**From your profile**\n${bioAlerts.join("\n\n")}\n`
      : "";

  // 3. Scenario: Fever / Malaria / Body aches
  if (
    query.includes("fever") ||
    query.includes("malaria") ||
    query.includes("chills") ||
    query.includes("typhoid") ||
    query.includes("temperature")
  ) {
    return {
      triageLevel: "moderate",
      referral: {
        recommended: true,
        facilityType: "pharmacy",
        searchQuery: "Artemether/Lumefantrine",
        actionText: "Check Malaria Medications & RDT Kits",
        reason:
          "Find verified Artemether/Lumefantrine and Rapid Diagnostic Kits at nearby Zelthia pharmacies.",
      },
      message: `A fever accompanied by chills, joint pain, or generalized fatigue in malaria-endemic regions requires prompt attention. Early diagnostic confirmation prevents complications.${bioSection}

**Recommended Next Steps**
- **Diagnostic Confirmation First**: Take a Rapid Diagnostic Test (RDT) or blood film for malaria parasites at a local pharmacy or clinic before starting antimalarial therapy.
- **First-Line Therapy (if positive)**: Artemisinin-based Combination Therapy (ACT), specifically **Artemether-Lumefantrine (Coartem)** or **Artesunate-Amodiaquine**, taken with a meal containing fats (such as milk) to enhance absorption.
- **Temperature & Pain Management**: Paracetamol 500mg–1000mg every 6–8 hours as needed (do not exceed 4000mg/day).
- **Hydration**: Drink plenty of fluids (clean water, coconut water, or oral rehydration salts) to counter fluid loss from sweating.

**Red Flags Requiring Immediate Escalation**
- Temperature above 39.5°C (103°F) that does not respond to antipyretics
- Persistent vomiting preventing oral fluid or medication intake
- Altered consciousness, severe confusion, or seizures (signs of cerebral malaria)
- Extreme jaundice (yellowing of eyes) or tea-colored dark urine

**Questions to Ask Your Pharmacist or Doctor**
- *"Can you perform an RDT finger-prick test before dispensing antimalarials?"*
- *"Does this antimalarial interact with any of my current daily medications?"*`,
    };
  }

  // 4. Scenario: Skin Rash / Itch / Cream
  if (
    query.includes("rash") ||
    query.includes("skin") ||
    query.includes("itching") ||
    query.includes("eczema") ||
    query.includes("dermatitis")
  ) {
    return {
      triageLevel: "low",
      referral: {
        recommended: true,
        facilityType: "pharmacy",
        searchQuery: "Hydrocortisone cream",
        actionText: "Check Pharmacy Stock for Dermatology Creams",
        reason:
          "Locate soothing topical creams and antihistamines in local partner stock.",
      },
      message: `Skin rashes can originate from contact dermatitis (allergens, detergents, cosmetics), mild fungal infections, insect bites, or heat rash.${bioSection}

**Recommended Supportive Care**
- **Gentle Cleansing**: Wash the affected area with mild, fragrance-free soap and lukewarm water. Gently pat dry without rubbing.
- **Topical Calming Agents**: For localized, non-infected itchy patches, a thin layer of **Hydrocortisone 1% cream** applied 1–2 times daily for no more than 7 days can reduce inflammation.
- **Oral Antihistamines**: If itching is disturbing sleep or daily activities, a non-drowsy antihistamine (such as Cetirizine 10mg or Loratadine 10mg) may provide relief.
- **Avoid Scratching**: Keep fingernails trimmed and use a cool damp compress to avoid secondary bacterial skin infections.

**When to Avoid Corticosteroid Creams**
- Do **not** apply hydrocortisone to open sores, weeping lesions, fungal ringworm (tinea), or viral blisters (e.g. cold sores or shingles), as steroids can worsen fungal and viral infections.

**Warning Signs to See a Doctor**
- Rash spreading rapidly across large portions of the body
- Accompanying facial swelling, difficulty swallowing, or hives (anaphylactic reaction -> call 112/911)
- Signs of secondary bacterial infection: warm skin, pus formation, yellow crusting, or increasing pain.`,
    };
  }

  // 5. Scenario: Pharmacy stock / Antibiotics inquiry
  if (
    query.includes("antibiotic") ||
    query.includes("stock") ||
    query.includes("pharmacy") ||
    query.includes("prescription") ||
    query.includes("amoxicillin") ||
    query.includes("ciprofloxacin") ||
    query.includes("augmentin")
  ) {
    return {
      triageLevel: "moderate",
      referral: {
        recommended: true,
        facilityType: "pharmacy",
        searchQuery: "Antibiotics",
        actionText: "Check Real-Time Pharmacy Stock & Locations",
        reason:
          "Search licensed community pharmacies for verified prescription stock and landmark directions.",
      },
      message: `Antibiotics are essential prescription medicines engineered specifically to treat bacterial infections. They are completely ineffective against viral illnesses like the common cold, viral bronchitis, or influenza.${bioSection}

**Safe Antibiotic Principles**
- **Prescription Requirement**: Antibiotics should only be obtained upon a clinical diagnosis and valid prescription from a registered doctor or healthcare facility.
- **Finish the Prescribed Course**: If you have been prescribed an antibiotic course, complete all doses even if you feel better early. Stopping prematurely fosters antimicrobial resistance (AMR).
- **Never Share or Reuse**: Never take leftover antibiotics or another person's prescription.

**Checking Local Availability on Zelthia**
- Zelthia's inventory portal links directly with verified community pharmacies and hospital dispensary centers.
- You can look up stock counts, batch verification, and landmark-based step-by-step directions directly in the Inventory portal.

**Red Flags**
- Signs of severe systemic bacterial infection: high persistent fever, rapid heart rate, deep-seated localized throbbing pain, or spreading red streaks from a wound. Seek direct outpatient or emergency clinic evaluation.`,
    };
  }

  // 6. Scenario: Drug interactions check
  if (
    query.includes("drug interaction") ||
    query.includes("interaction") ||
    query.includes("combine") ||
    query.includes("take together") ||
    query.includes("side effect")
  ) {
    const medList =
      biometrics?.currentMedications?.join(", ") ||
      "None registered in profile";
    return {
      triageLevel: "low",
      referral: {
        recommended: true,
        facilityType: "pharmacy",
        searchQuery: "Consult Pharmacist",
        actionText: "Find Registered Pharmacist Near You",
        reason:
          "Review your medication regimen with a licensed clinical pharmacist on Zelthia.",
      },
      message: `Reviewing drug compatibility is one of the most effective measures to prevent adverse drug events and maintain therapeutic efficacy.${bioSection}

**Profile Status**
- **Current active medications evaluated**: ${medList}
- When initiating any new medication, supplement, or herbal remedy, your clinical profile should always be verified for CYP450 enzyme interactions, additive CNS depression, and renal/hepatic clearance burdens.

**Common Interactions to Guard Against**
- **NSAIDs (Ibuprofen, Diclofenac) + Blood Pressure Meds**: Can blunt the blood pressure-lowering effect and increase stress on kidneys.
- **Antibiotics + Dairy/Antacids**: Tetracyclines and fluoroquinolones bind with calcium, magnesium, and iron, reducing drug absorption by up to 50%.
- **Alcohol + Central Acting Drugs / Antibiotics**: Interacts severely with Metronidazole (Flagyl) causing severe disulfiram-like nausea and vomiting.

**Recommended Action**
- Consult a certified pharmacist at your local dispensary to run a formal dispensing check before starting any new therapy.`,
    };
  }

  // 7. General / Default Clinical Guidance
  return {
    triageLevel: "low",
    referral: {
      recommended: true,
      facilityType: "clinic",
      searchQuery: "Primary Care Consultation",
      actionText: "Find Local Healthcare Centers",
      reason:
        "Connect with community clinics and pharmacies registered on Zelthia.",
    },
    message: `I'd rather not guess about your health without looking at it properly.${bioSection}

If it's not urgent, try again in a minute and I'll look at it properly. In the meantime, a pharmacist at any community pharmacy can usually help with everyday symptoms and medicines.

**Go to a hospital or call 112 now** if you have trouble breathing, chest pain or tightness, sudden weakness or fainting, a high fever that won't come down, or pain that keeps getting worse.`,
  };
}
