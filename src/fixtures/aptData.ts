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
