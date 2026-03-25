export interface BoundingBox {
  min: number
  max: number
  range_nm: number
}

export interface AptDimensions {
  x: BoundingBox
  y: BoundingBox
  z: BoundingBox
}

export interface AptSummary {
  filename: string
  atomCount: number
  dimensions: AptDimensions
  mzRange: { min: number; max: number }
  status: 'Processed' | 'Processing' | 'Error'
}

// Fixture data — replaced with real values once parse_epos.py runs
// Atom count = 290,225,452 bytes ÷ 44 bytes/record = 6,596,033
// Dimensions are physically realistic for a LEAP needle-tip APT dataset
// mzRange: realistic for a multi-component alloy (light oxygen at 16 Da → heavy Ni isotopes)
export const FIXTURE_SUMMARY: AptSummary = {
  filename: 'atom_probe_tomography_data-public.epos',
  atomCount: 6596033,
  dimensions: {
    x: { min: -18.4, max: 19.1, range_nm: 37.5 },
    y: { min: -17.9, max: 18.6, range_nm: 36.5 },
    z: { min: 0.0, max: 98.7, range_nm: 98.7 },
  },
  mzRange: { min: 0.2, max: 184.0 },
  status: 'Processed',
}
