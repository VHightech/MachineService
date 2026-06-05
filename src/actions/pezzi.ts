"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { type ActionResult, messaggioErrore } from "./types";

export interface PezzoInput {
  codice: string;
  nome: string;
  quantita: number;
  quantita_minima: number;
  macchineIds: string[];
}

function revalida() {
  revalidatePath("/");
  revalidatePath("/magazzino");
  revalidatePath("/manutenzioni");
}

function valida(input: PezzoInput): string | null {
  if (!input.codice?.trim()) return "Il codice del pezzo è obbligatorio.";
  if (!input.nome?.trim()) return "Il nome del pezzo è obbligatorio.";
  if (!Number.isFinite(input.quantita) || input.quantita < 0)
    return "La quantità deve essere un numero ≥ 0.";
  if (!Number.isFinite(input.quantita_minima) || input.quantita_minima < 0)
    return "La soglia minima deve essere un numero ≥ 0.";
  return null;
}

async function sincronizzaMacchine(
  pezzoId: string,
  macchineIds: string[],
): Promise<{ error: { code?: string; message: string } } | null> {
  const supabase = getSupabase();
  const del = await supabase
    .from("pezzi_macchine")
    .delete()
    .eq("pezzo_id", pezzoId);
  if (del.error) return { error: del.error };

  const unici = Array.from(new Set(macchineIds.filter(Boolean)));
  if (unici.length === 0) return null;

  const righe = unici.map((macchina_id) => ({ pezzo_id: pezzoId, macchina_id }));
  const ins = await supabase.from("pezzi_macchine").insert(righe);
  if (ins.error) return { error: ins.error };
  return null;
}

export async function createPezzo(input: PezzoInput): Promise<ActionResult> {
  const errore = valida(input);
  if (errore) return { ok: false, error: errore };

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pezzi")
    .insert({
      codice: input.codice.trim(),
      nome: input.nome.trim(),
      quantita: Math.trunc(input.quantita),
      quantita_minima: Math.trunc(input.quantita_minima),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: messaggioErrore(error ?? { message: "Errore" }) };
  }

  const linkErr = await sincronizzaMacchine(data.id, input.macchineIds);
  if (linkErr) return { ok: false, error: messaggioErrore(linkErr.error) };

  revalida();
  return { ok: true };
}

export async function updatePezzo(
  id: string,
  input: PezzoInput,
): Promise<ActionResult> {
  const errore = valida(input);
  if (errore) return { ok: false, error: errore };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("pezzi")
    .update({
      codice: input.codice.trim(),
      nome: input.nome.trim(),
      quantita: Math.trunc(input.quantita),
      quantita_minima: Math.trunc(input.quantita_minima),
    })
    .eq("id", id);

  if (error) return { ok: false, error: messaggioErrore(error) };

  const linkErr = await sincronizzaMacchine(id, input.macchineIds);
  if (linkErr) return { ok: false, error: messaggioErrore(linkErr.error) };

  revalida();
  return { ok: true };
}

export async function deletePezzo(id: string): Promise<ActionResult> {
  const supabase = getSupabase();
  const { error } = await supabase.from("pezzi").delete().eq("id", id);
  if (error) return { ok: false, error: messaggioErrore(error) };
  revalida();
  return { ok: true };
}
