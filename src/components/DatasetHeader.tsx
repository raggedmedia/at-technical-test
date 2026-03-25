import { useEffect, useRef, useState } from 'react'
import type { AptSummary, SpectrumBin } from '../fixtures/aptData'

// Count-up: animates from 0 → target over `duration`ms using ease-out-quart.
// The number "arriving" makes it feel like data was computed, not just rendered.
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(easeOutQuart(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

interface Props {
  data: AptSummary
}

// Fe²⁺ window (27.3–29 Da) dominant → healthy run. Used to tint the header.
function isCleanAcquisition(spectrum: SpectrumBin[]): boolean {
  const windows = [
    { mzMin: 15.5, mzMax: 16.5 },
    { mzMin: 27.3, mzMax: 29.0 }, // Fe²⁺ — expected dominant
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
  const count = useCountUp(data.atomCount, 1200)
  const clean = isCleanAcquisition(data.spectrum)

  const bgColor     = clean ? 'rgba(34, 197, 94, 0.07)'  : 'rgba(245, 158, 11, 0.07)'
  const borderColor = clean ? 'rgba(34, 197, 94, 0.18)'  : 'rgba(245, 158, 11, 0.18)'
  const dotColor    = clean ? '#22c55e' : '#f59e0b'
  const statusLabel = clean ? 'Clean acquisition' : 'Review acquisition'

  return (
    <div
      className="px-8 pt-10 pb-10 flex flex-col gap-3"
      style={{ background: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
        />
        <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.22em] text-(--text-dim) m-0">
          <span style={{ color: dotColor }}>{statusLabel}</span>
        </p>
      </div>
      <p className="tabular-nums text-[clamp(52px,8vw,84px)] font-semibold leading-none tracking-[-0.03em] text-(--text-primary) m-0">
        {count.toLocaleString('en-US')}
      </p>
      <p className="text-sm text-(--text-secondary) m-0">
        individual ions in 3D reconstruction
      </p>
    </div>
  )
}
