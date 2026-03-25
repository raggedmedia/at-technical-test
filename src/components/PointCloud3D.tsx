import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { AtomPoint } from '../hooks/useAptData'

interface Props {
  atoms: AtomPoint[]
  loading: boolean
}

// Colour atoms by m/z range — same classification as mass spectrum reference lines
function mzToRgb(mz: number): [number, number, number] {
  if (mz < 18)  return [251 / 255, 191 / 255,  36 / 255]  // amber   — O⁺  ~16 Da
  if (mz < 30)  return [ 59 / 255, 130 / 255, 246 / 255]  // blue    — Fe²⁺ ~28 Da
  if (mz < 35)  return [139 / 255,  92 / 255, 246 / 255]  // violet  — Ni²⁺ ~32 Da
  if (mz < 58)  return [ 96 / 255, 165 / 255, 250 / 255]  // sky     — Fe⁺  ~56 Da
  if (mz < 65)  return [167 / 255, 139 / 255, 250 / 255]  // purple  — Ni⁺  ~58 Da
  return          [107 / 255, 114 / 255, 128 / 255]         // grey    — unknown
}

const LEGEND = [
  { label: 'O⁺  ~16 Da',   dot: 'bg-amber-400'  },
  { label: 'Fe²⁺  ~28 Da', dot: 'bg-blue-500'   },
  { label: 'Ni²⁺  ~32 Da', dot: 'bg-violet-500' },
  { label: 'Fe⁺  ~56 Da',  dot: 'bg-blue-400'   },
  { label: 'Ni⁺  ~58 Da',  dot: 'bg-violet-400' },
  { label: 'Other',         dot: 'bg-gray-500'   },
]

// Build Float32Arrays once from atom list — re-computed only when atoms change
function AtomCloud({ atoms }: { atoms: AtomPoint[] }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(atoms.length * 3)
    const colors    = new Float32Array(atoms.length * 3)
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i]
      positions[i * 3]     = a.x
      positions[i * 3 + 1] = a.y
      positions[i * 3 + 2] = a.z
      const [r, g, b] = mzToRgb(a.mz)
      colors[i * 3]     = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }
    return { positions, colors }
  }, [atoms])

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

export function PointCloud3D({ atoms, loading }: Props) {
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

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="h-[520px] rounded-lg overflow-hidden">
        {loading ? (
          <div className="w-full h-full animate-pulse rounded-lg bg-(--bg-card-hi)" />
        ) : (
          // Canvas only mounts once atoms are available — camera.position is stable
          <Canvas
            camera={{ position: [80, -80, centerZ + 55], fov: 42 }}
            gl={{ antialias: true }}
          >
            {/* Set WebGL clear colour to match app background */}
            <color attach="background" args={['#0f1117']} />

            {/* Free orbit: left-drag = rotate, scroll = zoom, right-drag = pan */}
            <OrbitControls
              target={[0, 0, centerZ]}
              makeDefault
              minDistance={10}
              maxDistance={300}
            />

            <AtomCloud atoms={atoms} />
          </Canvas>
        )}
      </div>

      {/* Element colour legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
        {LEGEND.map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
            <span className="font-(--font-mono) text-[11px] text-(--text-secondary)">{label}</span>
          </div>
        ))}
      </div>

      <p className="font-(--font-mono) text-[11px] text-(--text-dim)">
        Left-drag to orbit · Scroll to zoom · Right-drag to pan — Z axis = needle depth (nm)
      </p>
    </div>
  )
}
