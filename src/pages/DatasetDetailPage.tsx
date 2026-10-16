import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAptData, type AtomPoint } from '../hooks/useAptData'
import { DATASETS, type Dataset } from '../fixtures/datasets'
import type { SpectrumBin } from '../fixtures/aptData'
import { computeQuality } from '../lib/quality'
import { deriveVerdict } from '../lib/verdict'
import { VerdictRail } from '../components/VerdictRail'
import { MassSpectrum } from '../components/MassSpectrum'
import { CompositionTable } from '../components/CompositionTable'
import { ReconstructionStage } from '../components/ReconstructionStage'

const SHELL = 'min-h-screen lg:grid lg:grid-cols-[24rem_minmax(0,1fr)]'

function Message({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="panel max-w-lg p-8">
        <h1 className="m-0 text-step-2 font-bold">{title}</h1>
        <p className="mt-2 mb-6 text-slate-600">{body}</p>
        <Link to="/" className="font-bold text-slate-900 underline underline-offset-4 hover:text-slate-600">Back to all datasets</Link>
      </div>
    </main>
  )
}

function Skeleton() {
  return (
    <div className={SHELL} aria-busy="true" aria-label="Loading dataset">
      <div className="h-64 bg-slate-900 lg:h-screen" />
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="panel pulse-soft h-92" />
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="panel pulse-soft h-104" />
          <div className="panel pulse-soft h-104" />
        </div>
      </div>
    </div>
  )
}

interface ViewProps {
  dataset: Dataset
  ionCount: number
  spectrum: SpectrumBin[]
  atoms: AtomPoint[] | null
  atomsLoading: boolean
}

function DatasetView({ dataset, ionCount, spectrum, atoms, atomsLoading }: ViewProps) {
  const quality = computeQuality(dataset, spectrum)
  const verdict = deriveVerdict(dataset, quality, ionCount)
  const spectrumFocus = verdict.focus?.on === 'spectrum' ? verdict.focus : null
  // A flagged dataset opens with the offending species already lit
  const [selectedId, setSelectedId] = useState<string | null>(spectrumFocus?.speciesId ?? null)
  const processing = verdict.tone === 'pending'

  return (
    <div className={SHELL}>
      <VerdictRail dataset={dataset} verdict={verdict} ionCount={ionCount} />
      <main className="flex min-w-0 flex-col gap-6 p-6 lg:p-8">
        <h2 className="sr-only">Evidence</h2>
        {processing ? (
          <div className="panel flex h-92 items-center justify-center p-6">
            <p className="pulse-soft m-0 text-slate-600">The spectrum appears once parsing finishes.</p>
          </div>
        ) : (
          <MassSpectrum spectrum={spectrum} selectedId={selectedId} onSelect={setSelectedId} focus={spectrumFocus} demo={dataset.id !== 'apt-real'} />
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <ReconstructionStage
            dataset={dataset}
            verdict={verdict}
            atoms={atoms}
            loading={atomsLoading}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {processing ? (
            <section className="panel flex flex-col p-6" aria-labelledby="composition-heading">
              <h2 id="composition-heading" className="m-0 text-step-1 font-bold">Composition</h2>
              <p className="pulse-soft mt-1 mb-0 text-slate-600">Ion shares appear once parsing finishes.</p>
            </section>
          ) : (
            <CompositionTable spectrum={spectrum} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>
      </main>
    </div>
  )
}

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  // Always called; its data is used only for the real dataset
  const aptData = useAptData()
  const dataset = DATASETS.find(d => d.id === id)

  if (!dataset) {
    return <Message title="Dataset not found" body={`There is no dataset with the id '${id}'.`} />
  }

  if (dataset.id !== 'apt-real') {
    return (
      <DatasetView key={dataset.id} dataset={dataset} ionCount={dataset.atomCount} spectrum={dataset.spectrum} atoms={null} atomsLoading={false} />
    )
  }

  if (aptData.state === 'loading') return <Skeleton />
  if (aptData.state === 'error') {
    return <Message title="Couldn't load this dataset" body={`The parsed data failed to load (${aptData.error}). Refresh to try again.`} />
  }

  return (
    <DatasetView
      key={dataset.id}
      dataset={dataset}
      ionCount={aptData.summary.atomCount}
      spectrum={aptData.summary.spectrum}
      atoms={aptData.atoms}
      atomsLoading={aptData.atomsLoading}
    />
  )
}
