# Formatting Skill

Apply consistent formatting to files in the MyCellar workspace.

## When to use

- Normalizing CSV data before import
- Cleaning up HTML in `cellar.html`
- Fixing TypeScript/TSX code style in `mycellar/`

## Rules by file type

### CSV files
- Header row must be present and use title case (match CellarTracker export format)
- Vintage: integer only — strip text, ranges become the earlier year
- Quantity: integer only — default to 1 if missing
- Drinking window years: 4-digit integers only
- Dates: normalize to YYYY-MM-DD
- Strip leading/trailing whitespace from all fields
- Producer and Wine name: title case

### TypeScript / TSX (`mycellar/`)
- Follow conventions in `mycellar/CLAUDE.md`
- No inline comments unless the WHY is non-obvious
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Tailwind v4 — no `tailwind.config.ts` references
- `Select.onValueChange` must guard against `null`: `value ?? fallback`
- `cookies()` must be awaited
- Server Components/Actions: import from `lib/supabase/server.ts`
- Client Components: import from `lib/supabase/client.ts`

### SQL migrations (`mycellar/supabase/migrations/`)
- Use 3-digit prefix: `001_`, `002_`, etc.
- Always include RLS enable + policies for any new table
- Prefer `timestamptz`, `gen_random_uuid()`, explicit column defaults
