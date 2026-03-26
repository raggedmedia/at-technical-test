import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAptData, type AtomPoint } from '../hooks/useAptData'
import { DATASETS } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import type { DatasetQuality } from '../lib/quality'
import type { SpectrumBin } from '../fixtures/aptData'
import { DatasetNav } from '../components/DatasetNav'
import { DatasetHeader } from '../components/DatasetHeader'
import { MaterialIdentification } from '../components/MaterialIdentification'
import { MassSpectrum } from '../components/MassSpectrum'
import { PointCloud3D } from '../components/PointCloud3D'
import { NextStepsFooter } from '../components/NextStepsFooter'
import { GeometryUnavailable } from '../components/GeometryUnavailable'

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  // Always call hooks unconditionally — used only when id === 'apt-real'
  const aptData = useAptData()
  const [selectedPeak, setSelectedPeak] = useState<string | null>(null)

  const dataset = DATASETS.find(d => d.id === id)
  if (!dataset) {
    return (
      <div className="min-h-screen bg-(--bg-base) flex items-center justify-center">
        <p className="text-(--text-secondary) font-(--font-mono) text-sm">Dataset not found: {id}</p>
      </div>
    )
  }

  // Resolve data for this dataset
  let atomCount: number
  let spectrum: SpectrumBin[]
  let atoms: AtomPoint[] | null
  let atomsLoading: boolean

  if (dataset.id === 'apt-real') {
    if (aptData.state === 'loading') {
      return (
        <div className="min-h-screen bg-(--bg-base)">
          <div className="max-w-300 mx-auto px-8 pt-10 pb-8 flex flex-col gap-10 animate-pulse">
            <div className="h-5 w-48 rounded-md bg-(--bg-card)" />
            <div className="h-24 w-80 rounded-xl bg-(--bg-card)" />
            <div className="h-48 rounded-xl bg-(--bg-card)" />
          </div>
        </div>
      )
    }
    if (aptData.state === 'error') {
      return (
        <div className="min-h-screen bg-(--bg-base) flex items-center justify-center">
          <p className="text-red-400 font-(--font-mono) text-sm">Error: {aptData.error}</p>
        </div>
      )
    }
    atomCount = aptData.summary.atomCount
    spectrum = aptData.summary.spectrum
    atoms = aptData.atoms
    atomsLoading = aptData.atomsLoading
  } else {
    atomCount = dataset.atomCount
    spectrum = dataset.spectrum
    atoms = null
    atomsLoading = false
  }

  const quality = computeQuality(dataset, spectrum)

  // Failed state: minimal view — no spectrum or point cloud data
  if (dataset.status === 'failed') {
    return (
      <div className="min-h-screen bg-(--bg-base)">
        <main className="max-w-300 mx-auto">
          <DatasetNav filename={dataset.filename} status={dataset.status} flagReason={dataset.flagReason} failReason={dataset.failReason} />
          <div className="px-8 pb-16 flex flex-col gap-16">
            <DatasetHeader atomCount={atomCount} quality={quality} />
          </div>
          <NextStepsFooter quality={quality} />
        </main>
      </div>
    )
  }

  // Full view for processed + flagged
  return (
    <div className="min-h-screen bg-(--bg-base)">
      <main className="max-w-300 mx-auto">
        <DatasetNav filename={dataset.filename} status={dataset.status} flagReason={dataset.flagReason} failReason={dataset.failReason} />
        <div className="px-8 pb-16 flex flex-col gap-24">
          <DatasetHeader atomCount={atomCount} quality={quality} />
          <div className="flex flex-col gap-8">
            <MaterialIdentification spectrum={spectrum} totalAtoms={atomCount} quality={quality} />
            <MassSpectrum
              spectrum={spectrum}
              totalAtoms={atomCount}
              selectedPeak={selectedPeak}
              onSelectPeak={setSelectedPeak}
            />
          </div>
          {dataset.id === 'apt-real' ? (
            <PointCloud3D
              atoms={atoms ?? []}
              loading={atomsLoading}
              selectedPeak={selectedPeak}
              onSelectPeak={setSelectedPeak}
            />
          ) : (
            <GeometryUnavailable quality={quality} />
          )}
        </div>
        <NextStepsFooter quality={quality} />
      </main>
    </div>
  )
}
