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
  const accentColor = clean ? '#22c55e' : '#f59e0b'

  return (
    <footer className="px-8 pb-16">
      <div
        className="card p-8 flex flex-col gap-6"
        style={{
          boxShadow: 'var(--shadow-level-3)',
          borderTopColor: clean ? 'rgba(34, 197, 94, 0.45)' : 'rgba(245, 158, 11, 0.45)',
          borderTopWidth: '2px',
        }}
      >

        {/* Status + description — narrow, left */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0"
              style={{
                background: clean ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                border: `1px solid ${clean ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                color: accentColor,
              }}
            >
              {clean ? '✓' : '⚠'}
            </span>
            <span className="text-sm font-semibold text-(--text-primary)">
              {clean ? 'Ready to simulate' : 'Review required'}
            </span>
          </div>
          <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
            {clean
              ? 'Fe-Ni alloy confirmed. Element identities auto-assigned. Use this reconstruction as a first-principles simulation seed, or validate against an existing simulation.'
              : 'Unexpected dominant peak detected. Review reconstruction parameters before proceeding to simulation.'}
          </p>
        </div>

        {/* Actions — side by side, primary bottom-right */}
        <div className="flex items-end justify-between gap-4">
          <p className="text-[11px] text-(--text-dim) m-0 leading-relaxed max-w-xs">
            The 3D atomic positions and element identities from this dataset seed the simulation directly — no intermediate steps required.
          </p>

          <div className="flex items-center gap-3 shrink-0">
            {/* Secondary */}
            <button
              disabled={!clean}
              className={[
                'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                clean
                  ? 'bg-transparent border-(--border-hi) text-(--text-secondary) cursor-pointer hover:bg-(--bg-card-hi) hover:border-(--accent) hover:text-(--text-primary)'
                  : 'bg-transparent border-(--border-dim) text-(--text-dim) cursor-not-allowed opacity-30',
              ].join(' ')}
              style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
            >
              <span>Compare to Simulation</span>
              <span className="opacity-50">→</span>
            </button>

            {/* Primary */}
            <button
              disabled={!clean}
              className={[
                'flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200',
                clean
                  ? 'bg-(--accent) border-transparent text-white cursor-pointer hover:brightness-110'
                  : 'bg-(--bg-base) border-(--border-dim) text-(--text-dim) cursor-not-allowed opacity-30',
              ].join(' ')}
              style={clean ? {
                boxShadow: '0 8px 32px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                transitionTimingFunction: 'var(--ease-out-quart)',
              } : {}}
            >
              <span>New Simulation from Dataset</span>
              <span className="opacity-70">→</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}
