import confetti from 'canvas-confetti'

// Colors pulled from the app's design tokens
const COLORS = ['#3b82f6', '#22c55e', '#a78bfa', '#f59e0b', '#ec4899', '#e8eaf0']

// Module-level state so cancelDemoEdge() can clean up from anywhere
let activeCanvas: HTMLCanvasElement | null = null
let activeToast: HTMLDivElement | null = null
const activeTimers: ReturnType<typeof setTimeout>[] = []

function track(id: ReturnType<typeof setTimeout>) {
  activeTimers.push(id)
  return id
}

export function cancelDemoEdge() {
  // Clear all pending timers
  activeTimers.splice(0).forEach(clearTimeout)
  // Remove the canvas from DOM — every particle disappears instantly
  if (activeCanvas) {
    activeCanvas.remove()
    activeCanvas = null
  }
  // Dismiss toast without animation
  if (activeToast) {
    activeToast.remove()
    activeToast = null
  }
}

// Toast fades out at 3000ms — same time the last confetti hits the floor
export function demoEdge(label = "You've reached the edge of the demo") {
  // Cancel any in-flight demo before starting a fresh one
  cancelDemoEdge()

  // ── Dedicated canvas for confetti ───────────────────────────────────────
  // Owning the canvas means cancel = canvas.remove(), instant & reliable
  const canvas = document.createElement('canvas')
  activeCanvas = canvas
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9998',
  })
  document.body.appendChild(canvas)
  const fire = confetti.create(canvas, { resize: true, useWorker: false })

  // ── Confetti bursts ──────────────────────────────────────────────────────
  fire({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: COLORS, disableForReducedMotion: true })
  track(setTimeout(() => {
    fire({ particleCount: 70, angle: 60,  spread: 65, origin: { x: 0.1, y: 0.65 }, colors: COLORS, disableForReducedMotion: true })
    fire({ particleCount: 70, angle: 120, spread: 65, origin: { x: 0.9, y: 0.65 }, colors: COLORS, disableForReducedMotion: true })
  }, 150))
  track(setTimeout(() => {
    fire({ particleCount: 60, spread: 100, origin: { y: 0.55 }, colors: COLORS, disableForReducedMotion: true, gravity: 0.6 })
  }, 600))
  track(setTimeout(() => {
    fire({ particleCount: 40, spread: 120, origin: { y: 0.5 }, colors: COLORS, disableForReducedMotion: true, gravity: 0.4, scalar: 0.8 })
  }, 1200))

  // Clean up canvas after particles have settled
  track(setTimeout(() => {
    canvas.remove()
    if (activeCanvas === canvas) activeCanvas = null
  }, 3600))

  // ── Toast ────────────────────────────────────────────────────────────────
  const toast = document.createElement('div')
  activeToast = toast
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '28px',
    left: '50%',
    transform: 'translateX(-50%) translateY(16px)',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(27, 31, 46, 0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 20px',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,4,18,0.7)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    color: '#e8eaf0',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    opacity: '0',
    transition: 'opacity 240ms cubic-bezier(0.25,1,0.5,1), transform 240ms cubic-bezier(0.25,1,0.5,1)',
    pointerEvents: 'none',
  })

  toast.innerHTML = `
    <span style="font-size:14px;font-weight:600;color:#e8eaf0">🎉 You've reached the edge of the demo</span>
    <span style="font-size:13px;color:#8b929e;font-weight:400">${label}</span>
  `

  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateX(-50%) translateY(0)'
    })
  })

  // Animate out and remove after 3s (in sync with confetti)
  track(setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(-50%) translateY(8px)'
    track(setTimeout(() => {
      toast.remove()
      if (activeToast === toast) activeToast = null
    }, 300))
  }, 3000))
}
