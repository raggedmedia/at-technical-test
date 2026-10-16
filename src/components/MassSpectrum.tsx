import { useEffect, useMemo, useRef, useState } from 'react'
import type { SpectrumBin } from '../fixtures/aptData'
import { SPECIES, speciesIdForMz } from '../fixtures/elementPeaks'
import type { Focus } from '../lib/verdict'
import { CANVAS, SPECIES_COLOUR } from '../lib/palette'
import { useTween } from '../hooks/useTween'
import { StatusIcon } from './StatusIcon'

interface Props {
  spectrum: SpectrumBin[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  focus: Extract<Focus, { on: 'spectrum' }> | null
  /** Fixture spectrum rather than parsed instrument data */
  demo?: boolean
}

// Chart margins, shared by draw, hit-test and the HTML note overlay
const ML = 64, MR = 16, MB = 40
const MZ_MAX = 100
const HEIGHT = 300
const TICK_FONT = '500 16px "Atkinson Hyperlegible Mono", ui-monospace, monospace'
const LABEL_FONT = '700 16px "Atkinson Hyperlegible Next", ui-sans-serif, sans-serif'
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

type Scale = 'log' | 'linear'
type Bin = { mz: number; count: number; log: number; species: string }

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return `${Math.round(n)}`
}

// Emphasis of one bar for a given selection: own colour opacity, faded opacity
function emphasis(species: string, sel: string | null): [number, number] {
  if (sel === null || species === sel) return [1, 0]
  return [0, 1]
}

export function MassSpectrum({ spectrum, selectedId, onSelect, focus, demo = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState<Scale>('log')
  const [width, setWidth] = useState(0)
  const [fontsReady, setFontsReady] = useState(false)
  const [hover, setHover] = useState<{ x: number; y: number; bin: Bin } | null>(null)
  const tween = useTween(selectedId)

  const bins = useMemo<Bin[]>(
    () => spectrum
      .filter(b => b.mz <= MZ_MAX)
      .map(b => ({ mz: b.mz, count: b.count, log: b.count > 0 ? Math.log10(b.count) : 0, species: speciesIdForMz(b.mz) })),
    [spectrum],
  )
  const maxCount = useMemo(() => Math.max(1, ...bins.map(b => b.count)), [bins])
  const yMax = scale === 'log' ? Math.ceil(Math.log10(maxCount)) : maxCount * 1.08
  // Tallest bar per identified species, in the current scale's units
  const peakTop = useMemo(() => {
    const m = new Map<string, number>()
    bins.forEach(b => {
      if (b.species === 'unranged') return
      const v = scale === 'log' ? b.log : b.count
      if (v > (m.get(b.species) ?? 0)) m.set(b.species, v)
    })
    return m
  }, [bins, scale])

  const MT = focus ? 56 : 36
  const cw = Math.max(0, width - ML - MR)
  const ch = HEIGHT - MT - MB
  const toX = (mz: number) => ML + (mz / MZ_MAX) * cw
  const toY = (v: number) => MT + ch - (v / yMax) * ch

  useEffect(() => { document.fonts.ready.then(() => setFontsReady(true)) }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx || !width) return
    const dpr = window.devicePixelRatio || 1
    c.width = width * dpr
    c.height = HEIGHT * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, HEIGHT)

    // Flag band sits behind the data and never changes it
    if (focus) {
      const x0 = toX(focus.mzMin - 0.4), x1 = toX(focus.mzMax + 0.4)
      ctx.fillStyle = CANVAS.focusBand
      ctx.fillRect(x0, MT, x1 - x0, ch)
      ctx.fillStyle = CANVAS.focusLine
      ctx.fillRect(x0, MT, x1 - x0, 2)
    }

    // Grid + ticks
    const yTicks = scale === 'log'
      ? Array.from({ length: yMax }, (_, i) => i + 1)
      : [0.25, 0.5, 0.75, 1].map(f => f * maxCount)
    ctx.font = TICK_FONT
    ctx.fillStyle = CANVAS.tick
    ctx.textBaseline = 'middle'
    yTicks.forEach(v => {
      const y = Math.round(toY(v)) + 0.5
      ctx.strokeStyle = CANVAS.grid
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ML, y); ctx.lineTo(width - MR, y); ctx.stroke()
      ctx.textAlign = 'right'
      ctx.fillText(scale === 'log' ? `10${SUPERSCRIPT[v]}` : formatCount(v), ML - 10, y)
    })
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const step = cw < 560 ? 20 : 10
    for (let mz = 0; mz <= MZ_MAX; mz += step) ctx.fillText(`${mz}`, toX(mz), MT + ch + 10)

    // Bars, interpolated between the previous and current selection
    const barW = Math.max(1.5, cw / (MZ_MAX * 10) - 0.5)
    const { from, to, t } = tween
    bins.forEach(b => {
      const v = scale === 'log' ? b.log : b.count
      if (v <= 0) return
      const [c0, f0] = emphasis(b.species, from)
      const [c1, f1] = emphasis(b.species, to)
      const own = c0 + (c1 - c0) * t
      const faded = f0 + (f1 - f0) * t
      const h = Math.max(1, (v / yMax) * ch)
      const x = toX(b.mz) - barW / 2
      if (faded > 0) {
        ctx.globalAlpha = faded
        ctx.fillStyle = CANVAS.barDim
        ctx.fillRect(x, MT + ch - h, barW, h)
      }
      if (own > 0) {
        ctx.globalAlpha = own
        ctx.fillStyle = SPECIES_COLOUR[b.species].light
        ctx.fillRect(x, MT + ch - h, barW, h)
      }
    })
    ctx.globalAlpha = 1

    // Name each identified peak above its tallest bar, nudging up when crowded
    ctx.font = LABEL_FONT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    let lastX = -Infinity, lastY = Infinity
    SPECIES.filter(s => s.mz <= MZ_MAX).forEach(s => {
      const top = peakTop.get(s.id)
      if (top === undefined) return
      const x = toX(s.mz)
      let y = toY(top) - 6
      if (x - lastX < 64) y = Math.min(y, lastY - 22)
      y = Math.max(20, y)
      lastX = x; lastY = y
      // Labels hold AA contrast: ink text, species colour carried by the swatch
      const dim = to !== null && to !== s.id
      const w = ctx.measureText(s.label).width
      ctx.globalAlpha = dim ? 0.35 : 1
      ctx.fillStyle = SPECIES_COLOUR[s.id].light
      ctx.fillRect(x - w / 2 - 14, y - 15, 10, 10)
      ctx.globalAlpha = 1
      ctx.fillStyle = dim ? CANVAS.labelDim : CANVAS.label
      ctx.fillText(s.label, x + 7, y)
    })

    // Baseline
    ctx.fillStyle = CANVAS.axis
    ctx.fillRect(ML, MT + ch, cw, 1.5)
  // toX/toY derive from width, ch, yMax, all listed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bins, width, scale, yMax, maxCount, tween, focus, fontsReady, peakTop])

  function binAt(clientX: number): Bin | null {
    const c = canvasRef.current
    if (!c || !cw) return null
    const mz = ((clientX - c.getBoundingClientRect().left - ML) / cw) * MZ_MAX
    let best: Bin | null = null
    for (const b of bins) if (b.count > 0 && Math.abs(b.mz - mz) <= 0.4 && (!best || b.count > best.count)) best = b
    return best
  }

  const noteX = focus ? Math.min(Math.max(toX((focus.mzMin + focus.mzMax) / 2), ML + 120), width - MR - 120) : 0
  const hoverSpecies = hover ? SPECIES.find(s => s.id === hover.bin.species) : null

  return (
    <section className="panel flex flex-col gap-4 p-6" aria-labelledby="spectrum-heading">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 id="spectrum-heading" className="m-0 text-step-1 font-bold">Mass spectrum</h2>
        <p className="m-0 text-slate-600">
          {demo && <span className="font-bold text-slate-900">Demonstration data. </span>}
          m/z 0 to {MZ_MAX} Da in 0.1 Da bins. Select a peak to light its ions.
        </p>
        <div role="group" aria-label="Y axis scale" className="ml-auto flex border border-slate-300">
          {(['log', 'linear'] as const).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={scale === s}
              onClick={() => setScale(s)}
              className={`cursor-pointer border-0 px-3.5 py-1.5 text-step-0 font-medium capitalize transition-colors duration-200 ${
                scale === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: HEIGHT }}>
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{ cursor: hover ? 'pointer' : 'default' }}
          role="img"
          aria-label={`Mass spectrum, ${scale} scale. Peak selection is also available in the composition table.`}
          onMouseMove={e => {
            const bin = binAt(e.clientX)
            const r = e.currentTarget.getBoundingClientRect()
            setHover(bin ? { x: e.clientX - r.left, y: e.clientY - r.top, bin } : null)
          }}
          onMouseLeave={() => setHover(null)}
          onClick={e => {
            const bin = binAt(e.clientX)
            if (bin) onSelect(selectedId === bin.species ? null : bin.species)
          }}
        />

        {focus && width > 0 && (
          <div
            className="pointer-events-none absolute flex -translate-x-1/2 items-center gap-2 border border-amber-600 bg-white px-3 py-1.5 font-bold whitespace-nowrap text-slate-900"
            style={{ left: noteX, top: 6, boxShadow: 'var(--shadow-panel)' }}
          >
            <StatusIcon tone="flag" size={16} />
            {focus.note}
          </div>
        )}

        {hover && (
          <div
            className="pointer-events-none absolute z-10 flex flex-col gap-0.5 bg-slate-900 px-3 py-2 text-white"
            style={{ left: Math.min(hover.x + 14, width - 180), top: Math.max(0, hover.y - 64), boxShadow: 'var(--shadow-raised)' }}
          >
            <span className="font-mono">{hover.bin.mz.toFixed(1)} Da</span>
            <span className="font-mono font-bold">{hover.bin.count.toLocaleString('en-AU')} ions</span>
            <span className="text-slate-300">{hoverSpecies ? `${hoverSpecies.label} ${hoverSpecies.name}` : 'Unranged'}</span>
          </div>
        )}
      </div>
    </section>
  )
}
