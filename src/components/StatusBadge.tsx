import type { DatasetStatus, FlagReason, FailReason } from '../fixtures/datasets'

// Shared status badge — used on both the datasets list and the dataset detail nav.
// Whole chip pulses for 'processing'. Flag reason appended inline when supplied.

const STATUS_ACCENT: Record<DatasetStatus, string> = {
  processed:  '#22c55e',
  processing: '#3b82f6',
  flagged:    '#f59e0b',
  failed:     '#ef4444',
}

const STATUS_LABELS: Record<DatasetStatus, string> = {
  processed:  'Processed',
  processing: 'Processing',
  flagged:    'Flagged',
  failed:     'Failed',
}

const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  'surface-contamination':    'Surface oxide',
  'reconstruction-artefacts': 'Artefacts',
  'unexpected-peak':          'Unknown peak',
}

const FAIL_REASON_LABELS: Record<FailReason, string> = {
  'specimen-fracture': 'Tip fracture',
  'voltage-spike':     'Voltage spike',
  'vacuum-loss':       'Vacuum loss',
}

interface StatusBadgeProps {
  status: DatasetStatus
  flagReason?: FlagReason
  failReason?: FailReason
  /** Override the derived accent color (e.g. pass quality.accentColor for consistency). */
  accentColor?: string
}

export function StatusBadge({ status, flagReason, failReason, accentColor }: StatusBadgeProps) {
  const color = accentColor ?? STATUS_ACCENT[status]
  const isPulsing = status === 'processing'

  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border"
        style={{
          background: `${color}18`,
          borderColor: `${color}38`,
          color,
          animation: isPulsing ? 'pulse 1.4s ease-in-out infinite' : undefined,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: color,
            boxShadow: !isPulsing ? `0 0 5px ${color}` : undefined,
          }}
        />
        {STATUS_LABELS[status]}
      </div>
      {flagReason && (
        <span className="text-[11px] whitespace-nowrap" style={{ color, opacity: 0.75 }}>
          {FLAG_REASON_LABELS[flagReason]}
        </span>
      )}
      {failReason && (
        <span className="text-[11px] whitespace-nowrap" style={{ color, opacity: 0.75 }}>
          {FAIL_REASON_LABELS[failReason]}
        </span>
      )}
    </div>
  )
}
