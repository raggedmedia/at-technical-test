// ─── Invoice ──────────────────────────────────────────────────────────────────
// Standalone page — not part of the dataset workflow.
// Route: /invoice

const INVOICE_NUMBER = 'INV-20260329'
const INVOICE_DATE = '29 March 2026'
const DUE_DATE = '12 April 2026'

const FROM = {
  name: 'Drew Foster',
  address: ['6 Romney St', 'Brighton QLD 4017', 'Australia'],
}

const TO = {
  company: 'Atomic Tessellator Limited',
  contact: 'Alain Richardt',
  email: 'alain@atomictessellator.com',
  nzbn: '9429050548521',
  address: ['Care of The Better Co Limited', '48 Broadway, Newmarket', 'Auckland 1023', 'New Zealand'],
}

const RATE = 40
const HOURS_CLAIMED = 8

interface LogItem {
  phase: string
  description: string
  minutes: number
}

const TIME_LOG: LogItem[] = [
  { phase: 'Planning',      description: 'Reviewing brief, validating and refining approach',              minutes: 30 },
  { phase: 'Setup',         description: 'Initial project setup and scaffolding',                         minutes: 30 },
  { phase: 'Data',          description: 'Parsing .epos file, understanding binary format',               minutes: 15 },
  { phase: 'Detail Page',   description: 'First iteration of dataset detail page',                        minutes: 30 },
  { phase: 'Design',        description: 'Design tokens, elevation system, visual hierarchy',             minutes: 30 },
  { phase: 'Detail Page',   description: 'Detail page visual hierarchy pass',                        minutes: 30 },
  { phase: 'Detail Page',   description: 'Mass spectrum polish',                                          minutes: 15 },
  { phase: 'Detail Page',   description: 'Point cloud polish',                                            minutes: 15 },
  { phase: 'Detail Page',   description: 'Next steps footer polish',                                      minutes: 15 },
  { phase: 'Planning',      description: 'Phase 2 planning — dataset management scope',                   minutes: 30 },
  { phase: 'Home Screen',   description: 'Initial dataset list home screen',                              minutes: 45 },
  { phase: 'Detail Page',   description: 'Detail page state variants (flagged, failed, processing)',      minutes: 45 },
  { phase: 'Home Screen',   description: 'Upload CTA UI',                                                 minutes: 30 },
  { phase: 'Polish',        description: 'Demo edge toasts and confetti',                                 minutes: 15 },
  { phase: 'Polish',        description: 'Code cleanup, polish, and tidy up',                            minutes: 45 },
  { phase: 'Documentation', description: 'Writing README',                                               minutes: 60 },
]

const TOTAL_LOGGED_MINUTES = TIME_LOG.reduce((sum, item) => sum + item.minutes, 0)
void TOTAL_LOGGED_MINUTES // retained for reference

function fmt(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function InvoicePage() {
  const subtotal = (HOURS_CLAIMED * RATE).toFixed(2)

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .invoice-root { background: #fff !important; padding: 0 !important; }
          .invoice-inner { padding: 0 !important; }
          .card {
            background: #fff !important;
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
          }
          * {
            color: #111 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          tr { background: transparent !important; }
        }
      `}</style>
    <div className="invoice-root min-h-screen bg-(--bg-base) py-16">
      <div className="max-w-3xl mx-auto px-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <img src="/at-logo.svg" alt="Atomic Tessellator" className="h-6 w-auto opacity-60 mb-6" />
            <h1
              className="text-4xl font-semibold tracking-tight m-0"
              style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              Invoice
            </h1>
          </div>
          <div className="text-right font-(--font-mono) text-sm space-y-1">
            <div className="text-(--text-primary) font-medium">{INVOICE_NUMBER}</div>
            <div className="text-(--text-secondary)">Issued: {INVOICE_DATE}</div>
            <div className="text-(--text-secondary)">Due: {DUE_DATE}</div>
          </div>
        </div>

        {/* ── From / To ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="card p-6 flex flex-col gap-1">
            <div className="text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim) mb-2">From</div>
            <div className="text-(--text-primary) font-medium">{FROM.name}</div>
            {FROM.address.map(line => (
              <div key={line} className="text-(--text-secondary) text-sm">{line}</div>
            ))}
            <div className="text-(--text-dim) text-sm mt-1">No ABN</div>
          </div>
          <div className="card p-6 flex flex-col gap-1">
            <div className="text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim) mb-2">To</div>
            <div className="text-(--text-primary) font-medium">{TO.company}</div>
            <div className="text-(--text-secondary) text-sm">Attn: {TO.contact}</div>
            <div className="text-(--text-secondary) text-sm">{TO.email}</div>
            {TO.address.map(line => (
              <div key={line} className="text-(--text-secondary) text-sm">{line}</div>
            ))}
            <div className="text-(--text-dim) text-sm mt-1">NZBN: {TO.nzbn}</div>
          </div>
        </div>

        {/* ── Line Items ───────────────────────────────────────────────── */}
        <div className="card overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-dim)">
                <th className="text-left px-6 py-3 text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim) w-28">Phase</th>
                <th className="text-left px-4 py-3 text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim)">Description</th>
                <th className="text-right px-6 py-3 text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim) w-16">Time</th>
              </tr>
            </thead>
            <tbody>
              {TIME_LOG.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-(--border-dim) last:border-0"
                  style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                >
                  <td className="px-6 py-3 font-(--font-mono) text-[11px] text-(--text-dim) whitespace-nowrap">{item.phase}</td>
                  <td className="px-4 py-3 text-(--text-secondary)">{item.description}</td>
                  <td className="px-6 py-3 text-right font-(--font-mono) text-(--text-secondary) whitespace-nowrap">{fmt(item.minutes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-(--border-hi)">
                <td colSpan={2} className="px-6 py-3 text-(--text-dim) text-sm font-(--font-mono)">
                  Total
                </td>
                <td className="px-6 py-3 text-right font-(--font-mono) text-sm text-(--text-secondary) whitespace-nowrap">{HOURS_CLAIMED}h</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Totals ───────────────────────────────────────────────────── */}
        <div className="flex justify-end mb-12">
          <div className="card p-6 w-72">
            <div className="flex justify-between text-sm text-(--text-secondary) mb-2">
              <span>{HOURS_CLAIMED} hrs × AUD ${RATE}.00/hr</span>
              <span className="font-(--font-mono)">AUD ${subtotal}</span>
            </div>
            <div className="h-px bg-(--border-hi) my-3" />
            <div className="flex justify-between font-semibold text-(--text-primary)">
              <span>Total Due</span>
              <span className="font-(--font-mono) text-lg">AUD ${subtotal}</span>
            </div>
          </div>
        </div>

        {/* ── Payment Details ──────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="text-[11px] font-(--font-mono) uppercase tracking-widest text-(--text-dim) mb-4">Payment Details</div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-(--text-dim) text-xs font-(--font-mono)">Account Name</span>
              <span className="text-(--text-primary)">{FROM.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-(--text-dim) text-xs font-(--font-mono)">BSB</span>
              <span className="text-(--text-primary) font-(--font-mono)">923-100</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-(--text-dim) text-xs font-(--font-mono)">Account Number</span>
              <span className="text-(--text-primary) font-(--font-mono)">31216800</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  )
}
