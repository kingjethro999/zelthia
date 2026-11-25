import { NextResponse, connection } from "next/server";
import { getSessionContext } from "@/lib/server/auth";
import { assertSameOrigin, handle, readJson } from "@/lib/server/api";
import {
  deleteConversation,
  getConversation,
  getMessages,
  renameConversation,
} from "@/lib/server/conversations";
import { deletePrivate } from "@/lib/server/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  try {
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json(
        { error: "Sign in to see this chat." },
        { status: 401 },
      );
    const { id } = await params;
    const conv = await getConversation(id, ctx.user.id, ctx.dek);
    if (!conv)
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json(
      { conversation: conv, messages: await getMessages(conv.id, ctx.user.id, ctx.dek) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/conversations/[id] failed", err);
    return NextResponse.json(
      { error: "Couldn't load this chat." },
      { status: 503 },
    );
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { id } = await params;
    const body = await readJson(req);
    const title = typeof body.title === "string" ? body.title : "";
    if (!title.trim())
      return NextResponse.json({ error: "Enter a title." }, { status: 400 });
    const ok = await renameConversation(id, ctx.user.id, title, ctx.dek);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Chat not found." }, { status: 404 });
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return handle("PATCH /api/conversations/[id]", err);
    }
    console.error("PATCH /api/conversations/[id] failed", err);
    return NextResponse.json(
      { error: "Couldn't rename this chat." },
      { status: 503 },
    );
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { id } = await params;
    const files = await deleteConversation(id, ctx.user.id);
    await Promise.allSettled(
      files.map((f) =>
        deletePrivate({
          storageId: f.storage_id,
          resourceType: f.resource_type,
          format: f.format,
        }),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return handle("DELETE /api/conversations/[id]", err);
    }
    console.error("DELETE /api/conversations/[id] failed", err);
    return NextResponse.json(
      { error: "Couldn't delete this chat." },
      { status: 503 },
    );
  }
}
