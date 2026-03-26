import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAptData, type AtomPoint } from '../hooks/useAptData'
import { DATASETS } from '../fixtures/datasets'
import type { FlagReason } from '../fixtures/datasets'
import { computeQuality } from '../lib/quality'
import type { DatasetQuality } from '../lib/quality'
import type { SpectrumBin } from '../fixtures/aptData'
import { DatasetNav } from '../components/DatasetNav'
import { DatasetHeader } from '../components/DatasetHeader'
import { MaterialIdentification } from '../components/MaterialIdentification'
import { MassSpectrum } from '../components/MassSpectrum'
import { PointCloud3D } from '../components/PointCloud3D'
import { NextStepsFooter } from '../components/NextStepsFooter'
import { StepLabel } from '../components/StepLabel'

const GEOMETRY_COPY: Partial<Record<FlagReason, { heading: string; body: string }>> = {
  'surface-contamination': {
    heading: 'Geometry obscured by surface oxide',
    body: 'The O⁺-dominated surface layer cannot be reliably depth-corrected. Strip the first 3–5 nm of Z before reconstruction to recover usable geometry.',
  },
  'reconstruction-artefacts': {
    heading: 'Reconstruction geometry distorted',
    body: 'Asymmetric XY cross-section (aspect ratio 1.82) indicates a phase or grain boundary event during evaporation. The atomic positions cannot be trusted for simulation seeding until parameters are corrected.',
  },
  'unexpected-peak': {
    heading: 'Element identity required before reconstruction',
    body: 'The unidentified cluster at 44–46 Da accounts for 31 % of ions. 3D positions are available but element colouring and simulation seeding require manual ranging first.',
  },
}

function GeometryUnavailable({ quality }: { quality: DatasetQuality }) {
  const flagReason = quality.status === 'flagged' ? quality.reason : undefined
  const copy = flagReason ? GEOMETRY_COPY[flagReason] : undefined
  return (
    <section className="flex flex-col gap-3">
      <StepLabel n="03" title="3D Reconstruction" />
      <div
        className="flex flex-col items-center justify-center gap-5 rounded-xl py-20 px-8"
        style={{
          border: `1px dashed ${quality.accentColor}40`,
          background: `${quality.accentColor}07`,
          minHeight: '320px',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-25" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div className="flex flex-col items-center gap-1.5 text-center max-w-sm">
          <p className="text-sm font-medium m-0" style={{ color: quality.accentColor }}>
            {copy?.heading ?? 'Geometry unavailable'}
          </p>
          <p className="text-[13px] text-(--text-dim) m-0 leading-relaxed">
            {copy?.body ?? quality.detail}
          </p>
        </div>
      </div>
    </section>
  )
}

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

  // Processing state: no data to show yet
  if (dataset.status === 'processing') {
    return (
      <div className="min-h-screen bg-(--bg-base)">
        <DatasetNav filename={dataset.filename} status={dataset.status} flagReason={dataset.flagReason} failReason={dataset.failReason} />
        <div className="flex flex-col items-center justify-center gap-4 py-40">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', animation: 'spin 0.9s linear infinite' }}
          />
          <p className="text-sm text-(--text-secondary)">Parsing {dataset.filename}…</p>
          <p className="text-xs text-(--text-dim)">This typically takes 2–5 minutes</p>
        </div>
      </div>
    )
  }

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
