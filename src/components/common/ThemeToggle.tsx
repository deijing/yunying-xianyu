import { Sun, Moon, SunMoon } from 'lucide-react'
import { useTheme } from '@/store/useTheme'
import type { ThemeMode } from '@/store/useTheme'
import { cn } from '@/lib/utils'

const NEXT: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' }
const LABEL: Record<ThemeMode, string> = { auto: '跟随时间', light: '亮色', dark: '暗色' }

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useTheme()
  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : SunMoon

  if (compact) {
    return (
      <button
        onClick={() => setMode(NEXT[mode])}
        title={`主题：${LABEL[mode]}`}
        className="flex size-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-fg"
      >
        <Icon className="size-[18px]" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setMode(NEXT[mode])}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm text-muted transition-colors hover:text-fg',
      )}
    >
      <Icon className="size-[18px]" />
      <span className="font-medium">{LABEL[mode]}</span>
      <span className="ml-auto text-[10px] uppercase tracking-wider text-subtle">Theme</span>
    </button>
  )
}
