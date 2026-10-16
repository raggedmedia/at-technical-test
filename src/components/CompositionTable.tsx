import { useMemo } from 'react'
import type { SpectrumBin } from '../fixtures/aptData'
import { SPECIES, UNRANGED_ID } from '../fixtures/elementPeaks'
import { SPECIES_COLOUR } from '../lib/palette'

interface Props {
  spectrum: SpectrumBin[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

interface Row {
  id: string
  label: string
  name: string
  note: string
  count: number
  share: number
}

export function CompositionTable({ spectrum, selectedId, onSelect }: Props) {
  const rows = useMemo<Row[]>(() => {
    const total = spectrum.reduce((s, b) => s + b.count, 0) || 1
    const ranged = SPECIES.map(sp => {
      const count = spectrum.filter(b => b.mz >= sp.mzMin && b.mz < sp.mzMax).reduce((s, b) => s + b.count, 0)
      return { id: sp.id, label: sp.label, name: sp.name, note: sp.note, count, share: count / total }
    })
    const rangedCount = ranged.reduce((s, r) => s + r.count, 0)
    const unranged = {
      id: UNRANGED_ID, label: 'Rest', name: 'Unranged', note: 'Outside every window, identity set at ranging',
      count: total - rangedCount, share: (total - rangedCount) / total,
    }
    return [...ranged, unranged].filter(r => r.count > 0).sort((a, b) => b.count - a.count)
  }, [spectrum])

  return (
    <section className="panel flex min-w-0 flex-col p-4 sm:p-6" aria-labelledby="composition-heading">
      <h2 id="composition-heading" className="m-0 text-step-1 font-bold">Composition</h2>
      <p className="mt-1 mb-4 text-slate-600">Share of ions by ranging window.</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th scope="col" className="py-2 pr-3 font-medium text-slate-600">Ion</th>
            <th scope="col" className="py-2 pr-3 font-medium text-slate-600">Element</th>
            <th scope="col" className="hidden py-2 pr-3 text-right font-medium text-slate-600 sm:table-cell">Ions</th>
            <th scope="col" className="py-2 text-right font-medium text-slate-600">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const on = selectedId === r.id
            return (
              <tr
                key={r.id}
                title={r.note}
                onClick={() => onSelect(on ? null : r.id)}
                className={`cursor-pointer border-b border-slate-200 transition-colors duration-300 ${on ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <td className="py-2.5 pr-3">
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={r.id === UNRANGED_ID ? 'Highlight unranged ions' : `Highlight ${r.name} ${r.label}`}
                    className={`lift inline-flex cursor-pointer sm:min-w-16 items-center gap-2 border-2 bg-white px-2 py-0.5 text-left font-bold text-slate-900 ${
                      on ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span aria-hidden className="size-3 shrink-0" style={{ background: SPECIES_COLOUR[r.id].light }} />
                    {r.label}
                  </button>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="font-bold text-slate-900" title={r.note}>{r.name}</span>
                </td>
                <td className="hidden py-2.5 pr-3 text-right font-mono tabular-nums sm:table-cell">{r.count.toLocaleString('en-AU')}</td>
                <td className="py-2.5 text-right font-mono font-bold tabular-nums">{(r.share * 100).toFixed(1)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
