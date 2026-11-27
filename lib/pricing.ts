/**
 * Prices follow purchasing power: Nigeria pays in naira, everyone else pays
 * the same figure in US dollars (₦15,000 in Nigeria is $15 elsewhere). A
 * visitor only ever sees the one that applies to them.
 */
export type PriceRegion = "ng" | "intl";

export const regionForCountry = (country: string): PriceRegion =>
  country === "NG" ? "ng" : "intl";

/** Whole currency units, e.g. 15000 -> "₦15,000", 15 -> "$15". */
export function formatPrice(amount: number, region: PriceRegion): string {
  return region === "ng"
    ? `₦${amount.toLocaleString("en-NG")}`
    : `$${amount.toLocaleString("en-US")}`;
}

/** Monthly amounts. In Nigeria the figure is naira, elsewhere US dollars. */
export const PRICES = {
  verifiedPro: { ng: 15_000, intl: 15 },
  plusOneSite: { ng: 50_000, intl: 50 },
  plusTwoSites: { ng: 75_000, intl: 75 },
  plusCap: { ng: 100_000, intl: 100 },
  companion: { ng: 3_000, intl: 5 },
} as const;

export const price = (key: keyof typeof PRICES, region: PriceRegion) =>
  formatPrice(PRICES[key][region], region);
