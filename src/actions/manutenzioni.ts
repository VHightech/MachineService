"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { type ActionResult, messaggioErrore } from "./types";

export interface PezzoUsatoInput {
  pezzo_id: string;
  quantita_usata: number;
}

export interface ManutenzioneInput {
  macchina_id: string;
  data: string; // "YYYY-MM-DD"
  descrizione: string;
  tecnico?: string | null;
  pezzi: PezzoUsatoInput[];
}

function revalida() {
  revalidatePath("/");
  revalidatePath("/manutenzioni");
  revalidatePath("/magazzino");
}

export async function createManutenzione(
  input: ManutenzioneInput,
): Promise<ActionResult> {
  if (!input.macchina_id) return { ok: false, error: "Seleziona una macchina." };
  if (!input.descrizione?.trim())
    return { ok: false, error: "Inserisci una descrizione dell'intervento." };
  if (!input.data) return { ok: false, error: "Inserisci la data dell'intervento." };

  const pezzi = (input.pezzi ?? []).filter(
    (p) => p.pezzo_id && Number(p.quantita_usata) > 0,
  );
  // Evita due righe per lo stesso pezzo: somma le quantità.
  const aggregati = new Map<string, number>();
  for (const p of pezzi) {
    aggregati.set(
      p.pezzo_id,
      (aggregati.get(p.pezzo_id) ?? 0) + Math.trunc(Number(p.quantita_usata)),
    );
  }
  const pezziPayload = Array.from(aggregati.entries()).map(
    ([pezzo_id, quantita_usata]) => ({ pezzo_id, quantita_usata }),
  );

  const supabase = getSupabase();
  const { error } = await supabase.rpc("crea_manutenzione", {
    p_macchina_id: input.macchina_id,
    p_data: input.data,
    p_descrizione: input.descrizione.trim(),
    p_tecnico: input.tecnico?.trim() || null,
    p_pezzi: pezziPayload,
  });

  if (error) return { ok: false, error: messaggioErrore(error) };
  revalida();
  return { ok: true };
}

export async function deleteManutenzione(id: string): Promise<ActionResult> {
  const supabase = getSupabase();
  // Eliminando la manutenzione, il trigger ripristina la giacenza dei pezzi.
  const { error } = await supabase.from("manutenzioni").delete().eq("id", id);
  if (error) return { ok: false, error: messaggioErrore(error) };
  revalida();
  return { ok: true };
}
