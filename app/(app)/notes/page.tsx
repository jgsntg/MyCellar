export default function NotesPage() {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">How the Ledger Works</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
      </div>

      <div className="bg-card border border-border rounded-sm p-8 shadow-sm max-w-2xl space-y-6 font-display text-[15px] leading-relaxed">
        <section>
          <h3 className="font-display font-medium text-xl text-[var(--burgundy-deep)] mb-3">The Drinking Window</h3>
          <p className="mb-2">Each bottle may carry four years that describe its arc:</p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>Earliest</strong> — when the wine first becomes pleasurable.</li>
            <li><strong>Peak Start</strong> — entry into the prime drinking window.</li>
            <li><strong>Peak End</strong> — the close of the prime window.</li>
            <li><strong>Latest</strong> — last reasonable date before decline.</li>
          </ul>
          <p className="mt-2 italic text-muted-foreground">
            If you only know rough years, put those in Peak Start and Peak End and leave the others blank.
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h3 className="font-display font-medium text-xl text-[var(--burgundy-deep)] mb-3">Suggested Defaults by Style</h3>
          <ul className="pl-5 list-disc space-y-1">
            <li><em>Beaujolais Nouveau, Vinho Verde, light whites:</em> drink within 1–2 years of vintage</li>
            <li><em>Pinot Grigio, Sauvignon Blanc, unoaked Chardonnay:</em> 1–3 years</li>
            <li><em>Rosé:</em> 1–2 years</li>
            <li><em>Oaked Chardonnay, dry Riesling:</em> 3–8 years</li>
            <li><em>Pinot Noir (mid-tier):</em> 4–8 years; top Burgundy 8–20+ years</li>
            <li><em>Chianti Classico:</em> 4–10 years; Brunello, Barolo: 10–25 years</li>
            <li><em>Napa Cabernet:</em> 8–20 years for serious bottlings</li>
            <li><em>Champagne (NV):</em> 2–5 years; Vintage: 8–20+ years</li>
          </ul>
        </section>

        <div className="border-t border-border" />

        <section>
          <h3 className="font-display font-medium text-xl text-[var(--burgundy-deep)] mb-3">Tips</h3>
          <ul className="pl-5 list-disc space-y-1">
            <li>Click any row in The Cellar to edit or delete an entry.</li>
            <li>Open the edit modal and choose <strong>Mark 1 Drunk</strong> to log a bottle and decrement quantity in one step.</li>
            <li>The Drinkability Report sorts urgency from "drink now" to "still young."</li>
            <li>Re-importing a CSV skips rows that are already in your cellar.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
