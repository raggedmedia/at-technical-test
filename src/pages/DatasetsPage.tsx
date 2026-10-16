import { useSearchParams } from 'react-router-dom'
import { DATASETS } from '../fixtures/datasets'
import { DatasetTable } from '../components/DatasetTable'
import { UploadZone } from '../components/UploadZone'

export function DatasetsPage() {
  const [searchParams] = useSearchParams()
  const isEmpty = searchParams.has('empty') || DATASETS.length === 0
  const needReview = DATASETS.filter(d => d.status === 'flagged').length
  const failed = DATASETS.filter(d => d.status === 'failed').length

  return (
    <div className="min-h-screen">
      <header className="on-dark bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-step-1 font-bold">APT Data Explorer</span>
          {!isEmpty && (
            <a
              href="#upload-zone"
              className="lift inline-flex shrink-0 items-center gap-2 bg-white whitespace-nowrap px-4 py-2 font-bold text-slate-950 no-underline hover:bg-slate-200"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 12V3M4 7l4-4 4 4M3 14h10" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              Upload .epos
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl min-w-0 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="m-0 text-step-3 font-bold">Datasets</h1>
          <p className="mt-2 mb-0 text-slate-600">
            {isEmpty
              ? 'No datasets yet. Upload an .epos file from your instrument to start a review.'
              : `${DATASETS.length} datasets. ${needReview} need review, ${failed} failed.`}
          </p>
        </div>

        {!isEmpty && <DatasetTable datasets={DATASETS} />}
        <UploadZone />
      </main>
    </div>
  )
}
