"use client";

import { useState, useTransition } from "react";
import { Pencil, Boxes } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { PlusCircle } from "@/components/ui/plus-circle";
import { SquareTrigger } from "@/components/ui/square-trigger";
import { Input, FieldRow, Label } from "@/components/ui/field";
import { createPezzo, updatePezzo, type PezzoInput } from "@/actions/pezzi";
import { cn } from "@/lib/utils";
import type { MacchinaRef, PezzoConMacchine } from "@/lib/types";

interface PezzoFormProps {
  pezzo?: PezzoConMacchine;
  macchine: MacchinaRef[];
  variant?: ButtonVariant;
  square?: boolean;
}

export function PezzoForm({
  pezzo,
  macchine,
  variant = "primary",
  square = false,
}: PezzoFormProps) {
  const isEdit = Boolean(pezzo);
  const [open, setOpen] = useState(false);
  const [codice, setCodice] = useState(pezzo?.codice ?? "");
  const [nome, setNome] = useState(pezzo?.nome ?? "");
  const [quantita, setQuantita] = useState(String(pezzo?.quantita ?? 0));
  const [minima, setMinima] = useState(String(pezzo?.quantita_minima ?? 0));
  const [sel, setSel] = useState<Set<string>>(
    new Set(pezzo?.macchine.map((m) => m.id) ?? []),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apri() {
    setCodice(pezzo?.codice ?? "");
    setNome(pezzo?.nome ?? "");
    setQuantita(String(pezzo?.quantita ?? 0));
    setMinima(String(pezzo?.quantita_minima ?? 0));
    setSel(new Set(pezzo?.macchine.map((m) => m.id) ?? []));
    setError(null);
    setOpen(true);
  }

  function toggle(id: string) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    setError(null);
    const payload: PezzoInput = {
      codice,
      nome,
      quantita: Number(quantita),
      quantita_minima: Number(minima),
      macchineIds: [...sel],
    };
    startTransition(async () => {
      const res = isEdit
        ? await updatePezzo(pezzo!.id, payload)
        : await createPezzo(payload);
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
        <SquareTrigger icon={Boxes} label="Pezzo" onClick={apri} />
      ) : (
        <Button variant={variant} onClick={apri}>
          <PlusCircle />
          Nuovo pezzo
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        size="lg"
        title={isEdit ? "Modifica pezzo" : "Nuovo pezzo di ricambio"}
        description="Codice alfanumerico, giacenza e macchine compatibili."
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

          <FieldRow label="Codice">
            <Input
              autoFocus
              value={codice}
              onChange={(e) => setCodice(e.target.value)}
              placeholder="es. FLT-001"
              className="font-mono"
            />
          </FieldRow>

          <FieldRow label="Descrizione">
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Filtro olio"
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Giacenza" hint="Quantità attualmente in magazzino.">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={quantita}
                onChange={(e) => setQuantita(e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Soglia minima" hint="Sotto o uguale a questa → scorta bassa.">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={minima}
                onChange={(e) => setMinima(e.target.value)}
              />
            </FieldRow>
          </div>

          <div>
            <Label>Macchine compatibili</Label>
            {macchine.length === 0 ? (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[13px] text-muted">
                Nessuna macchina disponibile. Aggiungine una nella sezione{" "}
                <span className="font-medium text-ink">Macchine</span>.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {macchine.map((m) => {
                  const on = sel.has(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                        on
                          ? "border-accent-strong bg-accent text-accent-ink"
                          : "border-line bg-surface text-muted hover:border-ink/20 hover:text-ink",
                      )}
                    >
                      {m.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}
