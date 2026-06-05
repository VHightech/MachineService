"use client";

import { useState, useTransition } from "react";
import { Wrench } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ManutenzioneCard } from "@/components/manutenzioni/manutenzione-card";
import { caricaStoricoMacchina } from "@/actions/storico";
import { cn } from "@/lib/utils";
import type { ManutenzioneCompleta } from "@/lib/types";

interface StoricoMacchinaProps {
  macchinaId: string;
  nomeMacchina: string;
  count: number;
}

export function StoricoMacchina({
  macchinaId,
  nomeMacchina,
  count,
}: StoricoMacchinaProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ManutenzioneCompleta[] | null>(null);
  const [pending, startTransition] = useTransition();

  function apri() {
    setOpen(true);
    setItems(null);
    startTransition(async () => {
      try {
        setItems(await caricaStoricoMacchina(macchinaId));
      } catch {
        setItems([]);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={apri}
        title="Vedi lo storico interventi"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors",
          count > 0
            ? "bg-accent-soft text-accent-ink hover:bg-accent"
            : "bg-surface-2 text-muted hover:bg-line",
        )}
      >
        {count} manutenzioni
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={`Storico — ${nomeMacchina}`}
        description="Interventi registrati su questa macchina."
      >
        {pending || items === null ? (
          <p className="py-10 text-center text-[14px] text-muted">
            Carico lo storico…
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
              <Wrench size={22} />
            </span>
            <p className="text-[14px] font-medium text-ink">
              Nessun intervento
            </p>
            <p className="text-[13px] text-muted">
              Non ci sono manutenzioni registrate per questa macchina.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((m) => (
              <li key={m.id}>
                <ManutenzioneCard manutenzione={m} hideMacchina />
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
