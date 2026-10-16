---
name: APT Data Explorer
description: Review before trust. A dark verdict rail beside a lit workbench of linked evidence.
colors:
  lit-ground: "oklch(98.4% 0.003 247.858)"
  panel-white: "#ffffff"
  night-slate: "oklch(20.8% 0.042 265.755)"
  rail-glow: "oklch(27.9% 0.041 260.031)"
  stage-black: "oklch(12.9% 0.042 264.695)"
  action-hover-on-dark: "oklch(92.9% 0.013 255.508)"
  rule-hairline: "oklch(92.9% 0.013 255.508)"
  rule-strong: "oklch(86.9% 0.022 252.894)"
  row-hover: "oklch(96.8% 0.007 247.896)"
  text-muted: "oklch(44.6% 0.043 257.281)"
  text-quiet-on-dark: "oklch(86.9% 0.022 252.894)"
  label-on-dark: "oklch(70.4% 0.04 256.788)"
  border-on-dark: "oklch(44.6% 0.043 257.281)"
  status-pass: "oklch(59.6% 0.145 163.225)"
  status-pass-on-dark: "oklch(76.5% 0.177 163.223)"
  status-flag: "oklch(66.6% 0.179 58.318)"
  status-flag-on-dark: "oklch(82.8% 0.189 84.429)"
  flag-band: "oklch(98.7% 0.022 95.277)"
  status-fail: "oklch(57.7% 0.245 27.325)"
  status-fail-on-dark: "oklch(70.4% 0.191 22.216)"
  status-fail-ink: "oklch(50.5% 0.213 27.518)"
  status-fail-wash: "oklch(97.1% 0.013 17.38)"
  status-pending: "oklch(55.4% 0.046 257.417)"
  species-fe2: "#155dfc"
  species-fe2-on-dark: "#51a2ff"
  species-fe1: "#51a2ff"
  species-fe1-on-dark: "#8ec5ff"
  species-ni2: "#e60076"
  species-ni2-on-dark: "#fb64b6"
  species-ni1: "#fb64b6"
  species-ni1-on-dark: "#fda5d5"
  species-o1: "#0092b8"
  species-o1-on-dark: "#00d3f2"
  species-unidentified: "#5ea500"
  species-unidentified-on-dark: "#9ae600"
  species-unranged: "#90a1b9"
  species-unranged-on-dark: "#62748e"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.953rem"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5625rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  lead:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  numeric:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary-on-dark:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.stage-black}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-primary-on-dark-hover:
    backgroundColor: "{colors.action-hover-on-dark}"
  button-secondary-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.text-quiet-on-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
  button-secondary-on-dark-hover:
    backgroundColor: "{colors.rail-glow}"
  button-outline:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.night-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "4px 12px"
  segment:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.night-slate}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 14px"
  segment-selected:
    backgroundColor: "{colors.night-slate}"
    textColor: "{colors.panel-white}"
  species-chip:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.night-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  panel:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.none}"
    padding: "24px"
  viewport-3d:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.text-quiet-on-dark}"
    height: "22rem"
  verdict-rail:
    backgroundColor: "{colors.night-slate}"
    textColor: "{colors.panel-white}"
    width: "24rem"
    padding: "20px 24px 24px"
  tooltip:
    backgroundColor: "{colors.night-slate}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  upload-zone:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.night-slate}"
    rounded: "{rounded.none}"
    padding: "36px 24px"
  upload-zone-reject:
    backgroundColor: "{colors.status-fail-wash}"
    textColor: "{colors.status-fail-ink}"
---

# Design System: APT Data Explorer

## Overview

**Creative North Star: "The Lit Workbench"**

The app is a physical bench under a single overhead light. The ground (`lit-ground`) is brightest where the light lands, a white radial falloff at the top of the page. White evidence panels sit on it, lifted by soft, cool, three-layer shadows. Beside the bench stands a dark verdict rail in `night-slate` that states the result, the cause and the one next action. The only darker surface is the 3D viewport, a `stage-black` box set inside a white panel like any other piece of evidence.

This is an Operate surface. It is dense but calm, with one hyperlegible typeface, a fixed rem type scale, no fluid type and nothing smaller than 16px. No hue is spent on chrome. Actions are ink: white on the dark rail and header, `night-slate` on light surfaces. Colour means data or status. Each ion species owns a Tailwind hue across every view. Status owns emerald, amber, red and slate, and every status also owns a shape.

Motion is weighted and functional. Things rise into place, lift a pixel on hover and settle fast on press. One easing curve (`ease-out-quart`) runs every transition. The signature behaviour is linked selection lighting: choosing a species in the spectrum, the composition table or the 3D needle keeps it in its colour in all three while the rest recedes.

**Key Characteristics:**
- Dark verdict rail beside a light workbench, the same layout for every status.
- Square corners everywhere, zero radius, no chamfer.
- Depth from overhead light: radial ground, cool layered shadows, a 1px lift on hover.
- Ink actions; hue is reserved for species and status.
- Atkinson Hyperlegible Next throughout, its Mono sibling for anything that aligns.

## Colors

All colours are Tailwind CSS v4 defaults used by name in markup; canvas and WebGL read copies from `src/lib/palette.ts`. The palette is slate plus data colour.

### Primary
- **Night Slate** (`night-slate`, slate-900): the verdict rail, the list page header, tooltips and toasts, body ink, the focus ring on light surfaces, the selected segment, the selected species chip border and the upload zone's hover and drag border and icon. Ink is the action colour on light surfaces.
- **Panel White** (#ffffff): every evidence panel, chips, and the fill of primary actions on dark (rail and header), with `stage-black` text. Those actions hover to **Action Hover On Dark** (slate-200). White is also the focus ring inside `.on-dark` regions.
- Text selection uses slate-200, so no hue is spent on chrome.

### Secondary (species identity)
One hue per element, lightness per charge state. The base step sits on white (spectrum bars, table chips); the `-on-dark` step sits in the 3D viewport.
- **Iron** (`species-fe2` blue-600, `species-fe1` blue-400): Fe²⁺ and Fe⁺.
- **Nickel** (`species-ni2` pink-600, `species-ni1` pink-400): Ni²⁺ and Ni⁺.
- **Oxygen** (`species-o1`, cyan-600): O⁺.
- **Unidentified** (`species-unidentified`, lime-600): peaks outside the known species list.
- **Unranged** (`species-unranged`, slate-400): ions outside every ranging window. Deliberately grey, so it never competes with a named species.

### Tertiary (status)
- **Pass** (`status-pass` emerald-600, emerald-400 on dark): filled circle with a check.
- **Flag** (`status-flag` amber-600 on white, `status-flag-on-dark` amber-400 on the rail and in the viewport): triangle with a bar. **Flag Band** (amber-50) shades the flagged m/z window in the spectrum, with a 2px amber-600 line on top and a matching amber-600 border on the pinned flag note.
- **Fail** (`status-fail` red-600, red-400 on dark): square with a cross. **Status Fail Ink** (red-700) and **Status Fail Wash** (red-50) carry the upload rejection state.
- **Pending and not assessed** (`status-pending` slate-500 on white; slate-400 pending and slate-500 not assessed on dark): a dashed ring that pulses, and a short bar.

### Neutral
- **Lit Ground** (slate-50): page background under a white radial highlight.
- **Rail Glow** (slate-800): a radial highlight at the rail's top left and the viewport's top centre; also the secondary button hover on dark.
- **Stage Black** (slate-950): the 3D viewport only, and the text on white actions.
- **Text Muted** (slate-600): descriptions, table headers, captions and secondary copy on light.
- **Text Quiet On Dark** (slate-300) and **Label On Dark** (slate-400): rail body copy and rail fact labels.
- **Rules**: `rule-hairline` (slate-200) between rows, `rule-strong` (slate-300) under table headers and around segmented controls and outline buttons. Hovered rows take slate-50, the selected species row takes `row-hover` (slate-100).

### Named Rules
**The Ink Acts Rule.** Actions carry no hue. On dark they are white with slate-950 text; on light they are slate-900. Colour belongs to data and status.

**The Species Owns Its Hue Rule.** A species keeps the same hue in every view. Blue, pink, cyan and lime are reserved for species, so no interface element borrows them.

**The Shape Carries Status Rule.** Every status tone has its own icon silhouette (circle, triangle, square, dashed ring, bar). Colour reinforces status; shape states it.

**The Three To One Graphic Rule.** Status icons, flag borders and flag lines reach at least 3:1 against the surface they sit on. That is why the flag is amber-600 on white (about 3.2:1) and amber-400 only on dark, and why pending icons on white are slate-500.

## Typography

**Interface Font:** Atkinson Hyperlegible Next (with ui-sans-serif, system-ui)
**Numeric Font:** Atkinson Hyperlegible Mono (with ui-monospace, SF Mono, Menlo)

**Character:** One hyperlegible family carries everything, so O and 0, l and 1, rn and m never blur, in prose or in species labels. Its Mono sibling takes over wherever characters must line up.

### Hierarchy
- **Display** (700, 1.953rem, 1.15): the rail's verdict title and the list page heading. One per screen.
- **Headline** (700, 1.5625rem, 1.25): standalone message panels (not found, load error).
- **Title** (700, 1.25rem, 1.4): panel headings (Mass spectrum, Reconstruction, Composition), the upload prompt and the product name in the header.
- **Lead** (500, 1.25rem, 1.4): the rail's cause sentence directly under the verdict title.
- **Body** (400, 1rem, 1.5): all running copy, rail facts and check values (with tabular figures). Check names, element names, species chips, the rail's 'Details' heading and status labels step up to 700 at the same size. Species labels on the spectrum canvas are 700 at 16px.
- **Label** (500, 1rem): table column headers and segmented control options, in sentence case.
- **Numeric** (Atkinson Hyperlegible Mono, 1rem, tabular): ion counts and shares in tables, file names (regular weight), tooltip readouts and the spectrum axis ticks (500, 16px on canvas).

### Named Rules
**The Sixteen Pixel Floor Rule.** Nothing renders below 1rem, canvas labels included. Hierarchy comes from weight and the 1.25 step scale, never from shrinking text.

**The Mono Aligns Rule.** Mono is for characters that must line up: column numbers, file names, readouts and axis ticks. Everything else is Atkinson Hyperlegible Next.

## Layout

The detail page is a two-column grid from 1024px: a 24rem verdict rail, sticky and full viewport height, beside a fluid workbench (`minmax(0, 1fr)`). The rail scrolls internally and pins its action block to the bottom behind a slate-800 rule. The workbench stacks the spectrum panel full width on top (canvas 300px tall), then the reconstruction panel and composition table side by side from 1280px. Below 1024px the rail stacks above the workbench.

The list page is a single column capped at 72rem (`max-w-6xl`) under a full-width night-slate header bar. Gutters step 16px, 24px, 32px at the sm and lg breakpoints. The dataset table collapses to file name plus an inline status badge below 768px.

Spacing runs on Tailwind's 4px base. Panels pad 24px (16px on small screens), workbench gaps are 24px, workbench padding is 24px then 32px, the rail pads 24px horizontally, and table cells pad 16px vertically by 20px horizontally.

## Elevation & Depth

Depth is lighting. One overhead light source: the page ground carries a white radial highlight at top centre, the rail and 3D viewport carry slate-800 radial glows, and shadows are cool (tinted slate-900, never black), layered contact, mid and ambient.

### Shadow Vocabulary
- **Panel** (`box-shadow: 0 1px 1px oklch(20.8% 0.042 265.755 / 0.07), 0 2px 6px oklch(20.8% 0.042 265.755 / 0.06), 0 12px 32px oklch(20.8% 0.042 265.755 / 0.06)`): resting elevation for every workbench panel, the dataset table and the spectrum flag note.
- **Raised** (`box-shadow: 0 1px 1px oklch(20.8% 0.042 265.755 / 0.08), 0 4px 10px oklch(20.8% 0.042 265.755 / 0.08), 0 20px 44px oklch(20.8% 0.042 265.755 / 0.1)`): things that respond or float, the upload zone on hover or drag and the toast.
- **Primary action** (`box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 6px 18px oklch(12.9% 0.042 264.695 / 0.45)`): the rail's primary button, a top-edge highlight plus a deep drop onto the dark rail.

### Named Rules
**The Overhead Light Rule.** Shadows fall straight down, soft and cool. Elevation rises with interactivity: panels rest, interactive surfaces lift to Raised.

## Shapes

Every corner is square, zero radius, no chamfer, including buttons, chips, tooltips, notes, panels, the 3D viewport and the upload zone. Borders are 1px hairlines for structure, 2px for selectable chips and the upload zone (dashed at rest, solid when dragging or rejecting). Icons are inline SVG on a 16px or 20px grid with 1.75 to 2px square-capped strokes.

## Components

### Buttons
Weighted and direct. Rail, header and chip buttons carry the `lift` behaviour: 1px rise on hover over 350ms, settling back in 100ms on press.
- **Shape:** square (0px).
- **Primary on dark:** white fill, slate-950 700 text at 1rem, 14px by 20px padding, full rail width with a trailing arrow, Primary action shadow. One per screen, pinned at the bottom of the rail. The header's 'Upload .epos' uses the same fill at 8px by 16px with a leading icon.
- **Hover / Focus:** fill drops to slate-200; focus is a 2px ring offset 2px, white on dark, slate-900 on light.
- **Secondary on dark:** transparent with a slate-600 border and slate-100 text at weight 500; hover lifts the border to slate-400 and fills slate-800.
- **Outline on light:** white with a slate-300 border and slate-900 text ('Reset view'); hover darkens the border to slate-900.
- **Text link on light:** slate-900, bold, underlined with a 4px offset; hover fades to slate-600.

### Segmented control
The spectrum's log and linear toggle. A slate-300 bordered group of square options; the pressed option fills night-slate with white text, others are white with slate-700 text and a slate-100 hover.

### Species chip
A white chip with a 2px slate-200 border, a 12px square swatch in the species colour and the species label in 700. Hover darkens the border to slate-400; selected takes a slate-900 border, and its table row fills slate-100. The chip is the keyboard entry point for linked selection.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** Panel White.
- **Shadow Strategy:** Panel at rest (see Elevation & Depth).
- **Border:** none; panels separate by shadow and ground.
- **Internal Padding:** 24px, 16px on small screens.

### 3D viewport
A 22rem tall stage-black inset inside the white Reconstruction panel, with a slate-800 glow at top centre. The panel keeps the heading, sample count and 'Reset view' above it and a slate-600 caption below (selection readout in bold slate-900 on the left, orbit hint on the right). Without a point sample the viewport shows the XY bounds as a dashed slate-500 outline, or a solid amber-400 outline with a flag note when the flag points at the needle.

### Inputs / Fields
- **Upload zone:** 2px dashed slate-300 border on a 70% white fill, 36px by 24px padding, centred icon, title-size prompt. Hover and valid drag turn the border and icon slate-900 over solid white, add the Raised shadow and float the icon (6px, 1.6s; 0.7s while dragging). Drag also scales the zone to 1.015.
- **Reject:** solid red-600 border on red-50, red-700 copy, a decaying horizontal shake on the zone (480ms) and a rotating shake on the cross icon (560ms). No overshoot.

### Navigation
The list page header is a night-slate bar holding the product name (Title) and the upload action. The detail page's only navigation is the rail's 'All datasets' back link, slate-300 turning white on hover, with a 16px chevron.

### Data table
Rows separate by slate-200 hairlines under a slate-300 header rule, 16px by 20px cells. In the dataset table the bold status label leads each row; file names sit in regular-weight Mono and underline on row hover with a 4px nudge, and the trailing chevron shifts and darkens to slate-900. Composition rows are one line (chip, element name, count, share), with the element note in the row's title tooltip.

### Verdict rail (signature)
Night-slate column with a rail-glow highlight at top left. Order is fixed: back link, status icon (26px) beside the Display verdict, the Lead cause sentence, a detail paragraph, three check rows (status icon, bold name, tabular value, 70% slate-700 rules between), then a 'Details' heading over a two-column fact list (slate-400 labels, right-aligned values; File in Mono). The action block sits below on its own rule. Title, cause and checks rise in with a 45ms stagger.

### Status badge
A status icon (18px), a bold label and, for flagged or failed datasets, a slate-600 reason ('Surface oxide', 'Tip fracture'). Used in the dataset table.

### Linked evidence (signature)
Spectrum bars, composition rows and 3D points share one selection. The selected species keeps its colour; every other species fades to slate-200 bars, dimmed labels or the viewport's dim colour over 350ms ease-out-quart, interpolated in JS for canvas and WebGL. A flagged dataset opens with its species selected and a flag note pinned above its peak: white, 1px amber-600 border, Panel shadow, flag icon and a bold note. The spectrum's top margin grows from 36px to 56px only when a note shows. The note sits on its own layer and never alters plotted data.

### Tooltip and toast
Both are night-slate, square, white text. The spectrum tooltip stacks m/z and count in Mono with the species in slate-300. The toast enters from 16px below over 240ms, holds for 3s, and carries the Raised shadow.

## Do's and Don'ts

### Do:
- **Do** keep every corner at 0px.
- **Do** make actions ink: white with slate-950 text on dark, slate-900 on light.
- **Do** draw a species in its own hue in every view, base step on white, the brighter `-on-dark` step in the 3D viewport.
- **Do** pair every status colour with its icon shape (circle, triangle, square, dashed ring, bar).
- **Do** check every status graphic for 3:1 against its surface; on white the flag is amber-600, never a lighter amber.
- **Do** set ion counts, shares, file names, readouts and axis ticks in Atkinson Hyperlegible Mono with tabular figures; everything else in Atkinson Hyperlegible Next.
- **Do** run every transition on `cubic-bezier(0.25, 1, 0.5, 1)`, 350ms for movement, 200ms for colour, 100ms on press.
- **Do** honour reduced motion: animations and transitions collapse to 1ms and the selection tween swaps instantly.
- **Do** tint shadows with slate-900, layered contact, mid and ambient.

### Don't:
- **Don't** set any text below 1rem, on canvas or in HTML.
- **Don't** spend a hue on chrome; blue, pink, cyan and lime belong to species, emerald, amber and red to status.
- **Don't** use slate-950 for whole surfaces other than the 3D viewport.
- **Don't** use pure black shadows or a single blurred shadow.
- **Don't** use springy or overshooting easing; motion is weighted and settles.
- **Don't** let a flag note or highlight change plotted values.
