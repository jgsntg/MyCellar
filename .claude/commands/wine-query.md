Generate a Supabase/Postgres query for the wine data.

Arguments: $ARGUMENTS — the question or report you want answered (required).

Steps:
1. Read `CLAUDE.md` to recall the DB schema (wines + consumption_log tables).
2. Write a SQL query that answers the question.
3. Show the query and explain it.
4. Optionally suggest how to expose this as a Server Component or Server Action in the app.

Schema reference:
- `wines`: id, user_id, producer, wine, type, varietal, region, country, vintage, quantity, size, location, notes, price, window_start, peak_start, peak_end, window_end, added_at
- `consumption_log`: id, user_id, wine_id, date, rating, note, value, snapshot_producer, snapshot_wine, snapshot_vintage, created_at
- Both tables are RLS-protected — queries in the app always scope to `auth.uid()` automatically.
