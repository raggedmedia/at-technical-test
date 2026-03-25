interface Props {
  n: string
  title: string
}

export function StepLabel({ n, title }: Props) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-(--font-mono) text-[11px] text-(--text-dim) tabular-nums shrink-0">{n}</span>
      <span className="h-px flex-1 bg-(--border-dim)" />
      <span className="font-(--font-mono) text-[11px] uppercase tracking-[0.18em] text-(--text-dim) shrink-0">{title}</span>
    </div>
  )
}
