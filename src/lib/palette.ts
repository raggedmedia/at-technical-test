// Tailwind v4 palette values for surfaces that can't read utility classes:
// the spectrum canvas (accepts oklch) and the WebGL point cloud (needs hex).

export const CANVAS = {
  barDim:     'oklch(92.9% 0.013 255.508)',  // slate-200
  label:      'oklch(20.8% 0.042 265.755)',  // slate-900
  labelDim:   'oklch(55.4% 0.046 257.417)',  // slate-500
  grid:       'oklch(92.9% 0.013 255.508)',  // slate-200
  axis:       'oklch(37.2% 0.044 257.287)',  // slate-700
  tick:       'oklch(44.6% 0.043 257.281)',  // slate-600
  focusBand:  'oklch(98.7% 0.022 95.277)',   // amber-50
  focusLine:  'oklch(66.6% 0.179 58.318)',   // amber-600
}

export const GL = {
  stage:    '#020618', // slate-950
  dim:      '#0f172b', // slate-900
}

// One hue per element, lightness per charge state. Light steps sit on white
// (spectrum, table); brighter steps sit on the dark 3D stage.
export const SPECIES_COLOUR: Record<string, { light: string; dark: string }> = {
  fe2:      { light: '#155dfc', dark: '#51a2ff' }, // blue-600 / blue-400
  fe1:      { light: '#51a2ff', dark: '#8ec5ff' }, // blue-400 / blue-300
  ni2:      { light: '#e60076', dark: '#fb64b6' }, // pink-600 / pink-400
  ni1:      { light: '#fb64b6', dark: '#fda5d5' }, // pink-400 / pink-300
  o1:       { light: '#0092b8', dark: '#00d3f2' }, // cyan-600 / cyan-400
  x72:      { light: '#5ea500', dark: '#9ae600' }, // lime-600 / lime-400
  unranged: { light: '#90a1b9', dark: '#62748e' }, // slate-400 / slate-500
}
