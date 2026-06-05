"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/actions/types";

interface ConfirmDeleteProps {
  action: () => Promise<ActionResult>;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Se presente mostra un bottone testuale, altrimenti un'icona cestino. */
  triggerLabel?: string;
}

export function ConfirmDelete({
  action,
  title,
  description,
  confirmLabel = "Elimina",
  triggerLabel,
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.ok) setOpen(false);
      else setError(res.error);
    });
  }

  return (
    <>
      {triggerLabel ? (
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          <Trash2 size={15} />
          {triggerLabel}
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Elimina"
          className="grid h-9 w-9 place-items-center rounded-full text-faint transition-colors hover:bg-danger-soft hover:text-danger-ink"
        >
          <Trash2 size={16} />
        </button>
      )}

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={title}
        description={description}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Annulla
            </Button>
            <Button variant="dangerSolid" onClick={handleConfirm} disabled={pending}>
              {pending ? "Elimino…" : confirmLabel}
            </Button>
          </>
        }
      >
        {error && (
          <p className="mb-3 rounded-2xl bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger-ink">
            {error}
          </p>
        )}
        <p className="text-[14px] text-muted">
          Questa azione non può essere annullata.
        </p>
      </Modal>
    </>
  );
}
