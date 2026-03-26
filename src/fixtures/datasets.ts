import type { SpectrumBin, AptDimensions } from './aptData'

export type DatasetStatus = 'processing' | 'processed' | 'flagged' | 'failed'
export type FlagReason = 'surface-contamination' | 'reconstruction-artefacts' | 'unexpected-peak'
export type FailReason = 'specimen-fracture' | 'voltage-spike' | 'vacuum-loss'

export interface Dataset {
  id: string
  filename: string
  status: DatasetStatus
  flagReason?: FlagReason
  failReason?: FailReason
  uploadedAt: string
  material: string
  atomCount: number
  spectrum: SpectrumBin[]
  dimensions: AptDimensions
  mzRange: { min: number; max: number }
}

// Inline fake spectra — TypeScript constants, NOT fetched from public/data/.
// These fabricate the key spectrum signatures that drive quality detection logic.
// The real dataset (id: 'apt-real') fetches live data via useAptData().

const SURFACE_CONTAMINATION_SPECTRUM: SpectrumBin[] = [
  // O⁺ at 16 Da — dominant (38%). Surface oxide from air exposure before loading.
  { mz: 15.8, count: 142000 }, { mz: 15.9, count: 185000 },
  { mz: 16.0, count: 198000 }, { mz: 16.1, count: 172000 },
  // Fe²⁺ at 28 Da — suppressed by oxidation layer
  { mz: 27.7, count: 45000 }, { mz: 27.9, count: 78000 }, { mz: 28.1, count: 52000 },
  // Cr²⁺ at 26 Da (Fe-Cr alloy base)
  { mz: 25.9, count: 32000 }, { mz: 26.0, count: 48000 }, { mz: 26.1, count: 35000 },
  // Ni²⁺ at 32 Da
  { mz: 31.8, count: 22000 }, { mz: 31.9, count: 38000 }, { mz: 32.1, count: 18000 },
  // Fe⁺ at 56 Da
  { mz: 55.8, count: 12000 }, { mz: 56.0, count: 18000 },
  { mz: 44.5, count: 4000 }, { mz: 71.9, count: 3000 },
]

const RECONSTRUCTION_ARTEFACTS_SPECTRUM: SpectrumBin[] = [
  // Fe²⁺ at 28 Da — healthy-looking spectrum. Quality is flagged for geometric
  // reasons only (distorted XY cross-section); this is why computeQuality()
  // MUST have access to dataset.flagReason, not just spectrum content.
  { mz: 27.7, count: 542000 }, { mz: 27.9, count: 892000 }, { mz: 28.1, count: 635000 },
  { mz: 31.8, count: 280000 }, { mz: 31.9, count: 440000 }, { mz: 32.1, count: 198000 },
  { mz: 15.9, count: 62000 }, { mz: 16.0, count: 85000 },
  { mz: 55.8, count: 42000 }, { mz: 56.0, count: 68000 },
  { mz: 57.9, count: 28000 }, { mz: 58.0, count: 38000 }, { mz: 63.5, count: 22000 },
  { mz: 71.9, count: 18000 },
]

const UNEXPECTED_PEAK_SPECTRUM: SpectrumBin[] = [
  // Unknown cluster at 44–46 Da — dominant (31%). Ti-6Al-4V peaks (Ti²⁺ @24, Al²⁺ @13.5)
  // fall outside our element map windows — automated identification fails.
  { mz: 44.3, count: 320000 }, { mz: 44.5, count: 560000 },
  { mz: 45.0, count: 285000 }, { mz: 45.5, count: 198000 },
  { mz: 23.9, count: 160000 }, { mz: 24.0, count: 195000 }, { mz: 24.1, count: 142000 },
  { mz: 13.4, count: 82000 },  { mz: 13.5, count: 98000 },
  { mz: 25.4, count: 55000 },  { mz: 25.5, count: 78000 },
  { mz: 27.9, count: 42000 },  { mz: 32.0, count: 28000 },
  { mz: 16.0, count: 18000 },  { mz: 71.5, count: 8000 },
]

const FAILED_SPECTRUM: SpectrumBin[] = [
  { mz: 15.9, count: 3800 }, { mz: 16.0, count: 5200 },
  { mz: 27.9, count: 9800 }, { mz: 28.0, count: 12000 },
  { mz: 32.0, count: 4500 }, { mz: 44.0, count: 2800 },
  { mz: 55.8, count: 1900 }, { mz: 71.9, count: 900 },
]

export const DATASETS: Dataset[] = [
  {
    id: 'apt-real',
    filename: 'atom_probe_tomography_data-public.epos',
    status: 'processed',
    uploadedAt: '2026-03-24T09:15:00Z',
    material: 'Fe-Ni Alloy',
    atomCount: 6600000,
    // Stub spectrum: just enough for quality to detect Fe²⁺ dominant in list view.
    // The detail page always uses live data from useAptData() instead.
    spectrum: [{ mz: 27.9, count: 892000 }],
    dimensions: {
      x: { min: -21, max: 21.11, range_nm: 42.11 },
      y: { min: -21.06, max: 21.05, range_nm: 42.11 },
      z: { min: 0, max: 71.18, range_nm: 71.18 },
    },
    mzRange: { min: 0.05, max: 299.98 },
  },
  {
    id: 'fe-cr-alloy',
    filename: 'fe-cr-alloy-run-2.epos',
    status: 'flagged',
    flagReason: 'surface-contamination',
    uploadedAt: '2026-03-24T11:42:00Z',
    material: 'Fe-Cr Alloy',
    atomCount: 520000,
    spectrum: SURFACE_CONTAMINATION_SPECTRUM,
    dimensions: {
      x: { min: -18.5, max: 18.2, range_nm: 36.7 },
      y: { min: -18.1, max: 18.4, range_nm: 36.5 },
      z: { min: 0, max: 48.2, range_nm: 48.2 },
    },
    mzRange: { min: 13.4, max: 72.1 },
  },
  {
    id: 'ni-superalloy',
    filename: 'ni-superalloy-001.epos',
    status: 'flagged',
    flagReason: 'reconstruction-artefacts',
    uploadedAt: '2026-03-23T16:08:00Z',
    material: 'Ni Superalloy',
    atomCount: 4200000,
    spectrum: RECONSTRUCTION_ARTEFACTS_SPECTRUM,
    dimensions: {
      x: { min: -12.2, max: 12.4, range_nm: 24.6 },
      y: { min: -6.8, max: 6.9, range_nm: 13.7 },
      z: { min: 0, max: 85.5, range_nm: 85.5 },
    },
    mzRange: { min: 0.05, max: 180.2 },
  },
  {
    id: 'ti-6al-4v',
    filename: 'ti-6al-4v-aerospace.epos',
    status: 'flagged',
    flagReason: 'unexpected-peak',
    uploadedAt: '2026-03-23T10:55:00Z',
    material: 'Ti-6Al-4V',
    atomCount: 1820000,
    spectrum: UNEXPECTED_PEAK_SPECTRUM,
    dimensions: {
      x: { min: -15.8, max: 15.9, range_nm: 31.7 },
      y: { min: -15.6, max: 15.7, range_nm: 31.3 },
      z: { min: 0, max: 62.4, range_nm: 62.4 },
    },
    mzRange: { min: 13.4, max: 72.1 },
  },
  {
    id: 'fe-steel-nuclear',
    filename: 'fe-steel-nuclear.epos',
    status: 'failed',
    failReason: 'specimen-fracture',
    uploadedAt: '2026-03-22T14:30:00Z',
    material: 'Fe Steel',
    atomCount: 182000,
    spectrum: FAILED_SPECTRUM,
    dimensions: {
      x: { min: -8.2, max: 8.1, range_nm: 16.3 },
      y: { min: -7.9, max: 8.0, range_nm: 15.9 },
      z: { min: 0, max: 8.2, range_nm: 8.2 },
    },
    mzRange: { min: 15.9, max: 72.0 },
  },
  {
    id: 'tungsten-fusion',
    filename: 'tungsten-plasma-wall.epos',
    status: 'processing',
    uploadedAt: '2026-03-26T08:45:00Z',
    material: 'W (Tungsten)',
    atomCount: 0,
    spectrum: [],
    dimensions: {
      x: { min: 0, max: 0, range_nm: 0 },
      y: { min: 0, max: 0, range_nm: 0 },
      z: { min: 0, max: 0, range_nm: 0 },
    },
    mzRange: { min: 0, max: 0 },
  },
]
