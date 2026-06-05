import { Database, FileCode2, KeyRound, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

const STEP = [
  {
    icon: Database,
    title: "Crea un progetto Supabase",
    text: "Vai su supabase.com, crea un progetto gratuito e apri Project Settings → API.",
  },
  {
    icon: KeyRound,
    title: "Compila .env.local",
    text: "Copia Project URL e anon key dentro NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  },
  {
    icon: FileCode2,
    title: "Esegui lo schema",
    text: "Nel SQL Editor di Supabase incolla ed esegui il contenuto di supabase/schema.sql (poi, se vuoi, seed.sql).",
  },
  {
    icon: RefreshCw,
    title: "Riavvia il server",
    text: "Ferma e riavvia npm run dev per caricare le variabili d'ambiente.",
  },
];

export function SetupNeeded() {
  return (
    <Card className="mx-auto max-w-2xl">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-ink">
        Configurazione
      </span>
      <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight">
        Collega Supabase per iniziare
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Mancano le credenziali del database. Bastano pochi passaggi.
      </p>

      <ol className="mt-6 flex flex-col gap-3">
        {STEP.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="flex gap-3.5 rounded-2xl border border-line bg-surface-2 p-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-ink">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-ink">
                {i + 1}. {title}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
