export type FacilityType = "Hospital" | "Clinic" | "Community Pharmacy";

export type DrugCategory =
  | "Antimalarials"
  | "Antibiotics"
  | "Pain Relief"
  | "Dermatology/Creams"
  | "Emergency Supplies"
  | "Chronic Care"
  | "Vitamins & Supplements";

export type DosageForm =
  | "Capsule"
  | "Tablet"
  | "Cream"
  | "Syrup"
  | "Inhaler"
  | "Injection"
  | "Suspension"
  | "Drops";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  licenseNumber: string;
  phone: string;
  email: string;
  operatingHours: string;
  address: string;
  city: string;
  state: string;
  landmarkDirections: string;
  stepByStepLandmarks: string[];
  emergencyContact: string;
  verified: boolean;
  rating: number;
  totalReviews?: number;
}

export interface InventoryItem {
  id: string;
  facilityId: string;
  name: string;
  genericFormula: string;
  category: DrugCategory;
  dosageForm: DosageForm;
  strength: string;
  stockCount: number;
  minThreshold: number;
  unitPrice: number; // in NGN (₦)
  currency: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  requiresPrescription: boolean;
  notes?: string;
  updatedAt: string;
}

export interface InventoryMetrics {
  totalSKUs: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number; // within next 90 days
  totalInventoryValue: number;
}

export function computeStockStatus(item: InventoryItem): StockStatus {
  if (item.stockCount <= 0) return "OUT_OF_STOCK";
  if (item.stockCount <= item.minThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

const STATIC_BASELINE_TIME = 1794700800000; // 2026-11-15T00:00:00.000Z

export function isExpiringSoon(
  expiryDateStr: string,
  daysThreshold: number = 90,
): boolean {
  try {
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - STATIC_BASELINE_TIME;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= daysThreshold;
  } catch {
    return false;
  }
}

export function isExpired(expiryDateStr: string): boolean {
  try {
    const expiry = new Date(expiryDateStr);
    return expiry.getTime() < STATIC_BASELINE_TIME;
  } catch {
    return false;
  }
}

// Initial Seed Facilities
export const SEED_FACILITIES: Facility[] = [
  {
    id: "fac-lincoln-abuja",
    name: "Lincoln Campus Health Centre (Abuja)",
    type: "Clinic",
    licenseNumber: "PCN-ABJ-88412",
    phone: "+234 803 241 8901",
    email: "clinic.abuja@lincoln.edu.ng",
    operatingHours:
      "Mon-Fri: 7:30 AM - 9:00 PM | Sat: 8:00 AM - 4:00 PM (Emergency 24/7)",
    address:
      "Plot 412 University Way, Lincoln University College Campus, Abuja",
    city: "Abuja",
    state: "FCT",
    landmarkDirections:
      "Directly opposite First Bank, 50m past the Total filling station junction, inside Lincoln University College Campus Gate B ground floor.",
    stepByStepLandmarks: [
      "Take the expressway exit at the Total filling station junction towards Campus Way.",
      "Drive or walk 50 meters straight until you spot the First Bank branch on your right.",
      "Turn directly opposite into Lincoln Campus Gate B (security gatehouse).",
      "Walk straight 30m; clinic reception is the ground-floor white-and-teal pavilion on your left.",
    ],
    emergencyContact: "+234 809 111 4455",
    verified: true,
    rating: 4.9,
    totalReviews: 84,
  },
  {
    id: "fac-central-wellness",
    name: "Central Wellness Community Pharmacy",
    type: "Community Pharmacy",
    licenseNumber: "PCN-ABJ-31904",
    phone: "+234 814 982 3341",
    email: "care@centralwellness.ng",
    operatingHours: "Daily: 8:00 AM - 10:30 PM",
    address: "Suite 4, Silver Plaza, Near Central Roundabout, Garki, Abuja",
    city: "Abuja",
    state: "FCT",
    landmarkDirections:
      "Next to Mobil Mart, 20m from Central Market roundabout, facing the Old Post Office building.",
    stepByStepLandmarks: [
      "Arrive at the Garki Central Market roundabout.",
      "Head towards Mobil Mart service station on the outer circle.",
      "Locate Silver Plaza immediately adjacent to Mobil Mart.",
      "Pharmacy is on Ground Floor Suite 4 with the prominent illuminated green cross.",
    ],
    emergencyContact: "+234 814 982 3349",
    verified: true,
    rating: 4.8,
    totalReviews: 128,
  },
  {
    id: "fac-lincoln-nsukka",
    name: "Lincoln Nsukka Health Bay & Dispensary",
    type: "Clinic",
    licenseNumber: "PCN-EN-50122",
    phone: "+234 806 732 1190",
    email: "healthbay.nsukka@lincoln.edu.ng",
    operatingHours: "Mon-Sat: 8:00 AM - 8:00 PM | Sun: On-Call Nurse",
    address: "University Road, Lincoln Campus Annex, Nsukka",
    city: "Nsukka",
    state: "Enugu",
    landmarkDirections:
      "Beside Faculty of Medical Sciences, 100m from Lincoln University Main Gate, opposite Zenith Bank ATM gallery.",
    stepByStepLandmarks: [
      "Enter via Lincoln University College Main Gate on University Road.",
      "Proceed straight past the security roundabout for approximately 100 meters.",
      "Spot the Zenith Bank ATM gallery on the right hand side.",
      "The Health Bay entrance is situated directly opposite the ATM gallery beside Medical Sciences Hall.",
    ],
    emergencyContact: "+234 806 732 1199",
    verified: true,
    rating: 4.7,
    totalReviews: 62,
  },
  {
    id: "fac-apex-general",
    name: "Apex General Hospital Pharmacy",
    type: "Hospital",
    licenseNumber: "MDCN-HOSP-7401",
    phone: "+234 802 555 7800",
    email: "pharmacy@apexgeneralhospital.org",
    operatingHours:
      "24 Hours / 7 Days (Round-the-clock Emergency & Outpatient)",
    address:
      "14 Hospital Avenue, Off Federal Secretariat Way, Area 11, Garki, Abuja",
    city: "Abuja",
    state: "FCT",
    landmarkDirections:
      "Off Garki Hospital Road, behind Area 11 Federal Secretariat complex, 3rd security gate on the right.",
    stepByStepLandmarks: [
      "From Federal Secretariat Area 11, take Hospital Avenue turnoff.",
      "Follow Hospital Avenue past the Ministry of Agriculture annex.",
      "Look for the large blue signpost for Apex General Hospital at Gate 3.",
      "Outpatient Pharmacy dispensary is located immediately to the right of the Emergency room entrance.",
    ],
    emergencyContact: "+234 802 555 7899",
    verified: true,
    rating: 4.9,
    totalReviews: 240,
  },
  {
    id: "fac-st-jude",
    name: "St. Jude Care Pharmacy & Diagnostic",
    type: "Community Pharmacy",
    licenseNumber: "PCN-ABJ-66219",
    phone: "+234 818 433 9900",
    email: "dispensary@stjudepharmacy.ng",
    operatingHours: "Mon-Sat: 7:30 AM - 10:00 PM | Sun: 12:00 PM - 8:00 PM",
    address: "Corner of Adetokunbo Ademola Crescent, Wuse 2, Abuja",
    city: "Abuja",
    state: "FCT",
    landmarkDirections:
      "Directly behind Ebeano Supermarket plaza, opposite Chicken Republic junction on Adetokunbo Ademola Crescent.",
    stepByStepLandmarks: [
      "Navigate to Adetokunbo Ademola Crescent in Wuse 2.",
      "Pass the Chicken Republic fast food junction heading towards Ebeano Supermarket.",
      "Turn into the access driveway behind the main supermarket parking lot.",
      "St. Jude Care Pharmacy occupies the standalone glass-front building with dedicated curb parking.",
    ],
    emergencyContact: "+234 818 433 9911",
    verified: true,
    rating: 4.85,
    totalReviews: 95,
  },
];

// Seeded Inventory Items
export const SEED_INVENTORY: InventoryItem[] = [
  // --- Lincoln Campus Health Centre (Abuja) ---
  {
    id: "inv-lin-001",
    facilityId: "fac-lincoln-abuja",
    name: "Hydrocortisone 1% Topical Cream",
    genericFormula: "Hydrocortisone (Micronized)",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "1% w/w (15g tube)",
    stockCount: 18,
    minThreshold: 5,
    unitPrice: 2200,
    currency: "NGN",
    batchNumber: "HC-2025-01A",
    expiryDate: "2026-09-30",
    requiresPrescription: false,
    notes:
      "Commonly requested by students for acute contact dermatitis, eczema flares, and insect bites.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-002",
    facilityId: "fac-lincoln-abuja",
    name: "Artemether / Lumefantrine 20/120mg (ACT)",
    genericFormula: "Artemether 20mg + Lumefantrine 120mg",
    category: "Antimalarials",
    dosageForm: "Tablet",
    strength: "20/120mg (Pack of 24)",
    stockCount: 42,
    minThreshold: 10,
    unitPrice: 3200,
    currency: "NGN",
    batchNumber: "AL-2025-44B",
    expiryDate: "2027-02-15",
    requiresPrescription: false,
    notes:
      "First-line Artemisinin Combination Therapy for acute uncomplicated Plasmodium falciparum malaria.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-003",
    facilityId: "fac-lincoln-abuja",
    name: "Amoxicillin / Clavulanate 625mg",
    genericFormula:
      "Amoxicillin Trihydrate 500mg + Potassium Clavulanate 125mg",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "625mg (Strip of 14)",
    stockCount: 25,
    minThreshold: 8,
    unitPrice: 4800,
    currency: "NGN",
    batchNumber: "AC-2024-89C",
    expiryDate: "2026-08-20",
    requiresPrescription: true,
    notes:
      "Broad-spectrum antibiotic for bacterial respiratory, urinary, and dental infections.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-004",
    facilityId: "fac-lincoln-abuja",
    name: "Paracetamol 500mg Caplets",
    genericFormula: "Acetaminophen / Paracetamol",
    category: "Pain Relief",
    dosageForm: "Tablet",
    strength: "500mg (Blister of 20)",
    stockCount: 95,
    minThreshold: 20,
    unitPrice: 850,
    currency: "NGN",
    batchNumber: "PARA-2025-11",
    expiryDate: "2027-11-30",
    requiresPrescription: false,
    notes:
      "Essential analgesic and antipyretic for fever and mild to moderate bodily pain.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-005",
    facilityId: "fac-lincoln-abuja",
    name: "Salbutamol Inhaler 100mcg",
    genericFormula: "Salbutamol Sulfate CFC-Free",
    category: "Emergency Supplies",
    dosageForm: "Inhaler",
    strength: "100mcg per actuation (200 doses)",
    stockCount: 4, // LOW STOCK
    minThreshold: 6,
    unitPrice: 5500,
    currency: "NGN",
    batchNumber: "SB-2024-33D",
    expiryDate: "2026-04-10", // Expiring soon
    requiresPrescription: true,
    notes:
      "Fast-acting bronchodilator for rapid relief of acute bronchospasm in asthma.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-006",
    facilityId: "fac-lincoln-abuja",
    name: "Oral Rehydration Salts (ORS) Sachets",
    genericFormula:
      "Sodium Chloride + Potassium Chloride + Dextrose + Sodium Citrate",
    category: "Emergency Supplies",
    dosageForm: "Suspension",
    strength: "WHO Standard 20.5g sachet (Pack of 5)",
    stockCount: 60,
    minThreshold: 15,
    unitPrice: 1200,
    currency: "NGN",
    batchNumber: "ORS-2025-09",
    expiryDate: "2027-05-18",
    requiresPrescription: false,
    notes:
      "Vital hydration support during gastroenteritis, food poisoning, and heat dehydration.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-lin-007",
    facilityId: "fac-lincoln-abuja",
    name: "Cetirizine Hydrochloride 10mg",
    genericFormula: "Cetirizine HCl",
    category: "Dermatology/Creams",
    dosageForm: "Tablet",
    strength: "10mg (Pack of 10)",
    stockCount: 30,
    minThreshold: 10,
    unitPrice: 1500,
    currency: "NGN",
    batchNumber: "CET-2025-14",
    expiryDate: "2027-01-25",
    requiresPrescription: false,
    notes:
      "Second-generation non-sedating antihistamine for urticaria, rhinitis, and itchy skin allergies.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },

  // --- Central Wellness Community Pharmacy ---
  {
    id: "inv-cen-001",
    facilityId: "fac-central-wellness",
    name: "Hydrocortisone 1% Topical Cream",
    genericFormula: "Hydrocortisone Acetate",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "1% w/w (15g tube)",
    stockCount: 0, // OUT OF STOCK (mirrors the founder's initial real-life friction!)
    minThreshold: 5,
    unitPrice: 2400,
    currency: "NGN",
    batchNumber: "HC-2024-88A",
    expiryDate: "2026-06-15",
    requiresPrescription: false,
    notes: "Currently waiting on distributor restock. Expected in 48 hours.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-cen-002",
    facilityId: "fac-central-wellness",
    name: "Ketoconazole 2% Anti-fungal Cream",
    genericFormula: "Ketoconazole 20mg/g",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "2% w/w (30g tube)",
    stockCount: 14,
    minThreshold: 5,
    unitPrice: 3100,
    currency: "NGN",
    batchNumber: "KTZ-2025-05",
    expiryDate: "2026-12-10",
    requiresPrescription: false,
    notes:
      "Broad-spectrum topical antifungal for ringworm, tinea versicolor, and cutaneous candidiasis.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-cen-003",
    facilityId: "fac-central-wellness",
    name: "Artemether / Lumefantrine 20/120mg (ACT)",
    genericFormula: "Artemether + Lumefantrine",
    category: "Antimalarials",
    dosageForm: "Tablet",
    strength: "20/120mg (Pack of 24)",
    stockCount: 38,
    minThreshold: 10,
    unitPrice: 3400,
    currency: "NGN",
    batchNumber: "AL-2025-90K",
    expiryDate: "2027-03-30",
    requiresPrescription: false,
    notes: "Standard anti-malarial blister pack.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-cen-004",
    facilityId: "fac-central-wellness",
    name: "Metformin Hydrochloride 500mg",
    genericFormula: "Metformin HCl Immediate-Release",
    category: "Chronic Care",
    dosageForm: "Tablet",
    strength: "500mg (Box of 100)",
    stockCount: 3, // LOW STOCK
    minThreshold: 8,
    unitPrice: 6200,
    currency: "NGN",
    batchNumber: "MET-2024-21B",
    expiryDate: "2026-05-15", // Expiring soon
    requiresPrescription: true,
    notes:
      "Biguanide medication for glycemic control in Type 2 diabetes mellitus.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-cen-005",
    facilityId: "fac-central-wellness",
    name: "Amlodipine Besylate 5mg",
    genericFormula: "Amlodipine Besylate",
    category: "Chronic Care",
    dosageForm: "Tablet",
    strength: "5mg (Pack of 30)",
    stockCount: 22,
    minThreshold: 6,
    unitPrice: 3800,
    currency: "NGN",
    batchNumber: "AML-2025-07",
    expiryDate: "2027-04-12",
    requiresPrescription: true,
    notes:
      "Dihydropyridine calcium channel blocker for chronic hypertension and angina management.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-cen-006",
    facilityId: "fac-central-wellness",
    name: "Multivitamin & Zinc Immune Syrup",
    genericFormula: "Vitamin B-Complex + Vitamin C + Zinc Gluconate",
    category: "Vitamins & Supplements",
    dosageForm: "Syrup",
    strength: "200ml Bottle",
    stockCount: 29,
    minThreshold: 6,
    unitPrice: 2800,
    currency: "NGN",
    batchNumber: "MVI-2025-30",
    expiryDate: "2026-11-20",
    requiresPrescription: false,
    notes: "Daily nutritional wellness and immune defense formula.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },

  // --- Lincoln Nsukka Health Bay & Dispensary ---
  {
    id: "inv-nsu-001",
    facilityId: "fac-lincoln-nsukka",
    name: "Hydrocortisone 1% Topical Cream",
    genericFormula: "Hydrocortisone BP 1.0%",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "1% w/w (15g tube)",
    stockCount: 12,
    minThreshold: 4,
    unitPrice: 2100,
    currency: "NGN",
    batchNumber: "HC-2025-NSK1",
    expiryDate: "2026-10-31",
    requiresPrescription: false,
    notes:
      "Stocked at student clinic for skin sensitivities, contact allergies, and insect stings.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-nsu-002",
    facilityId: "fac-lincoln-nsukka",
    name: "Ciprofloxacin 500mg Tablets",
    genericFormula: "Ciprofloxacin Hydrochloride",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "500mg (Pack of 10)",
    stockCount: 16,
    minThreshold: 5,
    unitPrice: 3200,
    currency: "NGN",
    batchNumber: "CIP-2025-02",
    expiryDate: "2027-01-10",
    requiresPrescription: true,
    notes:
      "Fluoroquinolone antibiotic for confirmed enteric fever (typhoid) and urinary tract infections.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-nsu-003",
    facilityId: "fac-lincoln-nsukka",
    name: "Ibuprofen 400mg Tablets",
    genericFormula: "Ibuprofen BP",
    category: "Pain Relief",
    dosageForm: "Tablet",
    strength: "400mg (Pack of 20)",
    stockCount: 50,
    minThreshold: 10,
    unitPrice: 1100,
    currency: "NGN",
    batchNumber: "IBU-2025-62",
    expiryDate: "2027-06-30",
    requiresPrescription: false,
    notes:
      "Non-steroidal anti-inflammatory drug (NSAID) for muscle ache, joint stiffness, and menstrual cramps.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-nsu-004",
    facilityId: "fac-lincoln-nsukka",
    name: "Dextromethorphan Cough Syrup 100ml",
    genericFormula: "Dextromethorphan HBr 15mg/5ml",
    category: "Pain Relief",
    dosageForm: "Syrup",
    strength: "100ml Bottle",
    stockCount: 2, // LOW STOCK
    minThreshold: 5,
    unitPrice: 2400,
    currency: "NGN",
    batchNumber: "DXM-2024-91",
    expiryDate: "2026-05-01", // Expiring soon
    requiresPrescription: false,
    notes: "Antitussive for suppressing dry, non-productive student coughs.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },

  // --- Apex General Hospital Pharmacy ---
  {
    id: "inv-apx-001",
    facilityId: "fac-apex-general",
    name: "Human Insulin NPH 100 IU/ml",
    genericFormula: "Isophane Insulin Human (rDNA origin)",
    category: "Chronic Care",
    dosageForm: "Injection",
    strength: "100 IU/ml (10ml vial)",
    stockCount: 28,
    minThreshold: 8,
    unitPrice: 11500,
    currency: "NGN",
    batchNumber: "INS-2025-77X",
    expiryDate: "2026-07-20",
    requiresPrescription: true,
    notes:
      "Refrigerated cold-chain storage verified (2-8°C). Intermediate-acting insulin.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-apx-002",
    facilityId: "fac-apex-general",
    name: "Ceftriaxone 1g Powder for Injection",
    genericFormula: "Ceftriaxone Sodium Sterile",
    category: "Antibiotics",
    dosageForm: "Injection",
    strength: "1g Vial with solvent ampoule",
    stockCount: 45,
    minThreshold: 12,
    unitPrice: 4200,
    currency: "NGN",
    batchNumber: "CTX-2025-50",
    expiryDate: "2027-04-15",
    requiresPrescription: true,
    notes:
      "Third-generation cephalosporin for severe hospital admissions, sepsis, and complicated infections.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-apx-003",
    facilityId: "fac-apex-general",
    name: "Omeprazole 20mg Delayed-Release Capsules",
    genericFormula: "Omeprazole BP",
    category: "Chronic Care",
    dosageForm: "Capsule",
    strength: "20mg (Pack of 28)",
    stockCount: 75,
    minThreshold: 15,
    unitPrice: 3600,
    currency: "NGN",
    batchNumber: "OMP-2025-18",
    expiryDate: "2027-08-30",
    requiresPrescription: false,
    notes:
      "Proton pump inhibitor (PPI) for gastric reflux, peptic ulcers, and acid indigestion.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-apx-004",
    facilityId: "fac-apex-general",
    name: "Hydrocortisone 1% Topical Cream",
    genericFormula: "Hydrocortisone 10mg/g",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "1% w/w (30g large tube)",
    stockCount: 35,
    minThreshold: 10,
    unitPrice: 3800,
    currency: "NGN",
    batchNumber: "HC-2025-APX",
    expiryDate: "2027-02-28",
    requiresPrescription: false,
    notes: "Outpatient pharmacy inventory. Available 24 hours.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-apx-005",
    facilityId: "fac-apex-general",
    name: "Tramadol HCl 50mg Capsules",
    genericFormula: "Tramadol Hydrochloride",
    category: "Pain Relief",
    dosageForm: "Capsule",
    strength: "50mg (Strip of 10)",
    stockCount: 15,
    minThreshold: 10,
    unitPrice: 2900,
    currency: "NGN",
    batchNumber: "TRM-2024-09S",
    expiryDate: "2026-10-14",
    requiresPrescription: true,
    notes:
      "Controlled Schedule analgesic. Requires authenticated physician signature and register entry.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },

  // --- St. Jude Care Pharmacy & Diagnostic ---
  {
    id: "inv-jud-001",
    facilityId: "fac-st-jude",
    name: "Hydrocortisone 1% Topical Cream",
    genericFormula: "Hydrocortisone Acetate USP",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "1% w/w (15g tube)",
    stockCount: 22,
    minThreshold: 6,
    unitPrice: 2500,
    currency: "NGN",
    batchNumber: "HC-2025-SJD",
    expiryDate: "2026-11-15",
    requiresPrescription: false,
    notes:
      "Premium formulation with soothing aloe base. Highly rated for topical skin reaction relief.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-jud-002",
    facilityId: "fac-st-jude",
    name: "Clotrimazole & Betamethasone Dipropionate Cream",
    genericFormula: "Clotrimazole 1% + Betamethasone 0.05%",
    category: "Dermatology/Creams",
    dosageForm: "Cream",
    strength: "Combined Cream (20g tube)",
    stockCount: 19,
    minThreshold: 5,
    unitPrice: 3400,
    currency: "NGN",
    batchNumber: "CB-2025-41",
    expiryDate: "2026-12-05",
    requiresPrescription: true,
    notes:
      "Combination antifungal and corticosteroid for inflamed inflammatory fungal skin lesions.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-jud-003",
    facilityId: "fac-st-jude",
    name: "Azithromycin 500mg Tablets",
    genericFormula: "Azithromycin Dihydrate",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "500mg (3-Day Z-Pack)",
    stockCount: 26,
    minThreshold: 8,
    unitPrice: 5200,
    currency: "NGN",
    batchNumber: "AZI-2025-88",
    expiryDate: "2027-05-30",
    requiresPrescription: true,
    notes: "Macrolide antibiotic for upper and lower respiratory infections.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "inv-jud-004",
    facilityId: "fac-st-jude",
    name: "Blood Glucose Test Strips & Lancet Kit",
    genericFormula: "Electrochemical Glucose Dehydrogenase Test Strips",
    category: "Emergency Supplies",
    dosageForm: "Drops",
    strength: "50 Strips + 50 Lancets Box",
    stockCount: 11,
    minThreshold: 4,
    unitPrice: 8900,
    currency: "NGN",
    batchNumber: "BG-2025-102",
    expiryDate: "2026-12-31",
    requiresPrescription: false,
    notes:
      "Essential diagnostic monitor consumables for diabetic home monitoring.",
    updatedAt: "2026-11-15T00:00:00.000Z",
  },
];

// In-Memory Data Store with Global Persistence across requests
interface GlobalInventoryStore {
  facilities: Facility[];
  items: InventoryItem[];
}

declare global {
  var __zelthia_inventory_store: GlobalInventoryStore | undefined;
}

function getStore(): GlobalInventoryStore {
  if (!globalThis.__zelthia_inventory_store) {
    globalThis.__zelthia_inventory_store = {
      facilities: JSON.parse(JSON.stringify(SEED_FACILITIES)),
      items: JSON.parse(JSON.stringify(SEED_INVENTORY)),
    };
  }
  return globalThis.__zelthia_inventory_store;
}

export function getAllFacilities(): Facility[] {
  return getStore().facilities;
}

export function getFacilityById(id: string): Facility | undefined {
  return getStore().facilities.find((f) => f.id === id);
}

export function addFacility(
  facilityData: Omit<Facility, "id" | "verified" | "rating" | "totalReviews">,
): Facility {
  const store = getStore();
  const newFacility: Facility = {
    ...facilityData,
    id: `fac-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    verified: true,
    rating: 5.0,
    totalReviews: 1,
  };
  store.facilities.unshift(newFacility);
  return newFacility;
}

export interface InventoryFilterOptions {
  facilityId?: string;
  category?: string;
  search?: string;
  dosageForm?: string;
  status?: StockStatus;
  onlyInStock?: boolean;
}

export function queryInventory(filters: InventoryFilterOptions = {}): {
  items: (InventoryItem & {
    facility: Facility;
    status: StockStatus;
    isExpiringSoon: boolean;
  })[];
  total: number;
} {
  const store = getStore();
  const { facilityId, category, search, dosageForm, status, onlyInStock } =
    filters;

  const facilityMap = new Map(store.facilities.map((f) => [f.id, f]));

  let results = store.items.map((item) => {
    const facility = facilityMap.get(item.facilityId) || {
      id: item.facilityId,
      name: "Unknown Facility",
      type: "Clinic" as FacilityType,
      licenseNumber: "N/A",
      phone: "N/A",
      email: "N/A",
      operatingHours: "Standard Hours",
      address: "Unknown Address",
      city: "Unknown",
      state: "Unknown",
      landmarkDirections: "Contact facility for directions.",
      stepByStepLandmarks: ["Call facility for navigational guidance."],
      emergencyContact: "N/A",
      verified: false,
      rating: 4.5,
    };

    const itemStatus = computeStockStatus(item);
    const expiringSoon = isExpiringSoon(item.expiryDate);

    return {
      ...item,
      facility,
      status: itemStatus,
      isExpiringSoon: expiringSoon,
    };
  });

  if (facilityId && facilityId !== "ALL") {
    results = results.filter((item) => item.facilityId === facilityId);
  }

  if (category && category !== "ALL") {
    results = results.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (dosageForm && dosageForm !== "ALL") {
    results = results.filter(
      (item) => item.dosageForm.toLowerCase() === dosageForm.toLowerCase(),
    );
  }

  if (status) {
    results = results.filter((item) => item.status === status);
  }

  if (onlyInStock) {
    results = results.filter((item) => item.stockCount > 0);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchGeneric = item.genericFormula.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchFacility = item.facility.name.toLowerCase().includes(q);
      const matchCity = item.facility.city.toLowerCase().includes(q);
      const matchLandmark = item.facility.landmarkDirections
        .toLowerCase()
        .includes(q);
      return (
        matchName ||
        matchGeneric ||
        matchCategory ||
        matchFacility ||
        matchCity ||
        matchLandmark
      );
    });
  }

  return {
    items: results,
    total: results.length,
  };
}

export function updateStockCount(
  itemId: string,
  newCount: number,
): InventoryItem | null {
  const store = getStore();
  const itemIndex = store.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return null;

  store.items[itemIndex].stockCount = Math.max(0, newCount);
  store.items[itemIndex].updatedAt = new Date().toISOString();
  return store.items[itemIndex];
}

export function quickRestockItem(
  itemId: string,
  delta: number,
): InventoryItem | null {
  const store = getStore();
  const itemIndex = store.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return null;

  const currentCount = store.items[itemIndex].stockCount;
  store.items[itemIndex].stockCount = Math.max(0, currentCount + delta);
  store.items[itemIndex].updatedAt = new Date().toISOString();
  return store.items[itemIndex];
}

export function addInventoryItem(
  itemData: Omit<InventoryItem, "id" | "currency" | "updatedAt">,
): InventoryItem {
  const store = getStore();
  const newItem: InventoryItem = {
    ...itemData,
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    currency: "NGN",
    updatedAt: "2026-11-15T00:00:00.000Z",
  };
  store.items.unshift(newItem);
  return newItem;
}

export function updateInventoryItemDetails(
  itemId: string,
  updates: Partial<Omit<InventoryItem, "id" | "facilityId">>,
): InventoryItem | null {
  const store = getStore();
  const itemIndex = store.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return null;

  store.items[itemIndex] = {
    ...store.items[itemIndex],
    ...updates,
    updatedAt: "2026-11-15T00:00:00.000Z",
  };
  return store.items[itemIndex];
}

export function deleteInventoryItem(itemId: string): boolean {
  const store = getStore();
  const initialLength = store.items.length;
  store.items = store.items.filter((item) => item.id !== itemId);
  return store.items.length < initialLength;
}

export function getFacilityMetrics(facilityId?: string): InventoryMetrics {
  const store = getStore();
  let items = store.items;
  if (facilityId && facilityId !== "ALL") {
    items = items.filter((item) => item.facilityId === facilityId);
  }

  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  let totalInventoryValue = 0;

  for (const item of items) {
    const status = computeStockStatus(item);
    if (status === "IN_STOCK") inStockCount++;
    else if (status === "LOW_STOCK") lowStockCount++;
    else if (status === "OUT_OF_STOCK") outOfStockCount++;

    if (isExpiringSoon(item.expiryDate)) {
      expiringSoonCount++;
    }

    totalInventoryValue += item.stockCount * item.unitPrice;
  }

  return {
    totalSKUs: items.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    totalInventoryValue,
  };
}

export function resetInventoryToSeed(): void {
  const store = getStore();
  store.facilities = JSON.parse(JSON.stringify(SEED_FACILITIES));
  store.items = JSON.parse(JSON.stringify(SEED_INVENTORY));
}
