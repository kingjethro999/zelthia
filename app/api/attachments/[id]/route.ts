import { NextResponse, connection } from "next/server";
import { getSessionContext } from "@/lib/server/auth";
import { getOwnedAttachment } from "@/lib/server/conversations";
import { aadAttachmentFile, decryptBytes, isEncryptedBytes } from "@/lib/server/crypto";
import { downloadPrivate } from "@/lib/server/storage";

/** Streams a private attachment to its owner only, decrypting user-encrypted blobs on the fly. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  try {
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json(
        { error: "Sign in to view this file." },
        { status: 401 },
      );
    const { id } = await params;
    const a = await getOwnedAttachment(id, ctx.user.id);
    if (!a?.storage_id || !a.resource_type) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    const res = await downloadPrivate({
      storageId: a.storage_id,
      resourceType: a.resource_type,
      format: a.format ?? "",
    });
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "File is unavailable right now." },
        { status: 502 },
      );
    }

    const raw = Buffer.from(await res.arrayBuffer());
    const payload =
      a.encrypted || isEncryptedBytes(raw)
        ? decryptBytes(raw, ctx.dek, aadAttachmentFile(ctx.user.id, id))
        : raw;

    return new Response(new Uint8Array(payload), {
      headers: {
        "Content-Type": a.mime,
        "Content-Disposition": `inline; filename="${encodeURIComponent(a.name)}"`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/attachments/[id] failed", err);
    return NextResponse.json(
      { error: "File is unavailable right now." },
      { status: 503 },
    );
  }
}
