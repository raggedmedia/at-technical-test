// Module-level state so cancelDemoEdge() can clean up from anywhere
let activeToast: HTMLDivElement | null = null
const activeTimers: ReturnType<typeof setTimeout>[] = []

function track(id: ReturnType<typeof setTimeout>) {
  activeTimers.push(id)
  return id
}

export function cancelDemoEdge() {
  // Clear all pending timers
  activeTimers.splice(0).forEach(clearTimeout)
  // Dismiss toast without animation
  if (activeToast) {
    activeToast.remove()
    activeToast = null
  }
}

export function demoEdge(label = "You've reached the edge of the demo") {
  // Cancel any in-flight demo before starting a fresh one
  cancelDemoEdge()

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
    gap: '2px',
    background: 'var(--color-slate-900)',
    padding: '14px 20px',
    boxShadow: 'var(--shadow-raised)',
    fontFamily: 'var(--font-sans)',
    color: 'white',
    fontSize: '1rem',
    maxWidth: 'calc(100vw - 32px)',
    opacity: '0',
    transition: 'opacity 240ms cubic-bezier(0.25,1,0.5,1), transform 240ms cubic-bezier(0.25,1,0.5,1)',
    pointerEvents: 'none',
  })

  toast.innerHTML = `
    <span style="font-weight:700">You've reached the edge of the demo</span>
    <span style="color:var(--color-slate-300)">${label}</span>
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
