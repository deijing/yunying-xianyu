import { cn } from '@/lib/utils'

export function IntentMeter({ level, color = '#0A84FF' }: { level: number; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={`意向强度 ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn('h-1.5 w-4 rounded-sm transition-colors', i > level && 'bg-line')}
          style={i <= level ? { background: color } : undefined}
        />
      ))}
    </span>
  )
}
