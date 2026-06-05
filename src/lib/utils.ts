import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classi Tailwind in modo sicuro (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatta una data "YYYY-MM-DD" in "GG/MM/AAAA" senza problemi di fuso. */
export function formatDataIt(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("T")[0].split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

const MESI_ABBR = [
  "GEN", "FEB", "MAR", "APR", "MAG", "GIU",
  "LUG", "AGO", "SET", "OTT", "NOV", "DIC",
];
const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export interface DataParti {
  giorno: string;
  meseAbbr: string;
  meseAnno: string; // "Giugno 2026"
  chiaveMese: string; // "2026-06" per il raggruppamento
}

/** Scompone una data "YYYY-MM-DD" in parti utili alla UI (senza fuso). */
export function parseData(value: string | null | undefined): DataParti {
  const [y, m, d] = (value ?? "").split("T")[0].split("-");
  const mi = Number(m) - 1;
  return {
    giorno: d ?? "—",
    meseAbbr: MESI_ABBR[mi] ?? "",
    meseAnno: `${MESI[mi] ?? ""} ${y ?? ""}`.trim(),
    chiaveMese: `${y ?? ""}-${m ?? ""}`,
  };
}

/** Data odierna in formato "YYYY-MM-DD" (per il valore di default dei form). */
export function oggiISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
