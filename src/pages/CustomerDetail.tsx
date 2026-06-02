import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, FileText, ArrowUpRight, FilePlus2, FolderOpen } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/common/Avatar'
import { StageBadge } from '@/components/common/StageBadge'
import { IntentMeter } from '@/components/common/IntentMeter'
import { EmptyState } from '@/components/common/EmptyState'
import { Reveal } from '@/components/common/Reveal'
import { CustomerFormDialog } from '@/components/common/CustomerFormDialog'

export function CustomerDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { customers, reports, removeCustomer } = useStore()
  const [edit, setEdit] = useState(false)

  const customer = customers.find((c) => c.id === id)
  if (!customer) {
    return <EmptyState icon={FolderOpen} title="客户不存在" hint="可能已被删除" />
  }
  const myReports = reports.filter((r) => r.customerId === customer.id)

  const del = () => {
    if (confirm('确定删除这个客户档案？其名下报告也会一并删除。')) {
      removeCustomer(customer.id)
      nav('/customers')
    }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <Link to="/customers" className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> 返回客户列表
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEdit(true)}><Pencil className="size-4" />编辑</Button>
            <Button variant="danger" size="sm" onClick={del}><Trash2 className="size-4" />删除</Button>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Card className="p-7">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={customer.name} size="lg" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <p className="mt-1 text-sm text-muted">{customer.segment} · 来自{customer.source || '—'}</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl border border-line bg-card2 p-4">
                <div className="mb-2 text-[11px] text-muted">成交阶段</div>
                <StageBadge stage={customer.stage} />
              </div>
              <div className="rounded-xl border border-line bg-card2 p-4">
                <div className="mb-2 text-[11px] text-muted">意向强度</div>
                <IntentMeter level={customer.intentLevel} />
              </div>
            </div>
          </div>

          {customer.note && (
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold tracking-wider text-muted">备注</div>
              <p className="rounded-xl border border-line bg-card2 p-4 text-sm leading-relaxed text-fg">{customer.note}</p>
            </div>
          )}

          {customer.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {customer.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          )}
        </Card>
      </Reveal>

      <Reveal>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FileText className="size-5 text-brand" /> 意图分析报告
            <span className="text-sm font-normal text-muted">（{myReports.length}）</span>
          </h2>
          <Link to={`/new?customer=${customer.id}`}>
            <Button variant="secondary" size="sm"><FilePlus2 className="size-4" />新建分析</Button>
          </Link>
        </div>
      </Reveal>

      {myReports.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {myReports.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <Link to={`/reports/${r.id}`}>
                <Card className="group h-full p-5 transition-colors hover:border-brand/50">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${r.brandColor}22`, color: r.brandColor }}>
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{r.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted">{r.createdAt} · 成交概率 {r.closeProbability}%</div>
                    </div>
                    <ArrowUpRight className="size-4 text-subtle transition-colors group-hover:text-brand" />
                  </div>
                  <p className="clamp-2 mt-3 text-xs leading-relaxed text-muted">{r.quickRead}</p>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="还没有意图分析报告" hint="点「新建分析」，粘贴客户消息或导入分析 JSON 即可生成" />
      )}

      <CustomerFormDialog open={edit} onOpenChange={setEdit} editing={customer} />
    </div>
  )
}
