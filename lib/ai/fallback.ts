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
        message: `### Get emergency care now

The symptom you described (${kw}) needs urgent in-person evaluation and can point to a life-threatening emergency.

**What to do right now**
1. Call local emergency services now: dial **112** in Nigeria, or **911** (or your local emergency number) elsewhere.
2. Tell someone near you so you are not alone.
3. Do not drive yourself; have an ambulance or someone with you take you to the nearest hospital emergency unit.
4. Sit upright and loosen any tight clothing around your neck and chest while waiting for help.

This chat cannot diagnose or stabilize an emergency, so please get to a hospital right away.`,
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
          "Your profile lists a **penicillin allergy**. Amoxicillin, ampicillin, and Augmentin are penicillin antibiotics and can trigger anaphylaxis, so do not take them without direct doctor clearance.",
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
          "Your profile lists a **sulfa allergy**. Avoid sulfonamide antibiotics such as Septrin or Bactrim because they can cause severe allergic reactions.",
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
          "Your profile lists an **NSAID or aspirin allergy**. Avoid ibuprofen, diclofenac, and naproxen; ask your pharmacist about paracetamol instead.",
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
          "With **high blood pressure**, watch out for multi-symptom cold and sinus remedies containing pseudoephedrine or phenylephrine, which can raise blood pressure. Ask a pharmacist for a decongestant-free formula.",
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
          "With **asthma**, NSAIDs like ibuprofen and aspirin can trigger bronchospasm in sensitive people. Check with a pharmacist and consider paracetamol instead.",
        );
      }
    }

    if (conditions.some((c) => c.includes("diabetes"))) {
      if (query.includes("cough syrup") || query.includes("syrup")) {
        bioAlerts.push(
          "With **diabetes**, many liquid cough syrups carry high amounts of sugar or corn syrup. Ask your pharmacist for a sugar-free option.",
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
          "Since you take an **ACE inhibitor** (such as lisinopril, enalapril, or ramipril), regular NSAIDs can blunt its blood-pressure effect and strain your kidneys.",
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
      message: `A fever with chills or body aches should be tested properly rather than treated by guesswork.${bioSection}

**What to do next**
- Get a malaria Rapid Diagnostic Test (RDT) or blood film at a pharmacy or clinic before starting antimalarials.
- If malaria is confirmed, first-line treatment is usually an ACT such as **artemether-lumefantrine** or artesunate-amodiaquine taken with food or milk to improve absorption.
- For fever and aches, adults typically use paracetamol 500 mg to 1000 mg every 6 to 8 hours (never more than 4000 mg in 24 hours).
- Drink clean water or oral rehydration salts steadily to replace fluids lost from sweating.

**When to go in right away**
- Fever above 39.5°C (103°F) that does not drop after paracetamol
- Persistent vomiting that keeps you from holding down fluids or tablets
- Confusion, severe drowsiness, or seizures
- Yellow eyes or dark tea-colored urine

**Questions to ask**
- "Can you run a finger-prick RDT before dispensing malaria medicine?"
- "Does this antimalarial interact with anything else I take?"`,
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
      message: `Skin rashes often come from contact irritation (soaps, detergents, cosmetics), heat rash, insect bites, or superficial fungal infections.${bioSection}

**What helps at home**
- Wash the area with lukewarm water and mild, fragrance-free soap, then pat dry gently.
- For small, non-infected itchy patches, a thin layer of **hydrocortisone 1% cream** 1 to 2 times daily for up to 7 days can calm inflammation.
- If itching disrupts sleep or daily life, an oral non-drowsy antihistamine such as cetirizine 10 mg or loratadine 10 mg may help.
- Keep nails short and use a cool damp cloth so scratching does not break the skin.

**When to skip hydrocortisone cream**
- Do **not** put steroid creams on open sores, weeping skin, ringworm, fungal infections, or viral blisters (cold sores, shingles), as steroids can worsen fungal and viral infections.

**When to see a doctor**
- A rash spreading quickly across large areas of your body
- Facial or lip swelling, trouble swallowing, or widespread hives (call 112/911 right away)
- Warm skin, pus, yellow crusting, or worsening pain around the rash`,
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
      message: `Antibiotics treat bacterial infections, not viral illnesses such as the common cold or flu.${bioSection}

**How to use antibiotics safely**
- Get antibiotics only after a proper clinical check and valid prescription from a registered doctor or clinic.
- Finish the full prescribed course even if you feel better early; stopping halfway drives antimicrobial resistance.
- Never take leftover tablets or another person's prescription.

You can check live pharmacy and dispensary stock, pack verifications, and landmark directions in Zelthia's directory. Go to a clinic or hospital right away if you have a persistent high fever, rapid pulse, worsening localized pain, or spreading red streaks from a wound.`,
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
      "None listed in your profile";
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
      message: `Active medicines checked from your profile: **${medList}**.${bioSection}

**Common combinations to watch out for**
- NSAIDs (ibuprofen, diclofenac) taken alongside blood-pressure medicines can reduce blood-pressure control and add strain on the kidneys.
- Tetracyclines and fluoroquinolones bind with calcium, magnesium, iron, dairy, and antacids, which can cut absorption roughly in half.
- Alcohol interacts strongly with metronidazole (Flagyl), triggering severe nausea and vomiting.

Ask a licensed pharmacist to check any new medicine, supplement, or herbal product against your full medication list before taking them together.`,
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
