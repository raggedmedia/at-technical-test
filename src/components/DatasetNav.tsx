// Page chrome: where am I, what is this file, what state is it in.
// Tertiary/secondary treatment — navigation, not content.

interface Props {
  filename: string
  status: 'Processed' | 'Processing'
}

export function DatasetNav({ filename, status }: Props) {
  return (
    <nav className="flex items-center justify-between gap-6 px-8 py-4 border-b border-(--border-dim) mb-8">

      {/* Back — tertiary: link-style, no background */}
      <button className="flex items-center gap-1.5 font-(--font-mono) text-[12px] text-(--text-dim) hover:text-(--text-secondary) transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0 shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All Datasets
      </button>

      {/* File identity — secondary */}
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <span className="font-(--font-mono) text-[13px] text-(--text-secondary) truncate">
          {filename}
        </span>
        <StatusBadge status={status} />
      </div>

    </nav>
  )
}

function StatusBadge({ status }: { status: Props['status'] }) {
  const isProcessed = status === 'Processed'
  return (
    <div
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border"
      style={isProcessed ? {
        background: 'var(--green-dim)',
        borderColor: 'var(--green-border)',
        color: 'var(--green)',
      } : {
        background: 'rgba(245,158,11,0.1)',
        borderColor: 'rgba(245,158,11,0.25)',
        color: '#f59e0b',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={isProcessed
          ? { background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }
          : { background: '#f59e0b', animation: 'pulse 1.5s ease-in-out infinite' }
        }
      />
      {status}
    </div>
  )
}
