import { useSearchParams } from 'react-router-dom'
import { DATASETS } from '../fixtures/datasets'
import { DatasetTable } from '../components/DatasetTable'
import { UploadZone } from '../components/UploadZone'

// ─── Or divider ────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-4 px-1">
      <div className="flex-1 h-px bg-(--border-dim)" />
      <span className="font-(--font-mono) text-[10px] uppercase tracking-[0.2em] text-(--text-dim)">or</span>
      <div className="flex-1 h-px bg-(--border-dim)" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────────────

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
