Run all quality checks: lint, type-check, and build.

Execute these commands sequentially, stopping and reporting on first failure:

```
npm run lint
npm run build
```

Report:
- Which checks passed
- Full error output for any failure, with the file:line reference
- A one-sentence summary of what needs fixing (if anything)

Do not attempt to fix issues automatically — just report.
