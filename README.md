# Officina — Gestionale Manutenzioni

Web app minimalista per gestire **manutenzioni**, **magazzino pezzi di ricambio** e **macchine**.
Next.js (App Router) + Supabase, pensata per l'uso in locale.

## Funzionalità

- **Dashboard** — totali, **scorte basse** in evidenza, ultime manutenzioni.
- **Manutenzioni** — storico completo degli interventi con i **pezzi utilizzati**; nuova
  manutenzione con data, descrizione, tecnico e selezione pezzi (filtrati per macchina).
  La giacenza dei pezzi si **scala in automatico**; eliminando un intervento la giacenza
  viene **ripristinata**.
- **Magazzino** — pezzi con **codice alfanumerico**, giacenza, soglia minima, ubicazione e
  **macchine compatibili** (un pezzo può andare su più macchine). Avviso **scorta bassa**.
- **Macchine** — anagrafica con il nome (e nota facoltativa).
- **Esportazione Excel** (.xlsx) di Manutenzioni e Magazzino.

## Setup (5 minuti)

### 1. Crea il progetto Supabase
- Vai su [supabase.com](https://supabase.com), crea un progetto gratuito.
- Apri **Project Settings → API** e copia **Project URL** e **anon public key**.

### 2. Configura le variabili d'ambiente
Apri `.env.local` e incolla i valori (Supabase → Project Settings → API):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
```
> Le chiavi sono usate solo lato server (mai nel browser). Con la RLS attiva
> (vedi sotto) l'app usa la **service_role**, che bypassa la RLS. I vecchi nomi
> `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_ANON_KEY` restano come fallback.

### 3. Crea le tabelle
Nel **SQL Editor** di Supabase incolla ed esegui tutto il contenuto di
[`supabase/schema.sql`](supabase/schema.sql).
(Facoltativo) esegui anche [`supabase/seed.sql`](supabase/seed.sql) per dei dati di esempio.

### 4. Avvia l'app
```bash
npm install      # già fatto
npm run dev
```
Apri http://localhost:3000

## Deploy su Vercel

1. Crea un repo Git e importalo su Vercel (oppure usa la CLI / l'integrazione).
2. In **Project → Settings → Environment Variables** imposta:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSWORD` → la password per entrare nell'app (gate Basic Auth).
3. Deploy. All'apertura il browser chiederà utente + password: l'utente può
   essere qualsiasi, conta solo la password (`APP_PASSWORD`).

## Sicurezza

- **RLS attiva** su tutte le tabelle, **nessuna policy**: le chiavi anon non
  accedono ai dati tramite l'API pubblica. Per blindare un DB già creato con la
  vecchia versione aperta, esegui [`supabase/harden.sql`](supabase/harden.sql).
- L'app accede al DB **lato server** con la **service_role key** (segreta, mai
  nel browser), che bypassa la RLS.
- Il **gate password** (Basic Auth) protegge l'accesso all'interfaccia.

## Note

- In **locale senza `APP_PASSWORD`** l'app non chiede alcuna password.
- Stack: Next.js 16 · React 19 · Tailwind CSS v4 · Supabase · ExcelJS.

## Struttura

```
src/
  app/                  pagine (dashboard, manutenzioni, magazzino, macchine) + API export
  actions/              server actions (create/update/delete)
  components/           UI riutilizzabile + form per ogni sezione
  lib/                  client Supabase, query, tipi, utility, export Excel
supabase/
  schema.sql            tabelle, trigger giacenza, funzione crea_manutenzione
  seed.sql              dati di esempio
```
