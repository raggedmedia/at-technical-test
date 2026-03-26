import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { DatasetsPage } from './pages/DatasetsPage'
import { DatasetDetailPage } from './pages/DatasetDetailPage'
import { cancelDemoEdge } from './lib/demoEdge'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    cancelDemoEdge()
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<DatasetsPage />} />
      <Route path="/dataset/:id" element={<DatasetDetailPage />} />
    </Routes>
  )
}
