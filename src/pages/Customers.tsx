import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Users, Tags, ListFilter, FileText, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { STAGES } from '@/types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/common/Avatar'
import { StageBadge } from '@/components/common/StageBadge'
import { IntentMeter } from '@/components/common/IntentMeter'
import { EmptyState } from '@/components/common/EmptyState'
import { Reveal } from '@/components/common/Reveal'
import { CustomerFormDialog } from '@/components/common/CustomerFormDialog'
import { cn } from '@/lib/utils'

export function Customers() {
  const { customers, segments } = useStore()
  const [q, setQ] = useState('')
  const [fSeg, setFSeg] = useState<string | null>(null)
  const [fStage, setFStage] = useState<string | null>(null)
  const [fTag, setFTag] = useState<string | null>(null)
  const [dlg, setDlg] = useState(false)

  const allTags = useMemo(() => [...new Set(customers.flatMap((c) => c.tags))], [customers])

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return customers.filter((c) => {
      if (fSeg && c.segment !== fSeg) return false
      if (fStage && c.stage !== fStage) return false
      if (fTag && !c.tags.includes(fTag)) return false
      if (kw) {
        const blob = `${c.name} ${c.note} ${c.tags.join(' ')} ${c.source}`.toLowerCase()
        if (!blob.includes(kw)) return false
      }
      return true
    })
  }, [customers, q, fSeg, fStage, fTag])

  const hasFilter = fSeg || fStage || fTag
  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs transition',
        active ? 'border-brand bg-brand text-white' : 'border-line bg-card2 text-muted hover:text-fg',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">客户</h1>
            <p className="mt-1 text-sm text-muted">Customers · 共 {customers.length} 位</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input className="w-48 pl-9 sm:w-60" placeholder="搜索客户/标签/备注" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Button onClick={() => setDlg(true)}><Plus className="size-4" />新建客户</Button>
          </div>
        </div>
      </Reveal>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 筛选 */}
        <aside className="shrink-0 space-y-6 lg:w-56">
          <FilterGroup icon={Users} title="人群分类">
            {segments.map((s) => chip(s, fSeg === s, () => setFSeg(fSeg === s ? null : s)))}
          </FilterGroup>
          <FilterGroup icon={ListFilter} title="成交阶段">
            {STAGES.map((s) => chip(s, fStage === s, () => setFStage(fStage === s ? null : s)))}
          </FilterGroup>
          <FilterGroup icon={Tags} title="标签">
            {allTags.length ? allTags.map((t) => chip(t, fTag === t, () => setFTag(fTag === t ? null : t)))
              : <span className="text-xs text-subtle">暂无标签</span>}
          </FilterGroup>
          {hasFilter && (
            <button onClick={() => { setFSeg(null); setFStage(null); setFTag(null) }} className="flex items-center gap-1 text-xs text-muted hover:text-fg">
              <X className="size-3" /> 清除筛选
            </button>
          )}
        </aside>

        {/* 卡片墙 */}
        <main className="flex-1">
          {list.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((c, i) => (
                <Reveal key={c.id} delay={Math.min(i * 0.04, 0.3)}>
                  <Link to={`/customers/${c.id}`}>
                    <Card className="h-full p-5 transition-colors hover:border-brand/50">
                      <div className="flex items-start gap-3">
                        <Avatar name={c.name} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-bold">{c.name}</span>
                            <span className="text-[10px] text-muted">{c.source}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted">{c.segment}</div>
                        </div>
                        {c.reportIds.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-muted">
                            <FileText className="size-3.5 text-brand" />{c.reportIds.length}
                          </span>
                        )}
                      </div>
                      <p className="clamp-2 mt-3 text-xs leading-relaxed text-muted">{c.note || '—'}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <StageBadge stage={c.stage} />
                        <IntentMeter level={c.intentLevel} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-card2 px-1.5 py-0.5 text-[10px] text-muted ring-1 ring-line">{t}</span>
                        ))}
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="没有符合条件的客户" hint="换个筛选条件，或点右上角新建客户" />
          )}
        </main>
      </div>

      <CustomerFormDialog open={dlg} onOpenChange={setDlg} />
    </div>
  )
}

function FilterGroup({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted">
        <Icon className="size-3.5" /> {title}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
