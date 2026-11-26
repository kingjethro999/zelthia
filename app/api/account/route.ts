import { NextResponse, connection } from "next/server";
import {
  endSession,
  getSessionContext,
  setUserProcessingRestriction,
  toSessionUser,
} from "@/lib/server/auth";
import { assertJson, assertSameOrigin, handle } from "@/lib/server/api";
import { getProfile, sanitizeProfile, saveProfile } from "@/lib/server/profile";
import { query } from "@/lib/server/db";
import { deletePrivate } from "@/lib/server/storage";

/** Save the health profile; `complete: true` marks account setup as finished. */
export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);
    assertJson(req);
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json(
        { error: "Sign in to save your profile." },
        { status: 401 },
      );
    }
    const { user, dek } = ctx;
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
    }
    let activeUser = user;
    if (typeof body.processingRestricted === "boolean") {
      const updated = await setUserProcessingRestriction(
        user.id,
        body.processingRestricted,
      );
      if (updated) activeUser = toSessionUser(updated);
      if (body.profile === undefined && typeof body.name !== "string") {
        return NextResponse.json({
          user: activeUser,
          profile: await getProfile(user.id, dek),
        });
      }
    }

    if (activeUser.processingRestricted) {
      return NextResponse.json(
        {
          error:
            "Processing restriction is active (DPA 2018 s. 47 / UK GDPR Art. 18). Lift the restriction in Privacy settings before modifying stored records.",
        },
        { status: 409 },
      );
    }

    const profile = sanitizeProfile(body.profile);
    await saveProfile(user.id, profile, dek);

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length >= 2 && name.length <= 80) {
      await query("update users set name = $1 where id = $2", [name, user.id]);
      activeUser = { ...activeUser, name };
    }
    if (body.complete === true && !activeUser.onboarded) {
      await query("update users set onboarded_at = now() where id = $1", [
        user.id,
      ]);
      activeUser = { ...activeUser, onboarded: true };
    }
    return NextResponse.json({ user: activeUser, profile });
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return handle("PUT /api/account", err);
    }
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
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    return NextResponse.json({
      user: ctx.user,
      profile: await getProfile(ctx.user.id, ctx.dek),
    });
  } catch (err) {
    console.error("GET /api/account failed", err);
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 },
    );
  }
}

/** Permanently deletes the account, its sessions and its health profile. */
export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { user } = ctx;
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
    if (err instanceof Error && "status" in err) {
      return handle("DELETE /api/account", err);
    }
    console.error("DELETE /api/account failed", err);
    return NextResponse.json(
      { error: "Account deletion failed. Try again." },
      { status: 503 },
    );
  }
}
