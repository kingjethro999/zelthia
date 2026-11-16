import { connection } from "next/server";
import { createFacility, listOwnedFacilities, parseFacilityInput, setVerification } from "@/lib/server/inventory";
import { verifyFacility } from "@/lib/server/verify";
import { handle, json, readJson, requireUser } from "@/lib/server/api";

export const maxDuration = 60;

export async function GET() {
  await connection();
  try {
    const user = await requireUser();
    return json({ facilities: await listOwnedFacilities(user.id) });
  } catch (err) {
    return handle("GET /api/facilities", err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    let facility = await createFacility(user.id, parseFacilityInput(await readJson(req)));
    if (facility.licenseNumber) {
      facility = (await setVerification(facility.id, await verifyFacility(facility))) ?? facility;
    }
    return json({ facility }, 201);
  } catch (err) {
    return handle("POST /api/facilities", err);
  }
}
