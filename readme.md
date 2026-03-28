# APT Data Explorer

A dataset management and analysis platform for Atom Probe Tomography data, built as a technical test for Atomic Tessellator.

## How to Run

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

NOTE: The parsed data files for the provided `epos` file (`public/data/summary.json` and `public/data/atoms.json`) are already committed to the repo. No setup beyond `pnpm install` is needed.

## What is this?

Hi Alain and Daniel,

What I decided to do for the technical test was present a data management and review app.

I operated under the assumption that an `.epos` (Extended Position) file is the primary output from an Atom Probe Tomography instrument, and that APT data moves through a defined scientific workflow:

1. Physical experiment (already done)
2. **Ingest and first look** (this app)
3. Range the data: assign definitive element identities to m/z peaks
4. Analyse or simulate

Approaching it from the point of view of a scientist using the Atomic Tessellator platform, I assumed they have already done the physical experiment (resulting in the `atom_probe_tomography_data-public.epos` file). They now want to ingest it into the simulation app, confirm the results of the experiment, and use that as a reliable baseline before comparing to existing simulations or running new ones.

## What's in the Demo

There are two main parts to the demo.

### 1. Dataset Homescreen
The home screen is a sortable dataset table showing different state options for uploaded files. Assuming that there must be plenty of times where experiments fail or only partially succeed, it felt important to show what different scenarios look like:

1. A correct, clean experiment (`atom_probe_tomography_data-public.epos`).
2. Experiments that worked but have issues like surface contamination, reconstruction artefacts, or unexpected peaks.
3. Outright failed acquisitions.

Additionally, assuming a scientist would upload an `.epos` file that is then processed and parsed in the cloud before review, we needed to show a 'processing' state.

I also handled the small UI states for the upload CTA, such as rejecting non-`.epos` files if a user drags and drops the wrong item, as well as showing an [empty state if there were no previous uploads](http://localhost:5173/?empty`).

### 2. Dataset Detail Screen
Visit [http://localhost:5173/dataset/apt-real](http://localhost:5173/dataset/apt-real) for the primary view.

Assuming a successful APT experiment, the main purpose of this screen is to review and validate the data before proceeding with simulations. After a lot of back and forth researching with Claude, I determined the key questions the UI needs to answer immediately:

1. Did the acquisition work? (Total ion count, acquisition quality badge)
2. What material is this? (Material identification table and mass spectrum)
3. Is the reconstruction credible? (3D point cloud: the needle reconstruction should look physically correct)

### Review and Fail States
The detail pages for the flagged and failed dataset states show different versions of the above. They specifically call out what the issues with the files are and surface different actions depending on the error.

## Behind the Scenes

### The Python Parser
You'll see a `parse_epos.py` script. I wrote this to get the raw data out of the binary format so the UI had something real to render. The parsed output (`public/data/summary.json` and `public/data/atoms.json`) is already committed, so you don't need to run it.

In a real application I'd expect this kind of bulk parsing to happen on a backend worker after upload. It's outside the scope of what I'm demonstrating here, but it was a necessary step to make the frontend functional with actual data rather than fixtures.

### AI Use
I used Claude Sonnet via Github Copilot extensively as a pair programmer. It was incredibly useful for helping me walk through what an `.epos` file actually is, what an APT workflow looks like, and what information is likely to be important to researchers using the AT software.

I have tried my best to validate its outputs, like ensuring the most important metric on the detail screen is the total ion (not atom) count. Hopefully there aren't too many LLM hallucinations sneaking through the science. I leave it to you both to confirm how close or far off the domain logic landed.

### Design Philosophy
For this demo I wanted to focus on the interaction design and UI finish, focusing on details such as:
- **Logical user flows:** The UI should feel 'inevitable.' The path a user takes is logical, frictionless, and intuitive.
- **Immediate feedback:** The interface always responds instantly.
- **State changes:** Deliberate handling of default, hover, active, disabled, loading, and error states.
- **Micro-interactions:** Treating the app as a physical object under a light source. Using light and spacing to create depth, and using that depth to create visual hierarchy.
- **Physics:** Making sure the design has mass, weight, and a bit of personality.

### React, Not Vue
I chose to use React over Vue simply because I have more familiarity with it and could move significantly faster. The high level concepts and patterns should translate cleanly between the two.

### A Little Bit of Three.js
I didn't want to get too lost in the weeds of 3D rendering for this `.epos` file, as trying to build a fully optimised renderer could have easily consumed the entire eight hours. But I did want to demonstrate at least some Three.js and WebGL competency, so I included the 3D point cloud on the detail view. It renders a 50k point sample cleanly using a `Float32Array` buffer geometry, keeping it to a single draw call at 60fps.

## Thanks for Your Time

Lastly, I've done a few technical tests over the last couple of years and this was genuinely the best one. Paying for the time and actively encouraging LLM use meant the process felt like real work, not a performance. Learning more about atom probe tomography and getting to use my skills to make (hopefully) sensible front-end decisions was a bonus. I thoroughly enjoyed it. Thank you.
