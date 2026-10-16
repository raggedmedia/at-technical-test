import type { Tone } from '../lib/verdict'

// Each tone gets its own shape, so status never relies on colour alone.
// Light surfaces take steps that hold 3:1 on white; the dark rail takes -400.

const COLOUR: Record<Tone, { light: string; dark: string }> = {
  pass:    { light: 'text-emerald-600', dark: 'text-emerald-400' },
  flag:    { light: 'text-amber-600',   dark: 'text-amber-400' },
  fail:    { light: 'text-red-600',     dark: 'text-red-400' },
  pending: { light: 'text-slate-500',   dark: 'text-slate-400' },
  na:      { light: 'text-slate-500',   dark: 'text-slate-500' },
}

const PATHS: Record<Tone, React.ReactNode> = {
  // Filled circle with a check
  pass: (
    <>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path d="M6 10.4l2.6 2.6L14 7.6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="square" />
    </>
  ),
  // Triangle with a bar
  flag: (
    <>
      <path d="M10 1.5L19 18H1z" fill="currentColor" />
      <path d="M10 7.5v5M10 14.5v1.5" stroke="oklch(27.9% 0.077 45.635)" strokeWidth="2" />
    </>
  ),
  // Square with a cross
  fail: (
    <>
      <rect x="1.5" y="1.5" width="17" height="17" fill="currentColor" />
      <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="white" strokeWidth="2" />
    </>
  ),
  // Dashed ring
  pending: <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3.2 2.6" />,
  // Short bar
  na: <path d="M4 10h12" stroke="currentColor" strokeWidth="2.5" />,
}

const LABEL: Record<Tone, string> = {
  pass: 'Passed',
  flag: 'Flagged',
  fail: 'Failed',
  pending: 'Pending',
  na: 'Not assessed',
}

interface Props {
  tone: Tone
  onDark?: boolean
  size?: number
  className?: string
  /** Announce the tone to screen readers. Leave off when visible text already says it. */
  labelled?: boolean
}

export function StatusIcon({ tone, onDark = false, size = 20, className = '', labelled = false }: Props) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      {...(labelled ? { role: 'img', 'aria-label': LABEL[tone] } : { 'aria-hidden': true })}
      className={`shrink-0 ${COLOUR[tone][onDark ? 'dark' : 'light']} ${tone === 'pending' ? 'pulse-soft' : ''} ${className}`}
    >
      {PATHS[tone]}
    </svg>
  )
}
