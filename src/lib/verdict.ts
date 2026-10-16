import type { Dataset, FailReason, FlagReason } from '../fixtures/datasets'
import type { DatasetQuality } from './quality'

// Everything the verdict rail says, derived once from quality + dataset.

export type Tone = 'pass' | 'flag' | 'fail' | 'pending' | 'na'

export interface Check {
  name: 'Acquisition' | 'Composition' | 'Reconstruction'
  tone: Tone
  value: string
}

export interface Action {
  label: string
  demo: string
}

// Where the evidence for a flag lives, so the workbench can open on it.
export type Focus =
  | { on: 'spectrum'; speciesId?: string; mzMin: number; mzMax: number; note: string }
  | { on: 'needle'; note: string }

export interface Verdict {
  tone: Tone
  title: string
  summary: string
  detail: string
  checks: Check[]
  primary: Action | null
  secondary: Action | null
  focus: Focus | null
}

const SIMULATE = 'This would open the simulation tool in the full product.'
const REMEDIATE = 'This would open the remediation tool in the full product.'

const FLAG: Record<FlagReason, { summary: string; action: string }> = {
  'surface-contamination':    { summary: 'Surface oxide is masking the alloy signal.',  action: 'Trim surface layer' },
  'reconstruction-artefacts': { summary: 'The reconstruction geometry is distorted.',   action: 'Adjust reconstruction' },
  'unexpected-peak':          { summary: 'An unidentified peak dominates the spectrum.', action: 'Range unknown peak' },
}

const FAIL: Record<FailReason, string> = {
  'specimen-fracture': 'The specimen tip fractured early in the run.',
  'voltage-spike':     'A voltage spike ended the run.',
  'vacuum-loss':       'Vacuum was lost during the run.',
}

export const formatIons = (n: number) => n.toLocaleString('en-AU')
const nm = (n: number) => n.toFixed(1)

export function volumeLabel(d: Dataset): string {
  const { x, y, z } = d.dimensions
  return `${nm(x.range_nm)} × ${nm(y.range_nm)} × ${nm(z.range_nm)} nm`
}

export function deriveVerdict(dataset: Dataset, quality: DatasetQuality, ionCount: number): Verdict {
  const ions = `${formatIons(ionCount)} ions`
  const volume = volumeLabel(dataset)
  const { x, y, z } = dataset.dimensions

  switch (quality.status) {
    case 'clean':
      return {
        tone: 'pass',
        title: 'Clean acquisition',
        summary: 'Ready to seed a simulation.',
        detail: quality.detail,
        checks: [
          { name: 'Acquisition', tone: 'pass', value: ions },
          { name: 'Composition', tone: 'pass', value: dataset.material },
          { name: 'Reconstruction', tone: 'pass', value: 'No artefacts flagged' },
        ],
        primary: { label: 'New simulation from dataset', demo: SIMULATE },
        secondary: { label: 'Compare to a simulation', demo: SIMULATE },
        focus: null,
      }

    case 'flagged': {
      const reason = quality.reason
      const base = {
        tone: 'flag' as const,
        title: 'Review required',
        summary: FLAG[reason].summary,
        detail: quality.detail,
        primary: { label: FLAG[reason].action, demo: REMEDIATE },
        secondary: null,
      }
      if (reason === 'surface-contamination') {
        return {
          ...base,
          checks: [
            { name: 'Acquisition', tone: 'pass', value: ions },
            { name: 'Composition', tone: 'flag', value: 'O⁺ outweighs Fe²⁺' },
            { name: 'Reconstruction', tone: 'pass', value: 'No artefacts flagged' },
          ],
          focus: { on: 'spectrum', speciesId: 'o1', mzMin: 15.5, mzMax: 16.5, note: 'O⁺ outweighs Fe²⁺' },
        }
      }
      if (reason === 'reconstruction-artefacts') {
        return {
          ...base,
          checks: [
            { name: 'Acquisition', tone: 'pass', value: ions },
            { name: 'Composition', tone: 'pass', value: dataset.material },
            { name: 'Reconstruction', tone: 'flag', value: `XY ${nm(x.range_nm)} × ${nm(y.range_nm)} nm` },
          ],
          focus: { on: 'needle', note: `Asymmetric cross-section, ${nm(x.range_nm)} × ${nm(y.range_nm)} nm` },
        }
      }
      return {
        ...base,
        checks: [
          { name: 'Acquisition', tone: 'pass', value: ions },
          { name: 'Composition', tone: 'flag', value: 'Unidentified at 44 to 46 Da' },
          { name: 'Reconstruction', tone: 'na', value: 'Waits on ranging' },
        ],
        focus: { on: 'spectrum', mzMin: 44, mzMax: 46, note: 'Unidentified cluster, 44 to 46 Da' },
      }
    }

    case 'failed':
      return {
        tone: 'fail',
        title: 'Acquisition failed',
        summary: dataset.failReason ? FAIL[dataset.failReason] : 'The acquisition did not complete.',
        detail: quality.detail,
        checks: [
          { name: 'Acquisition', tone: 'fail', value: `${ions}, ${nm(z.range_nm)}\u00a0nm` },
          { name: 'Composition', tone: 'na', value: 'Not enough ions' },
          { name: 'Reconstruction', tone: 'na', value: 'Not enough depth' },
        ],
        primary: { label: 'Archive dataset', demo: 'This would archive the file in the real app.' },
        secondary: null,
        focus: null,
      }

    case 'processing':
      return {
        tone: 'pending',
        title: 'Processing',
        summary: 'Parsing the .epos file.',
        detail: quality.detail,
        checks: (['Acquisition', 'Composition', 'Reconstruction'] as const).map(name => ({ name, tone: 'pending', value: 'Waiting' })),
        primary: null,
        secondary: null,
        focus: null,
      }

    default:
      return {
        tone: 'na',
        title: 'Status unknown',
        summary: 'This dataset could not be assessed automatically.',
        detail: quality.detail,
        checks: [
          { name: 'Acquisition', tone: ionCount > 0 ? 'pass' : 'na', value: ions },
          { name: 'Composition', tone: 'na', value: 'Not identified' },
          { name: 'Reconstruction', tone: 'na', value: volume },
        ],
        primary: null,
        secondary: null,
        focus: null,
      }
  }
}
