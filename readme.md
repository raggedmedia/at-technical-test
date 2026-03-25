# APT Data Explorer

A first-look dashboard for Atom Probe Tomography data, built as a technical test for Atomic Tessellator.

---

## How to Run

```bash
# 1. Parse the raw data (one-time, ~60 seconds)
python3 parse_epos.py

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

Open `http://localhost:5173`. The app fetches `public/data/summary.json` (header stats, mass spectrum) immediately on load, then lazily fetches `public/data/atoms.json` (50k point cloud atoms) in the background.

---

## What is an `.epos` File?

An `.epos` (Extended Position) file is the primary output format from an Atom Probe Tomography instrument. The machine evaporates individual atoms off a needle-sharp material sample one by one using high-voltage pulses, detects each atom hitting a 2D detector, and records:

- **X, Y, Z** — 3D position of each atom in the material (nanometres)
- **m/z** — mass-to-charge ratio (Daltons) — identifies which element the atom is

Each ion record is **44 bytes** (11 × 32-bit big-endian floats). This file is 276MB: roughly **6.6 million individual atoms** from a real Fe-Ni alloy sample.

This is how Atomic Tessellator discovered the rare-earth magnet substitute described on their website. This is real data.

---

## The Product Decision: Why Step 2?

The scientific workflow for APT data is:

1. Physical experiment (already done — this is the `.epos` file)
2. **Ingest and first look** ← this app
3. Range the data (assign definitive element identities to m/z peaks)
4. Analyse or simulate

I built Step 2 deliberately, not by default.

A 3D WebGL renderer of 6.6 million points is the obvious impressive-looking choice. It is also the wrong one. A researcher loading a fresh dataset does not need to orbit atoms — they need to answer three questions in under 30 seconds:

1. **Did the acquisition work?** (ion count, acquisition quality badge)
2. **What material is this?** (automated element identification from mass spectrum)
3. **Is the reconstruction credible?** (3D point cloud shape — should be a circular needle cross-section)

Only once those questions are answered does ranging and simulation make sense. The app is designed around that decision sequence, not around the data.

The step labels (01 / 02 / 03) are deliberate — they show the user where they are in a larger workflow and prime the "Range this Dataset" action as the obvious next move.

---

## Design Philosophy

The job description asks for someone with *exceptional taste* who can *champion that taste internally*. This section explains what I mean by taste and how it manifests in the specific decisions in this dashboard.

### Physics of the UI

Digital interfaces feel untrustworthy when they behave in ways that nothing physical ever does: things that appear instantly with no duration, objects that are indistinguishable by depth or weight, surfaces with no texture.

**What this looks like in practice:**

- **Easing with mass.** The hero ion count (6,596,033) animates in over 1.2 seconds using a quartic ease-out — the number decelerates as it lands, like something arriving with momentum. `cubic-bezier(0.25, 1, 0.5, 1)`. The alternative — the number just appearing — implies no computation happened.

- **Spring physics on the toggle.** The Log/Linear scale toggle uses a sliding pill with `cubic-bezier(0.34, 1.56, 0.64, 1)` — it slightly overshoots and settles back. This is not decoration. The overshoot communicates that the object has mass and that a real state change occurred. A colour-swap communicates nothing physical.

- **Staggered entrance.** Each section (01, 02, 03) slides into view 120ms after the previous. The page doesn't arrive all at once; it loads in sequence, the same way a human would read it.

### Elevation and Lighting

Every surface in the physical world sits at a height. Light comes from above. The things closest to you cast the deepest shadows and catch the most light on their top edge.

The design system has three shadow levels. The distinguishing detail in each is the `inset 0 1px 0 rgba(255,255,255,N)` — the top-edge highlight that only exists if there is a light source above the object. Level 3 is reserved for the primary CTA, which should be the most physically prominent element on the page. Hierarchy should be legible with your eyes half-closed.

The `.card` class has a `linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, transparent 48px)` baked in — the inner face of a 3D box catching overhead light.

Stat cards lift 2px on hover with a deeper shadow. They feel like objects you can pick up.

### Texture

Flat #0f1117 backgrounds feel synthetic. Screens are smooth; physical surfaces are not. A 3% SVG `feTurbulence` noise layer on the body breaks the sterility without being visible at a glance — you feel it more than see it. This is the same instinct that makes matte finishes feel premium over glossy ones.

### Micro-interactions as Honest Feedback

Every user action should produce an immediate, proportionate physical response.

- **Peak bars animate into view** on mount with staggered delays (60ms per row) — the data visibly "arrives" rather than being pre-rendered. The animation is not decoration; it's honest feedback that the spectrum was computed.

- **Table rows slide forward 3px** on hover, with a left accent border. The row you're examining moves toward you, like picking something up.

- **The 3D point cloud hint** ("Left-drag to orbit") fades out 3 seconds after loading and disappears on first interaction. It exists only when it's needed. After that, it would be noise.

- **Arrow icons on CTAs shift right 4px** on hover with spring easing. The directional affordance responds to your intent before you click.

### What "Good" Looks Like at a Glance

Before any pixel-level decisions: the page should pass the squint test. Half-close your eyes. The primary action (Range this Dataset) should be the brightest, most elevated thing on the page. The secondary action (Compare to Simulation) should be clearly subordinate. Everything else should recede.

Shadow depth = elevation = importance. Not colour, not size alone — depth.

---

## Architecture Decisions

**Python for parsing.** 276MB parsed client-side is unusable — 30+ seconds to load, blocks the main thread, crashes mobile. Python runs once as a build step, writes two small JSON files, and never runs again in production. This is how a real pipeline would work.

**Big-endian detection.** LEAP instruments write big-endian IEEE 754 floats. The parser detects this empirically (20/20 plausibility test on first records) rather than hardcoding, which means it would handle little-endian instruments without modification.

**Three.js for the point cloud, not Canvas.** The original implementation used an HTML5 Canvas 2D projection (XY only). I replaced it with `@react-three/fiber` + `OrbitControls` because APT data is 3D — the needle depth (Z axis) is scientifically meaningful. A 2D projection loses it entirely. The `Float32Array` buffer geometry approach renders 49k atoms in a single draw call at 60fps.

**Recharts for the mass spectrum.** The spectrum is 2000 bins of real data. Recharts handles the axis domain, log/linear toggle state, and reference line annotations without requiring custom SVG math. The log scale is the default — scientists always use log for APT mass spectra because the Fe²⁺ peak at 28 Da (16% of all ions) would visually obliterate every minor peak on a linear scale.

**No inline styles (almost).** Tailwind v4 CSS variable syntax (`text-(--var)`) throughout. The two exceptions are dynamic values that must be computed at runtime (the sliding pill position, the bar animation width via `--bar-width` custom property) — these use `style={{}}` only where a static class cannot express the value.

**No ranging UI.** Step 3 (letting the user assign element identities to m/z peaks) is another full day of work done properly: drag-to-select peak ranges, element assignment modal, composition table. The `MaterialIdentification` component makes automated guesses from known APT signatures and explicitly labels them as such. The `NextStepsFooter` explains what ranging is and gates the CTA on acquisition quality. This is the honest MVP boundary.

---

## AI Workflow

This was built with GitHub Copilot (Claude Sonnet) as a pair programmer, used honestly:

**What the AI did well:** scaffolding the Vite project structure, writing the Python binary parser (big-endian struct format, endian detection), generating Recharts boilerplate, TypeScript interface definitions, and CSS keyframe animation syntax.

**Where I directed and corrected it:**
- The initial parser used little-endian and fell back to hardcoded mock data — I identified the bug and specified the fix (big-endian detection, no fallbacks)
- The AI's first stat card choices (file size, total atoms, file format) were wrong scientifically — I replaced them with Depth(Z), m/z Range, and Reconstruction Volume
- The AI initially made the mass spectrum the centrepiece. I reframed it as supporting evidence for `MaterialIdentification` — the automated "First Look" — which is the actual primary output a researcher needs
- Tailwind v4 CSS variable syntax (`text-(--var)` not `text-[var(--var)]`) — the AI got this wrong twice; I corrected it
- Every shadow level, easing curve, and animation duration was specified by me

The AI is fast at scaffolding and syntax. Taste, scientific justification, and interaction hierarchy are not things it produces without direction.

---

## What Step 3 Would Look Like

Ranging means assigning definitive element identities to m/z peak ranges. The user draws range brackets on the mass spectrum, assigns each bracket to an element, and the app re-colours the 3D point cloud to match.

The data is already wired for it: `atoms.json` stores the raw m/z value per atom, and the 3D cloud already colours by m/z range. Ranging would replace the hardcoded `mzToRgb` classification with user-defined ranges, re-computing vertex colours on the GPU via a custom Three.js shader.

The `MaterialIdentification` automated identifications would become the starting point for the UI — pre-populated brackets the user can adjust rather than build from scratch.

After ranging: compositional percentages, isotope ratios, proximity histograms, and the data is ready to use as a simulation starting configuration.
