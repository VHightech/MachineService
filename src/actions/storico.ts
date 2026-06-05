"use server";

import { getManutenzioniMacchina } from "@/lib/queries";
import type { ManutenzioneCompleta } from "@/lib/types";

/** Carica lo storico interventi di una singola macchina (per il modale). */
export async function caricaStoricoMacchina(
  macchinaId: string,
): Promise<ManutenzioneCompleta[]> {
  return getManutenzioniMacchina(macchinaId);
}
