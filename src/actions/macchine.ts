"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { type ActionResult, messaggioErrore } from "./types";

function revalidaTutto() {
  revalidatePath("/");
  revalidatePath("/macchine");
  revalidatePath("/magazzino");
  revalidatePath("/manutenzioni");
}

export async function createMacchina(input: {
  nome: string;
  note?: string | null;
}): Promise<ActionResult> {
  const nome = input.nome?.trim();
  if (!nome) return { ok: false, error: "Il nome della macchina è obbligatorio." };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("macchine")
    .insert({ nome, note: input.note?.trim() || null });

  if (error) return { ok: false, error: messaggioErrore(error) };
  revalidaTutto();
  return { ok: true };
}

export async function updateMacchina(
  id: string,
  input: { nome: string; note?: string | null },
): Promise<ActionResult> {
  const nome = input.nome?.trim();
  if (!nome) return { ok: false, error: "Il nome della macchina è obbligatorio." };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("macchine")
    .update({ nome, note: input.note?.trim() || null })
    .eq("id", id);

  if (error) return { ok: false, error: messaggioErrore(error) };
  revalidaTutto();
  return { ok: true };
}

export async function deleteMacchina(id: string): Promise<ActionResult> {
  const supabase = getSupabase();
  const { error } = await supabase.from("macchine").delete().eq("id", id);

  if (error) return { ok: false, error: messaggioErrore(error) };
  revalidaTutto();
  return { ok: true };
}
