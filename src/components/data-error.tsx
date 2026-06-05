import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DataError({ message }: { message: string }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <div className="flex gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger-ink">
          <TriangleAlert size={18} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            Errore nel caricamento dei dati
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Verifica di aver eseguito <code className="text-ink">supabase/schema.sql</code>{" "}
            nel SQL Editor di Supabase. Dettaglio tecnico:
          </p>
          <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 font-mono text-[12px] text-danger-ink">
            {message}
          </p>
        </div>
      </div>
    </Card>
  );
}
