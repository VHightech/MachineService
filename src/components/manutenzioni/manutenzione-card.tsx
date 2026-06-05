import { User } from "lucide-react";
import { parseData } from "@/lib/utils";
import type { ManutenzioneCompleta } from "@/lib/types";

interface ManutenzioneCardProps {
  manutenzione: ManutenzioneCompleta;
  actions?: React.ReactNode;
  hideMacchina?: boolean;
}

export function ManutenzioneCard({
  manutenzione: m,
  actions,
  hideMacchina = false,
}: ManutenzioneCardProps) {
  const d = parseData(m.data);

  return (
    <article className="panel flex gap-4 p-4">
      {/* Colonna data */}
      <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl bg-surface-2">
        <span className="font-display text-[22px] font-semibold leading-none text-ink tabular-nums">
          {d.giorno}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          {d.meseAbbr}
        </span>
      </div>

      {/* Contenuto */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {!hideMacchina && (
              <p className="truncate font-display text-[16px] font-semibold tracking-tight text-ink">
                {m.macchina?.nome ?? "Macchina rimossa"}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted">
              <span>{d.meseAnno}</span>
              {m.tecnico && (
                <span className="inline-flex items-center gap-1">
                  <User size={13} />
                  {m.tecnico}
                </span>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink/75">
          {m.descrizione}
        </p>

        {m.pezzi.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {m.pezzi.map((pp) => (
              <span
                key={pp.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pl-2.5 pr-1.5 text-[12px]"
              >
                <span className="font-mono text-[11px] text-muted">
                  {pp.pezzo_codice}
                </span>
                <span className="text-ink">{pp.pezzo_nome}</span>
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink tabular-nums">
                  ×{pp.quantita_usata}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
