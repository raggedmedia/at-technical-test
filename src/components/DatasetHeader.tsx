import type { AptSummary } from '../fixtures/aptData'

interface Props {
  data: AptSummary
}

function formatNm(n: number): string {
  return n.toFixed(1)
}

function formatVolume(d: AptSummary['dimensions']): string {
  const vol = d.x.range_nm * d.y.range_nm * d.z.range_nm
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)} μm³`
  return `${Math.round(vol).toLocaleString('en-US')} nm³`
}

export function DatasetHeader({ data }: Props) {
  const { dimensions: d } = data

  return (
    <header className="flex flex-col gap-10 px-8 pt-10 pb-8">

      {/* Identity row */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.22em] text-(--text-dim) m-0">
            Atom Probe Tomography · EPOS
          </p>
          <p className="text-[15px] text-(--text-secondary) truncate m-0">
            {data.filename}
          </p>
        </div>
        <ProcessedBadge />
      </div>

      {/* Hero: atom count */}
      <div className="flex flex-col gap-2">
        <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.22em] text-(--text-dim) m-0">
          Ions Detected
        </p>
        <p className="tabular-nums text-[clamp(52px,8vw,84px)] font-semibold leading-none tracking-[-0.03em] text-(--text-primary) m-0">
          {data.atomCount.toLocaleString('en-US')}
        </p>
        <p className="text-sm text-(--text-secondary) m-0">
          individual ions in 3D reconstruction
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Depth (Z)"
          value={`${formatNm(d.z.range_nm)} nm`}
          sub={`${formatNm(d.z.min)} → ${formatNm(d.z.max)} nm`}
          detail="Evaporation depth into material"
        />
        <StatCard
          label="m/z Range"
          value={`${data.mzRange.min} – ${data.mzRange.max} Da`}
          sub="mass-to-charge detected"
          detail="Defines which element classes are present"
        />
        <StatCard
          label="Reconstruction Volume"
          value={formatVolume(d)}
          sub={`${formatNm(d.x.range_nm)} × ${formatNm(d.y.range_nm)} × ${formatNm(d.z.range_nm)} nm`}
          detail="Physical block of material sampled"
        />
      </div>

    </header>
  )
}

function ProcessedBadge() {
  return (
    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-(--green-dim) border border-(--green-border) text-(--green) shadow-[0_0_16px_rgba(34,197,94,0.08)] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-(--green) shadow-[0_0_6px_var(--green)] shrink-0" />
      Processed
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub: string
  detail: string
}

function StatCard({ label, value, sub, detail }: StatCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-2.5">
      <p className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) m-0">
        {label}
      </p>
      <p className="tabular-nums text-[22px] font-semibold leading-[1.1] text-(--text-primary) m-0">
        {value}
      </p>
      <p className="tabular-nums font-(--font-mono) text-[11px] leading-none text-(--text-secondary) m-0">
        {sub}
      </p>
      <p className="text-[11px] leading-[1.4] text-(--text-dim) mt-0.5 pt-2 border-t border-(--border-dim) m-0">
        {detail}
      </p>
    </div>
  )
}
