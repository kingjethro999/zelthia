"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Info } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { usePresence } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/Choice";
import { useSession } from "@/lib/store/session";
import type { BiometricProfile } from "@/lib/ai/types";
import { AboutFields, BodyFields, HistoryFields, NotesField } from "@/components/profile/ProfileSections";

type Tab = "about" | "body" | "history" | "notes";

export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Stay mounted through the exit so the sheet leaves the way it came; a
  // fresh open after that starts from a clean draft.
  const { mounted } = usePresence(open);
  if (!mounted) return null;
  return <ProfileSheetInner open={open} onClose={onClose} />;
}

function ProfileSheetInner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, user, saveProfile } = useSession();
  const [draft, setDraft] = useState<BiometricProfile>(profile);
  const [tab, setTab] = useState<Tab>("history");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const patch = (p: Partial<BiometricProfile>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await saveProfile(draft);
    setSaving(false);
    if (res.ok) onClose();
    else setError(res.error ?? "Profile not saved");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="sheet"
      title="Your health profile"
      description="Zelthia checks every answer against this."
      footer={
        <>
          {error && (
            <p role="alert" className="mr-auto flex items-center gap-1.5 text-sm text-alert">
              <AlertCircle className="h-4 w-4" aria-hidden />
              {error}
            </p>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save profile
          </Button>
        </>
      }
    >
      {!user && (
        <p className="mb-5 flex items-start gap-2 rounded-xl bg-mist p-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Saved on this device only.{" "}
            <Link href="/signup" className="font-semibold text-brand underline-offset-4 hover:underline">
              Create an account
            </Link>{" "}
            to keep it everywhere.
          </span>
        </p>
      )}
      <ChoiceGroup<Tab>
        label="Profile section"
        hideLabel
        variant="pills"
        value={tab}
        onChange={setTab}
        options={[
          { value: "history", label: "History" },
          { value: "about", label: "About" },
          { value: "body", label: "Body" },
          { value: "notes", label: "Notes" },
        ]}
        className="mb-6"
      />
      <div key={tab} className="animate-rise">
        {tab === "about" && <AboutFields profile={draft} patch={patch} />}
        {tab === "body" && <BodyFields profile={draft} patch={patch} />}
        {tab === "history" && <HistoryFields profile={draft} patch={patch} />}
        {tab === "notes" && <NotesField profile={draft} patch={patch} />}
      </div>
    </Dialog>
  );
}
