import { Link } from 'react-router-dom'
import type { Dataset } from '../fixtures/datasets'
import { formatIons, volumeLabel, type Verdict } from '../lib/verdict'
import { demoEdge } from '../lib/demoEdge'
import { StatusIcon } from './StatusIcon'

// The result, why, and what to do next. Same layout for every status;
// sticky beside the workbench on wide screens, stacked above it on narrow ones.

interface Props {
  dataset: Dataset
  verdict: Verdict
  ionCount: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function VerdictRail({ dataset, verdict, ionCount }: Props) {
  const known = (v: string) => (verdict.tone === 'pending' ? 'Pending' : v)
  const facts: [string, string][] = [
    ['Ions', known(formatIons(ionCount))],
    ['Material', known(dataset.material)],
    ['m/z range', known(`${dataset.mzRange.min} to ${dataset.mzRange.max} Da`)],
    ['Volume', known(volumeLabel(dataset))],
    ['Uploaded', formatDate(dataset.uploadedAt)],
  ]

  return (
    <aside
      className="on-dark flex flex-col bg-slate-900 text-slate-100 lg:sticky lg:top-0 lg:h-screen"
      style={{ backgroundImage: 'radial-gradient(130% 45% at 0% 0%, var(--color-slate-800), transparent 75%)' }}
    >
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-5 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 self-start text-slate-300 no-underline transition-colors duration-200 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" />
          </svg>
          All datasets
        </Link>

        <header>
          <div className="rise flex items-center gap-3">
            <StatusIcon tone={verdict.tone} onDark size={26} />
            <h1 className="m-0 text-step-3 font-bold text-balance text-white">{verdict.title}</h1>
          </div>
          <p className="rise mt-4 mb-0 text-step-1 font-medium text-pretty text-white" style={{ '--i': 1 } as React.CSSProperties}>{verdict.summary}</p>
          <p className="mt-2 mb-0 text-pretty text-slate-300">{verdict.detail}</p>
        </header>

        <section aria-labelledby="checks-heading">
          <h2 id="checks-heading" className="sr-only">Checks</h2>
          <ul className="m-0 list-none p-0">
            {verdict.checks.map((c, i) => (
              <li key={c.name} className="rise flex items-start gap-3 border-t border-slate-700/70 py-2.5" style={{ '--i': i + 2 } as React.CSSProperties}>
                <StatusIcon tone={c.tone} onDark labelled className="mt-0.5" />
                <span className="font-bold text-white">{c.name}</span>
                <span className="ml-auto text-right text-pretty text-slate-300 tabular-nums">{c.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="details-heading" className="mt-2">
        <h2 id="details-heading" className="m-0 mb-2 text-step-0 font-bold text-white">Details</h2>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <dt className="text-slate-400">File</dt>
          <dd className="m-0 text-right font-mono break-all text-slate-100">{dataset.filename}</dd>
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-slate-400">{k}</dt>
              <dd className="m-0 text-right text-slate-100 tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        </section>
      </div>

      {(verdict.primary || verdict.secondary) && (
        <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-900 px-6 py-6">
          {verdict.primary && (
            <button
              type="button"
              onClick={() => demoEdge(verdict.primary!.demo)}
              className="lift flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-white px-5 py-3.5 text-left text-step-0 font-bold text-slate-950 hover:bg-slate-200"
              style={{ boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 6px 18px oklch(12.9% 0.042 264.695 / 0.45)' }}
            >
              {verdict.primary.label}
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h9M8.5 4L12.5 8l-4 4" stroke="currentColor" strokeWidth="1.75" />
              </svg>
            </button>
          )}
          {verdict.secondary && (
            <button
              type="button"
              onClick={() => demoEdge(verdict.secondary!.demo)}
              className="lift w-full cursor-pointer border border-slate-600 bg-transparent px-5 py-3 text-left text-step-0 font-medium text-slate-100 hover:border-slate-400 hover:bg-slate-800"
            >
              {verdict.secondary.label}
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
