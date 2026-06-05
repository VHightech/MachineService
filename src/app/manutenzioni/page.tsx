import { Wrench, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { ManutenzioneForm } from "@/components/manutenzioni/manutenzione-form";
import { ManutenzioneCard } from "@/components/manutenzioni/manutenzione-card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { SetupNeeded } from "@/components/setup-needed";
import { DataError } from "@/components/data-error";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getMacchineRefs,
  getManutenzioniComplete,
  getPezziPerSelezione,
} from "@/lib/queries";
import { deleteManutenzione } from "@/actions/manutenzioni";
import { parseData } from "@/lib/utils";
import type { ManutenzioneCompleta, MacchinaRef } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Gruppo {
  chiave: string;
  label: string;
  items: ManutenzioneCompleta[];
}

/** Raggruppa per mese mantenendo l'ordine (già desc per data). */
function raggruppaPerMese(manutenzioni: ManutenzioneCompleta[]): Gruppo[] {
  const gruppi: Gruppo[] = [];
  for (const m of manutenzioni) {
    const { chiaveMese, meseAnno } = parseData(m.data);
    const ultimo = gruppi[gruppi.length - 1];
    if (ultimo && ultimo.chiave === chiaveMese) ultimo.items.push(m);
    else gruppi.push({ chiave: chiaveMese, label: meseAnno, items: [m] });
  }
  return gruppi;
}

export default async function ManutenzioniPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded />;

  let manutenzioni: ManutenzioneCompleta[];
  let macchine: MacchinaRef[];
  let pezzi: Awaited<ReturnType<typeof getPezziPerSelezione>>;
  try {
    [manutenzioni, macchine, pezzi] = await Promise.all([
      getManutenzioniComplete(),
      getMacchineRefs(),
      getPezziPerSelezione(),
    ]);
  } catch (e) {
    return <DataError message={e instanceof Error ? e.message : "Errore"} />;
  }

  const noMacchine = macchine.length === 0;
  const gruppi = raggruppaPerMese(manutenzioni);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Storico interventi"
        title="Manutenzioni"
        description="La cronologia completa degli interventi e dei pezzi utilizzati."
        actions={
          <>
            {manutenzioni.length > 0 && (
              <a
                href="/api/export/manutenzioni"
                className={buttonStyles({ variant: "outline" })}
              >
                <FileSpreadsheet size={16} />
                Esporta Excel
              </a>
            )}
            {!noMacchine && <ManutenzioneForm macchine={macchine} pezzi={pezzi} />}
          </>
        }
      />

      {noMacchine ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title="Aggiungi prima una macchina"
            description="Per registrare una manutenzione ti serve almeno una macchina in anagrafica."
            action={
              <Link href="/macchine" className={buttonStyles({ variant: "primary" })}>
                Vai a Macchine
              </Link>
            }
          />
        </Card>
      ) : manutenzioni.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title="Nessuna manutenzione registrata"
            description="Registra il primo intervento: seleziona la macchina, descrivi il lavoro e indica i pezzi utilizzati."
            action={<ManutenzioneForm macchine={macchine} pezzi={pezzi} />}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {gruppi.map((g) => (
            <section key={g.chiave}>
              <div className="mb-2.5 flex items-center gap-3">
                <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {g.label}
                </h2>
                <span className="text-[12px] text-faint">
                  {g.items.length}{" "}
                  {g.items.length === 1 ? "intervento" : "interventi"}
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <div className="flex flex-col gap-2.5">
                {g.items.map((m) => (
                  <div key={m.id} id={`m-${m.id}`} className="scroll-mt-6">
                    <ManutenzioneCard
                      manutenzione={m}
                      actions={
                        <ConfirmDelete
                          action={deleteManutenzione.bind(null, m.id)}
                          title="Elimina manutenzione"
                          description="L'intervento verrà eliminato e i pezzi utilizzati torneranno in giacenza."
                        />
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
