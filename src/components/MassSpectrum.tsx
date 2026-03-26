import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { SpectrumBin } from '../fixtures/aptData'
import { ELEMENT_PEAKS } from '../fixtures/elementPeaks'

interface Props {
  spectrum: SpectrumBin[]
  totalAtoms: number
  selectedPeak: string | null
  onSelectPeak: (label: string | null) => void
}

// Chart margins — must match between draw and hit-test
const ML = 54, MR = 12, MT = 28, MB = 36
const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

type Bin = { mz: number; count: number; logCount: number }

function draw(
  canvas: HTMLCanvasElement,
  data: Bin[],
  scale: 'log' | 'linear',
  linearMax: number,
  selectedPeak: string | null,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (!w || !h) return
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const cw = w - ML - MR
  const ch = h - MT - MB
  const yMax = scale === 'log' ? 7 : linearMax * 1.05

  const toX = (mz: number) => ML + (mz / 200) * cw
  const toY = (v: number)  => MT + ch - (v / yMax) * ch

  ctx.clearRect(0, 0, w, h)

  // Horizontal grid
  const yTicks = scale === 'log'
    ? [1, 2, 3, 4, 5, 6, 7]
    : [0.25, 0.5, 0.75, 1.0].map(f => f * linearMax)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  yTicks.forEach(v => {
    const y = toY(v)
    ctx.beginPath(); ctx.moveTo(ML, y); ctx.lineTo(w - MR, y); ctx.stroke()
  })

  // X axis baseline
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath(); ctx.moveTo(ML, MT + ch); ctx.lineTo(w - MR, MT + ch); ctx.stroke()

  // Bars
  const barW = Math.max(0.8, cw / 2000)
  const activePeak = selectedPeak ? ELEMENT_PEAKS.find(p => p.label === selectedPeak) : null

  if (!activePeak) {
    ctx.fillStyle = '#7dd3fc'
    data.forEach(b => {
      const v = scale === 'log' ? b.logCount : b.count
      if (v <= 0) return
      const bh = Math.max(1, (v / yMax) * ch)
      ctx.fillRect(toX(b.mz), MT + ch - bh, barW, bh)
    })
  } else {
    // Dim all bars
    ctx.fillStyle = 'rgba(255,255,255,0.09)'
    data.forEach(b => {
      const v = scale === 'log' ? b.logCount : b.count
      if (v <= 0) return
      const bh = Math.max(1, (v / yMax) * ch)
      ctx.fillRect(toX(b.mz), MT + ch - bh, barW, bh)
    })
    // Highlight selected mz range
    ctx.fillStyle = activePeak.color
    data.forEach(b => {
      if (b.mz < activePeak.mzMin || b.mz >= activePeak.mzMax) return
      const v = scale === 'log' ? b.logCount : b.count
      if (v <= 0) return
      const bh = Math.max(1, (v / yMax) * ch)
      ctx.fillRect(toX(b.mz), MT + ch - bh, barW, bh)
    })
  }

  // Reference lines
  ELEMENT_PEAKS.forEach(p => {
    const x = toX(p.mz)
    const active = !activePeak || activePeak.label === p.label
    ctx.save()
    ctx.strokeStyle = p.color
    ctx.globalAlpha = active ? 0.9 : 0.2
    ctx.lineWidth = active && activePeak ? 1.5 : 1
    ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(x, MT); ctx.lineTo(x, MT + ch); ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = active ? 1 : 0.25
    ctx.fillStyle = p.color
    ctx.font = `11px ${MONO}`
    ctx.textAlign = 'center'
    ctx.fillText(p.label, x, MT - 8)
    ctx.globalAlpha = 1
  })

  // Y tick labels
  ctx.fillStyle = 'rgba(107,114,128,1)'
  ctx.font = `10px ${MONO}`
  yTicks.forEach(v => {
    ctx.textAlign = 'right'
    const label = scale === 'log' ? `10^${v}` : formatCount(v)
    ctx.fillText(label, ML - 6, toY(v) + 3)
  })

  // X tick labels
  ctx.textAlign = 'center'
  for (let mz = 0; mz <= 200; mz += 20) {
    ctx.fillText(`${mz}`, toX(mz), MT + ch + 16)
  }
  ctx.textAlign = 'right'
  ctx.fillText('m/z (Da)', w - MR, MT + ch + 30)
}

interface TooltipState { x: number; y: number; bin: Bin }

export function MassSpectrum({ spectrum, selectedPeak, onSelectPeak }: Props) {
  const [scale, setScale] = useState<'log' | 'linear'>('log')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const data = useMemo<Bin[]>(() =>
    spectrum.map(b => ({ mz: b.mz, count: b.count, logCount: b.count > 0 ? Math.log10(b.count) : 0 })),
    [spectrum]
  )
  const linearMax = useMemo(() => Math.max(...data.map(d => d.count)), [data])

  // Redraw whenever scale, data, or selection changes
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    draw(c, data, scale, linearMax, selectedPeak)
  }, [data, scale, linearMax, selectedPeak])

  // Redraw on resize
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => draw(c, data, scale, linearMax, selectedPeak))
    ro.observe(c)
    return () => ro.disconnect()
  }, [data, scale, linearMax, selectedPeak])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left
    const cw = c.clientWidth - ML - MR
    const mz = ((x - ML) / cw) * 200
    if (mz < 0 || mz > 200) { setTooltip(null); return }
    const bin = data.reduce((b, d) => Math.abs(d.mz - mz) < Math.abs(b.mz - mz) ? d : b)
    setTooltip({ x, y: e.clientY - rect.top, bin })
  }, [data])

  const ttElement = tooltip ? ELEMENT_PEAKS.find(p => Math.abs(p.mz - tooltip.bin.mz) < 0.5) : null

  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-xl"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.18em] text-(--text-dim) m-0">
          Mass Spectrum · 0.1 Da bin width
        </p>
        <div
          className="relative flex items-center p-0.5 rounded-lg bg-(--bg-base) border border-(--border-dim) shrink-0"
          style={{ gap: 0 }}
        >
          <span
            aria-hidden
            className="absolute top-0.5 bottom-0.5 rounded-md bg-(--bg-card-hi) shadow-sm pointer-events-none"
            style={{
              width: 'calc(50% - 2px)', left: '2px',
              transform: scale === 'linear' ? 'translateX(calc(100% + 0px))' : 'translateX(0)',
              transition: 'transform 220ms var(--ease-spring)',
            }}
          />
          {(['log', 'linear'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={[
                'relative z-10 px-3 py-1 rounded-md text-xs font-(--font-mono) cursor-pointer border-0 bg-transparent w-14 text-center transition-colors duration-150',
                scale === s ? 'text-(--text-primary)' : 'text-(--text-dim) hover:text-(--text-secondary)',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Legend — click to isolate element in both views */}
      <div className="flex flex-wrap gap-2">
        {ELEMENT_PEAKS.map(p => {
          const isActive = selectedPeak === p.label
          const isDimmed = selectedPeak !== null && !isActive
          return (
            <button
              key={p.label}
              onClick={() => onSelectPeak(isActive ? null : p.label)}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-(--font-mono) border cursor-pointer transition-all duration-150',
                isActive
                  ? 'bg-(--bg-card-hi) text-(--text-primary)'
                  : isDimmed
                    ? 'border-(--border-dim) bg-(--bg-base) opacity-35 hover:opacity-80 hover:bg-(--bg-card-hi) hover:border-(--border-hi)'
                    : 'border-(--border-dim) bg-(--bg-base) hover:bg-(--bg-card-hi) hover:border-(--border-hi) hover:text-(--text-primary)',
              ].join(' ')}
              style={isActive ? { border: `1px solid ${p.color}`, boxShadow: `0 0 0 1px ${p.color}22` } : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
              <span className={isActive ? 'text-(--text-primary)' : 'text-(--text-secondary)'}>{p.label}</span>
              <span className={isActive ? 'text-(--text-secondary)' : 'text-(--text-dim)'}>{p.mz} Da</span>
            </button>
          )
        })}
      </div>

      {/* Canvas */}
      <div className="h-72 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />
        {tooltip && (
          <div
            className="card px-3 py-2.5 flex flex-col gap-1 text-xs min-w-36 absolute pointer-events-none"
            style={{ left: tooltip.x + 14, top: Math.max(0, tooltip.y - 10), zIndex: 10 }}
          >
            <p className="font-(--font-mono) text-(--text-dim) m-0">{tooltip.bin.mz.toFixed(1)} Da</p>
            <p className="tabular-nums font-semibold text-(--text-primary) m-0">{tooltip.bin.count.toLocaleString('en-US')} ions</p>
            {ttElement && <p className="m-0" style={{ color: ttElement.color }}>{ttElement.label}</p>}
          </div>
        )}
      </div>

      {/* Scale note */}
      <p className="text-[11px] text-(--text-dim) m-0">
        {scale === 'log'
          ? 'Log₁₀ scale — standard for APT mass spectra. Reveals minor peaks hidden by dominant Fe²⁺ signal.'
          : 'Linear scale — shows true relative abundance. Minor peaks may not be visible.'}
      </p>
    </div>
  )
}
