import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { SpectrumBin } from '../fixtures/aptData'

interface Props {
  spectrum: SpectrumBin[]
  totalAtoms: number
}

// Known element peaks for this Fe-Ni alloy dataset.
// Charge state noted: ²⁺ means doubly-ionised (mass appears at M/2).
const ELEMENT_PEAKS = [
  { mz: 16.0, label: 'O⁺',   color: '#f59e0b' },
  { mz: 27.9, label: 'Fe²⁺', color: '#3b82f6' },
  { mz: 31.9, label: 'Ni²⁺', color: '#8b5cf6' },
  { mz: 55.8, label: 'Fe⁺',  color: '#60a5fa' },
  { mz: 57.9, label: 'Ni⁺',  color: '#a78bfa' },
  { mz: 71.9, label: '?⁺',   color: '#6b7280' },
]

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

interface TooltipPayload {
  mz: number
  count: number
  logCount: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayload }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const element = ELEMENT_PEAKS.find(p => Math.abs(p.mz - d.mz) < 0.5)
  return (
    <div className="card px-3 py-2.5 flex flex-col gap-1 text-xs min-w-36">
      <p className="font-(--font-mono) text-(--text-dim) m-0">{d.mz.toFixed(1)} Da</p>
      <p className="tabular-nums font-semibold text-(--text-primary) m-0">{d.count.toLocaleString('en-US')} ions</p>
      {element && (
        <p className="m-0" style={{ color: element.color }}>{element.label}</p>
      )}
    </div>
  )
}

export function MassSpectrum({ spectrum, totalAtoms }: Props) {
  const [scale, setScale] = useState<'log' | 'linear'>('log')

  const data = useMemo(() => {
    return spectrum.map(bin => ({
      mz: bin.mz,
      count: bin.count,
      logCount: bin.count > 0 ? Math.log10(bin.count) : 0,
    }))
  }, [spectrum])

  const dataKey = scale === 'log' ? 'logCount' : 'count'

  const yDomain = useMemo(() => {
    if (scale === 'log') return [0, 7] as [number, number]
    const max = Math.max(...data.map(d => d.count))
    return [0, max * 1.05] as [number, number]
  }, [scale, data])

  const yTickFormatter = (v: number) =>
    scale === 'log' ? `10^${v.toFixed(0)}` : formatCount(v)

  return (
    <section className="card p-6 flex flex-col gap-5">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) m-0">
            Mass Spectrum
          </p>
          <p className="text-[13px] text-(--text-secondary) m-0">
            {totalAtoms.toLocaleString('en-US')} ions · 0.1 Da bin width · {spectrum.length} bins
          </p>
        </div>

        {/* Log / Linear toggle — sliding pill with spring physics */}
        <div
          className="relative flex items-center p-0.5 rounded-lg bg-(--bg-base) border border-(--border-dim) shrink-0"
          style={{ gap: 0 }}
        >
          {/* Sliding pill — translates between the two positions */}
          <span
            aria-hidden
            className="absolute top-0.5 bottom-0.5 rounded-md bg-(--bg-card-hi) shadow-sm pointer-events-none"
            style={{
              width: 'calc(50% - 2px)',
              left: '2px',
              transform: scale === 'linear' ? 'translateX(calc(100% + 0px))' : 'translateX(0)',
              transition: 'transform 220ms var(--ease-spring)',
            }}
          />
          {(['log', 'linear'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={[
                'relative z-10 px-3 py-1 rounded-md text-xs font-(--font-mono) cursor-pointer border-0 bg-transparent w-14 text-center',
                'transition-colors duration-150',
                scale === s ? 'text-(--text-primary)' : 'text-(--text-dim) hover:text-(--text-secondary)',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Element legend pills */}
      <div className="flex flex-wrap gap-2">
        {ELEMENT_PEAKS.map(p => (
          <span
            key={p.label}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-(--font-mono) border border-(--border-dim) bg-(--bg-base)"
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-(--text-secondary)">{p.label}</span>
            <span className="text-(--text-dim)">{p.mz} Da</span>
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 8, left: 48 }} barCategoryGap={0}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="mz"
              type="number"
              domain={[0, 200]}
              tickCount={21}
              tickFormatter={v => `${v}`}
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--border-dim)' }}
              tickLine={false}
              label={{
                value: 'm/z (Da)',
                position: 'insideBottomRight',
                offset: -4,
                fontSize: 10,
                fill: 'var(--text-dim)',
              }}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            {ELEMENT_PEAKS.map(p => (
              <ReferenceLine
                key={p.label}
                x={p.mz}
                stroke={p.color}
                strokeOpacity={0.5}
                strokeDasharray="4 3"
                label={{
                  value: p.label,
                  position: 'top',
                  fontSize: 9,
                  fill: p.color,
                  fontFamily: 'var(--font-mono)',
                }}
              />
            ))}
            <Bar
              dataKey={dataKey}
              fill="var(--accent)"
              fillOpacity={0.7}
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scale note */}
      <p className="text-[11px] text-(--text-dim) m-0">
        {scale === 'log'
          ? 'Log₁₀ scale — standard for APT mass spectra. Reveals minor peaks hidden by dominant Fe²⁺ signal.'
          : 'Linear scale — shows true relative abundance. Minor peaks may not be visible.'}
      </p>

    </section>
  )
}
