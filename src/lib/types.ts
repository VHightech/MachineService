// Tipi del dominio — rispecchiano lo schema in supabase/schema.sql

export interface Macchina {
  id: string;
  nome: string;
  note: string | null;
  created_at: string;
}

export interface Pezzo {
  id: string;
  codice: string;
  nome: string;
  quantita: number;
  quantita_minima: number;
  created_at: string;
}

export interface ManutenzionePezzo {
  id: string;
  manutenzione_id: string;
  pezzo_id: string | null;
  pezzo_codice: string;
  pezzo_nome: string;
  quantita_usata: number;
}

export interface Manutenzione {
  id: string;
  macchina_id: string;
  data: string; // formato "YYYY-MM-DD"
  descrizione: string;
  tecnico: string | null;
  created_at: string;
}

// --- Tipi arricchiti per le viste ---

export type MacchinaRef = Pick<Macchina, "id" | "nome">;

export interface PezzoConMacchine extends Pezzo {
  macchine: MacchinaRef[];
}

export interface ManutenzioneCompleta extends Manutenzione {
  macchina: MacchinaRef | null;
  pezzi: ManutenzionePezzo[];
}

/** Un pezzo è in scorta bassa quando la giacenza è <= alla soglia minima. */
export function isScortaBassa(
  p: Pick<Pezzo, "quantita" | "quantita_minima">,
): boolean {
  return p.quantita <= p.quantita_minima;
}
