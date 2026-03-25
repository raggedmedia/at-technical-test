import { useEffect, useRef, useState } from 'react'
import type { AtomPoint } from '../hooks/useAptData'

interface Props {
  atoms: AtomPoint[]
  loading: boolean
}

// Colour atoms by m/z range — maps element classes to hues
function mzToColor(mz: number): { r: number; g: number; b: number } {
  if (mz < 18)  return { r: 251, g: 191, b: 36  }  // amber   — O⁺  @16
  if (mz < 30)  return { r: 59,  g: 130, b: 246  }  // blue    — Fe²⁺ @28
  if (mz < 35)  return { r: 139, g: 92,  b: 246  }  // violet  — Ni²⁺ @32
  if (mz < 58)  return { r: 96,  g: 165, b: 250  }  // sky     — Fe⁺  @56
  if (mz < 65)  return { r: 167, g: 139, b: 250  }  // purple  — Ni⁺  @58-64
  return          { r: 107, g: 114, b: 128 }          // grey    — unknown
}

function assessShape(atoms: AtomPoint[]): { label: string; color: string; detail: string } {
  if (!atoms.length) return { label: 'No data', color: '#6b7280', detail: '' }

  const xs = atoms.map(a => a.x)
  const ys = atoms.map(a => a.y)
  const xRange = Math.max(...xs) - Math.min(...xs)
  const yRange = Math.max(...ys) - Math.min(...ys)
  const ratio = Math.max(xRange, yRange) / Math.min(xRange, yRange)

  if (ratio < 1.15) return {
    label: 'Circular',
    color: '#22c55e',
    detail: `X/Y aspect ratio ${ratio.toFixed(2)} — needle cross-section is symmetric. Reconstruction is credible.`,
  }
  if (ratio < 1.4) return {
    label: 'Slightly elongated',
    color: '#f59e0b',
    detail: `X/Y aspect ratio ${ratio.toFixed(2)} — minor asymmetry. May indicate field evaporation artefacts.`,
  }
  return {
    label: 'Asymmetric',
    color: '#ef4444',
    detail: `X/Y aspect ratio ${ratio.toFixed(2)} — significant asymmetry. Review reconstruction parameters.`,
  }
}

export function PointCloud2D({ atoms, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 600, h: 520 })
  const shape = !loading && atoms.length ? assessShape(atoms) : null

  // Observe container width for responsive canvas
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      setSize({ w: Math.floor(w), h: Math.floor(w * 0.72) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Draw point cloud
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !atoms.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { w, h } = size
    const PAD = 40

    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, w, h)

    // Compute data bounds
    const xs = atoms.map(a => a.x)
    const ys = atoms.map(a => a.y)
    const xMin = Math.min(...xs), xMax = Math.max(...xs)
    const yMin = Math.min(...ys), yMax = Math.max(...ys)
    const xRange = xMax - xMin
    const yRange = yMax - yMin

    // Keep aspect ratio: map data to canvas with equal nm-per-pixel in both axes
    const plotW = w - PAD * 2
    const plotH = h - PAD * 2
    const scale = Math.min(plotW / xRange, plotH / yRange)
    const offsetX = PAD + (plotW - xRange * scale) / 2
    const offsetY = PAD + (plotH - yRange * scale) / 2

    const toCanvasX = (x: number) => offsetX + (x - xMin) * scale
    const toCanvasY = (y: number) => offsetY + (yMax - y) * scale  // flip Y

    // Grid lines at 10nm intervals
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    const gridStep = 10
    for (let gx = Math.ceil(xMin / gridStep) * gridStep; gx <= xMax; gx += gridStep) {
      const cx = toCanvasX(gx)
      ctx.beginPath(); ctx.moveTo(cx, PAD); ctx.lineTo(cx, h - PAD); ctx.stroke()
    }
    for (let gy = Math.ceil(yMin / gridStep) * gridStep; gy <= yMax; gy += gridStep) {
      const cy = toCanvasY(gy)
      ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(w - PAD, cy); ctx.stroke()
    }

    // Draw atoms — batch by colour for fewer fillStyle switches
    const BATCH_SIZE = 5000
    let drawn = 0

    function drawBatch() {
      if (!ctx) return
      const end = Math.min(drawn + BATCH_SIZE, atoms.length)
      for (let i = drawn; i < end; i++) {
        const a = atoms[i]
        const { r, g, b } = mzToColor(a.mz)
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`
        ctx.fillRect(toCanvasX(a.x) - 0.7, toCanvasY(a.y) - 0.7, 1.4, 1.4)
      }
      drawn = end
      if (drawn < atoms.length) requestAnimationFrame(drawBatch)
      else drawAxes()
    }

    function drawAxes() {
      if (!ctx) return
      ctx.font = '10px var(--font-mono, monospace)'
      ctx.fillStyle = 'rgba(107,114,128,0.9)'
      ctx.textAlign = 'center'

      // X axis ticks
      for (let gx = Math.ceil(xMin / gridStep) * gridStep; gx <= xMax; gx += gridStep) {
        ctx.fillText(`${gx}`, toCanvasX(gx), h - PAD + 14)
      }
      // Y axis ticks
      ctx.textAlign = 'right'
      for (let gy = Math.ceil(yMin / gridStep) * gridStep; gy <= yMax; gy += gridStep) {
        ctx.fillText(`${gy}`, PAD - 6, toCanvasY(gy) + 4)
      }
      // Axis labels
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(75,85,99,0.9)'
      ctx.fillText('X (nm)', w / 2, h - 4)
      ctx.save()
      ctx.translate(12, h / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Y (nm)', 0, 0)
      ctx.restore()
    }

    requestAnimationFrame(drawBatch)
  }, [atoms, size])

  return (
    <section className="card p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) m-0">
            Reconstruction Geometry · XY Projection
          </p>
          <p className="text-[13px] text-(--text-secondary) m-0">
            {loading ? 'Loading…' : `${atoms.length.toLocaleString('en-US')} sampled ions · coloured by m/z class`}
          </p>
        </div>
        {shape && (
          <div
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border"
            style={{
              color: shape.color,
              background: `${shape.color}18`,
              borderColor: `${shape.color}40`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: shape.color }} />
            {shape.label}
          </div>
        )}
      </div>

      {/* Shape assessment */}
      {shape && (
        <p className="text-[13px] text-(--text-secondary) m-0 -mt-2">{shape.detail}</p>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden border border-(--border-dim)">
        {loading ? (
          <div className="h-96 bg-(--bg-base) animate-pulse rounded-lg" />
        ) : (
          <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            className="block w-full"
          />
        )}
      </div>

      {/* Colour legend */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'O⁺', range: '< 18 Da',   color: '#fbbf24' },
            { label: 'Fe²⁺', range: '18–30 Da', color: '#3b82f6' },
            { label: 'Ni²⁺', range: '30–35 Da', color: '#8b5cf6' },
            { label: 'Fe⁺',  range: '35–58 Da', color: '#60a5fa' },
            { label: 'Ni⁺',  range: '58–65 Da', color: '#a78bfa' },
            { label: 'Other', range: '> 65 Da',  color: '#6b7280' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] font-(--font-mono) text-(--text-secondary)">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, opacity: 0.85 }} />
              {l.label} <span className="text-(--text-dim)">{l.range}</span>
            </span>
          ))}
        </div>
      )}

    </section>
  )
}
