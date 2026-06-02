import { create } from 'zustand'

export type ThemeMode = 'auto' | 'light' | 'dark'
const KEY = 'intent-hub-theme'

/** 白天(6:00-18:00)用亮色，其余用暗色 */
export function isNight(): boolean {
  const h = new Date().getHours()
  return h < 6 || h >= 18
}

function resolve(mode: ThemeMode): boolean {
  return mode === 'auto' ? isNight() : mode === 'dark'
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

interface ThemeState {
  mode: ThemeMode
  dark: boolean
  setMode: (m: ThemeMode) => void
  /** 供 auto 模式定时复评：到点了自动切换 */
  refresh: () => void
}

const initialMode: ThemeMode = ((): ThemeMode => {
  try {
    return (localStorage.getItem(KEY) as ThemeMode) || 'auto'
  } catch {
    return 'auto'
  }
})()

export const useTheme = create<ThemeState>((set, get) => ({
  mode: initialMode,
  dark: resolve(initialMode),
  setMode: (mode) => {
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      // ignore
    }
    const dark = resolve(mode)
    apply(dark)
    set({ mode, dark })
  },
  refresh: () => {
    const dark = resolve(get().mode)
    if (dark !== get().dark) {
      apply(dark)
      set({ dark })
    }
  },
}))
