import { connection } from "next/server";
import { handle, json } from "@/lib/server/api";
import { geoFromRequest } from "@/lib/server/geo";

/** Approximate location of the caller from their IP address. */
export async function GET(req: Request) {
  await connection();
  try {
    return json({ geo: await geoFromRequest(req) });
  } catch (err) {
    return handle("GET /api/geo", err);
  }
}
