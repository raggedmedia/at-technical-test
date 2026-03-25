import { DatasetHeader } from './components/DatasetHeader'
import { FIXTURE_SUMMARY } from './fixtures/aptData'

function App() {
  return (
    <div className="min-h-screen bg-(--bg-base)">
      <main className="max-w-300 mx-auto">
        <DatasetHeader data={FIXTURE_SUMMARY} />
      </main>
    </div>
  )
}

export default App
