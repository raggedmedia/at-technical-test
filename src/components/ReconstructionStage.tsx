import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { AtomPoint } from '../hooks/useAptData'
import type { Dataset } from '../fixtures/datasets'
import type { Focus, Verdict } from '../lib/verdict'
import { SPECIES, UNRANGED_ID, speciesIdForMz } from '../fixtures/elementPeaks'
import { GL, SPECIES_COLOUR } from '../lib/palette'
import { useTween } from '../hooks/useTween'
import { StatusIcon } from './StatusIcon'

interface Props {
  dataset: Dataset
  verdict: Verdict
  atoms: AtomPoint[] | null
  loading: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// Vertex colours are linear; the renderer converts to sRGB on output.
// Linearise the sRGB palette so the screen shows the palette colour.
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const hexToRgb = (hex: string) => [1, 3, 5].map(i => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255))

const DIM = hexToRgb(GL.dim)
const OWN = Object.fromEntries(Object.entries(SPECIES_COLOUR).map(([id, c]) => [id, hexToRgb(c.dark)]))

const CAMERA_TARGET = (z: number): [number, number, number] => [0, 0, z]
const CAMERA_POSITION = (z: number): [number, number, number] => [80, -80, z + 55]

function rgbFor(species: string, sel: string | null) {
  return sel === null || species === sel ? OWN[species] : DIM
}

function AtomCloud({ atoms, species, selectedId, onSelect }: {
  atoms: AtomPoint[]
  species: string[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { from, to, t } = useTween(selectedId)

  const positions = useMemo(() => {
    const out = new Float32Array(atoms.length * 3)
    atoms.forEach((a, i) => { out[i * 3] = a.x; out[i * 3 + 1] = a.y; out[i * 3 + 2] = a.z })
    return out
  }, [atoms])

  const colors = useMemo(() => {
    const out = new Float32Array(atoms.length * 3)
    for (let i = 0; i < atoms.length; i++) {
      const a = rgbFor(species[i], from), b = rgbFor(species[i], to)
      out[i * 3]     = a[0] + (b[0] - a[0]) * t
      out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t
      out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t
    }
    return out
  }, [atoms, species, from, to, t])

  return (
    <points
      onClick={e => {
        if (e.delta > 4 || e.index === undefined) return
        e.stopPropagation()
        const id = species[e.index]
        onSelect(selectedId === id ? null : id)
      }}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.45} vertexColors sizeAttenuation />
    </points>
  )
}

// Fixture datasets carry no point sample. Show what is known, the bounding
// box, rather than inventing geometry.
function BoundsOnly({ dataset, verdict, focus }: { dataset: Dataset; verdict: Verdict; focus: Extract<Focus, { on: 'needle' }> | null }) {
  const { x, y, z } = dataset.dimensions
  const scale = 120 / Math.max(x.range_nm, y.range_nm, 1)
  const w = x.range_nm * scale, h = y.range_nm * scale
  const message =
    verdict.tone === 'pending' ? 'The reconstruction appears once parsing finishes.'
    : verdict.tone === 'fail' ? `Only ${z.range_nm.toFixed(1)} nm of depth was captured, too little to reconstruct.`
    : 'No point sample for this dataset. Only its bounds are shown.'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-6 text-center">
      {x.range_nm > 0 && (
        <figure className="m-0 flex flex-col items-center gap-3">
          <svg width="160" height="160" viewBox="0 0 200 200" aria-hidden>
            <rect
              x={100 - w / 2} y={100 - h / 2} width={w} height={h}
              fill="none"
              stroke={focus ? 'var(--color-amber-400)' : 'var(--color-slate-500)'}
              strokeWidth="2"
              strokeDasharray={focus ? undefined : '6 5'}
            />
          </svg>
          <figcaption className="text-slate-300">
            XY bounds {x.range_nm.toFixed(1)} × {y.range_nm.toFixed(1)} nm
          </figcaption>
        </figure>
      )}
      {focus ? (
        <p className="m-0 flex items-center gap-2 border border-amber-400 px-3 py-1.5 font-bold text-white">
          <StatusIcon tone="flag" onDark size={16} />
          {focus.note}
        </p>
      ) : (
        <p className="m-0 max-w-[36ch] text-pretty text-slate-300">{message}</p>
      )}
    </div>
  )
}

export function ReconstructionStage({ dataset, verdict, atoms, loading, selectedId, onSelect }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  const focus = verdict.focus?.on === 'needle' ? verdict.focus : null

  const species = useMemo(() => (atoms ?? []).map(a => speciesIdForMz(a.mz)), [atoms])
  const centerZ = useMemo(() => {
    if (!atoms?.length) return 35
    let min = Infinity, max = -Infinity
    for (const a of atoms) { if (a.z < min) min = a.z; if (a.z > max) max = a.z }
    return (min + max) / 2
  }, [atoms])

  const selection = useMemo(() => {
    if (!selectedId || !species.length) return null
    const count = species.filter(s => s === selectedId).length
    const sp = SPECIES.find(s => s.id === selectedId)
    return { label: selectedId === UNRANGED_ID ? 'Unranged' : `${sp?.label} ${sp?.name}`, count, pct: (count / species.length) * 100 }
  }, [species, selectedId])

  const hasCloud = !loading && atoms && atoms.length > 0

  // OrbitControls.reset() returns to the state saved before the target prop
  // applied, which is the needle tip. Restore the real starting view instead.
  function resetView() {
    const c = controlsRef.current
    if (!c) return
    // Spend any leftover drag momentum first, or damping spins the view after reset
    c.enableDamping = false
    c.update()
    c.enableDamping = true
    c.target.set(...CAMERA_TARGET(centerZ))
    c.object.position.set(...CAMERA_POSITION(centerZ))
    c.update()
  }

  return (
    <section className="panel flex flex-col gap-4 p-4 sm:p-6" aria-labelledby="stage-heading">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="stage-heading" className="m-0 text-step-1 font-bold">Reconstruction</h2>
        {hasCloud && <p className="m-0 text-slate-600">{atoms.length.toLocaleString('en-AU')} ion sample</p>}
        {hasCloud && (
          <button
            type="button"
            onClick={resetView}
            className="ml-auto cursor-pointer border border-slate-300 bg-white px-3 py-1 text-slate-900 transition-colors duration-200 hover:border-slate-900"
          >
            Reset view
          </button>
        )}
      </div>

      <div className="on-dark relative h-88 bg-slate-950 text-slate-100" style={{ backgroundImage: 'radial-gradient(90% 55% at 50% 0%, var(--color-slate-800), transparent 70%)' }}>
        {loading ? (
          <p className="pulse-soft absolute inset-0 m-0 flex items-center justify-center text-slate-300">Loading ion sample</p>
        ) : hasCloud ? (
          <Canvas
            camera={{ position: CAMERA_POSITION(centerZ), fov: 42 }}
            raycaster={{ params: { Points: { threshold: 0.4 } } as never }}
            gl={{ antialias: true }}
            aria-label="3D point cloud of the reconstructed needle"
          >
            <color attach="background" args={[GL.stage]} />
            <OrbitControls ref={controlsRef} target={CAMERA_TARGET(centerZ)} makeDefault minDistance={10} maxDistance={300} />
            <AtomCloud atoms={atoms} species={species} selectedId={selectedId} onSelect={onSelect} />
          </Canvas>
        ) : (
          <BoundsOnly dataset={dataset} verdict={verdict} focus={focus} />
        )}
      </div>

      {hasCloud && (
        <p className="m-0 flex flex-wrap gap-x-4 text-slate-600">
          {selection ? (
            <span className="font-bold text-slate-900">
              {selection.label}: {selection.count.toLocaleString('en-AU')} ions, {selection.pct.toFixed(1)}%
            </span>
          ) : (
            <span>Click an ion to highlight every ion of that type.</span>
          )}
          <span className="ml-auto">Drag to orbit. Scroll to zoom.</span>
        </p>
      )}
    </section>
  )
}
