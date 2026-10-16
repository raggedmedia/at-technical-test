export interface Species {
  id: string
  label: string     // ion with charge, e.g. Fe²⁺
  name: string
  mz: number        // nominal peak position
  mzMin: number     // ranging window lower bound (inclusive)
  mzMax: number     // ranging window upper bound (exclusive)
  note: string
}

// Single source of truth for ion identity. Drives the spectrum, the composition
// table and the point cloud, so a selection means the same ions in all three.
// Anything outside these windows is unranged: identity waits for the ranging step.
export const SPECIES: Species[] = [
  { id: 'o1',  label: 'O⁺',   name: 'Oxygen',       mz: 16.0, mzMin: 15.5, mzMax: 16.5, note: 'Surface oxide or vacuum residual' },
  { id: 'fe2', label: 'Fe²⁺', name: 'Iron',         mz: 27.9, mzMin: 27.3, mzMax: 29.0, note: 'Matrix element' },
  { id: 'ni2', label: 'Ni²⁺', name: 'Nickel',       mz: 31.9, mzMin: 29.0, mzMax: 33.0, note: 'Alloying element' },
  { id: 'fe1', label: 'Fe⁺',  name: 'Iron',         mz: 55.8, mzMin: 54.5, mzMax: 57.0, note: 'Singly charged iron' },
  { id: 'ni1', label: 'Ni⁺',  name: 'Nickel',       mz: 57.9, mzMin: 57.0, mzMax: 65.0, note: 'Singly charged nickel isotopes' },
  { id: 'x72', label: '?',    name: 'Unidentified', mz: 71.9, mzMin: 71.0, mzMax: 73.0, note: 'Mo²⁺ or Ge, needs ranging' },
]

export const UNRANGED_ID = 'unranged'

export function speciesIdForMz(mz: number): string {
  return SPECIES.find(s => mz >= s.mzMin && mz < s.mzMax)?.id ?? UNRANGED_ID
}
