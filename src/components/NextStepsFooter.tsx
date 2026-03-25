import type { SpectrumBin } from '../fixtures/aptData'

interface Props {
  spectrum: SpectrumBin[]
  totalAtoms: number
}

function isClean(spectrum: SpectrumBin[], totalAtoms: number): boolean {
  if (!spectrum.length || totalAtoms === 0) return false
  const fe2Count = spectrum
    .filter(b => b.mz >= 27.3 && b.mz <= 29.0)
    .reduce((s, b) => s + b.count, 0)
  return fe2Count / totalAtoms > 0.1
}

export function NextStepsFooter({ spectrum, totalAtoms }: Props) {
  const clean = isClean(spectrum, totalAtoms)

  return (
    <footer className="px-8 pb-16">
      <div className="card p-8 flex flex-col gap-6">

        {/* Status summary */}
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: clean ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${clean ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}
          >
            <span className="text-base leading-none" style={{ color: clean ? '#22c55e' : '#f59e0b' }}>
              {clean ? '✓' : '⚠'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-semibold text-(--text-primary) m-0">
              {clean
                ? 'Dataset looks clean. Ready for analysis.'
                : 'Dataset flagged for review. Resolve before proceeding.'}
            </h3>
            <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
              {clean
                ? 'Fe-Ni alloy confirmed. Acquisition quality clean. 1 unidentified peak at 71.9 Da — assign identity in ranging step.'
                : 'Unexpected dominant peak detected. Review reconstruction parameters before ranging.'}
            </p>
          </div>
        </div>

        <div className="h-px bg-(--border-dim)" />

        {/* Actions */}
        <div className="flex items-start gap-4 flex-wrap">

          {/* Primary: Range */}
          <div className="flex flex-col gap-2 flex-1 min-w-64">
            <button
              disabled={!clean}
              className={[
                'w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-medium border transition-all duration-150',
                clean
                  ? 'bg-(--accent) border-transparent text-white cursor-pointer hover:brightness-110 shadow-[0_0_24px_rgba(59,130,246,0.25)]'
                  : 'bg-(--bg-base) border-(--border-dim) text-(--text-dim) cursor-not-allowed opacity-40',
              ].join(' ')}
            >
              <span>Range this Dataset</span>
              <span className="opacity-70">→</span>
            </button>
            <p className="text-[11px] text-(--text-dim) m-0 px-1 leading-relaxed">
              Step 3 — Assign definitive element identities to m/z peaks. Required before compositional analysis or simulation.
            </p>
          </div>

          {/* Secondary: Compare */}
          <div className="flex flex-col gap-2 flex-1 min-w-64">
            <button
              disabled={!clean}
              className={[
                'w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-medium border transition-all duration-150',
                clean
                  ? 'bg-transparent border-(--border-hi) text-(--text-primary) cursor-pointer hover:bg-(--bg-card-hi) hover:border-(--accent)'
                  : 'bg-(--bg-base) border-(--border-dim) text-(--text-dim) cursor-not-allowed opacity-40',
              ].join(' ')}
            >
              <span>Compare to Simulation</span>
              <span className="opacity-50">→</span>
            </button>
            <p className="text-[11px] text-(--text-dim) m-0 px-1 leading-relaxed">
              Match measured spectrum and composition against AT simulation library for this material class.
            </p>
          </div>

        </div>

        {/* Downstream hint */}
        <p className="text-[11px] text-(--text-dim) m-0 pt-3 border-t border-(--border-dim) leading-relaxed">
          After ranging →{' '}
          <span className="text-(--text-secondary) font-medium">New Simulation from Dataset</span>
          {' '}— use the 3D atomic reconstruction as a first-principles simulation starting configuration.
        </p>

      </div>
    </footer>
  )
}
