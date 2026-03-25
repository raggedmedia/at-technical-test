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

export interface SpectrumBin {
  mz: number
  count: number
}

export interface AptSummary {
  filename: string
  atomCount: number
  dimensions: AptDimensions
  mzRange: { min: number; max: number }
  status: 'Processed' | 'Processing' | 'Error'
  spectrum: SpectrumBin[]
}

// Fixture data — realistic peaks matching the actual EPOS file's Fe-Ni alloy signature
// Real peaks confirmed: Fe²⁺ @28 Da, Ni²⁺ @32 Da, O @16 Da, Fe/Mo @72 Da
function makeFixtureSpectrum(): SpectrumBin[] {
  const bins: SpectrumBin[] = []
  const peaks = [
    { center: 27.9, height: 1_072_038, width: 1.2 },
    { center: 16.0, height: 327_421,  width: 0.6 },
    { center: 31.9, height: 440_864,  width: 0.8 },
    { center: 71.9, height: 275_818,  width: 0.8 },
    { center: 24.0, height: 40_000,   width: 0.5 },
    { center: 14.0, height: 25_000,   width: 0.4 },
  ]
  for (let i = 0; i < 2000; i++) {
    const mz = parseFloat((i * 0.1).toFixed(1))
    let count = Math.floor(Math.random() * 200)
    for (const p of peaks) {
      const dist = mz - p.center
      count += Math.round(p.height * Math.exp(-(dist * dist) / (2 * p.width * p.width)))
    }
    if (count > 0) bins.push({ mz, count })
  }
  return bins
}

export const FIXTURE_SUMMARY: AptSummary = {
  filename: 'atom_probe_tomography_data-public.epos',
  atomCount: 6596033,
  dimensions: {
    x: { min: -21.0, max: 21.1, range_nm: 42.1 },
    y: { min: -21.1, max: 21.0, range_nm: 42.1 },
    z: { min: 0.0, max: 71.2, range_nm: 71.2 },
  },
  mzRange: { min: 0.05, max: 299.98 },
  status: 'Processed',
  spectrum: makeFixtureSpectrum(),
}
