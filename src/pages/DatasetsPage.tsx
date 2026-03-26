import { useNavigate } from 'react-router-dom'
import { DATASETS } from '../fixtures/datasets'
import type { Dataset, FlagReason } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import type { DatasetQuality } from '../lib/quality'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  if (n === 0) return '—'
  return n.toString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  'surface-contamination':    'Surface oxide',
  'reconstruction-artefacts': 'Artefacts',
  'unexpected-peak':          'Unknown peak',
}

function QualityDot({ quality }: { quality: DatasetQuality }) {
  const pulse = quality.status === 'processing'
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0"
      style={{
        background: quality.accentColor,
        boxShadow: !pulse ? `0 0 7px ${quality.accentColor}` : undefined,
        animation: pulse ? 'pulse 1.5s ease-in-out infinite' : undefined,
      }}
    />
  )
}

function DatasetRow({ dataset }: { dataset: Dataset }) {
  const navigate = useNavigate()
  const quality = computeQuality(dataset, dataset.spectrum)
  const isClickable = dataset.status !== 'processing'

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={() => isClickable && navigate(`/dataset/${dataset.id}`)}
      onKeyDown={e => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) navigate(`/dataset/${dataset.id}`) }}
      className={[
        'group grid items-center gap-6 px-5 py-4 rounded-xl transition-all duration-150',
        isClickable
          ? 'cursor-pointer hover:bg-(--bg-card)'
          : 'cursor-default',
      ].join(' ')}
      style={{
        gridTemplateColumns: '1fr 160px 90px 64px 24px',
        outline: 'none',
      }}
    >
      {/* Col 1: status dot + filename */}
      <div className="flex items-center gap-3 min-w-0">
        <QualityDot quality={quality} />
        <div className="flex flex-col min-w-0 gap-0.5">
          <span
            className={[
              'font-(--font-mono) text-[13px] leading-snug truncate transition-colors duration-150',
              isClickable ? 'text-(--text-primary) group-hover:text-white' : 'text-(--text-dim)',
            ].join(' ')}
          >
            {dataset.filename}
          </span>
          {dataset.flagReason && (
            <span
              className="text-[11px] leading-none"
              style={{ color: quality.accentColor }}
            >
              {FLAG_REASON_LABELS[dataset.flagReason]}
            </span>
          )}
        </div>
      </div>

      {/* Col 2: material */}
      <span className="text-sm text-(--text-secondary) truncate">{dataset.material}</span>

      {/* Col 3: ion count */}
      <span className="tabular-nums font-(--font-mono) text-sm text-(--text-dim) text-right">
        {formatCount(dataset.atomCount)}
      </span>

      {/* Col 4: date */}
      <span className="text-[12px] text-(--text-dim) text-right whitespace-nowrap">
        {formatDate(dataset.uploadedAt)}
      </span>

      {/* Col 5: arrow */}
      <div className="flex justify-end">
        {isClickable && (
          <svg
            className="w-4 h-4 text-(--text-dim) transition-all duration-150 group-hover:text-(--text-secondary) group-hover:translate-x-0.5"
            viewBox="0 0 16 16" fill="none" aria-hidden
          >
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}

export function DatasetsPage() {
  // Summary stats
  const statusCounts = DATASETS.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-(--bg-base)">
      <header className="border-b border-(--border-dim)">
        <div className="max-w-300 mx-auto px-8 py-6 flex items-end justify-between gap-8">
          <div>
            <p className="font-(--font-mono) text-[10px] uppercase tracking-[0.3em] text-(--text-dim) m-0">
              Atomic Tessellator
            </p>
            <h1 className="text-2xl font-semibold text-(--text-primary) m-0 mt-1.5">
              Datasets
            </h1>
            <p className="text-sm text-(--text-secondary) m-0 mt-1">
              {DATASETS.length} reconstructions
              {statusCounts['flagged'] ? ` · ${statusCounts['flagged']} flagged` : ''}
              {statusCounts['failed']  ? ` · ${statusCounts['failed']} failed`  : ''}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-(--text-secondary) border border-(--border-hi) bg-transparent hover:bg-(--bg-card) hover:text-(--text-primary) hover:border-(--border-hi) transition-all duration-150 cursor-pointer"
            style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2v9M4 7l4 4 4-4M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload .epos
          </button>
        </div>
      </header>

      <main className="max-w-300 mx-auto py-4">
        {/* Column header row */}
        <div
          className="grid items-center gap-6 px-5 py-2"
          style={{ gridTemplateColumns: '1fr 160px 90px 64px 24px' }}
        >
          <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim)">Filename</span>
          <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim)">Material</span>
          <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) text-right">Ions</span>
          <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim) text-right">Uploaded</span>
          <span />
        </div>

        <div className="flex flex-col gap-1 px-0">
          {DATASETS.map(d => <DatasetRow key={d.id} dataset={d} />)}
        </div>
      </main>
    </div>
  )
}
