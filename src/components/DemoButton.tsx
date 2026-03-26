interface Props {
  onClick: () => void
  variant?: 'primary' | 'ghost'
  arrow?: boolean
  children: React.ReactNode
}

export function DemoButton({ onClick, variant = 'primary', arrow = false, children }: Props) {
  if (variant === 'ghost') {
    return (
      <a
        href="#"
        onClick={e => { e.preventDefault(); onClick() }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-(--border-hi) bg-transparent text-(--text-secondary) no-underline hover:bg-(--bg-card-hi) hover:border-(--accent) hover:text-(--text-primary) transition-all duration-200"
        style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
      >
        <span>{children}</span>
        {arrow && <span className="opacity-50">{'→'}</span>}
      </a>
    )
  }

  return (
    <a
      href="#"
      onClick={e => { e.preventDefault(); onClick() }}
      className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white no-underline hover:brightness-110 transition-all duration-200"
      style={{
        background: 'var(--accent)',
        boxShadow: '0 8px 32px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        transitionTimingFunction: 'var(--ease-out-quart)',
      }}
    >
      <span>{children}</span>
      {arrow && <span className="opacity-70">{'→'}</span>}
    </a>
  )
}
