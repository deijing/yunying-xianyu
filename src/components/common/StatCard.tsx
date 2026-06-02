import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  value,
  label,
  labelEn,
  accent,
}: {
  icon: LucideIcon
  value: number | string
  label: string
  labelEn?: string
  accent?: boolean
}) {
  return (
    <Card className="p-5">
      <Icon className="mb-2 size-5 text-brand" />
      <div className={cn('text-5xl font-bold leading-none', accent && 'text-brand')}>{value}</div>
      <div className="mt-2 text-xs text-muted">
        {label}
        {labelEn && <span className="ml-1 text-subtle">· {labelEn}</span>}
      </div>
    </Card>
  )
}
