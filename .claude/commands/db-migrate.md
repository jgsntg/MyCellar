Create a new Supabase migration.

Arguments: $ARGUMENTS — description of the schema change (required).

Steps:
1. Read `supabase/migrations/001_init.sql` to understand the existing schema.
2. Determine the next migration number (e.g., `002_<slug>.sql`).
3. Write the migration file at `supabase/migrations/<number>_<slug>.sql`.
4. Rules for the SQL:
   - All new tables need RLS: `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;`
   - Add RLS policies for `user_id = auth.uid()` on SELECT, INSERT, UPDATE, DELETE.
   - Use `gen_random_uuid()` for PK defaults.
   - Prefer `timestamptz` over `timestamp`.
   - Never drop or rename columns — add new ones instead (app is live).
5. Show the user the SQL and explain what it does.
6. Remind the user to apply it via the Supabase dashboard SQL editor or `supabase db push`.
