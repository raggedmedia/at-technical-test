import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { AtomPoint } from '../hooks/useAptData'
import { StepLabel } from './StepLabel'
import { ELEMENT_PEAKS } from '../fixtures/elementPeaks'

interface Props {
  atoms: AtomPoint[]
  loading: boolean
  selectedPeak: string | null
  onSelectPeak: (label: string | null) => void
}

// Precompute RGB from shared element peaks — runs once at module load
const PEAK_RGB = ELEMENT_PEAKS.map(p => ({
  mzMin: p.mzMin,
  mzMax: p.mzMax,
  r: parseInt(p.color.slice(1, 3), 16) / 255,
  g: parseInt(p.color.slice(3, 5), 16) / 255,
  b: parseInt(p.color.slice(5, 7), 16) / 255,
}))

function mzToRgb(mz: number): [number, number, number] {
  const pc = PEAK_RGB.find(pc => mz >= pc.mzMin && mz < pc.mzMax) ?? PEAK_RGB[PEAK_RGB.length - 1]
  return [pc.r, pc.g, pc.b]
}

// Positions computed once; colors recomputed when selection changes
function AtomCloud({ atoms, selectedPeak }: { atoms: AtomPoint[]; selectedPeak: string | null }) {
  const { positions, baseColors } = useMemo(() => {
    const positions  = new Float32Array(atoms.length * 3)
    const baseColors = new Float32Array(atoms.length * 3)
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i]
      positions[i * 3]     = a.x
      positions[i * 3 + 1] = a.y
      positions[i * 3 + 2] = a.z
      const [r, g, b] = mzToRgb(a.mz)
      baseColors[i * 3]     = r
      baseColors[i * 3 + 1] = g
      baseColors[i * 3 + 2] = b
    }
    return { positions, baseColors }
  }, [atoms])

  const colors = useMemo(() => {
    if (!selectedPeak) return baseColors
    const peak = ELEMENT_PEAKS.find(p => p.label === selectedPeak)
    if (!peak) return baseColors
    const out = new Float32Array(atoms.length * 3)
    for (let i = 0; i < atoms.length; i++) {
      const mz = atoms[i].mz
      if (mz >= peak.mzMin && mz < peak.mzMax) {
        out[i * 3]     = baseColors[i * 3]
        out[i * 3 + 1] = baseColors[i * 3 + 1]
        out[i * 3 + 2] = baseColors[i * 3 + 2]
      } else {
        out[i * 3]     = 0.06
        out[i * 3 + 1] = 0.06
        out[i * 3 + 2] = 0.08
      }
    }
    return out
  }, [atoms, baseColors, selectedPeak])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial size={0.35} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

export function PointCloud3D({ atoms, loading, selectedPeak, onSelectPeak }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  // Compute z-centre once so the camera targets the middle of the needle
  const centerZ = useMemo(() => {
    if (!atoms.length) return 35
    let min = Infinity, max = -Infinity
    for (const a of atoms) {
      if (a.z < min) min = a.z
      if (a.z > max) max = a.z
    }
    return (min + max) / 2
  }, [atoms])

  const selectionStats = useMemo(() => {
    if (!selectedPeak || !atoms.length) return null
    const peak = ELEMENT_PEAKS.find(p => p.label === selectedPeak)
    if (!peak) return null
    const count = atoms.filter(a => a.mz >= peak.mzMin && a.mz < peak.mzMax).length
    const pct = ((count / atoms.length) * 100).toFixed(1)
    return { count, pct, color: peak.color }
  }, [atoms, selectedPeak])

  return (
    <section className="flex flex-col gap-3">
      <StepLabel n="02" title="Reconstruction Geometry" />
      <div className="card flex flex-col gap-4 p-5">
      <div className="h-130 rounded-lg overflow-hidden relative">
        {loading ? (
          <div className="w-full h-full animate-pulse rounded-lg bg-(--bg-card-hi)" />
        ) : (
          <>
            <Canvas
              camera={{ position: [80, -80, centerZ + 55], fov: 42 }}
              gl={{ antialias: true }}
            >
              <color attach="background" args={['#141720']} />
              <OrbitControls
                ref={controlsRef}
                target={[0, 0, centerZ]}
                makeDefault
                minDistance={10}
                maxDistance={300}
              />
              <AtomCloud atoms={atoms} selectedPeak={selectedPeak} />
            </Canvas>

            {/* Single overlaid control bar: filters left, stat + reset right */}
            <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
              {/* Element filter pills — left */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {ELEMENT_PEAKS.map(p => {
                  const isActive = selectedPeak === p.label
                  const isDimmed = selectedPeak !== null && !isActive
                  return (
                    <button
                      key={p.label}
                      onClick={() => onSelectPeak(isActive ? null : p.label)}
                      className={[
                        'pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-(--font-mono) border cursor-pointer transition-all duration-150',
                        isActive
                          ? 'bg-(--bg-card-hi) text-(--text-primary)'
                          : isDimmed
                            ? 'border-(--border-dim) bg-(--bg-card) opacity-35 hover:opacity-80 hover:bg-(--bg-card-hi) hover:border-(--border-hi)'
                            : 'border-(--border-dim) bg-(--bg-card) hover:bg-(--bg-card-hi) hover:border-(--border-hi) hover:text-(--text-primary)',
                      ].join(' ')}
                      style={isActive ? { border: `1px solid ${p.color}`, boxShadow: `0 0 0 1px ${p.color}22` } : undefined}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className={isActive ? 'text-(--text-primary)' : 'text-(--text-secondary)'}>{p.label}</span>
                      <span className={isActive ? 'text-(--text-secondary)' : 'text-(--text-dim)'}>{p.mz} Da</span>
                    </button>
                  )
                })}
              </div>

              {/* Selection stat — appears when an element is active */}
              {selectionStats && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-(--font-mono) border border-(--border-hi) bg-(--bg-card) shrink-0"
                  style={{ color: selectionStats.color }}
                >
                  <span className="tabular-nums">{selectionStats.count.toLocaleString('en-US')} ions</span>
                  <span className="text-(--text-dim)">·</span>
                  <span className="tabular-nums text-(--text-secondary)">{selectionStats.pct}%</span>
                </div>
              )}

              {/* Reset camera */}
              <button
                onClick={() => controlsRef.current?.reset()}
                title="Reset camera"
                className="pointer-events-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-(--font-mono) border border-(--border-dim) bg-(--bg-card) text-(--text-dim) cursor-pointer transition-all duration-150 hover:border-(--border-hi) hover:text-(--text-secondary)"
              >
                ↺ reset view
              </button>
            </div>
          </>
        )}
      </div>

      <p className="font-(--font-mono) text-[11px] text-(--text-dim)">
        Left-drag to orbit · Scroll to zoom · Right-drag to pan — Z axis = needle depth (nm)
      </p>
      </div>
    </section>
  )
}
