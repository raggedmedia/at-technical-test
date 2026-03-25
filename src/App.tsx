import { DatasetHeader } from './components/DatasetHeader'
import { MaterialIdentification } from './components/MaterialIdentification'
import { MassSpectrum } from './components/MassSpectrum'
import { PointCloud3D } from './components/PointCloud3D'
import { NextStepsFooter } from './components/NextStepsFooter'
import { useAptData } from './hooks/useAptData'
import { DatasetNav } from './components/DatasetNav'

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
            <DatasetNav filename="atom_probe_tomography_data-public.epos" status="Processed" />
            <div className="px-8 pb-16 flex flex-col gap-12">
                <DatasetHeader data={summary} />
              <MaterialIdentification spectrum={summary.spectrum} totalAtoms={summary.atomCount} />
              <MassSpectrum spectrum={summary.spectrum} totalAtoms={summary.atomCount} />
              <PointCloud3D atoms={atoms ?? []} loading={atomsLoading} />
            </div>
            <NextStepsFooter spectrum={summary.spectrum} totalAtoms={summary.atomCount} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
