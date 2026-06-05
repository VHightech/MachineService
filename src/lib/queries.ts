import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import {
  type Macchina,
  type MacchinaRef,
  type ManutenzioneCompleta,
  type Pezzo,
  type PezzoConMacchine,
  isScortaBassa,
} from "@/lib/types";

export async function getMacchine(): Promise<Macchina[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("macchine")
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Macchina[];
}

export async function getMacchineRefs(): Promise<MacchinaRef[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("macchine")
    .select("id, nome")
    .order("nome", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MacchinaRef[];
}

export interface MacchinaConStat extends Macchina {
  nManutenzioni: number;
  nPezzi: number;
}

interface MacchinaStatRow extends Macchina {
  manutenzioni: { count: number }[] | null;
  pezzi_macchine: { count: number }[] | null;
}

export async function getMacchineConStat(): Promise<MacchinaConStat[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("macchine")
    .select("*, manutenzioni(count), pezzi_macchine(count)")
    .order("nome", { ascending: true });
  if (error) throw new Error(error.message);

  return ((data ?? []) as MacchinaStatRow[]).map((row) => {
    const { manutenzioni, pezzi_macchine, ...macchina } = row;
    return {
      ...macchina,
      nManutenzioni: manutenzioni?.[0]?.count ?? 0,
      nPezzi: pezzi_macchine?.[0]?.count ?? 0,
    };
  });
}

interface PezzoRow extends Pezzo {
  pezzi_macchine: { macchine: MacchinaRef | null }[] | null;
}

export async function getPezziConMacchine(): Promise<PezzoConMacchine[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pezzi")
    .select("*, pezzi_macchine(macchine(id, nome))")
    .order("codice", { ascending: true });
  if (error) throw new Error(error.message);

  return ((data ?? []) as PezzoRow[]).map((row) => {
    const { pezzi_macchine, ...pezzo } = row;
    const macchine = (pezzi_macchine ?? [])
      .map((pm) => pm.macchine)
      .filter((m): m is MacchinaRef => Boolean(m))
      .sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    return { ...pezzo, macchine };
  });
}

interface ManutenzioneRow extends Omit<ManutenzioneCompleta, "macchina" | "pezzi"> {
  macchine: MacchinaRef | null;
  manutenzione_pezzi: ManutenzioneCompleta["pezzi"] | null;
}

function mapManutenzione(row: ManutenzioneRow): ManutenzioneCompleta {
  const { macchine, manutenzione_pezzi, ...resto } = row;
  return {
    ...resto,
    macchina: macchine,
    pezzi: (manutenzione_pezzi ?? []).sort((a, b) =>
      a.pezzo_codice.localeCompare(b.pezzo_codice, "it"),
    ),
  };
}

export async function getManutenzioniComplete(): Promise<ManutenzioneCompleta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("manutenzioni")
    .select("*, macchine(id, nome), manutenzione_pezzi(*)")
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ManutenzioneRow[]).map(mapManutenzione);
}

export async function getManutenzioniMacchina(
  macchinaId: string,
): Promise<ManutenzioneCompleta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("manutenzioni")
    .select("*, macchine(id, nome), manutenzione_pezzi(*)")
    .eq("macchina_id", macchinaId)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ManutenzioneRow[]).map(mapManutenzione);
}

export interface DashboardData {
  totali: { macchine: number; pezzi: number; manutenzioni: number };
  scorteBasse: Pezzo[];
  ultimeManutenzioni: ManutenzioneCompleta[];
  valoreScorte: number; // somma delle giacenze (numero pezzi totali)
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabase();

  const [pezziRes, manutenzioniRes, macchineCountRes] = await Promise.all([
    supabase.from("pezzi").select("*").order("codice", { ascending: true }),
    getManutenzioniComplete(),
    supabase.from("macchine").select("*", { count: "exact", head: true }),
  ]);

  if (pezziRes.error) throw new Error(pezziRes.error.message);
  if (macchineCountRes.error) throw new Error(macchineCountRes.error.message);

  const pezzi = (pezziRes.data ?? []) as Pezzo[];
  const scorteBasse = pezzi
    .filter(isScortaBassa)
    .sort((a, b) => a.quantita - a.quantita_minima - (b.quantita - b.quantita_minima));

  return {
    totali: {
      macchine: macchineCountRes.count ?? 0,
      pezzi: pezzi.length,
      manutenzioni: manutenzioniRes.length,
    },
    scorteBasse,
    ultimeManutenzioni: manutenzioniRes.slice(0, 6),
    valoreScorte: pezzi.reduce((sum, p) => sum + p.quantita, 0),
  };
}

/** Per il form "Nuova manutenzione": pezzi con le macchine a cui sono associati. */
export async function getPezziPerSelezione(): Promise<
  { id: string; codice: string; nome: string; quantita: number; macchineIds: string[] }[]
> {
  const pezzi = await getPezziConMacchine();
  return pezzi.map((p) => ({
    id: p.id,
    codice: p.codice,
    nome: p.nome,
    quantita: p.quantita,
    macchineIds: p.macchine.map((m) => m.id),
  }));
}
