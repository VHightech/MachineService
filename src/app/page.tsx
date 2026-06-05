import Link from "next/link";
import {
  Factory,
  Boxes,
  Wrench,
  CheckCircle2,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MacchinaForm } from "@/components/macchine/macchina-form";
import { PezzoForm } from "@/components/magazzino/pezzo-form";
import { ManutenzioneForm } from "@/components/manutenzioni/manutenzione-form";
import { SetupNeeded } from "@/components/setup-needed";
import { DataError } from "@/components/data-error";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getDashboardData,
  getMacchineRefs,
  getPezziPerSelezione,
  type DashboardData,
} from "@/lib/queries";
import { formatDataIt } from "@/lib/utils";
import type { MacchinaRef } from "@/lib/types";

export const dynamic = "force-dynamic";

const STAT_TONE = "text-accent-ink bg-accent-soft";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded />;

  let data: DashboardData;
  let macchine: MacchinaRef[];
  let pezzi: Awaited<ReturnType<typeof getPezziPerSelezione>>;
  try {
    [data, macchine, pezzi] = await Promise.all([
      getDashboardData(),
      getMacchineRefs(),
      getPezziPerSelezione(),
    ]);
  } catch (e) {
    return <DataError message={e instanceof Error ? e.message : "Errore"} />;
  }

  const stats = [
    { label: "Macchine", value: data.totali.macchine, icon: Factory, href: "/macchine" },
    { label: "Pezzi in magazzino", value: data.totali.pezzi, icon: Boxes, href: "/magazzino" },
    { label: "Manutenzioni", value: data.totali.manutenzioni, icon: Wrench, href: "/manutenzioni" },
  ];

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Panoramica" title="Dashboard" />

      {/* Azioni rapide + statistiche */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 flex flex-col p-1.5 lg:col-span-1">
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            <ManutenzioneForm macchine={macchine} pezzi={pezzi} square />
            <PezzoForm macchine={macchine} square />
            <MacchinaForm square />
          </div>
        </Card>

        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="panel group p-5 transition-colors hover:border-ink/15"
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${STAT_TONE}`}>
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <ArrowUpRight
                size={18}
                className="text-faint transition-colors group-hover:text-ink"
              />
            </div>
            <p className="mt-4 font-display text-[32px] font-semibold leading-none tabular-nums text-ink">
              {value}
            </p>
            <p className="mt-1.5 text-[13px] text-muted">{label}</p>
          </Link>
        ))}
      </div>

      {/* Scorte basse + ultime manutenzioni */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Scorte basse */}
        <Card className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-[17px] font-semibold tracking-tight">
                Scorte basse
              </h2>
              {data.scorteBasse.length > 0 && (
                <Badge tone="danger">{data.scorteBasse.length}</Badge>
              )}
            </div>
            <Link
              href="/magazzino"
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              Magazzino →
            </Link>
          </div>

          {data.scorteBasse.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-soft text-teal">
                <CheckCircle2 size={22} />
              </span>
              <p className="text-[14px] font-medium text-ink">Tutto a posto</p>
              <p className="text-[13px] text-muted">
                Nessun pezzo sotto la soglia minima.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data.scorteBasse.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">
                      <span className="font-mono text-[12px] text-muted">
                        {p.codice}
                      </span>{" "}
                      · {p.nome}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] text-faint tabular-nums">
                      min {p.quantita_minima}
                    </span>
                    <span className="font-display text-[20px] font-semibold leading-none text-danger-ink tabular-nums">
                      {p.quantita}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Ultime manutenzioni */}
        <Card className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-[17px] font-semibold tracking-tight">
              Ultime manutenzioni
            </h2>
            <Link
              href="/manutenzioni"
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              Tutte →
            </Link>
          </div>

          {data.ultimeManutenzioni.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
                <Wrench size={22} />
              </span>
              <p className="text-[14px] font-medium text-ink">
                Nessun intervento
              </p>
              <p className="text-[13px] text-muted">
                Le manutenzioni registrate appariranno qui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data.ultimeManutenzioni.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/manutenzioni#m-${m.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
                      <Wrench size={16} strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {m.macchina?.nome ?? "Macchina rimossa"}
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-ink">
                          <CalendarDays size={15} className="text-muted" />
                          {formatDataIt(m.data)}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-[13px] text-muted">
                        {m.descrizione}
                      </p>
                      {m.pezzi.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.pezzi.slice(0, 4).map((pp) => (
                            <span
                              key={pp.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-2 pr-1 text-[11px]"
                            >
                              <span className="font-mono text-[10px] text-muted">
                                {pp.pezzo_codice}
                              </span>
                              <span className="text-ink">{pp.pezzo_nome}</span>
                              <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-ink tabular-nums">
                                ×{pp.quantita_usata}
                              </span>
                            </span>
                          ))}
                          {m.pezzi.length > 4 && (
                            <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                              +{m.pezzi.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
