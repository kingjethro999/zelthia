import { NextResponse, connection } from "next/server";
import { endSession, getSessionUser } from "@/lib/server/auth";
import { getProfile, sanitizeProfile, saveProfile } from "@/lib/server/profile";
import { query } from "@/lib/server/db";
import { deletePrivate } from "@/lib/server/storage";

/** Save the health profile; `complete: true` marks account setup as finished. */
export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in to save your profile." },
        { status: 401 },
      );
    }
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
    }
    const profile = sanitizeProfile(body.profile);
    await saveProfile(user.id, profile);

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length >= 2 && name.length <= 80) {
      await query("update users set name = $1 where id = $2", [name, user.id]);
      user.name = name;
    }
    if (body.complete === true && !user.onboarded) {
      await query("update users set onboarded_at = now() where id = $1", [
        user.id,
      ]);
      user.onboarded = true;
    }
    return NextResponse.json({ user, profile });
  } catch (err) {
    console.error("PUT /api/account failed", err);
    return NextResponse.json(
      {
        error:
          "Your profile wasn't saved. Check your connection and try again.",
      },
      { status: 503 },
    );
  }
}

export async function GET() {
  await connection();
  try {
    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    return NextResponse.json({ user, profile: await getProfile(user.id) });
  } catch (err) {
    console.error("GET /api/account failed", err);
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 },
    );
  }
}

/** Permanently deletes the account, its sessions and its health profile. */
export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const files = await query<{
      storage_id: string;
      resource_type: string;
      format: string;
    }>(
      "select storage_id, resource_type, format from attachments where user_id = $1 and storage_id is not null",
      [user.id],
    );
    await endSession();
    await query("delete from users where id = $1", [user.id]);
    // Uploaded documents are health data: remove them from storage too.
    const results = await Promise.allSettled(
      files.map((f) =>
        deletePrivate({
          storageId: f.storage_id,
          resourceType: f.resource_type,
          format: f.format,
        }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed)
      console.error(
        `Account deleted but ${failed} stored file(s) failed to delete`,
        user.id,
      );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/account failed", err);
    return NextResponse.json(
      { error: "Account deletion failed. Try again." },
      { status: 503 },
    );
  }
}
