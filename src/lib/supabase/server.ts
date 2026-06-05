import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tutto l'accesso al DB è lato server. Con la RLS attiva, l'app usa la
// SERVICE ROLE KEY (segreta, mai esposta al browser) che bypassa la RLS.
// La chiave anon resta come fallback per setup non ancora "hardened".
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const key = serviceKey ?? anonKey;

/**
 * Client Supabase lato server (Server Components, Server Actions, Route Handler).
 * Usa la service_role key se presente, altrimenti la anon key.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      "Supabase non configurato. Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (consigliata) o SUPABASE_ANON_KEY in .env.local / Vercel.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** true se le variabili d'ambiente Supabase sono presenti. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}
