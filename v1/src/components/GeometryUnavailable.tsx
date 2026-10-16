import type { FlagReason } from '../fixtures/datasets'
import type { DatasetQuality } from '../lib/quality'
import { StepLabel } from './StepLabel'

const GEOMETRY_COPY: Partial<Record<FlagReason, { heading: string; body: string }>> = {
  'surface-contamination': {
    heading: 'Geometry obscured by surface oxide',
    body: 'The O⁺-dominated surface layer cannot be reliably depth-corrected. Strip the first 3–5 nm of Z before reconstruction to recover usable geometry.',
  },
  'reconstruction-artefacts': {
    heading: 'Reconstruction geometry distorted',
    body: 'Asymmetric XY cross-section (aspect ratio 1.82) indicates a phase or grain boundary event during evaporation. The atomic positions cannot be trusted for simulation seeding until parameters are corrected.',
  },
  'unexpected-peak': {
    heading: 'Element identity required before reconstruction',
    body: 'The unidentified cluster at 44–46 Da accounts for 31 % of ions. 3D positions are available but element colouring and simulation seeding require manual ranging first.',
  },
}

export function GeometryUnavailable({ quality }: { quality: DatasetQuality }) {
  const flagReason = quality.status === 'flagged' ? quality.reason : undefined
  const copy = flagReason ? GEOMETRY_COPY[flagReason] : undefined
  return (
    <section className="flex flex-col gap-3">
      <StepLabel n="02" title="Reconstruction Geometry" />
      <div
        className="flex flex-col items-center justify-center gap-5 rounded-xl py-20 px-8"
        style={{
          border: `1px dashed ${quality.accentColor}40`,
          background: `${quality.accentColor}07`,
          minHeight: '320px',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-25" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div className="flex flex-col items-center gap-1.5 text-center max-w-sm">
          <p className="text-sm font-medium m-0" style={{ color: quality.accentColor }}>
            {copy?.heading ?? 'Geometry unavailable'}
          </p>
          <p className="text-[13px] text-(--text-dim) m-0 leading-relaxed">
            {copy?.body ?? quality.detail}
          </p>
        </div>
      </div>
    </section>
  )
}
