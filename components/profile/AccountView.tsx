"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, LogOut, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { useSession } from "@/lib/store/session";
import type { BiometricProfile } from "@/lib/ai/types";
import { AboutFields, BodyFields, HistoryFields, NotesField } from "./ProfileSections";

export function AccountView() {
  const router = useRouter();
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/signin?next=/account");
  }, [status, user, router]);

  if (status !== "ready" || !user) {
    return <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-muted">Loading your account…</div>;
  }
  return <AccountForm />;
}

function AccountForm() {
  const router = useRouter();
  const { user, profile, saveProfile, signOut, deleteAccount } = useSession();
  const [draft, setDraft] = useState<BiometricProfile>(profile);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const patch = (p: Partial<BiometricProfile>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    setSaving(true);
    const res = await saveProfile(draft, { name });
    setSaving(false);
    setNotice(res.ok ? { ok: true, text: "Profile saved" } : { ok: false, text: res.error ?? "Profile not saved" });
  };

  const remove = async () => {
    setDeleting(true);
    const res = await deleteAccount();
    setDeleting(false);
    if (res.ok) router.replace("/");
    else setNotice({ ok: false, text: res.error ?? "Account not deleted" });
  };

  if (!user) return null;

  const sections = [
    { title: "About you", body: <AboutFields profile={draft} patch={patch} /> },
    { title: "Body measurements", body: <BodyFields profile={draft} patch={patch} /> },
    { title: "Health history", body: <HistoryFields profile={draft} patch={patch} /> },
    { title: "Notes", body: <NotesField profile={draft} patch={patch} /> },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">Your account</h1>
          <p className="mt-1 text-muted">{user.email}</p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <TextField label="Name" placeholder="e.g. Chidi Eze" value={name} onChange={(e) => setName(e.target.value)} icon={UserRound} className="max-w-md" />
        </section>
        {sections.map((s) => (
          <section key={s.title} className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-ink">{s.title}</h2>
            {s.body}
          </section>
        ))}

        <section className="rounded-3xl border border-alert/25 p-5 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-ink">Delete account</h2>
          <p className="mt-1 text-sm text-muted">
            Permanently removes your account and health profile from Zelthia.
          </p>
          <Button variant="danger" className="mt-4" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete account
          </Button>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-line bg-paper px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface sm:shadow-lg">
        {notice && (
          <p role="status" className={`mr-auto flex items-center gap-1.5 text-sm ${notice.ok ? "text-brand" : "text-alert"}`}>
            {notice.ok ? <Check className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />}
            {notice.text}
          </p>
        )}
        <Button onClick={save} loading={saving} size="lg">
          Save changes
        </Button>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        description="Your account, health profile and sign-in sessions are erased. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep account
            </Button>
            <Button variant="danger" loading={deleting} onClick={remove}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete account
            </Button>
          </>
        }
      />
    </div>
  );
}
