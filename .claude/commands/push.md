Commit and push changes to GitHub.

Remote: https://github.com/jgsntg/MyCellar.git (branch: main)

Steps:
1. Run `git status` to see what changed.
2. Run `git diff HEAD` to review the diff.
3. Stage only relevant files — never `.env.local`, `node_modules/`, `.next/`, or any secrets.
4. Write a concise commit message focused on WHY the change was made (not what).
5. Commit using a heredoc so the message formats correctly.
6. Push to `origin main`.
7. Report the commit hash and a one-line summary.

If there is nothing to commit, say so and stop.

Arguments (optional): $ARGUMENTS — use as the commit message if provided, otherwise draft one from the diff.
