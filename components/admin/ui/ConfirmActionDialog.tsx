"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextArea, TextField } from "@/components/ui/Field";

/**
 * Confirmation dialog reserved for genuinely destructive admin actions.
 * Supports optional reason capture and typed confirmation string.
 */
export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  requireReason = false,
  reasonLabel = "Audit reason",
  reasonPlaceholder = "Briefly explain why this action is being taken",
  confirmText,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmText?: string;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const resetAndClose = () => {
    setReason("");
    setTyped("");
    setErr(null);
    onClose();
  };

  const handleConfirm = async () => {
    const cleanReason = reason.trim();
    if (requireReason && cleanReason.length < 3) {
      setErr("Enter a brief reason (at least 3 characters).");
      return;
    }
    if (confirmText && typed.trim() !== confirmText) {
      setErr(`Type "${confirmText}" exactly to continue.`);
      return;
    }
    setErr(null);
    await onConfirm(cleanReason);
    setReason("");
    setTyped("");
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={resetAndClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-2xl border border-alert/25 bg-alert-soft p-3 text-xs leading-relaxed text-alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            This action is permanent and will be recorded in the administrator
            audit log.
          </span>
        </div>

        {requireReason && (
          <TextArea
            label={reasonLabel}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (err) setErr(null);
            }}
            placeholder={reasonPlaceholder}
            rows={3}
          />
        )}

        {confirmText && (
          <TextField
            label={`Type "${confirmText}" to confirm`}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              if (err) setErr(null);
            }}
            placeholder={confirmText}
          />
        )}

        {err && <p className="text-xs font-medium text-alert">{err}</p>}
      </div>
    </Dialog>
  );
}
