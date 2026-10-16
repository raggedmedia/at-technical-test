import type { FlagReason, FailReason } from '../fixtures/datasets'
import type { DatasetQuality } from '../lib/quality'
import type { Tone } from '../lib/verdict'
import { StatusIcon } from './StatusIcon'

const TONE: Record<DatasetQuality['status'], { tone: Tone; label: string }> = {
  clean:      { tone: 'pass',    label: 'Clean' },
  flagged:    { tone: 'flag',    label: 'Review' },
  failed:     { tone: 'fail',    label: 'Failed' },
  processing: { tone: 'pending', label: 'Processing' },
  unknown:    { tone: 'na',      label: 'Unknown' },
}

const FLAG_REASON: Record<FlagReason, string> = {
  'surface-contamination':    'Surface oxide',
  'reconstruction-artefacts': 'Artefacts',
  'unexpected-peak':          'Unknown peak',
}

const FAIL_REASON: Record<FailReason, string> = {
  'specimen-fracture': 'Tip fracture',
  'voltage-spike':     'Voltage spike',
  'vacuum-loss':       'Vacuum loss',
}

interface Props {
  quality: DatasetQuality
  failReason?: FailReason
}

export function StatusBadge({ quality, failReason }: Props) {
  const { tone, label } = TONE[quality.status]
  const reason = quality.status === 'flagged' ? FLAG_REASON[quality.reason]
    : quality.status === 'failed' && failReason ? FAIL_REASON[failReason]
    : null

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 md:flex-nowrap md:whitespace-nowrap">
      <StatusIcon tone={tone} size={18} />
      <span className="font-bold text-slate-900">{label}</span>
      {reason && <span className="text-slate-600">{reason}</span>}
    </span>
  )
}
