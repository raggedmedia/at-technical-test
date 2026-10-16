# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: an Atom Probe Tomography (APT) scientist on a simulation platform. They finished the physical experiment and hold an `.epos` file. Their job is to ingest it, confirm the acquisition worked, and accept it as a reliable baseline before comparing against existing simulations or running new ones.

Secondary: Drew Foster, as author. The app is a portfolio piece and idea test. It shows what Drew's own version looks like when built on Drew's design principles. The original technical-test reviewers are no longer an audience.

## Product Purpose

APT Data Explorer manages and reviews APT datasets. It covers the 'ingest and first look' stage of the workflow:

1. Physical experiment (done before the app).
2. Ingest and first look (this app).
3. Range the data (assign definitive element identities to m/z peaks).
4. Analyse or simulate.

Success means a scientist answers three questions within seconds of opening a dataset:

1. Did the acquisition work? (total ion count, acquisition quality)
2. What material is this? (material identification, mass spectrum)
3. Is the reconstruction credible? (3D point cloud of the needle)

## Positioning

Review before trust. The app treats a dataset as unproven until the scientist sees evidence that the acquisition, composition and reconstruction hold up. Flagged and failed datasets name the specific problem and offer actions that fit that problem.

## Operating Context

- Input is an `.epos` (Extended Position) binary file from an APT instrument.
- Upload happens by drag and drop. The platform parses files in the cloud, so datasets pass through a 'processing' state.
- Datasets land in four outcome states: clean, flagged (surface contamination, reconstruction artefacts, unexpected peaks), failed acquisition, and processing.
- Ranging and simulation are downstream steps. The app hands off to them; it does not perform them.

## Capabilities and Constraints

- Stack: React 19, Vite, TypeScript, Tailwind CSS 4, React Router, Recharts, Three.js via React Three Fiber.
- Routes: `/` (dataset table), `/dataset/:id` (detail), `/?empty` (empty state demo).
- Dataset table is sortable. Upload rejects non-`.epos` files.
- 3D point cloud renders a 50k point sample as a single `Float32Array` buffer geometry draw call.
- Terminology: say 'ion count', never 'atom count', for the primary acquisition metric. 'Ranging' is the downstream peak identification step.
- `/invoice` is a standalone billing page from the original test. It is outside the product and outside design scope.
- Undecided: whether domain logic (peak identification, quality heuristics) holds up under expert review. Treat it as plausible, not verified.

## Brand Commitments

The Atomic Tessellator name and logo are not binding.

Drew's design defaults are the binding reference for visual work: `~/ragged/toys/design/` (README plus typography, colour, lighting, layout, motion, interaction). They are a considered default, not law; deviate with a stated reason. Confirmed deviations for this project: fonts are open (not tied to Archivo or JetBrains Mono); chamfered corners are optional; colours come from the Tailwind CSS v4 default palette, chosen for the job; orange is not a default accent. The app is an Operate surface, so apply the Operate register from that README: restraint, a fixed `rem` type scale, functional motion only. Older notes that the toys folder supersedes: `~/ragged/raggedmedia/design-cheat-sheet.md`, `~/ragged/raggedmedia/design-prompt-snippet.md`, `context/design-notes.md`.

## Evidence on Hand

- Real parsed data from `atom_probe_tomography_data-public.epos`: `public/data/summary.json`, `public/data/atoms.json`. Parser: `parse_epos.py`.
- Fixture datasets for flagged, failed and processing states: `src/fixtures/datasets.ts`, `src/fixtures/aptData.ts`, `src/fixtures/elementPeaks.ts`.
- No real users, testimonials or usage data exist. Do not fabricate any.

## Product Principles

Drew's own principles, carried from the original build:

1. Logical flows. The path through the app feels inevitable, with no friction and no guesswork.
2. Immediate feedback. The interface responds at once to every action.
3. Deliberate states. Default, hover, active, disabled, loading and error each get designed, not defaulted.
4. Light and depth. Treat the app as a physical object under a light source; depth carries hierarchy.
5. Physics and personality. Elements have mass and weight, with a bit of character.

## Accessibility & Inclusion

WCAG 2.2 AA.
