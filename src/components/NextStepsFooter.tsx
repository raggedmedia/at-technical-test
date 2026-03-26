import type { DatasetQuality } from '../lib/quality'

interface Props {
  quality: DatasetQuality
}

export function NextStepsFooter({ quality }: Props) {
  const clean = quality.status === 'clean'

  return (
    <footer className="px-8 pb-16">
      <div
        className="card p-8 flex flex-col gap-6"
        style={{
          boxShadow: 'var(--shadow-level-3)',
          borderTopColor: clean ? 'rgba(34, 197, 94, 0.45)' : `${quality.accentColor}72`,
          borderTopWidth: '2px',
        }}
      >
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0"
              style={{
                background: `${quality.accentColor}1e`,
                border: `1px solid ${quality.accentColor}4d`,
                color: quality.accentColor,
              }}
            >
              {clean ? '\u2713' : quality.status === 'failed' ? '\u2715' : '\u26a0'}
            </span>
            <span className="text-sm font-semibold text-(--text-primary)">
              {clean
                ? 'Ready to simulate'
                : quality.status === 'failed'
                  ? 'Acquisition failed \u2014 re-run required'
                  : 'Review required before proceeding'}
            </span>
          </div>
          <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
            {quality.detail}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="text-[11px] text-(--text-dim) m-0 leading-relaxed max-w-xs">
            The 3D atomic positions and element identities from this dataset seed the simulation
            directly \u2014 no intermediate steps required.
          </p>
          <div className="flex items-center gap-3 shrink-0">
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
              <span className="opacity-50">\u2192</span>
            </button>
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
              <span className="opacity-70">\u2192</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
