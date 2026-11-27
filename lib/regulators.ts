/**
 * How a country's medicine regulator and pack registration number are named,
 * for labels and hints. Zelthia checks NAFDAC, US FDA, UK MHRA and Health
 * Canada directly; other countries get neutral wording.
 */
export interface RegulatorCopy {
  /** e.g. "NAFDAC", "the UK MHRA". */
  regulator: string;
  /** Short name of the pack number, e.g. "NAFDAC no.", "PL number". */
  code: string;
  /** Field label for the pack number. */
  codeLabel: string;
  /** Example value for placeholders. */
  example: string;
}

const COPY: Record<string, RegulatorCopy> = {
  NG: {
    regulator: "NAFDAC",
    code: "NAFDAC no.",
    codeLabel: "NAFDAC Reg. No.",
    example: "A4-9674",
  },
  US: {
    regulator: "the US FDA",
    code: "NDC",
    codeLabel: "National Drug Code (NDC)",
    example: "0573-0164-40",
  },
  GB: {
    regulator: "the UK MHRA",
    code: "PL number",
    codeLabel: "Product licence (PL) number",
    example: "PL 00289/0071",
  },
  CA: {
    regulator: "Health Canada",
    code: "DIN",
    codeLabel: "Drug Identification Number (DIN)",
    example: "02242963",
  },
};

const NEUTRAL: RegulatorCopy = {
  regulator: "your medicines regulator",
  code: "registration no.",
  codeLabel: "Registration number on the pack",
  example: "As printed on the pack",
};

export const regulatorCopy = (country?: string | null): RegulatorCopy =>
  (country && COPY[country.toUpperCase()]) || NEUTRAL;
