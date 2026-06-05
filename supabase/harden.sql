-- ============================================================
--  HARDENING SICUREZZA — esegui UNA VOLTA nel SQL Editor di
--  Supabase per blindare un DB creato con la vecchia versione
--  "aperta" (RLS off + grant ad anon).
--
--  Dopo questo:
--   - le chiavi anon/authenticated NON accedono piu' ai dati
--     tramite l'API pubblica;
--   - l'app DEVE usare la SERVICE ROLE KEY lato server
--     (imposta SUPABASE_SERVICE_ROLE_KEY su Vercel e in .env.local
--      PRIMA o subito DOPO aver eseguito questo file).
-- ============================================================

alter table public.macchine            enable row level security;
alter table public.pezzi               enable row level security;
alter table public.pezzi_macchine      enable row level security;
alter table public.manutenzioni        enable row level security;
alter table public.manutenzione_pezzi  enable row level security;

revoke all privileges on all tables    in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke execute on all functions        in schema public from anon, authenticated;
