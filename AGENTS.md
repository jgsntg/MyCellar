<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## App-Specific Agent Rules

### Supabase Client Selection

| Context | Import from |
|---------|------------|
| Server Component | `lib/supabase/server.ts` |
| Server Action | `lib/supabase/server.ts` |
| Route Handler | `lib/supabase/server.ts` |
| `'use client'` component | `lib/supabase/client.ts` |

Wrong client = silent auth failure or hydration error. This is the most common bug in this codebase.

### Server Actions Checklist

Every Server Action in `app/actions/` must:
1. Call `createClient()` from `lib/supabase/server.ts`
2. Get `user_id` via `supabase.auth.getUser()` — never trust a `user_id` from client input
3. Perform the DB operation (RLS enforces per-user scoping automatically)
4. Call `revalidatePath('<route>')` to invalidate stale Next.js cache

### Auth Middleware

- File: `proxy.ts` in the app root (not `middleware.ts` — that name does not work here)
- Exported function must be named `proxy`
- Public paths (no auth required): `/login`, `/auth`, `/_next`, `/api`
- Unauthenticated on protected path → redirect to `/login`
- Authenticated on `/login` → redirect to `/dashboard`

### Styling Rules

- Tailwind v4 via PostCSS — no `tailwind.config.ts`
- Theme CSS variables defined in `app/globals.css` using oklch color space
- Custom palette: `--burgundy`, `--gold`, `--cream`, `--parchment`, `--ink`, `--rust`, `--moss`
- Display fonts: `Cormorant_Garamond` (`--font-display`), `Cormorant_SC` (`--font-display-sc`)
- Body font: `Inter` (`--font-body`)
- Always use `cn()` from `@/lib/utils` for conditional Tailwind classes

### New Feature Placement

| Artifact | Location |
|----------|---------|
| Protected page | `app/(app)/<name>/page.tsx` |
| Server Action | `app/actions/<name>.ts` |
| Reusable component | `components/<name>.tsx` |
| DB migration | `supabase/migrations/<NNN>_<desc>.sql` |
| Shared type | `types/index.ts` |

### Database Rules

Both `wines` and `consumption_log` have RLS — every query is automatically scoped to the authenticated user via `user_id = auth.uid()`.

For new migrations:
- Use 3-digit prefix: `002_`, `003_`, etc.
- Always include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + user-scoped policies
- Prefer `timestamptz` over `timestamp`, `gen_random_uuid()` for PKs, explicit column defaults

Schema reference: `supabase/migrations/001_init.sql`
