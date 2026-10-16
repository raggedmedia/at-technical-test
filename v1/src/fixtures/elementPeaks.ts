export interface ElementPeak {
  label: string
  mz: number      // nominal peak position for reference line
  mzMin: number   // m/z classification lower bound (inclusive)
  mzMax: number   // m/z classification upper bound (exclusive)
  color: string
}

// Single source of truth for element identity — drives mass spectrum reference
// lines, legend pills, point cloud colouring, and selection-filtering across both views.
export const ELEMENT_PEAKS: ElementPeak[] = [
  { label: 'O⁺',   mz: 16.0, mzMin:  0, mzMax:  18, color: '#f59e0b' },
  { label: 'Fe²⁺', mz: 27.9, mzMin: 18, mzMax:  30, color: '#3b82f6' },
  { label: 'Ni²⁺', mz: 31.9, mzMin: 30, mzMax:  35, color: '#8b5cf6' },
  { label: 'Fe⁺',  mz: 55.8, mzMin: 35, mzMax:  58, color: '#60a5fa' },
  { label: 'Ni⁺',  mz: 57.9, mzMin: 58, mzMax:  65, color: '#a78bfa' },
  { label: '?⁺',   mz: 71.9, mzMin: 65, mzMax: 200, color: '#6b7280' },
]
