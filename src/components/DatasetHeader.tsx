import type { AptSummary, SpectrumBin } from '../fixtures/aptData'

interface Props {
  data: AptSummary
}

// Fe²⁺ window (27.3–29 Da) dominant → healthy run. Used to tint the header.
function isCleanAcquisition(spectrum: SpectrumBin[]): boolean {
  const windows = [
    { mzMin: 15.5, mzMax: 16.5 },
    { mzMin: 27.3, mzMax: 29.0 },
    { mzMin: 29.0, mzMax: 33.0 },
    { mzMin: 54.5, mzMax: 57.0 },
    { mzMin: 57.0, mzMax: 65.0 },
    { mzMin: 71.0, mzMax: 73.0 },
  ]
  const counts = windows.map(w =>
    spectrum.filter(b => b.mz >= w.mzMin && b.mz <= w.mzMax).reduce((s, b) => s + b.count, 0)
  )
  return counts[1] === Math.max(...counts)
}

export function DatasetHeader({ data }: Props) {
  const clean = isCleanAcquisition(data.spectrum)

  const accentColor = clean ? '#22c55e' : '#f59e0b'
  const accentAlpha = clean ? 'rgba(34, 197, 94' : 'rgba(245, 158, 11'
  const statusLabel = clean ? 'Clean acquisition' : 'Review acquisition'

  return (
    <div
      className="pt-10 pb-12 px-8 flex flex-col gap-3 rounded-xl"
      style={{
        background: `var(--bg-card)`,
        backgroundImage: `linear-gradient(to bottom, ${accentAlpha}, 0.13) 0px, ${accentAlpha}, 0.02) 140px)`,
        border: `1px solid ${accentAlpha}, 0.5)`,
        boxShadow: `var(--shadow-level-3), 0 0 48px ${accentAlpha}, 0.13), 0 1px 0 ${accentAlpha}, 0.25) inset`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        />
        <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.22em] m-0" style={{ color: accentColor }}>
          {statusLabel}
        </p>
      </div>
      <p className="tabular-nums text-[clamp(52px,8vw,84px)] font-semibold leading-none tracking-[-0.03em] text-(--text-primary) m-0">
        {data.atomCount.toLocaleString('en-US')}
      </p>
      <p className="text-sm text-(--text-secondary) m-0">
        individual ions in 3D reconstruction
      </p>
    </div>
  )
}
