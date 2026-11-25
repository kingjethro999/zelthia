"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Download,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { useSession } from "@/lib/store/session";
import type { BiometricProfile } from "@/lib/ai/types";
import {
  AboutFields,
  BodyFields,
  HistoryFields,
  NotesField,
} from "./ProfileSections";

export function AccountView() {
  const router = useRouter();
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/signin?next=/account");
  }, [status, user, router]);

  if (status !== "ready" || !user) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-muted">
        Loading your account…
      </div>
    );
  }
  return <AccountForm />;
}

function AccountForm() {
  const router = useRouter();
  const {
    user,
    profile,
    saveProfile,
    signOut,
    revokeOtherSessions,
    deleteAccount,
  } = useSession();
  const [draft, setDraft] = useState<BiometricProfile>(profile);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const patch = (p: Partial<BiometricProfile>) =>
    setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    setSaving(true);
    const res = await saveProfile(draft, { name });
    setSaving(false);
    setNotice(
      res.ok
        ? { ok: true, text: "Profile saved" }
        : { ok: false, text: res.error ?? "Profile not saved" },
    );
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not export your data.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "zelthia-my-data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice({ ok: true, text: "Downloaded a copy of your data." });
    } catch (err) {
      setNotice({
        ok: false,
        text: (err as Error).message || "Could not export your data.",
      });
    } finally {
      setExporting(false);
    }
  };

  const revokeOthers = async () => {
    setRevoking(true);
    const res = await revokeOtherSessions();
    setRevoking(false);
    setNotice(
      res.ok
        ? {
            ok: true,
            text:
              res.revoked && res.revoked > 0
                ? `Signed out ${res.revoked} other session${res.revoked === 1 ? "" : "s"}.`
                : "No other active sessions found.",
          }
        : { ok: false, text: res.error ?? "Could not sign out other devices." },
    );
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
    {
      title: "Body measurements",
      body: <BodyFields profile={draft} patch={patch} />,
    },
    {
      title: "Health history",
      body: <HistoryFields profile={draft} patch={patch} />,
    },
    { title: "Notes", body: <NotesField profile={draft} patch={patch} /> },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">
            Your account
          </h1>
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

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/25 bg-brand-soft/45 p-4 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
        <div>
          <p className="font-semibold text-ink">
            Protected with password-locked encryption
          </p>
          <p className="mt-0.5 text-muted">
            Your health profile, saved chats and uploaded notes are encrypted
            with a key locked to your password. They are never stored as plain
            text in our database and cannot be read by Zelthia staff.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <TextField
            label="Name"
            placeholder="e.g. Chidi Eze"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={UserRound}
            className="max-w-md"
          />
        </section>
        {sections.map((s) => (
          <section
            key={s.title}
            className="rounded-3xl border border-line bg-surface p-5 sm:p-7"
          >
            <h2 className="mb-5 font-display text-xl font-semibold text-ink">
              {s.title}
            </h2>
            {s.body}
          </section>
        ))}

        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
            <ShieldCheck className="h-5 w-5 text-brand" aria-hidden />
            Privacy and sessions
          </h2>
          <p className="mt-1 text-sm text-muted">
            Download a copy of your decrypted profile and chat history, or sign
            out of other browsers and devices.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              loading={exporting}
              onClick={exportData}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download my data
            </Button>
            <Button
              variant="secondary"
              loading={revoking}
              onClick={revokeOthers}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out other devices
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-alert/25 p-5 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-ink">
            Delete account
          </h2>
          <p className="mt-1 text-sm text-muted">
            Permanently removes your account, encrypted health profile, chats
            and uploaded files from Zelthia.
          </p>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete account
          </Button>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-line bg-paper px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface sm:shadow-lg">
        {notice && (
          <p
            role="status"
            className={`mr-auto flex items-center gap-1.5 text-sm ${notice.ok ? "text-brand" : "text-alert"}`}
          >
            {notice.ok ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4" aria-hidden />
            )}
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
        description="Your account, encrypted health profile, chats, uploaded files and sign-in sessions are erased. This can't be undone."
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
