Scaffold a new feature following the app's existing patterns.

Arguments: $ARGUMENTS — the feature name/description (required).

Before writing any code:
1. Read `CLAUDE.md` for conventions (stack, file layout, auth pattern, server actions pattern, styling).
2. Identify which existing files to reference as patterns (page, server action, component).
3. Confirm the plan with the user before writing.

Then implement following these rules:
- New pages go under `app/(app)/<feature-name>/page.tsx` (protected route group).
- Data mutations go in `app/actions/<feature-name>.ts` as Server Actions.
- UI components go in `components/<feature-name>.tsx` if reusable.
- Use `createClient()` from `lib/supabase/server.ts` in Server Components and Actions.
- Use `createClient()` from `lib/supabase/client.ts` only in `'use client'` components.
- All Server Actions must call `revalidatePath()` after mutations.
- RLS handles auth at DB level — always get `user_id` from `supabase.auth.getUser()`.
- Style with Tailwind v4 + custom CSS variables (`--burgundy`, `--gold`, `--cream`, etc.).
- No comments unless a non-obvious invariant needs explaining.
