import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-subtle">
      <Icon className="mb-3 size-10" />
      <p className="text-sm">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-subtle">{hint}</p>}
    </div>
  )
}
