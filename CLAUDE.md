@AGENTS.md

# MyCellar — Claude Code Reference

## Project Overview

Personal wine cellar ledger app. Users track their wine inventory, log bottles consumed, and see drinkability reports based on drinking windows. Single-user per Supabase account via Google OAuth.

**App name displayed to users:** "The Cellar — Personal Wine Ledger"

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.2.4 | App Router, React 19 |
| Database | Supabase (Postgres) | RLS enabled on all tables |
| Auth | Supabase + Google OAuth | Cookie-based session |
| UI Components | shadcn/ui (Base UI style) | NOT Radix — affects component API |
| Styling | Tailwind CSS v4 | PostCSS plugin, no `tailwind.config.ts` needed |
| Deployment | Vercel | |

## Critical Next.js 16 Differences

- **Middleware file is `proxy.ts`**, not `middleware.ts`. The exported function must be named `proxy`, not `middleware`.
- **`cookies()` from `next/headers` is async** — always `await cookies()`.
- **shadcn uses Base UI primitives**, not Radix. There is no `asChild` prop on Trigger/Item components.
- **`Select.onValueChange` delivers `string | null`** — always guard: `value ?? fallback`.
- Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
```

## File Layout (Key Paths)

```
app/
  (app)/                   # Protected route group — requires auth
    dashboard/page.tsx     # Stats + urgency cards
    cellar/page.tsx        # Wine inventory table
    log/page.tsx           # Consumption log
    report/page.tsx        # Drinkability report
    data/page.tsx          # CSV import/export + wipe
    notes/page.tsx         # Static help page
    layout.tsx             # Header + NavTabs with counts
  login/page.tsx           # Google sign-in
  auth/callback/route.ts   # OAuth callback → /dashboard
  actions/
    wines.ts               # createWine, updateWine, deleteWine, bulkImportCellar
    log.ts                 # markDrunk, bulkImportLog
  page.tsx                 # Root redirect: /dashboard or /login

components/
  ui/                      # shadcn/ui primitives (do not edit directly)
  wine-table.tsx           # 'use client' — sortable/filterable wine list
  wine-form-dialog.tsx     # Add/edit wine modal
  drink-dialog.tsx         # Log a consumed bottle
  import-csv.tsx           # CSV upload + preview + import
  export-buttons.tsx       # CSV export
  urgency-cards.tsx        # Wines grouped by drinkability
  urgency-badge.tsx        # Status badge component

lib/
  supabase/server.ts       # createClient() for Server Components / Actions
  supabase/client.ts       # createClient() for 'use client' components
  drinkability.ts          # getUrgency(wine) → {code, label, order, msg}
  csv-parser.ts            # CSV parsing, type detection, fuzzy wine matching
  utils.ts                 # cn() — clsx + tailwind-merge

types/index.ts             # Wine, LogEntry, Urgency, WineFormData, ImportedRow types
proxy.ts                   # Auth middleware (see above)
supabase/migrations/001_init.sql  # Full DB schema
```

## Database Schema

### `wines` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid FK | → auth.users, cascade delete |
| source_id | text | CellarTracker iWine ID for dedup |
| producer, wine, type, varietal, region, country | text | |
| vintage | int | |
| quantity | int | default 1 |
| size | text | default '750 ml' |
| location, notes | text | |
| price | numeric(10,2) | |
| window_start, peak_start, peak_end, window_end | int | drinking window years |
| added_at | timestamptz | default now() |

### `consumption_log` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | → auth.users |
| wine_id | uuid FK | → wines, SET NULL on delete |
| date | date | NOT NULL |
| rating | int | 1–5 |
| note, value | text/numeric | |
| snapshot_producer, snapshot_wine, snapshot_vintage | text | denormalized wine info |
| created_at | timestamptz | |

Both tables have RLS policies: users can only read/write their own rows (`user_id = auth.uid()`).

## Auth Pattern

1. `proxy.ts` runs on every request — public paths: `/login`, `/auth`, `/_next`, `/api`
2. Unauthenticated → redirect to `/login`
3. Authenticated on `/login` → redirect to `/dashboard`
4. Google OAuth → Supabase callback at `/auth/callback` → session cookie set → `/dashboard`

**Server Components/Actions:** use `lib/supabase/server.ts`  
**Client Components:** use `lib/supabase/client.ts`

## Server Actions Pattern

All mutations go through Server Actions in `app/actions/`. They:
1. Call `createClient()` from `lib/supabase/server.ts`
2. Get `user_id` from `supabase.auth.getUser()`
3. Perform the DB operation
4. Call `revalidatePath()` to invalidate affected routes

## Urgency Logic

`getUrgency(wine)` in `lib/drinkability.ts` compares current year to drinking window fields:

| Code | Condition | Order |
|------|-----------|-------|
| `drink-now` | Past peak_end but before window_end | 1 |
| `peak` | Within peak_start–peak_end | 2 |
| `approaching` | Within 2 years of peak_start | 3 |
| `young` | More than 2 years before peak_start | 4 |
| `past` | Past window_end | 5 |
| `unknown` | No window data | 6 |

## Styling Conventions

- Tailwind v4 via PostCSS (`@tailwindcss/postcss`) — no `tailwind.config.ts` file
- Theme defined in `app/globals.css` using CSS variables (oklch color space)
- Custom palette: `--burgundy`, `--gold`, `--cream`, `--parchment`, `--ink`, `--rust`, `--moss`
- Display fonts: `Cormorant_Garamond` (var `--font-display`), `Cormorant_SC` (var `--font-display-sc`)
- Body font: `Inter` (var `--font-body`)
- Use `cn()` from `@/lib/utils` for conditional class merging

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key (public)
```

See `env.example`. Never commit `.env.local`.

## CSV Import

The app imports from CellarTracker CSV exports. `lib/csv-parser.ts` handles:
- Auto-detection of file type (cellar vs consumed)
- Fuzzy wine matching via Levenshtein distance (≤3 edits)
- Deduplication of cellar entries by `source_id` (CellarTracker iWine ID)
- Date format normalization (M/D/YYYY and YYYY-MM-DD)
