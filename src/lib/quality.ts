import type { Dataset, FlagReason } from '../fixtures/datasets'
import type { SpectrumBin } from '../fixtures/aptData'

/**
 * Discriminated union representing acquisition quality.
 *
 * Architectural note: 'reconstruction-artefacts' cannot be derived from
 * spectrum analysis alone — the spectrum may look entirely healthy while
 * the 3D geometry is distorted. Quality computation therefore requires
 * access to dataset metadata (flagReason), not just spectrum data.
 *
 * This is why quality is computed ONCE at the page level via computeQuality()
 * and threaded down as a prop, rather than each component rederiving from
 * the spectrum independently.
 */
export type DatasetQuality =
  | { status: 'clean';      detail: string; accentColor: string }
  | { status: 'flagged';    reason: FlagReason; detail: string; accentColor: string }
  | { status: 'failed';     detail: string; accentColor: string }
  | { status: 'processing'; detail: string; accentColor: string }
  | { status: 'unknown';    detail: string; accentColor: string }

const ACCENT = {
  clean:      '#22c55e',
  flagged:    '#f59e0b',
  failed:     '#ef4444',
  processing: '#3b82f6',
  unknown:    '#6b7280',
}

const FLAG_DETAILS: Record<FlagReason, string> = {
  'surface-contamination':
    'O\u207a is the dominant ion species \u2014 surface oxide from pre-experiment air exposure. Discard the first 3\u20135\u00a0nm of Z depth before ranging.',
  'reconstruction-artefacts':
    'Asymmetric XY cross-section detected (aspect ratio 1.82). Reconstruction geometry distorted \u2014 likely a phase or grain boundary event. Review field evaporation parameters before ranging.',
  'unexpected-peak':
    'Unidentified cluster at 44\u201346\u00a0Da accounts for 31\u00a0% of total ions. Material identity cannot be automatically assigned. Manual ranging required.',
}

/**
 * computeQuality — single source of truth for acquisition quality.
 *
 * Evaluation order:
 *   1. Status overrides (processing, failed) — from dataset.status alone
 *   2. Metadata override (reconstruction-artefacts) — only detectable via flagReason
 *   3. Spectrum-derived checks: surface-contamination, unexpected-peak, clean
 */
export function computeQuality(dataset: Dataset, spectrum?: SpectrumBin[]): DatasetQuality {
  if (dataset.status === 'processing') {
    return {
      status: 'processing',
      detail: 'Parsing in progress \u2014 check back shortly.',
      accentColor: ACCENT.processing,
    }
  }

  if (dataset.status === 'failed') {
    return {
      status: 'failed',
      detail: 'Specimen failure \u2014 only 182\u00a0k ions detected across 8.2\u00a0nm depth. Insufficient for ranging. Re-run required.',
      accentColor: ACCENT.failed,
    }
  }

  // Reconstruction artefacts: CANNOT be derived from spectrum content.
  // The spectrum above looks completely healthy — the issue is geometric.
  if (dataset.flagReason === 'reconstruction-artefacts') {
    return {
      status: 'flagged',
      reason: 'reconstruction-artefacts',
      detail: FLAG_DETAILS['reconstruction-artefacts'],
      accentColor: ACCENT.flagged,
    }
  }

  const src = spectrum ?? dataset.spectrum
  if (!src.length) {
    return { status: 'unknown', detail: 'No spectrum data available.', accentColor: ACCENT.unknown }
  }

  const totalCount = src.reduce((s, b) => s + b.count, 0)
  if (totalCount === 0) {
    return { status: 'unknown', detail: 'Empty spectrum.', accentColor: ACCENT.unknown }
  }

  const oCount   = src.filter(b => b.mz >= 15.5 && b.mz < 16.5).reduce((s, b) => s + b.count, 0)
  const fe2Count = src.filter(b => b.mz >= 27.3 && b.mz < 29.0).reduce((s, b) => s + b.count, 0)

  // Surface contamination: O⁺ outcompetes Fe²⁺
  if (dataset.flagReason === 'surface-contamination' || oCount > fe2Count) {
    return {
      status: 'flagged',
      reason: 'surface-contamination',
      detail: FLAG_DETAILS['surface-contamination'],
      accentColor: ACCENT.flagged,
    }
  }

  // Unexpected peak: our known element windows capture less than half of all ions
  const knownWindows = [
    { mzMin: 15.5, mzMax: 16.5 },
    { mzMin: 27.3, mzMax: 29.0 },
    { mzMin: 29.0, mzMax: 33.0 },
    { mzMin: 54.5, mzMax: 57.0 },
    { mzMin: 57.0, mzMax: 65.0 },
  ]
  const knownCount = knownWindows.reduce(
    (sum, w) => sum + src.filter(b => b.mz >= w.mzMin && b.mz < w.mzMax).reduce((s, b) => s + b.count, 0),
    0,
  )
  if (dataset.flagReason === 'unexpected-peak' || knownCount / totalCount < 0.5) {
    return {
      status: 'flagged',
      reason: 'unexpected-peak',
      detail: FLAG_DETAILS['unexpected-peak'],
      accentColor: ACCENT.flagged,
    }
  }

  // Fe²⁺ dominant — expected signature for Fe-based alloys
  if (fe2Count / totalCount > 0.1) {
    return {
      status: 'clean',
      detail: 'Dominant Fe\u00b2\u207a peak \u2014 expected acquisition signature. Element identities auto-assigned.',
      accentColor: ACCENT.clean,
    }
  }

  return {
    status: 'unknown',
    detail: 'Spectrum present but element identity could not be determined automatically.',
    accentColor: ACCENT.unknown,
  }
}
