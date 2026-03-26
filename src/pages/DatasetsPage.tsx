import { useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DATASETS } from '../fixtures/datasets'
import type { Dataset, DatasetStatus, FailReason } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import { StatusBadge } from '../components/StatusBadge'

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

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isDragInvalid, setIsDragInvalid] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [rejectKey, setRejectKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = isDragging || isHovered

  // .epos has no registered MIME type — its type is always ''
  // Any file with a known MIME type is definitively not .epos
  function isValidDrag(e: React.DragEvent): boolean {
    return Array.from(e.dataTransfer.items).every(
      item => item.kind !== 'file' || item.type === ''
    )
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (isValidDrag(e)) {
      setIsDragging(true)
      setIsDragInvalid(false)
    } else {
      setIsDragging(false)
      setIsDragInvalid(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
      setIsDragInvalid(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    setIsHovered(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.epos')) {
      setIsDragInvalid(true)
      setRejectKey(k => k + 1)
      setTimeout(() => setIsDragInvalid(false), 1800)
      return
    }
    setIsDragInvalid(false)
    alert("You've reached the edge of the demo — in the real app this file would begin processing.")
  }

  function handleFileChange() {
    if (inputRef.current?.files?.length) {
      alert("You've reached the edge of the demo — in the real app this file would begin processing.")
      inputRef.current.value = ''
    }
  }

  return (
    <div
      id="upload-zone"
      role="button"
      tabIndex={0}
      aria-label="Upload .epos file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card flex flex-col items-center justify-center gap-4 py-16 cursor-pointer select-none outline-none"
      style={{
        transition: 'border-color 220ms var(--ease-out-quart), box-shadow 220ms var(--ease-out-quart), background-color 220ms var(--ease-out-quart)',
        ...((isDragInvalid || isActive) && {
          backgroundColor: 'var(--bg-card-hi)',
          borderColor: isDragInvalid
            ? 'rgba(239, 68, 68, 0.7)'
            : isDragging ? 'var(--green)' : 'rgba(34, 197, 94, 0.45)',
          backgroundImage: isDragInvalid
            ? 'linear-gradient(to bottom, rgba(239, 68, 68, 0.05) 0px, transparent 80px)'
            : 'linear-gradient(to bottom, rgba(34, 197, 94, 0.045) 0px, transparent 80px)',
          boxShadow: isDragInvalid
            ? '0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 24px rgba(0,4,18,0.7), 0 1px 3px rgba(0,4,18,0.5), 0 0 0 1px rgba(239,68,68,0.35), 0 0 32px rgba(239,68,68,0.1)'
            : isDragging
              ? '0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 24px rgba(0,4,18,0.7), 0 1px 3px rgba(0,4,18,0.5), 0 0 0 1px rgba(34,197,94,0.4), 0 0 48px rgba(34,197,94,0.12)'
              : '0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 24px rgba(0,4,18,0.7), 0 1px 3px rgba(0,4,18,0.5), 0 0 0 1px rgba(34,197,94,0.25), 0 0 32px rgba(34,197,94,0.07)',
        }),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".epos"
        className="sr-only"
        onChange={handleFileChange}
        onClick={e => e.stopPropagation()}
      />

      {/* Icon — floats on hover/drag, shakes on rejection */}
      {isDragInvalid ? (
        <svg
          key={rejectKey}
          className="w-8 h-8 upload-icon-shake"
          style={{ color: '#ef4444' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : (
        <svg
          className={`w-8 h-8 transition-colors duration-220${isActive ? ' upload-icon-float' : ''}`}
          style={{ color: isActive ? 'var(--green)' : 'var(--text-dim)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      )}

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p
          className="text-sm font-medium m-0"
          style={{
            color: isDragInvalid ? '#ef4444' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 220ms var(--ease-out-quart)',
          }}
        >
          {isDragInvalid ? 'Not an .epos file' : isDragging ? 'Release to upload' : 'Drop an .epos file'}
        </p>
        <p
          className="text-[12px] m-0"
          style={{
            color: isDragInvalid ? 'rgba(239, 68, 68, 0.6)' : isActive ? 'rgba(34, 197, 94, 0.65)' : 'var(--text-dim)',
            transition: 'color 220ms var(--ease-out-quart)',
          }}
        >
          {isDragInvalid ? 'Only .epos files are supported' : 'or click to browse'}
        </p>
      </div>
    </div>
  )
}

// ─── Or divider ───────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-4 px-1">
      <div className="flex-1" style={{ height: '1px', background: 'var(--border-dim)' }} />
      <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim)">or</span>
      <div className="flex-1" style={{ height: '1px', background: 'var(--border-dim)' }} />
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
            <a
              href="#upload-zone"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-(--text-dim) border border-(--border-dim) no-underline hover:text-(--text-secondary) hover:border-(--border-hi) transition-all duration-150"
              style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v9M4 7l4 4 4-4M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Upload .epos
            </a>
          )}
        </div>
      </header>

      <main className="max-w-300 mx-auto">
        {isEmpty ? (
          <div className="px-8 py-12">
            <UploadZone />
          </div>
        ) : (
          <div className="px-8 py-6 flex flex-col gap-16">
            {/* Tier 3: table card — elevated off the page base */}
            <div className="card overflow-hidden">
              <DatasetTable datasets={DATASETS} />
            </div>
            <OrDivider />
            <UploadZone />
          </div>
        )}
      </main>
    </div>
  )
}
