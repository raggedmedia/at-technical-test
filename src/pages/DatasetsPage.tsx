import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DATASETS } from '../fixtures/datasets'
import type { Dataset, DatasetStatus, FlagReason } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import type { DatasetQuality } from '../lib/quality'

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  if (n === 0) return '\u2014'
  return n.toString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Status chip ──────────────────────────────────────────────────────────────

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

function StatusChip({ dataset, quality }: { dataset: Dataset; quality: DatasetQuality }) {
  const isPulsing = dataset.status === 'processing'
  return (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit whitespace-nowrap"
        style={{
          background: `${quality.accentColor}18`,
          border: `1px solid ${quality.accentColor}38`,
          color: quality.accentColor,
          animation: isPulsing ? 'pulse 1.4s ease-in-out infinite' : undefined,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: quality.accentColor,
            boxShadow: !isPulsing ? `0 0 5px ${quality.accentColor}` : undefined,
          }}
        />
        {STATUS_LABELS[dataset.status]}
      </div>
      {dataset.flagReason && (
        <span className="text-[11px] whitespace-nowrap" style={{ color: `${quality.accentColor}99` }}>
          {FLAG_REASON_LABELS[dataset.flagReason]}
        </span>
      )}
    </div>
  )
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey = 'status' | 'material' | 'ions' | 'uploaded'
type SortDir = 'asc' | 'desc'

const STATUS_ORDER: Record<DatasetStatus, number> = { flagged: 0, failed: 1, processed: 2, processing: 3 }

function sortDatasets(datasets: Dataset[], key: SortKey, dir: SortDir): Dataset[] {
  const sorted = [...datasets].sort((a, b) => {
    switch (key) {
      case 'status':   return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      case 'material': return a.material.localeCompare(b.material)
      case 'ions':     return a.atomCount - b.atomCount
      case 'uploaded': return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    }
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  const up   = 'M6 9V3M3 6l3-3 3 3'
  const down = 'M6 3v6M3 6l3 3 3-3'
  return (
    <svg
      className="w-3 h-3 shrink-0 transition-opacity duration-100"
      style={{ opacity: active ? 0.85 : 0.25 }}
      viewBox="0 0 12 12" fill="none" aria-hidden
    >
      <path d={active && dir === 'desc' ? down : up} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface SortableThProps {
  col: SortKey
  activeKey: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  align?: 'left' | 'right'
  children: React.ReactNode
}

function SortableTh({ col, activeKey, dir, onSort, align = 'left', children }: SortableThProps) {
  const active = activeKey === col
  return (
    <th
      scope="col"
      onClick={() => onSort(col)}
      className={[
        'font-(--font-mono) text-[10px] uppercase tracking-[0.18em] font-normal',
        'cursor-pointer select-none transition-colors duration-100 whitespace-nowrap',
        active ? 'text-(--text-secondary)' : 'text-(--text-dim) hover:text-(--text-secondary)',
      ].join(' ')}
    >
      <span className={`flex items-center gap-1 px-4 py-2.5 ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        <SortIcon active={active} dir={dir} />
      </span>
    </th>
  )
}

function DatasetTable({ datasets }: { datasets: Dataset[] }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('uploaded')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => sortDatasets(datasets, sortKey, sortDir), [datasets, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'uploaded' || key === 'ions' ? 'desc' : 'asc')
    }
  }

  return (
    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 1px' }}>
      <colgroup>
        <col style={{ width: '34%' }} />
        <col style={{ width: '16%' }} />
        <col style={{ width: '16%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '6%'  }} />
      </colgroup>

      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-dim)', background: 'rgba(255,255,255,0.018)' }}>
          {/* Filename — not sortable (hash filenames don't sort meaningfully) */}
          <th
            scope="col"
            className="font-(--font-mono) text-[10px] uppercase tracking-[0.18em] text-(--text-dim) font-normal text-left px-4 py-2.5"
          >
            Filename
          </th>
          <SortableTh col="status"   activeKey={sortKey} dir={sortDir} onSort={handleSort}>Status</SortableTh>
          <SortableTh col="material" activeKey={sortKey} dir={sortDir} onSort={handleSort}>Material</SortableTh>
          <SortableTh col="ions"     activeKey={sortKey} dir={sortDir} onSort={handleSort} align="right">Ions</SortableTh>
          <SortableTh col="uploaded" activeKey={sortKey} dir={sortDir} onSort={handleSort}>Uploaded</SortableTh>
          <th scope="col" />
        </tr>
      </thead>

      <tbody>
        {sorted.map((dataset, idx) => {
          const quality = computeQuality(dataset, dataset.spectrum)
          const isClickable = dataset.status !== 'processing'
          return (
            <tr
              key={dataset.id}
              onClick={() => isClickable && navigate(`/dataset/${dataset.id}`)}
              onKeyDown={e => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) navigate(`/dataset/${dataset.id}`) }}
              tabIndex={isClickable ? 0 : undefined}
              className={[
                'group transition-all duration-100',
                isClickable ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              style={{
                outline: 'none',
                borderTop: idx > 0 ? '1px solid var(--border-dim)' : undefined,
              }}
              onMouseEnter={e => {
                if (!isClickable) return
                const el = e.currentTarget
                el.style.background = 'var(--bg-card-hi)'
                el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.13) inset, 0 -1px 0 rgba(255,255,255,0.03) inset'
              }}
              onMouseLeave={e => {
                if (!isClickable) return
                const el = e.currentTarget
                el.style.background = ''
                el.style.boxShadow = ''
              }}
            >
              {/* Filename */}
              <td className="px-4 py-3 rounded-l-lg">
                <span className={[
                  'font-(--font-mono) text-[13px] leading-snug block truncate max-w-96 transition-colors duration-100',
                  isClickable ? 'text-(--text-secondary) group-hover:text-white' : 'text-(--text-dim)',
                ].join(' ')}>
                  {dataset.filename}
                </span>
              </td>

              {/* Status chip */}
              <td className="px-4 py-3">
                <StatusChip dataset={dataset} quality={quality} />
              </td>

              {/* Material — blank for processing rows */}
              <td className="px-4 py-3">
                {isClickable && (
                  <span className="text-[13px] text-(--text-secondary) transition-colors duration-100 group-hover:text-white">
                    {dataset.material}
                  </span>
                )}
              </td>

              {/* Ions */}
              <td className="px-4 py-3 text-right">
                <span className={[
                  'tabular-nums font-(--font-mono) text-[13px] transition-colors duration-100',
                  isClickable ? 'text-(--text-dim) group-hover:text-white' : 'text-(--text-dim)',
                ].join(' ')}>
                  {isClickable ? formatCount(dataset.atomCount) : ''}
                </span>
              </td>

              {/* Uploaded */}
              <td className="px-4 py-3">
                <span className={[
                  'text-[12px] whitespace-nowrap transition-colors duration-100',
                  isClickable ? 'text-(--text-dim) group-hover:text-white' : 'text-(--text-dim)',
                ].join(' ')}>
                  {formatDate(dataset.uploadedAt)}
                </span>
              </td>

              {/* Chevron */}
              <td className="px-4 py-3 rounded-r-lg">
                {isClickable && (
                  <svg
                    className="w-4 h-4 ml-auto transition-all duration-100 text-(--text-dim) group-hover:text-(--accent) group-hover:translate-x-0.5"
                    viewBox="0 0 16 16" fill="none" aria-hidden
                  >
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-8">
      <div
        className="flex flex-col items-center gap-6 p-12 rounded-2xl w-full max-w-sm border-2 border-dashed border-(--border-dim) hover:border-(--border-hi) transition-colors duration-200"
      >
        <svg viewBox="0 0 1252.14 1211.68" className="w-10 h-10 opacity-15" aria-hidden>
          <g transform="translate(125.214, 121.168) scale(0.8)">
            <path fill="white" d="M1201.58,365.22c0-28.91-23.43-52.34-52.34-52.34-27.37,0-49.8,21.02-52.11,47.79l-448.33,70.25c-5.53-22.97-26.16-40.06-50.83-40.06-12.36,0-23.71,4.31-32.66,11.48l-260.32-251.81c3.92-7.34,6.16-15.72,6.16-24.62,0-28.91-23.43-52.34-52.34-52.34s-52.34,23.43-52.34,52.34c0,17.93,9.03,33.74,22.77,43.17l-124.93,351.45c-.47-.01-.93-.07-1.4-.07-28.91,0-52.34,23.43-52.34,52.34s23.43,52.34,52.34,52.34c8.29,0,16.09-1.98,23.06-5.41l321.11,435.05c-6.06,8.54-9.66,18.95-9.66,30.22,0,28.91,23.43,52.34,52.34,52.34s49.99-21.22,52.13-48.16l433.91-235.09c8.97,7.21,20.35,11.55,32.75,11.55,28.91,0,52.34-23.43,52.34-52.34,0-17.68-8.8-33.29-22.22-42.76l110.67-352.98c28.87-.04,52.26-23.45,52.26-52.34ZM586.63,494.27c3.65.81,7.44,1.27,11.34,1.27,23.47,0,43.33-15.45,49.97-36.73l425.52-66.68-639.5,331.74,152.68-229.6ZM286.15,170.47l262.88,254.28c-2.17,5.74-3.41,11.94-3.41,18.45,0,15.09,6.42,28.65,16.64,38.2l-152.84,229.84c-4.2-1.38-8.64-2.2-13.23-2.46l-113.67-536.26c1.24-.63,2.44-1.32,3.62-2.05ZM130.59,528.44l124.55-350.38c.18.01.37.02.55.03l113.68,536.29c-3.65,1.87-7.06,4.14-10.15,6.78l-205.03-137.81c.7-3.41,1.06-6.94,1.06-10.55,0-18.73-9.87-35.11-24.65-44.36ZM160.91,620.92l182.83,122.89c-1.87,5.38-2.94,11.14-2.94,17.16,0,28.91,23.43,52.34,52.34,52.34.47,0,.92-.06,1.38-.07l65.26,212.61-298.88-404.93ZM536.25,1061.05c-8.58-16.62-25.78-28.04-45.7-28.34l-69.44-227.55c9.62-6.1,17.09-15.24,21.09-26.08l516.64,50.6c.23.68.49,1.35.74,2.02l-423.33,229.36ZM1012.84,761.18c-1.42-.12-2.86-.22-4.31-.22-25.01,0-45.9,17.56-51.08,41.02l-512.83-50.23c-.14-.77-.28-1.54-.45-2.29l668.53-346.8c3.04,2.96,6.45,5.54,10.13,7.7l-110,350.82Z"/>
          </g>
        </svg>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-medium text-(--text-primary) m-0">No datasets yet</p>
          <p className="text-[13px] text-(--text-dim) m-0 leading-relaxed">Upload an .epos file to begin<br />atom probe reconstruction</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-(--accent) text-white cursor-pointer transition-all duration-200 hover:brightness-110 border-0"
          style={{ boxShadow: '0 8px 24px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.12)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v9M4 7l4 4 4-4M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload .epos file
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DatasetsPage() {
  const [searchParams] = useSearchParams()
  const isEmpty = searchParams.has('empty') || DATASETS.length === 0

  return (
    <div className="min-h-screen bg-(--bg-base)">
      <header className="border-b border-(--border-dim)">
        <div className="max-w-300 mx-auto px-8 py-5 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <img src="/at-logo.svg" alt="Atomic Tessellator" className="h-6 w-auto opacity-60" />
            <h1 className="text-xl font-semibold text-(--text-primary) m-0">Datasets</h1>
          </div>
          {!isEmpty && (
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-(--text-dim) border border-(--border-dim) bg-transparent hover:text-(--text-secondary) hover:border-(--border-hi) transition-all duration-150 cursor-pointer"
              style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v9M4 7l4 4 4-4M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Upload .epos
            </button>
          )}
        </div>
      </header>

      <main className="max-w-300 mx-auto">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="px-8 py-6">
            {/* Tier 3: table card — elevated off the page base */}
            <div className="card overflow-hidden">
              <DatasetTable datasets={DATASETS} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
