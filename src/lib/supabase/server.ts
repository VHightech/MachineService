import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Variabili lato server (NON esposte al browser). Per retrocompatibilità
// con i vecchi nomi NEXT_PUBLIC_* in locale, usiamo un fallback.
const url =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client Supabase lato server. Tutte le operazioni passano da qui
 * (Server Components, Server Actions, Route Handler) usando la chiave anon.
 * La chiave resta sul server e non finisce nel bundle del browser.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase non configurato. Imposta SUPABASE_URL e SUPABASE_ANON_KEY nel file .env.local (o nelle Environment Variables di Vercel).",
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** true se le variabili d'ambiente Supabase sono presenti. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
