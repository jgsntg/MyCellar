# Data Inspection Skill

Analyze wine data files and Supabase schema for quality issues, import readiness, and schema alignment.

## When to use

- Before importing CSV data via the app's `/data` page
- When diagnosing why an import failed or produced wrong results
- When comparing source CSV columns to the `wines` / `consumption_log` DB schema

## What to check

### CSV files (`My Cellar.csv`, `My Consumed Bottles.csv`)
- Column headers match what `lib/csv-parser.ts` expects (CellarTracker format)
- Vintage values are integers (not ranges like "2018-2019")
- Drinking window fields (`Begin Date`, `End Date`, `Peak From`, `Peak Through`) are present and parseable
- `iWine` column exists and is populated (used as `source_id` for dedup)
- Quantity values are positive integers
- Date fields in `My Consumed Bottles.csv` use M/D/YYYY or YYYY-MM-DD format

### Schema alignment (`supabase/migrations/001_init.sql`)
- New CSV columns that don't map to existing DB columns
- Data type mismatches (e.g., vintage as text vs int)
- NULL values in NOT NULL columns

## Output format

Report as a punch list:
- OK: what looks good
- WARN: potential issues that won't block import but may lose data
- ERROR: will definitely break import — must fix first
