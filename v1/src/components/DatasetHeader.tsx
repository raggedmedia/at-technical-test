import type { DatasetQuality } from '../lib/quality'

interface Props {
  atomCount: number
  quality: DatasetQuality
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

const STATUS_LABELS: Record<DatasetQuality['status'], string> = {
  clean:      'Clean acquisition',
  flagged:    'Review required',
  failed:     'Acquisition failed',
  processing: 'Processing\u2026',
  unknown:    'Status unknown',
}

export function DatasetHeader({ atomCount, quality }: Props) {
  const { accentColor, status } = quality
  const rgb = hexToRgb(accentColor)

  return (
    <div
      className="pt-10 pb-12 px-8 flex flex-col gap-3 rounded-xl"
      style={{
        background: 'var(--bg-card)',
        backgroundImage: `linear-gradient(to bottom, rgba(${rgb}, 0.13) 0px, rgba(${rgb}, 0.02) 140px)`,
        border: `1px solid rgba(${rgb}, 0.5)`,
        boxShadow: `var(--shadow-level-3), 0 0 48px rgba(${rgb}, 0.13), 0 1px 0 rgba(${rgb}, 0.25) inset`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        />
        <p className="font-(--font-mono) text-[11px] uppercase tracking-[0.22em] m-0" style={{ color: accentColor }}>
          {STATUS_LABELS[status]}
        </p>
      </div>
      <p className="tabular-nums text-[clamp(52px,8vw,84px)] font-semibold leading-none tracking-[-0.03em] text-(--text-primary) m-0">
        {atomCount > 0 ? atomCount.toLocaleString('en-US') : '\u2014'}
      </p>
      <p className="text-sm text-(--text-secondary) m-0">
        {status === 'failed'
          ? 'ions detected \u2014 insufficient for analysis'
          : status === 'processing'
            ? 'parsing in progress'
            : 'individual ions in 3D reconstruction'}
      </p>
    </div>
  )
}
