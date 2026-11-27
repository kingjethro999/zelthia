import { json } from "@/lib/server/api";
import { listCountries } from "@/lib/server/geo";

/** Every country with its dialling code. Static, so it caches well. */
export async function GET() {
  return json({ countries: listCountries() }, 200);
}
