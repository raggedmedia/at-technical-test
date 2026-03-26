// Page chrome: where am I, what file, what state.
// Tertiary/secondary treatment — navigation, not content.
import { useNavigate } from 'react-router-dom'
import type { DatasetStatus } from '../fixtures/datasets'

interface Props {
  filename: string
  status: DatasetStatus
}

const STATUS_CONFIG: Record<
  DatasetStatus,
  { label: string; color: string; bg: string; border: string; pulse: boolean }
> = {
  processed:  { label: 'Processed',  color: 'var(--green)', bg: 'var(--green-dim)',     border: 'var(--green-border)',   pulse: false },
  processing: { label: 'Processing', color: '#3b82f6',      bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', pulse: true  },
  flagged:    { label: 'Flagged',    color: '#f59e0b',      bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', pulse: false },
  failed:     { label: 'Failed',     color: '#ef4444',      bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  pulse: false },
}

export function DatasetNav({ filename, status }: Props) {
  const navigate = useNavigate()
  return (
    <nav className="flex items-center justify-between gap-6 px-8 py-4 border-b border-(--border-dim) mb-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 font-(--font-mono) text-[12px] text-(--text-dim) hover:text-(--text-secondary) transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0 shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All Datasets
      </button>
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <span className="font-(--font-mono) text-[13px] text-(--text-secondary) truncate">
          {filename}
        </span>
        <StatusBadge status={status} />
      </div>
    </nav>
  )
}

function StatusBadge({ status }: { status: DatasetStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: cfg.color,
          boxShadow: !cfg.pulse ? `0 0 5px ${cfg.color}` : undefined,
          animation: cfg.pulse ? 'pulse 1.5s ease-in-out infinite' : undefined,
        }}
      />
      {cfg.label}
    </div>
  )
}
