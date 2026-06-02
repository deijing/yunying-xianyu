import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, FilePlus2, Settings, IdCard, Menu, X, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useTheme } from '@/store/useTheme'

const NAV: { to: string; label: string; en: string; icon: LucideIcon }[] = [
  { to: '/', label: '总览', en: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: '客户', en: 'Customers', icon: Users },
  { to: '/new', label: '新建分析', en: 'New Analysis', icon: FilePlus2 },
  { to: '/xianyu', label: '闲鱼选品', en: 'Xianyu', icon: ShoppingBag },
  { to: '/settings', label: '设置', en: 'Settings', icon: Settings },
]

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.to === '/'}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'brand-grad-soft text-brand border border-brand/30'
                : 'text-muted hover:bg-card2 hover:text-fg',
            )
          }
        >
          <n.icon className="size-[18px]" />
          <span className="font-medium whitespace-nowrap">{n.label}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-subtle whitespace-nowrap">{n.en}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex size-10 items-center justify-center rounded-xl brand-grad-soft border border-brand/30">
        <IdCard className="size-5 text-brand" />
      </div>
      <div>
        <div className="text-[15px] font-bold leading-none">意图管理系统</div>
        <div className="mt-1 text-[10px] tracking-[0.2em] text-subtle">INTENT HUB</div>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const refresh = useTheme((s) => s.refresh)

  // auto 模式下，每分钟复评一次，到点(白天↔夜间)自动切换
  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [refresh])

  return (
    <div className="min-h-screen lg:flex">
      {/* 桌面侧栏 */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:gap-8 lg:border-r lg:border-line lg:p-5 lg:fixed lg:inset-y-0">
        <div className="pt-3">
          <Brand />
        </div>
        <NavItems />
        <div className="mt-auto space-y-3">
          <ThemeToggle />
          <div className="px-2 text-[11px] leading-relaxed text-subtle">
            数据存于本地浏览器，可在「设置」导入导出备份
          </div>
        </div>
      </aside>

      {/* 移动顶栏 */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="text-fg">
          <Menu className="size-6" />
        </button>
        <Brand />
        <div className="flex-1" />
        <ThemeToggle compact />
      </header>

      {/* 移动抽屉 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line bg-card p-5 animate-in slide-in-from-left">
            <div className="mb-8 flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="text-muted">
                <X className="size-5" />
              </button>
            </div>
            <NavItems onClick={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main key={loc.pathname} className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  )
}
