import { NextResponse, connection } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
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
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in to see this chat." }, { status: 401 });
    const { id } = await params;
    const conv = await getConversation(id, user.id);
    if (!conv) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json(
      { conversation: conv, messages: await getMessages(conv.id) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/conversations/[id] failed", err);
    return NextResponse.json({ error: "Couldn't load this chat." }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title : "";
    if (!title.trim()) return NextResponse.json({ error: "Enter a title." }, { status: 400 });
    const ok = await renameConversation(id, user.id, title);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Chat not found." }, { status: 404 });
  } catch (err) {
    console.error("PATCH /api/conversations/[id] failed", err);
    return NextResponse.json({ error: "Couldn't rename this chat." }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { id } = await params;
    const files = await deleteConversation(id, user.id);
    await Promise.allSettled(
      files.map((f) =>
        deletePrivate({ storageId: f.storage_id, resourceType: f.resource_type, format: f.format }),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/conversations/[id] failed", err);
    return NextResponse.json({ error: "Couldn't delete this chat." }, { status: 503 });
  }
}
