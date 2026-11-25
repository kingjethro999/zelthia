import { NextResponse, connection } from "next/server";
import { getFacilityAudio } from "@/lib/server/inventory";
import { downloadPrivate } from "@/lib/server/storage";

/** Public playback of a facility's recorded directions. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  try {
    const { id } = await params;
    const a = await getFacilityAudio(id);
    if (!a || !a.mime.startsWith("audio/"))
      return NextResponse.json(
        { error: "No recorded directions." },
        { status: 404 },
      );
    const res = await downloadPrivate({
      storageId: a.storage_id,
      resourceType: a.resource_type,
      format: a.format,
    });
    if (!res.ok || !res.body)
      return NextResponse.json(
        { error: "Recording unavailable." },
        { status: 502 },
      );
    return new Response(res.body, {
      headers: {
        "Content-Type": a.mime,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/facilities/[id]/audio failed", err);
    return NextResponse.json(
      { error: "Recording unavailable." },
      { status: 503 },
    );
  }
}
