import { Boxes, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { PezzoForm } from "@/components/magazzino/pezzo-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { SetupNeeded } from "@/components/setup-needed";
import { DataError } from "@/components/data-error";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getMacchineRefs, getPezziConMacchine } from "@/lib/queries";
import { deletePezzo } from "@/actions/pezzi";
import { type MacchinaRef, type PezzoConMacchine } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const COLS = "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_150px_84px]";

export default async function MagazzinoPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded />;

  let pezzi: PezzoConMacchine[];
  let macchine: MacchinaRef[];
  try {
    [pezzi, macchine] = await Promise.all([
      getPezziConMacchine(),
      getMacchineRefs(),
    ]);
  } catch (e) {
    return <DataError message={e instanceof Error ? e.message : "Errore"} />;
  }

  const esauriti = pezzi.filter((p) => p.quantita === 0).length;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Pezzi di ricambio"
        title="Magazzino"
        description={
          pezzi.length > 0
            ? `${pezzi.length} pezzi a catalogo${esauriti > 0 ? ` · ${esauriti} esauriti` : ""}.`
            : "Inserisci qui i pezzi di ricambio in tuo possesso."
        }
        actions={
          <>
            {pezzi.length > 0 && (
              <a
                href="/api/export/magazzino"
                className={buttonStyles({ variant: "outline" })}
              >
                <FileSpreadsheet size={16} />
                Esporta Excel
              </a>
            )}
            <PezzoForm macchine={macchine} />
          </>
        }
      />

      {pezzi.length === 0 ? (
        <Card>
          <EmptyState
            icon={Boxes}
            title="Magazzino vuoto"
            description="Aggiungi il primo pezzo: codice alfanumerico, giacenza, soglia minima e le macchine compatibili."
            action={<PezzoForm macchine={macchine} />}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          {/* Intestazione colonne (desktop) */}
          <div
            className={cn(
              "hidden gap-3 border-b border-line bg-surface-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint md:grid",
              COLS,
            )}
          >
            <span>Pezzo</span>
            <span>Macchine compatibili</span>
            <span>Giacenza</span>
            <span className="text-right">Azioni</span>
          </div>

          <ul className="divide-y divide-line">
            {pezzi.map((p) => {
              const esaurito = p.quantita === 0;
              return (
                <li
                  key={p.id}
                  className={cn(
                    "grid grid-cols-1 items-center gap-3 px-4 py-4 sm:px-5",
                    COLS,
                  )}
                >
                  {/* Pezzo */}
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 rounded-lg bg-ink/[0.06] px-2 py-1 font-mono text-[12px] font-medium text-ink">
                      {p.codice}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-ink">
                        {p.nome}
                      </p>
                    </div>
                  </div>

                  {/* Macchine */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.macchine.length > 0 ? (
                      p.macchine.map((m) => (
                        <span
                          key={m.id}
                          className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-muted"
                        >
                          {m.nome}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] text-faint">
                        Nessuna associazione
                      </span>
                    )}
                  </div>

                  {/* Giacenza */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "font-display text-[22px] font-semibold leading-none tabular-nums",
                        esaurito ? "text-danger-ink" : "text-ink",
                      )}
                    >
                      {p.quantita}
                    </span>
                    {esaurito && (
                      <Badge tone="danger" dot>
                        Esaurito
                      </Badge>
                    )}
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center justify-end gap-0.5">
                    <PezzoForm pezzo={p} macchine={macchine} />
                    <ConfirmDelete
                      action={deletePezzo.bind(null, p.id)}
                      title="Elimina pezzo"
                      description={`Il pezzo "${p.codice} — ${p.nome}" verrà rimosso dal magazzino.`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
