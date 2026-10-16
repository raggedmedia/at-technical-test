import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Dataset, DatasetStatus } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import { StatusBadge } from './StatusBadge'

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return n.toString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
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

// ─── Sortable column header ───────────────────────────────────────────────────

interface SortableThProps {
  col: SortKey
  activeKey: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  align?: 'left' | 'right'
  /** Only shown from md up */
  wide?: boolean
  children: React.ReactNode
}

function SortableTh({ col, activeKey, dir, onSort, align = 'left', wide = false, children }: SortableThProps) {
  const active = activeKey === col
  return (
    <th scope="col" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`p-0 font-medium ${wide ? 'hidden md:table-cell' : ''}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent px-5 py-3 transition-colors duration-200 ${
          align === 'right' ? 'justify-end' : ''
        } ${active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
      >
        {children}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className={active ? 'opacity-100' : 'opacity-30'}>
          <path d={active && dir === 'desc' ? 'M6 2v8M2.5 6.5L6 10l3.5-3.5' : 'M6 10V2M2.5 5.5L6 2l3.5 3.5'} stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
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
    <div className="panel min-w-0">
      <table className="w-full border-collapse text-left md:table-fixed">
        <caption className="sr-only">Uploaded datasets. Select a file name to review it.</caption>
        <colgroup>
          <col className="md:w-[32%]" />
          <col className="hidden md:table-column md:w-[22%]" />
          <col className="hidden md:table-column md:w-[16%]" />
          <col className="hidden md:table-column md:w-[10%]" />
          <col className="hidden md:table-column md:w-[14%]" />
          <col className="w-10 md:w-[6%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-300">
            <th scope="col" className="px-4 py-3 font-medium text-slate-600 md:px-5">File</th>
            <SortableTh col="status"   activeKey={sortKey} dir={sortDir} onSort={handleSort} wide>Status</SortableTh>
            <SortableTh col="material" activeKey={sortKey} dir={sortDir} onSort={handleSort} wide>Material</SortableTh>
            <SortableTh col="ions"     activeKey={sortKey} dir={sortDir} onSort={handleSort} align="right" wide>Ions</SortableTh>
            <SortableTh col="uploaded" activeKey={sortKey} dir={sortDir} onSort={handleSort} wide>Uploaded</SortableTh>
            <th scope="col"><span className="sr-only">Open</span></th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((dataset, i) => {
            const quality = computeQuality(dataset, dataset.spectrum)
            const ready = dataset.status !== 'processing'
            const href = `/dataset/${dataset.id}`
            return (
              <tr
                key={dataset.id}
                onClick={() => ready && navigate(href)}
                className={`group rise border-b border-slate-200 last:border-b-0 transition-colors duration-200 ${
                  ready ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
                style={{ '--i': i } as React.CSSProperties}
              >
                <td className="max-w-0 px-4 py-4 md:max-w-none md:px-5">
                  {ready ? (
                    <Link
                      to={href}
                      onClick={e => e.stopPropagation()}
                      className="block truncate font-mono text-slate-900 no-underline transition-[color,translate] duration-300 group-hover:translate-x-1 group-hover:underline group-hover:underline-offset-4"
                    >
                      {dataset.filename}
                    </Link>
                  ) : (
                    <span className="block truncate font-mono text-slate-600">{dataset.filename}</span>
                  )}
                  <span className="mt-1.5 block md:hidden">
                    <StatusBadge quality={quality} failReason={dataset.failReason} />
                  </span>
                </td>
                <td className="hidden px-5 py-4 md:table-cell">
                  <StatusBadge quality={quality} failReason={dataset.failReason} />
                </td>
                <td className="hidden px-5 py-4 text-slate-700 md:table-cell">{ready ? dataset.material : ''}</td>
                <td className="hidden px-5 py-4 text-right font-mono tabular-nums text-slate-700 md:table-cell">
                  {ready ? formatCount(dataset.atomCount) : ''}
                </td>
                <td className="hidden px-5 py-4 whitespace-nowrap text-slate-700 md:table-cell">{formatDate(dataset.uploadedAt)}</td>
                <td className="py-4 pr-4 md:px-5">
                  {ready && (
                    <svg
                      width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden
                      className="ml-auto text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-slate-900"
                      style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
                    >
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
