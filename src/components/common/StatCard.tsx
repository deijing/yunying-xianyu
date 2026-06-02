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
    <Card className="group relative overflow-hidden bg-card/60 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 hover:border-brand/30 border border-line/50">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-inset ring-brand/20 transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:shadow-[0_0_16px_rgba(10,132,255,0.4)]">
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-fg">{label}</span>
            {labelEn && <span className="text-[10px] font-medium tracking-wider text-muted uppercase">{labelEn}</span>}
          </div>
        </div>
        
        <div className={cn('text-5xl font-black tracking-tight', accent ? 'bg-gradient-to-br from-brand to-cyan-400 bg-clip-text text-transparent drop-shadow-sm' : 'text-fg')}>
          {value}
        </div>
      </div>
    </Card>
  )
}
