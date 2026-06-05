import { Factory } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { MacchinaForm } from "@/components/macchine/macchina-form";
import { StoricoMacchina } from "@/components/macchine/storico-macchina";
import { ConfirmDelete } from "@/components/confirm-delete";
import { SetupNeeded } from "@/components/setup-needed";
import { DataError } from "@/components/data-error";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getMacchineConStat, type MacchinaConStat } from "@/lib/queries";
import { deleteMacchina } from "@/actions/macchine";

export const dynamic = "force-dynamic";

export default async function MacchinePage() {
  if (!isSupabaseConfigured()) return <SetupNeeded />;

  let macchine: MacchinaConStat[];
  try {
    macchine = await getMacchineConStat();
  } catch (e) {
    return <DataError message={e instanceof Error ? e.message : "Errore"} />;
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Anagrafica"
        title="Macchine"
        description="L'elenco delle macchine su cui esegui le manutenzioni."
        actions={<MacchinaForm />}
      />

      {macchine.length === 0 ? (
        <Card>
          <EmptyState
            icon={Factory}
            title="Nessuna macchina"
            description="Aggiungi le tue macchine: ti serviranno per registrare manutenzioni e associare i pezzi di ricambio."
            action={<MacchinaForm />}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {macchine.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-ink">
                  <Factory size={19} strokeWidth={2.1} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[16px] font-semibold tracking-tight text-ink">
                    {m.nome}
                  </p>
                  {m.note && (
                    <p className="mt-0.5 truncate text-[13px] text-muted">{m.note}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{m.nPezzi} pezzi</Badge>
                  <StoricoMacchina
                    macchinaId={m.id}
                    nomeMacchina={m.nome}
                    count={m.nManutenzioni}
                  />
                </div>

                <div className="flex items-center gap-0.5 sm:pl-2">
                  <MacchinaForm macchina={m} />
                  <ConfirmDelete
                    action={deleteMacchina.bind(null, m.id)}
                    title="Elimina macchina"
                    description={`Verranno eliminate anche le manutenzioni e le associazioni collegate a "${m.nome}".`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
