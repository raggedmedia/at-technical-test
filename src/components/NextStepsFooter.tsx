import type { DatasetQuality } from '../lib/quality'
import type { FlagReason } from '../fixtures/datasets'

interface Props {
  quality: DatasetQuality
}

const DEMO_EDGE = () => alert("You've reached the edge of the demo — this would open the remediation tool in the full product.")
const DEMO_ARCHIVE = () => alert("You've reached the edge of the demo — this would archive the file in the real app.")
const DEMO_SIMULATE = () => alert("You've reached the edge of the demo — this would open the simulation tool in the full product.")

const FLAGGED_CTA_LABEL: Record<FlagReason, string> = {
  'surface-contamination':    'Trim Surface Layer',
  'reconstruction-artefacts': 'Adjust Reconstruction',
  'unexpected-peak':          'Range Unknown Peak',
}

export function NextStepsFooter({ quality }: Props) {
  const clean = quality.status === 'clean'
  const flaggedCta = quality.status === 'flagged' ? FLAGGED_CTA_LABEL[quality.reason] : null

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
                  ? 'Acquisition failed \u2014 new specimen required'
                  : 'Review required before proceeding'}
            </span>
          </div>
          <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
            {quality.detail}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="text-[11px] text-(--text-dim) m-0 leading-relaxed max-w-xs">
            {quality.status === 'flagged'
              ? 'Resolve the flagged issue before this dataset can seed a simulation. Each flag type has a documented remediation path.'
              : quality.status === 'failed'
                ? 'This acquisition cannot be recovered. Archive the dataset and prepare a new specimen tip for re-acquisition.'
                : 'The 3D atomic positions and element identities from this dataset seed the simulation directly \u2014 no intermediate steps required.'}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {quality.status === 'flagged' ? (
              <a
                href="#"
                onClick={e => { e.preventDefault(); DEMO_EDGE() }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white no-underline hover:brightness-110 transition-all duration-200"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                  transitionTimingFunction: 'var(--ease-out-quart)',
                }}
              >
                <span>{flaggedCta}</span>
                <span className="opacity-70">{'→'}</span>
              </a>
            ) : quality.status === 'failed' ? (
              <a
                href="#"
                onClick={e => { e.preventDefault(); DEMO_ARCHIVE() }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white no-underline hover:brightness-110 transition-all duration-200"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                  transitionTimingFunction: 'var(--ease-out-quart)',
                }}
              >
                <span>Archive Dataset</span>
              </a>
            ) : (
              <>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); DEMO_SIMULATE() }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-(--border-hi) bg-transparent text-(--text-secondary) no-underline hover:bg-(--bg-card-hi) hover:border-(--accent) hover:text-(--text-primary) transition-all duration-200"
                  style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
                >
                  <span>Compare to Simulation</span>
                  <span className="opacity-50">{'→'}</span>
                </a>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); DEMO_SIMULATE() }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white no-underline hover:brightness-110 transition-all duration-200"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 8px 32px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                    transitionTimingFunction: 'var(--ease-out-quart)',
                  }}
                >
                  <span>New Simulation from Dataset</span>
                  <span className="opacity-70">{'→'}</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
