"use client";

import { useState, useTransition } from "react";
import { Pencil, Factory } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { PlusCircle } from "@/components/ui/plus-circle";
import { SquareTrigger } from "@/components/ui/square-trigger";
import { Input, Textarea, FieldRow } from "@/components/ui/field";
import { createMacchina, updateMacchina } from "@/actions/macchine";
import type { Macchina } from "@/lib/types";

interface MacchinaFormProps {
  macchina?: Macchina;
  variant?: ButtonVariant;
  square?: boolean;
}

export function MacchinaForm({
  macchina,
  variant = "primary",
  square = false,
}: MacchinaFormProps) {
  const isEdit = Boolean(macchina);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(macchina?.nome ?? "");
  const [note, setNote] = useState(macchina?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apri() {
    setNome(macchina?.nome ?? "");
    setNote(macchina?.note ?? "");
    setError(null);
    setOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateMacchina(macchina!.id, { nome, note })
        : await createMacchina({ nome, note });
      if (res.ok) setOpen(false);
      else setError(res.error);
    });
  }

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={apri}
          aria-label="Modifica"
          className="grid h-9 w-9 place-items-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Pencil size={16} />
        </button>
      ) : square ? (
        <SquareTrigger icon={Factory} label="Macchina" onClick={apri} />
      ) : (
        <Button variant={variant} onClick={apri}>
          <PlusCircle />
          Nuova macchina
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={isEdit ? "Modifica macchina" : "Nuova macchina"}
        description="Inserisci il nome della macchina; la nota è facoltativa."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Annulla
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending}>
              {pending ? "Salvo…" : "Salva"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="rounded-2xl bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger-ink">
              {error}
            </p>
          )}
          <FieldRow label="Nome macchina">
            <Input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Tornio CNC Mazak"
            />
          </FieldRow>
          <FieldRow label="Nota (facoltativa)">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="es. Reparto 1, numero di matricola…"
            />
          </FieldRow>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}
