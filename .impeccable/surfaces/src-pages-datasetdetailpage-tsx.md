---
version: 1
slug: "src-pages-datasetdetailpage-tsx"
primary_target: "src/pages/DatasetDetailPage.tsx"
related_targets: ["src/pages/DatasetsPage.tsx"]
---

# Dataset detail and datasets table

Scope: `/dataset/:id` (all statuses: clean, flagged x3, failed, processing) and `/` (datasets table, upload, empty state). Visitor mode: Operate. Build path: code-led.

Audience and job: APT scientist at a lab desk, large monitor, ambient office light, long review sessions. Opens a dataset to learn the result, why, and the next step (simulate, remediate, archive), and digs into evidence when flagged.

Constraints: WCAG 2.2 AA. React 19, Tailwind 4, React Three Fiber stay. Data and fixtures unchanged. `/invoice` out of scope. Tailwind v4 default palette only.

Unresolved: user sign-off on consolidating ranging windows onto the narrow windows from the old MaterialIdentification component.

Motion: one authored entrance (rows and checks rise, staggered); uploader keeps hover float, drag swell and a heavy red shake on reject.

## Direction contract

THESIS: One fixed layout for every status. A dark verdict rail says the result, the cause and the next action; a light workbench holds linked evidence. Refuses the category default of a top-to-bottom stack with a hero metric up top and the action buried at the bottom.

OWN-WORLD: Light scene. `slate-50` ground, white panels lifted by soft offset shadows, `slate-900` rail, `slate-950` only inside the 3D viewport, which sits in a white panel like its neighbours. Primary actions are ink: white on the dark rail and header, `slate-900` on light surfaces. No hue is spent on chrome; colour means data or status. Each species has its own Tailwind hue, one hue per element and lightness per charge (Fe blue, Ni pink, O cyan, unidentified lime, unranged slate). Status: `emerald`, `amber`, `red`, `slate` processing, each with its own icon shape. Atkinson Hyperlegible Next for the whole interface; Atkinson Hyperlegible Mono for aligned numbers, file names and axis ticks. Fixed rem scale at 1.25 steps. Square corners, zero radius, no chamfer.

STORY: The scientist reads the result and cause in the rail within seconds, checks the evidence the rail points to, then presses the one action that fits the status.

FIRST VIEWPORT: 1440 x 900. Rail 24rem wide, full height, sticky: back link, result heading with cause sentence, three checks, key values under a Details heading (file name first), primary action pinned at the bottom. Workbench to the right: spectrum panel full width on top (about 40% height); 3D needle stage and composition table side by side below. Flagged datasets open with the offending species selected and a note pinned to its peak.

FORM: Verdict rail and workbench, position 1 of 7 on the ordered list, merged with the cause-first opening from position 3 at the user's request. seed:3b977fb7eb314288

SIGNATURE: Linked selection lighting. Choosing an ion species in the spectrum, the table or the needle keeps it in its species colour in all three while everything else recedes, over 350ms ease-out-quart; reduced motion swaps instantly. The flag note sits on its own layer and never alters plotted data.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
