import type React from 'react'
import type { SpectrumBin } from '../fixtures/aptData'
import { StepLabel } from './StepLabel'

interface Props {
  spectrum: SpectrumBin[]
  totalAtoms: number
}

// Known element assignments for APT data.
// Each entry covers a m/z window that captures the peak cluster.
// charge: how many times the ion was ionised (²⁺ = doubly charged)
const ELEMENT_MAP = [
  { label: 'O',  fullName: 'Oxygen',     mzMin: 15.5, mzMax: 16.5, charge: 1, atomicMass: 16,  color: '#f59e0b', note: 'Surface oxide / vacuum residual' },
  { label: 'Fe', fullName: 'Iron',        mzMin: 27.3, mzMax: 29.0, charge: 2, atomicMass: 56,  color: '#3b82f6', note: 'Matrix element — dominant species' },
  { label: 'Ni', fullName: 'Nickel',      mzMin: 29.0, mzMax: 33.0, charge: 2, atomicMass: 58,  color: '#8b5cf6', note: 'Alloying element' },
  { label: 'Fe', fullName: 'Iron',        mzMin: 54.5, mzMax: 57.0, charge: 1, atomicMass: 56,  color: '#60a5fa', note: 'Singly-charged iron' },
  { label: 'Ni', fullName: 'Nickel',      mzMin: 57.0, mzMax: 65.0, charge: 1, atomicMass: 58,  color: '#a78bfa', note: 'Singly-charged nickel isotopes' },
  { label: '?',  fullName: 'Unidentified', mzMin: 71.0, mzMax: 73.0, charge: 1, atomicMass: 72, color: '#6b7280', note: 'Mo²⁺ or Ge — requires ranging' },
] as const

interface IdentifiedPeak {
  label: string
  fullName: string
  charge: number
  atomicMass: number
  color: string
  note: string
  count: number
  pct: number
  peakMz: number
}

function identifyPeaks(spectrum: SpectrumBin[], totalAtoms: number): IdentifiedPeak[] {
  return ELEMENT_MAP.map(el => {
    const bins = spectrum.filter(b => b.mz >= el.mzMin && b.mz <= el.mzMax)
    const count = bins.reduce((s, b) => s + b.count, 0)
    const peakBin = bins.reduce((best, b) => (b.count > best.count ? b : best), { mz: el.mzMin + (el.mzMax - el.mzMin) / 2, count: 0 })
    return {
      label: el.label,
      fullName: el.fullName,
      charge: el.charge,
      atomicMass: el.atomicMass,
      color: el.color,
      note: el.note,
      count,
      pct: (count / totalAtoms) * 100,
      peakMz: peakBin.mz,
    }
  }).sort((a, b) => b.count - a.count)
}

function chargeStr(n: number) {
  return n === 1 ? '⁺' : n === 2 ? '²⁺' : `${n}⁺`
}

function acquisitionQuality(peaks: IdentifiedPeak[]): { label: string; color: string; detail: string } {
  const topPeak = peaks[0]
  if (!topPeak || topPeak.count === 0) return { label: 'Unknown', color: '#6b7280', detail: 'No peaks detected' }
  // Fe²⁺ dominant is the expected signature for a healthy Fe-Ni alloy run
  if (topPeak.label === 'Fe' && topPeak.charge === 2) {
    return { label: 'Clean', color: '#22c55e', detail: 'Dominant Fe²⁺ peak — expected signature for Fe-Ni alloy' }
  }
  return { label: 'Review', color: '#f59e0b', detail: 'Unexpected dominant peak — verify reconstruction parameters' }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

export function MaterialIdentification({ spectrum, totalAtoms }: Props) {
  const peaks = identifyPeaks(spectrum, totalAtoms)
  const quality = acquisitionQuality(peaks)

  // Derive unique elements (deduplicate Fe which appears twice)
  const uniqueElements = [...new Map(peaks.filter(p => p.label !== '?').map(p => [p.label, p])).values()]
  const materialLabel = uniqueElements.map(e => e.label).join('-')

  return (
    <section className="flex flex-col gap-3">
      <StepLabel n="01" title="Material Identification" />
      <div
        className="flex flex-col gap-6 p-6 rounded-r-xl"
        style={{
          borderLeft: '2px solid var(--border-hi)',
          background: 'rgba(255, 255, 255, 0.016)',
        }}
      >

      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) m-0">
          First Look · Automated Identification
        </p>
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-(--text-primary) m-0">
            {materialLabel} Alloy
          </h2>
          <span className="text-sm text-(--text-secondary)">Fe-Ni based · iron matrix</span>
        </div>
      </div>

      {/* Quality detail */}
      <p className="text-[13px] text-(--text-secondary) m-0 -mt-2">
        {quality.detail}
      </p>

      {/* Peak table */}
      <div className="flex flex-col gap-px">
        {/* Column headers */}
        <div className="grid gap-4 px-3 pb-1.5" style={{ gridTemplateColumns: '2fr 3fr 2fr 2fr 3fr' }}>
          {['Ion', 'Element', 'Peak m/z', 'Ion Count', 'Note'].map(h => (
            <p key={h} className="font-(--font-mono) text-[10px] uppercase tracking-[0.15em] text-(--text-dim) m-0">{h}</p>
          ))}
        </div>

        {peaks.map((p, i) => (
          <div
            key={`${p.label}-${p.charge}-${i}`}
            className="grid gap-4 px-3 py-3 rounded-lg items-center"
            style={{
              gridTemplateColumns: '2fr 3fr 2fr 2fr 3fr',
              transition: 'transform 150ms var(--ease-out-quart), background 120ms ease, border-color 120ms ease',
              borderLeft: '2px solid transparent',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'var(--bg-card-hi)'
              el.style.transform = 'translateX(3px)'
              el.style.borderLeftColor = 'rgba(59,130,246,0.35)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = ''
              el.style.transform = ''
              el.style.borderLeftColor = 'transparent'
            }}
          >
            {/* Ion label */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="font-(--font-mono) text-sm font-medium text-(--text-primary)">
                {p.label}{chargeStr(p.charge)}
              </span>
            </div>

            {/* Full element name */}
            <span className="text-sm text-(--text-secondary)">{p.fullName}</span>

            {/* Peak m/z */}
            <span className="tabular-nums font-(--font-mono) text-sm text-(--text-primary)">
              {p.peakMz.toFixed(1)} Da
            </span>

            {/* Count + animated bar */}
            <div className="flex flex-col gap-1">
              <span className="tabular-nums font-(--font-mono) text-sm text-(--text-primary)">{formatCount(p.count)}</span>
              <div className="h-1 rounded-full bg-(--border-dim) overflow-hidden w-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    '--bar-width': `${Math.min(100, p.pct * 4)}%`,
                    width: 'var(--bar-width)',
                    background: p.color,
                    opacity: 0.7,
                    animation: `growBar 600ms var(--ease-out-quart) both`,
                    animationDelay: `${i * 60}ms`,
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Note */}
            <span className="text-[11px] text-(--text-dim) leading-tight">{p.note}</span>
          </div>
        ))}
      </div>

      {/* Footer caveat */}
      <p className="text-[11px] text-(--text-dim) m-0 pt-2 border-t border-(--border-dim)">
        Automated identification based on known APT m/z signatures. Assign definitive element ranges in Step 3: Range.
      </p>

      </div>
    </section>
  )
}
