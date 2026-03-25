import { DatasetHeader } from './components/DatasetHeader'
import { MaterialIdentification } from './components/MaterialIdentification'
import { MassSpectrum } from './components/MassSpectrum'
import { PointCloud2D } from './components/PointCloud2D'
import { useAptData } from './hooks/useAptData'

function StepLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-(--font-mono) text-[11px] text-(--text-dim) tabular-nums shrink-0">{n}</span>
      <span className="h-px flex-1 bg-(--border-dim)" />
      <span className="font-(--font-mono) text-[11px] uppercase tracking-[0.18em] text-(--text-dim) shrink-0">{title}</span>
    </div>
  )
}

function App() {
  const { summary, atoms, summaryLoading, atomsLoading, error } = useAptData()

  return (
    <div className="min-h-screen bg-(--bg-base)">
      <main className="max-w-300 mx-auto">
        {error && (
          <p className="px-8 py-4 text-sm text-red-400 font-(--font-mono)">Error: {error}</p>
        )}
        {summaryLoading && !error && (
          <div className="px-8 pt-10 pb-8 flex flex-col gap-10 animate-pulse">
            <div className="h-6 w-64 rounded-md bg-(--bg-card)" />
            <div className="h-20 w-80 rounded-md bg-(--bg-card)" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-(--bg-card)" />)}
            </div>
          </div>
        )}
        {summary && (
          <>
            <DatasetHeader data={summary} />
            <div className="px-8 pb-16 flex flex-col gap-8">
              <div>
                <StepLabel n="01" title="Material Identification" />
                <MaterialIdentification spectrum={summary.spectrum} totalAtoms={summary.atomCount} />
              </div>
              <div>
                <StepLabel n="02" title="Mass Spectrum" />
                <MassSpectrum spectrum={summary.spectrum} totalAtoms={summary.atomCount} />
              </div>
              <div>
                <StepLabel n="03" title="Reconstruction Geometry" />
                <PointCloud2D atoms={atoms ?? []} loading={atomsLoading} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
