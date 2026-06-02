import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Handshake, CheckCircle2, FileText, ArrowUpRight, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { STAGES } from '@/types'
import { StatCard } from '@/components/common/StatCard'
import { StageBadge } from '@/components/common/StageBadge'
import { IntentMeter } from '@/components/common/IntentMeter'
import { Avatar } from '@/components/common/Avatar'
import { Card } from '@/components/ui/card'
import { Reveal } from '@/components/common/Reveal'
import { SegmentPie, StageFunnelChart, IntentTrendChart } from '@/components/charts/EChartsComponents'

export function Dashboard() {
  const { customers, reports, segments } = useStore()

  const stats = useMemo(() => {
    const hot = customers.filter((c) => c.stage === '准备成交').length
    const paid = customers.filter((c) => c.stage === '已付费推进' || c.stage === '复购续费').length
    
    // Segment data for Pie
    const segData = segments
      .map((s) => ({ name: s, value: customers.filter((c) => c.segment === s).length }))
      .filter((d) => d.value > 0)
    
    // Stage data for Funnel
    const stageData = STAGES.map((s) => ({
      name: s,
      value: customers.filter((c) => c.stage === s).length,
    })).reverse() // Funnel usually goes from top to bottom
    
    // Trend data (mocked based on actual counts)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
    
    const trendData = last7Days.map(date => {
      // Count customers updated on or before this date
      const count = customers.filter(c => c.updatedAt.split('T')[0] <= date).length
      // Add some variation based on intentionality
      const avgIntent = customers.length > 0 
        ? customers.reduce((acc, c) => acc + c.intentLevel, 0) / customers.length 
        : 0
      return { date: date.slice(5), value: count * avgIntent }
    })

    const recent = [...customers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
    
    return { hot, paid, segData, stageData, trendData, recent }
  }, [customers, segments])

  return (
    <div className="relative min-h-screen space-y-10">
      {/* Aurora Background Glows */}
      <div className="pointer-events-none absolute -inset-x-20 -top-20 z-0 h-[600px] overflow-hidden opacity-40 mix-blend-normal dark:opacity-20 dark:mix-blend-color-dodge">
        <div className="absolute left-1/4 top-1/4 size-[400px] animate-float rounded-full bg-brand/30 blur-[100px]" />
        <div className="absolute right-1/4 top-1/3 size-[300px] animate-float rounded-full bg-purple-500/20 blur-[80px]" style={{ animationDelay: '2s' }} />
        <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 space-y-8">
        <Reveal>
          <div className="flex items-end justify-between rounded-3xl bg-card/40 p-8 shadow-lg shadow-brand/5 ring-1 ring-inset ring-white/10 backdrop-blur-2xl transition-all hover:bg-card/50">
            <div>
              <h1 className="bg-gradient-to-r from-brand via-purple-500 to-cyan-400 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-sm">
                意图总览
              </h1>
              <p className="mt-2 text-sm font-medium text-muted">Dashboard · 客户洞察与转化全景视图</p>
            </div>
            <div className="hidden text-right lg:block">
              <div className="bg-gradient-to-br from-brand to-cyan-400 bg-clip-text text-4xl font-mono font-black text-transparent drop-shadow-sm">
                {Math.round((stats.paid / (customers.length || 1)) * 100)}%
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-muted uppercase">付费转化率 Overall Conversion</div>
            </div>
          </div>
        </Reveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><StatCard icon={Users} value={customers.length} label="客户总数" labelEn="Total Leads" accent /></Reveal>
        <Reveal delay={0.05}><StatCard icon={Handshake} value={stats.hot} label="准备成交" labelEn="Hot Opportunities" /></Reveal>
        <Reveal delay={0.1}><StatCard icon={CheckCircle2} value={stats.paid} label="已付费" labelEn="Converted" /></Reveal>
        <Reveal delay={0.15}><StatCard icon={FileText} value={reports.length} label="AI 意图报告" labelEn="Analysis Reports" /></Reveal>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Funnel */}
        <Reveal className="lg:col-span-1">
          <Card className="relative h-full overflow-hidden border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
            <div className="absolute right-6 top-6">
              <div className="rounded-full bg-brand/10 p-2 text-brand ring-1 ring-inset ring-brand/20">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold text-fg">转化漏斗 · Funnel</div>
              <div className="text-[10px] text-muted uppercase tracking-tighter">Conversion stages distribution</div>
            </div>
            <StageFunnelChart data={stats.stageData} />
          </Card>
        </Reveal>

        {/* Middle/Right Column: Distribution & Trend */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal delay={0.1}>
              <Card className="border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
                <div className="mb-4">
                  <div className="text-sm font-semibold text-fg">人群占比 · Segments</div>
                  <div className="text-[10px] text-muted uppercase tracking-tighter">Customer base segmentation</div>
                </div>
                <div className="flex items-center justify-center">
                  <SegmentPie data={stats.segData} />
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card className="border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
                <div className="mb-4">
                  <div className="text-sm font-semibold text-fg">意向趋势 · Intensity</div>
                  <div className="text-[10px] text-muted uppercase tracking-tighter">Overall purchase intent trend</div>
                </div>
                <IntentTrendChart data={stats.trendData} />
              </Card>
            </Reveal>
          </div>

          {/* Recent Activity */}
          <Reveal delay={0.3}>
            <Card className="border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-fg">最近动态 · Recent Activity</div>
                  <div className="text-[10px] text-muted uppercase tracking-tighter">Latest customer updates and insights</div>
                </div>
                <Link to="/customers" className="flex items-center gap-1 text-xs font-medium text-brand transition-all hover:gap-2 hover:text-cyan-500">
                  查看全部 <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {stats.recent.map((c) => (
                  <Link
                    key={c.id}
                    to={`/customers/${c.id}`}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line/40 bg-card2/30 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-card2/80 hover:shadow-xl hover:shadow-brand/10"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <Avatar name={c.name} className="ring-2 ring-background transition-transform duration-300 group-hover:scale-110 group-hover:ring-brand/20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fg">{c.name}</span>
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand ring-1 ring-inset ring-brand/20">{c.segment}</span>
                      </div>
                      <p className="clamp-1 mt-1 text-xs text-muted-foreground group-hover:text-fg/80 transition-colors">{c.note || '暂无备注'}</p>
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
      </div>
    </div>
  )
}
