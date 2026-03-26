import { Routes, Route } from 'react-router-dom'
import { DatasetsPage } from './pages/DatasetsPage'
import { DatasetDetailPage } from './pages/DatasetDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DatasetsPage />} />
      <Route path="/dataset/:id" element={<DatasetDetailPage />} />
    </Routes>
  )
}
