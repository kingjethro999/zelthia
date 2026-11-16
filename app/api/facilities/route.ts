import { connection } from "next/server";
import { createFacility, listOwnedFacilities, parseFacilityInput } from "@/lib/server/inventory";
import { handle, json, readJson, requireUser } from "@/lib/server/api";

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
    const facility = await createFacility(user.id, parseFacilityInput(await readJson(req)));
    return json({ facility }, 201);
  } catch (err) {
    return handle("POST /api/facilities", err);
  }
}
