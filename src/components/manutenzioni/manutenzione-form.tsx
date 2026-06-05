"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { PlusCircle } from "@/components/ui/plus-circle";
import { Input, Textarea, Select, FieldRow, Label } from "@/components/ui/field";
import { createManutenzione } from "@/actions/manutenzioni";
import { oggiISO, cn } from "@/lib/utils";
import type { MacchinaRef } from "@/lib/types";

export interface PezzoSelezione {
  id: string;
  codice: string;
  nome: string;
  quantita: number;
  macchineIds: string[];
}

interface ManutenzioneFormProps {
  macchine: MacchinaRef[];
  pezzi: PezzoSelezione[];
  variant?: ButtonVariant;
}

interface Riga {
  pezzo_id: string;
  quantita_usata: number;
}

export function ManutenzioneForm({
  macchine,
  pezzi,
  variant = "primary",
}: ManutenzioneFormProps) {
  const [open, setOpen] = useState(false);
  const [macchinaId, setMacchinaId] = useState("");
  const [data, setData] = useState(oggiISO());
  const [descrizione, setDescrizione] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [righe, setRighe] = useState<Riga[]>([]);
  const [mostraTutti, setMostraTutti] = useState(false);
  const [query, setQuery] = useState("");
  const [listaAperta, setListaAperta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pezziById = useMemo(
    () => new Map(pezzi.map((p) => [p.id, p])),
    [pezzi],
  );

  const disponibili = useMemo(() => {
    const added = new Set(righe.map((r) => r.pezzo_id));
    return pezzi.filter(
      (p) =>
        !added.has(p.id) &&
        (mostraTutti || !macchinaId || p.macchineIds.includes(macchinaId)),
    );
  }, [pezzi, righe, mostraTutti, macchinaId]);

  const risultati = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return disponibili.slice(0, 8);
    return disponibili
      .filter(
        (p) =>
          p.codice.toLowerCase().includes(q) ||
          p.nome.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [disponibili, query]);

  function reset() {
    setMacchinaId("");
    setData(oggiISO());
    setDescrizione("");
    setTecnico("");
    setRighe([]);
    setMostraTutti(false);
    setQuery("");
    setListaAperta(false);
    setError(null);
  }

  function apri() {
    reset();
    setOpen(true);
  }

  function scegli(id: string) {
    setRighe((prev) => [...prev, { pezzo_id: id, quantita_usata: 1 }]);
    setQuery("");
    setListaAperta(false);
  }

  function setQta(id: string, value: string) {
    const q = Math.max(1, Math.trunc(Number(value) || 1));
    setRighe((prev) =>
      prev.map((r) => (r.pezzo_id === id ? { ...r, quantita_usata: q } : r)),
    );
  }

  function rimuovi(id: string) {
    setRighe((prev) => prev.filter((r) => r.pezzo_id !== id));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createManutenzione({
        macchina_id: macchinaId,
        data,
        descrizione,
        tecnico,
        pezzi: righe,
      });
      if (res.ok) {
        setOpen(false);
        reset();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <Button variant={variant} onClick={apri}>
        <PlusCircle />
        Nuova manutenzione
      </Button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        size="lg"
        title="Nuova manutenzione"
        description="Registra un intervento e i pezzi utilizzati: la giacenza viene aggiornata in automatico."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Annulla
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending}>
              {pending ? "Salvo…" : "Registra intervento"}
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

          <FieldRow label="Macchina">
            <Select
              value={macchinaId}
              onChange={(e) => setMacchinaId(e.target.value)}
            >
              <option value="" disabled>
                Seleziona una macchina…
              </option>
              {macchine.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Data intervento">
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Tecnico (facoltativo)">
              <Input
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
                placeholder="es. Marco Rossi"
              />
            </FieldRow>
          </div>

          <FieldRow label="Descrizione intervento">
            <Textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Cosa è stato fatto…"
            />
          </FieldRow>

          {/* Pezzi utilizzati */}
          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label className="mb-0">Pezzi utilizzati</Label>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-muted">
                <input
                  type="checkbox"
                  checked={mostraTutti}
                  onChange={(e) => setMostraTutti(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-[var(--color-accent-strong)]"
                />
                Mostra tutti i pezzi
              </label>
            </div>

            {righe.length > 0 && (
              <ul className="mb-3 flex flex-col gap-2">
                {righe.map((r) => {
                  const p = pezziById.get(r.pezzo_id);
                  if (!p) return null;
                  const supera = r.quantita_usata > p.quantita;
                  return (
                    <li
                      key={r.pezzo_id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">
                          <span className="font-mono text-[12px] text-muted">
                            {p.codice}
                          </span>{" "}
                          · {p.nome}
                        </p>
                        <p
                          className={cn(
                            "text-[12px]",
                            supera ? "text-danger-ink" : "text-faint",
                          )}
                        >
                          Disponibili: {p.quantita}
                          {supera ? " — quantità superiore alla giacenza" : ""}
                        </p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={r.quantita_usata}
                        onChange={(e) => setQta(r.pezzo_id, e.target.value)}
                        className="h-10 w-[72px] rounded-xl border border-line bg-surface text-center text-[14px] font-medium text-ink focus:border-ink/20 focus:outline-none focus:ring-4 focus:ring-accent/30"
                      />
                      <button
                        type="button"
                        onClick={() => rimuovi(r.pezzo_id)}
                        aria-label="Rimuovi pezzo"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-danger-soft hover:text-danger-ink"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Ricerca pezzo */}
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setListaAperta(true);
                }}
                onFocus={() => setListaAperta(true)}
                onBlur={() => setTimeout(() => setListaAperta(false), 150)}
                placeholder="Cerca un pezzo per codice o nome…"
                className="h-11 w-full rounded-2xl border border-line bg-surface pl-10 pr-3.5 text-[14px] text-ink placeholder:text-faint focus:border-ink/20 focus:outline-none focus:ring-4 focus:ring-accent/30"
              />
            </div>

            {/* Risultati in-flow: non vengono tagliati dallo scroll del modale */}
            {listaAperta && (
              <div className="mt-2 max-h-56 overflow-auto rounded-2xl border border-line bg-surface py-1">
                {risultati.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-muted">
                    {disponibili.length === 0
                      ? "Nessun pezzo disponibile."
                      : "Nessun pezzo corrisponde alla ricerca."}
                  </p>
                ) : (
                  risultati.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        scegli(p.id);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0 truncate text-[14px] text-ink">
                        <span className="font-mono text-[12px] text-muted">
                          {p.codice}
                        </span>{" "}
                        · {p.nome}
                      </span>
                      <span className="shrink-0 text-[12px] text-faint">
                        disp. {p.quantita}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}
