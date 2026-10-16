// Page chrome: where am I, what file, what state.
// Tertiary/secondary treatment — navigation, not content.
import { useNavigate } from 'react-router-dom'
import type { DatasetStatus, FlagReason, FailReason } from '../fixtures/datasets'
import { StatusBadge } from './StatusBadge'

interface Props {
  filename: string
  status: DatasetStatus
  flagReason?: FlagReason
  failReason?: FailReason
}

export function DatasetNav({ filename, status, flagReason, failReason }: Props) {
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
        <StatusBadge status={status} flagReason={flagReason} failReason={failReason} />
      </div>
    </nav>
  )
}
