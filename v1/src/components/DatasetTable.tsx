import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Dataset, DatasetStatus } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import { StatusBadge } from './StatusBadge'

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

// ─── Sort icon ────────────────────────────────────────────────────────────────

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

// ─── Sortable column header ───────────────────────────────────────────────────

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

// ─── Table ────────────────────────────────────────────────────────────────────

export function DatasetTable({ datasets }: { datasets: Dataset[] }) {
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
                el.style.boxShadow = 'var(--shadow-row-hover)'
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
                <StatusBadge status={dataset.status} flagReason={dataset.flagReason} failReason={dataset.failReason} accentColor={quality.accentColor} />
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
