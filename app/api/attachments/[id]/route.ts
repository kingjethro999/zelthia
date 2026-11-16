import { NextResponse, connection } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { getOwnedAttachment } from "@/lib/server/conversations";
import { downloadPrivate } from "@/lib/server/storage";

/** Streams a private attachment to its owner only. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in to view this file." }, { status: 401 });
    const { id } = await params;
    const a = await getOwnedAttachment(id, user.id);
    if (!a?.storage_id || !a.resource_type) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    const res = await downloadPrivate({
      storageId: a.storage_id,
      resourceType: a.resource_type,
      format: a.format ?? "",
    });
    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "File is unavailable right now." }, { status: 502 });
    }
    return new Response(res.body, {
      headers: {
        "Content-Type": a.mime,
        "Content-Disposition": `inline; filename="${encodeURIComponent(a.name)}"`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/attachments/[id] failed", err);
    return NextResponse.json({ error: "File is unavailable right now." }, { status: 503 });
  }
}
