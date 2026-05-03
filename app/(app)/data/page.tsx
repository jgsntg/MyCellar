import { ImportCsv } from '@/components/import-csv'
import { ExportButtons } from '@/components/export-buttons'
import { WipeButton } from '@/components/wipe-button'

export default function DataPage() {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">Data &amp; Import</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
      </div>

      <div className="bg-card border border-border rounded-sm p-8 shadow-sm max-w-2xl space-y-8">
        <section className="space-y-3">
          <h3 className="font-display font-medium text-xl text-[var(--burgundy-deep)]">Import from CellarTracker</h3>
          <p className="font-display text-base text-foreground leading-relaxed">
            Export CSVs from CellarTracker and upload them here. The importer auto-detects which file is which:
          </p>
          <ul className="space-y-1.5 pl-5 list-disc font-display text-[15px] leading-relaxed text-foreground">
            <li><strong>My Cellar export</strong> → adds bottles to your cellar with vintage, region, varietal, and drinking windows.</li>
            <li><strong>My Consumed Bottles export</strong> → adds entries to your consumption log. Re-importing skips duplicates.</li>
          </ul>
          <ImportCsv />
        </section>

        <div className="border-t border-border" />

        <section className="space-y-3">
          <h3 className="font-display font-medium text-xl text-[var(--burgundy-deep)]">Export</h3>
          <p className="font-display text-base text-foreground leading-relaxed">
            Download your cellar as CSV for use in other tools or spreadsheets.
          </p>
          <ExportButtons />
        </section>

        <div className="border-t border-border" />

        <section className="space-y-3">
          <h3 className="font-display font-medium text-xl text-[var(--rust)]">Danger Zone</h3>
          <p className="font-display text-base text-foreground leading-relaxed">
            Delete every wine and log entry from your account. There is no undo.
          </p>
          <WipeButton />
        </section>
      </div>
    </div>
  )
}
