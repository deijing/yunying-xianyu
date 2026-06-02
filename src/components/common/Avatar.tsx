import { cn } from '@/lib/utils'

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initial = (name || '?').trim().charAt(0)
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border border-brand/30 brand-grad-soft font-bold text-brand',
        size === 'lg' ? 'h-16 w-16 rounded-2xl text-2xl' : 'h-11 w-11 text-lg',
      )}
    >
      {initial}
    </div>
  )
}
