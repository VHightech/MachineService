export type ActionResult = { ok: true } | { ok: false; error: string };

/** Mappa gli errori Postgres/Supabase in messaggi leggibili in italiano. */
export function messaggioErrore(error: {
  code?: string;
  message: string;
}): string {
  switch (error.code) {
    case "23505":
      return "Esiste già un pezzo con questo codice.";
    case "23514":
      return "Operazione non valida: giacenza insufficiente per un pezzo selezionato.";
    case "23503":
      return "Operazione non valida: riferimento a un elemento inesistente.";
    default:
      return error.message || "Si è verificato un errore.";
  }
}
