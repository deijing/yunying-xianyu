import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Handshake, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { STAGES } from '@/types'
import { StatCard } from '@/components/common/StatCard'
import { StageBadge } from '@/components/common/StageBadge'
import { IntentMeter } from '@/components/common/IntentMeter'
import { Avatar } from '@/components/common/Avatar'
import { Card } from '@/components/ui/card'
import { Reveal } from '@/components/common/Reveal'
import { SegmentDonut, StageFunnel } from '@/components/charts/Charts'

export function Dashboard() {
  const { customers, reports, segments } = useStore()

  const stats = useMemo(() => {
    const hot = customers.filter((c) => c.stage === '准备成交').length
    const paid = customers.filter((c) => c.stage === '已付费推进' || c.stage === '复购续费').length
    const segData = segments
      .map((s) => ({ name: s, value: customers.filter((c) => c.segment === s).length }))
      .filter((d) => d.value > 0)
    const stageShort = ['观望', '犹豫', '成交', '已付', '复购']
    const stageData = STAGES.map((s, i) => ({
      name: stageShort[i],
      value: customers.filter((c) => c.stage === s).length,
    }))
    const recent = [...customers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
    return { hot, paid, segData, stageData, recent }
  }, [customers, segments])

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold">总览</h1>
          <p className="mt-1 text-sm text-muted">Dashboard · 客户与意图全景</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Reveal><StatCard icon={Users} value={customers.length} label="客户总数" labelEn="Total" accent /></Reveal>
        <Reveal delay={0.05}><StatCard icon={Handshake} value={stats.hot} label="准备成交" labelEn="Hot" /></Reveal>
        <Reveal delay={0.1}><StatCard icon={CheckCircle2} value={stats.paid} label="已付费" labelEn="Paid" /></Reveal>
        <Reveal delay={0.15}><StatCard icon={FileText} value={reports.length} label="意图报告" labelEn="Reports" /></Reveal>
        <Reveal delay={0.2} className="col-span-2 lg:col-span-1">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-1 text-xs text-muted">人群分布 · Segments</div>
            <div className="flex-1">
              <SegmentDonut data={stats.segData} />
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-1">
          <Card className="p-6">
            <div className="mb-4 text-sm font-semibold text-muted">阶段漏斗 · Funnel</div>
            <StageFunnel data={stats.stageData} />
          </Card>
        </Reveal>

        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-muted">最近更新 · Recent</div>
              <Link to="/customers" className="flex items-center gap-1 text-xs text-brand hover:underline">
                查看全部 <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recent.map((c) => (
                <Link
                  key={c.id}
                  to={`/customers/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card2 p-3 transition-colors hover:border-brand/50"
                >
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[11px] text-muted">{c.segment}</span>
                    </div>
                    <p className="clamp-2 mt-0.5 text-xs text-muted">{c.note || '—'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StageBadge stage={c.stage} />
                    <IntentMeter level={c.intentLevel} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
