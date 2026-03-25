import { useState, useEffect } from 'react'
import type { AptSummary } from '../fixtures/aptData'

export interface AtomPoint {
  x: number
  y: number
  z: number
  mz: number
}

export interface AptData {
  summary: AptSummary | null
  atoms: AtomPoint[] | null
  summaryLoading: boolean
  atomsLoading: boolean
  error: string | null
}

export function useAptData(): AptData {
  const [summary, setSummary] = useState<AptSummary | null>(null)
  const [atoms, setAtoms] = useState<AtomPoint[] | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [atomsLoading, setAtomsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Eager: fetch summary first — unblocks header + spectrum immediately
  useEffect(() => {
    fetch('/data/summary.json')
      .then(r => {
        if (!r.ok) throw new Error(`summary.json: ${r.status}`)
        return r.json()
      })
      .then((data: AptSummary) => {
        setSummary(data)
        setSummaryLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setSummaryLoading(false)
      })
  }, [])

  // Lazy: fetch atoms after summary resolved — doesn't block initial render
  useEffect(() => {
    if (summaryLoading) return
    fetch('/data/atoms.json')
      .then(r => {
        if (!r.ok) throw new Error(`atoms.json: ${r.status}`)
        return r.json()
      })
      .then((raw: [number, number, number, number][]) => {
        // atoms.json is [[x, y, z, mz], ...] — convert to typed objects
        setAtoms(raw.map(([x, y, z, mz]) => ({ x, y, z, mz })))
        setAtomsLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setAtomsLoading(false)
      })
  }, [summaryLoading])

  return { summary, atoms, summaryLoading, atomsLoading, error }
}
