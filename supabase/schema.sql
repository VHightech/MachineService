-- ============================================================
--  Officina — Gestionale Manutenzioni / Magazzino / Macchine
--  Schema Postgres per Supabase
--
--  COME USARLO:
--  1. Apri il tuo progetto Supabase -> SQL Editor
--  2. Incolla TUTTO questo file e premi "Run"
--  3. (facoltativo) esegui anche supabase/seed.sql per dati di esempio
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  MACCHINE  (solo il nome + una nota facoltativa)
-- ------------------------------------------------------------
create table if not exists public.macchine (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
--  PEZZI  (il magazzino: codice alfanumerico, giacenza, soglia)
-- ------------------------------------------------------------
create table if not exists public.pezzi (
  id               uuid primary key default gen_random_uuid(),
  codice           text not null unique,            -- codice alfanumerico
  nome             text not null,
  quantita         integer not null default 0 check (quantita >= 0),
  quantita_minima  integer not null default 0 check (quantita_minima >= 0),
  ubicazione       text,                            -- es. "Scaffale A3"
  created_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
--  PEZZI <-> MACCHINE  (un pezzo può andare su più macchine)
-- ------------------------------------------------------------
create table if not exists public.pezzi_macchine (
  pezzo_id     uuid not null references public.pezzi(id)    on delete cascade,
  macchina_id  uuid not null references public.macchine(id) on delete cascade,
  primary key (pezzo_id, macchina_id)
);

-- ------------------------------------------------------------
--  MANUTENZIONI  (un intervento su una macchina, con data)
-- ------------------------------------------------------------
create table if not exists public.manutenzioni (
  id           uuid primary key default gen_random_uuid(),
  macchina_id  uuid not null references public.macchine(id) on delete cascade,
  data         date not null default current_date,
  descrizione  text not null,
  tecnico      text,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
--  MANUTENZIONE_PEZZI  (pezzi usati in un intervento)
--  Salviamo anche codice/nome come "fotografia" cosi' la storia
--  resta leggibile anche se il pezzo viene poi eliminato.
-- ------------------------------------------------------------
create table if not exists public.manutenzione_pezzi (
  id               uuid primary key default gen_random_uuid(),
  manutenzione_id  uuid not null references public.manutenzioni(id) on delete cascade,
  pezzo_id         uuid references public.pezzi(id) on delete set null,
  pezzo_codice     text not null,
  pezzo_nome       text not null,
  quantita_usata   integer not null check (quantita_usata > 0)
);

-- ------------------------------------------------------------
--  INDICI
-- ------------------------------------------------------------
create index if not exists idx_manutenzioni_macchina on public.manutenzioni(macchina_id);
create index if not exists idx_manutenzioni_data      on public.manutenzioni(data desc);
create index if not exists idx_mp_manutenzione        on public.manutenzione_pezzi(manutenzione_id);
create index if not exists idx_mp_pezzo               on public.manutenzione_pezzi(pezzo_id);
create index if not exists idx_pm_macchina            on public.pezzi_macchine(macchina_id);
create index if not exists idx_pm_pezzo               on public.pezzi_macchine(pezzo_id);

-- ------------------------------------------------------------
--  TRIGGER: aggiorna la giacenza del pezzo
--    INSERT in manutenzione_pezzi -> scala la giacenza
--    DELETE da manutenzione_pezzi -> ripristina la giacenza
--  (eliminare una manutenzione cancella in cascata le sue righe
--   e quindi ripristina automaticamente i pezzi usati)
-- ------------------------------------------------------------
create or replace function public.fn_aggiorna_giacenza()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.pezzi
       set quantita = quantita - new.quantita_usata
     where id = new.pezzo_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.pezzi
       set quantita = quantita + old.quantita_usata
     where id = old.pezzo_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_manutenzione_pezzi_giacenza on public.manutenzione_pezzi;
create trigger trg_manutenzione_pezzi_giacenza
after insert or delete on public.manutenzione_pezzi
for each row execute function public.fn_aggiorna_giacenza();

-- ------------------------------------------------------------
--  FUNZIONE RPC: crea una manutenzione + i suoi pezzi in modo
--  ATOMICO (o va tutto, o niente). Fotografa codice/nome pezzo.
--  p_pezzi = [{ "pezzo_id": "uuid", "quantita_usata": 2 }, ...]
-- ------------------------------------------------------------
create or replace function public.crea_manutenzione(
  p_macchina_id uuid,
  p_data        date,
  p_descrizione text,
  p_tecnico     text,
  p_pezzi       jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_manutenzione_id uuid;
  v_item            jsonb;
  v_pezzo           record;
begin
  insert into public.manutenzioni (macchina_id, data, descrizione, tecnico)
  values (p_macchina_id, coalesce(p_data, current_date), p_descrizione, nullif(btrim(coalesce(p_tecnico, '')), ''))
  returning id into v_manutenzione_id;

  if p_pezzi is not null and jsonb_typeof(p_pezzi) = 'array' then
    for v_item in select * from jsonb_array_elements(p_pezzi)
    loop
      select id, codice, nome into v_pezzo
        from public.pezzi
       where id = (v_item->>'pezzo_id')::uuid;

      if v_pezzo.id is null then
        raise exception 'Pezzo non trovato: %', v_item->>'pezzo_id';
      end if;

      insert into public.manutenzione_pezzi
        (manutenzione_id, pezzo_id, pezzo_codice, pezzo_nome, quantita_usata)
      values (
        v_manutenzione_id,
        v_pezzo.id,
        v_pezzo.codice,
        v_pezzo.nome,
        (v_item->>'quantita_usata')::int
      );
    end loop;
  end if;

  return v_manutenzione_id;
end;
$$;

-- ------------------------------------------------------------
--  SICUREZZA (RLS)
--  La RLS è ATTIVA su tutte le tabelle e NON ci sono policy:
--  quindi le chiavi anon/authenticated NON possono leggere o
--  scrivere nulla tramite l'API pubblica.
--  L'app gira lato server con la SERVICE ROLE KEY, che bypassa
--  la RLS (chiave segreta, mai esposta al browser).
-- ------------------------------------------------------------
alter table public.macchine            enable row level security;
alter table public.pezzi               enable row level security;
alter table public.pezzi_macchine      enable row level security;
alter table public.manutenzioni        enable row level security;
alter table public.manutenzione_pezzi  enable row level security;

-- Niente privilegi per anon/authenticated sull'API pubblica.
revoke all privileges on all tables    in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke execute on all functions        in schema public from anon, authenticated;
