Deploy the app to Vercel.

Arguments: $ARGUMENTS — pass "prod" or "production" to deploy to production. Default is preview.

Steps:
1. First run `/check` to confirm lint + build are clean. If they fail, stop — do not deploy broken code.
2. Confirm required env vars exist in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
3. Run the appropriate command:
   - Preview: `npx vercel`
   - Production: `npx vercel --prod`
4. Report the deployment URL when done.

If the Vercel CLI is not authenticated, instruct the user to run `npx vercel login` first.
