import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import {
  Crosshair,
  Flag,
  Lightbulb,
  MessageSquareQuote,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
  Star,
  Send,
  Clock,
  Copy,
  Check,
  CircleDot,
} from 'lucide-react'
import type { IntentReport } from '@/types'
import { hexToRgba } from '@/lib/utils'
import { Reveal } from '@/components/common/Reveal'

export function ReportRenderer({ report }: { report: IntentReport }) {
  const c = report.brandColor || '#0A84FF'
  const soft = { background: `linear-gradient(135deg, ${hexToRgba(c, 0.16)}, ${hexToRgba(c, 0.04)})` }
  const txt = { color: c }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <header className="mb-2">
        <Reveal>
          <div className="mb-4 flex items-center gap-3">
            <CircleDot className="size-6" style={txt} />
            <span className="text-xs uppercase tracking-[0.3em] text-muted">Customer Intent Analysis</span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{report.title}</h1>
        </Reveal>
        {report.titleEn && (
          <Reveal delay={0.1}>
            <p className="mt-3 text-lg font-semibold text-muted">{report.titleEn}</p>
          </Reveal>
        )}
      </header>

      {/* 核心研判 */}
      <Reveal>
        <Section icon={Crosshair} title="核心研判" en="Executive Read" color={c}>
          <p className="mb-7 max-w-4xl text-base leading-relaxed text-fg">{report.quickRead}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat soft={soft}>
              <div className="text-3xl font-bold leading-none" style={txt}>
                {report.stage}
              </div>
              <Sub>成交阶段 · Stage</Sub>
            </MiniStat>
            <MiniStat>
              <div className="text-5xl font-bold leading-none" style={txt}>
                {report.intentLevel}
                <span className="text-2xl text-subtle">/5</span>
              </div>
              <Sub>意向强度 · Intent Level</Sub>
            </MiniStat>
            <MiniStat>
              <div className="text-5xl font-bold leading-none" style={txt}>
                {report.closeProbability}%
              </div>
              <Sub>成交概率(估) · Close Prob.</Sub>
            </MiniStat>
            <MiniStat>
              <div className="text-3xl font-bold leading-none">
                {report.signals.length}
                <span className="text-base text-subtle"> 信号</span>
              </div>
              <Sub>积极信号 · Signals</Sub>
            </MiniStat>
          </div>
        </Section>
      </Reveal>

      {/* 意图 & 目标 */}
      <Reveal>
        <Section icon={Crosshair} title="当下意图 & 想要的效果" en="Intent & Goal" color={c}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PointCard icon={Flag} title="当下意图" en="What he wants now" detail={report.intent} color={c} />
            <PointCard icon={Lightbulb} title="深层目标" en="Underlying Goal" detail={report.deepGoal} color={c} />
            <PointCard icon={MessageSquareQuote} title="判断依据" en="Evidence" detail={report.evidence} color={c} />
          </div>
        </Section>
      </Reveal>

      {/* 信号 & 顾虑 */}
      <Reveal>
        <Section icon={TrendingUp} title="成交信号与顾虑" en="Signals & Concerns" color={c}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {report.signals.map((s, i) => (
              <div key={i} className="rounded-lg border border-line p-5" style={soft}>
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="size-3.5" style={txt} />
                  <span className="text-[11px] font-semibold tracking-wider" style={txt}>
                    信号 SIGNAL
                  </span>
                </div>
                <div className="text-lg font-bold leading-snug">{s.title}</div>
                <p className="mt-2 text-sm text-muted">{s.detail}</p>
              </div>
            ))}
            {report.concerns.map((s, i) => (
              <div key={i} className="rounded-lg border border-line bg-card2 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <HelpCircle className="size-3.5 text-muted" />
                  <span className="text-[11px] font-semibold tracking-wider text-muted">顾虑 CONCERN</span>
                </div>
                <div className="text-lg font-bold leading-snug">{s.title}</div>
                <p className="mt-2 text-sm text-muted">{s.detail}</p>
              </div>
            ))}
          </div>
          {report.risk && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border p-5" style={{ ...soft, borderColor: hexToRgba(c, 0.4) }}>
              <AlertTriangle className="mt-0.5 size-5 shrink-0" style={txt} />
              <div>
                <span className="font-bold" style={txt}>
                  关键风险 ·{' '}
                </span>
                <span className="text-fg">{report.risk}</span>
              </div>
            </div>
          )}
        </Section>
      </Reveal>

      {/* 如何教学 */}
      <Reveal>
        <Section icon={Star} title="如何教学" en="Teaching Framework" color={c}>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {report.teaching.framework.map((step, i) => (
              <div key={i} className="rounded-lg border border-line bg-card2 p-5">
                <div className="mb-3 text-5xl font-bold leading-none" style={txt}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-lg font-bold">{step.title}</div>
                <p className="mt-1 text-sm text-muted">{step.detail}</p>
              </div>
            ))}
          </div>
          {report.teaching.trialLesson && (
            <div className="rounded-xl border p-6" style={{ ...soft, borderColor: hexToRgba(c, 0.4) }}>
              <div className="mb-3 flex items-center gap-2">
                <Star className="size-4" style={txt} />
                <span className="text-xs font-bold tracking-[0.2em]" style={txt}>
                  第一节体验课 · TRIAL LESSON 01
                </span>
              </div>
              <div className="mb-4 text-2xl font-bold sm:text-3xl">{report.teaching.trialLesson.title}</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {report.teaching.trialLesson.points.map((p, i) => (
                  <div key={i} className="rounded-lg bg-fg/5 p-4">
                    <p className="text-sm text-fg">{p}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-l-2 pl-3 text-sm italic text-muted" style={{ borderColor: c }}>
                为什么这么排：{report.teaching.trialLesson.why}
              </p>
            </div>
          )}
        </Section>
      </Reveal>

      {/* 操作 & 跟进 */}
      <Reveal>
        <Section icon={Send} title="如何操作 & 如何跟进" en="Action & Follow-up" color={c}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {report.actions.map((a, i) => (
              <div key={i} className="rounded-lg border border-line bg-card2 p-5">
                <div className="mb-3 flex size-7 items-center justify-center rounded-full text-sm font-bold" style={{ ...soft, color: c }}>
                  {i + 1}
                </div>
                <div className="text-lg font-bold">{a.title}</div>
                <p className="mt-1 text-sm text-muted">{a.detail}</p>
              </div>
            ))}
          </div>
          {report.followUp && (
            <div className="mt-4 flex items-start gap-4 rounded-lg border border-line bg-card2 p-5">
              <Clock className="mt-1 size-6 shrink-0" style={txt} />
              <div>
                <div className="mb-1 text-sm font-semibold tracking-wider" style={txt}>
                  跟进节奏 · FOLLOW-UP
                </div>
                <p className="text-sm text-fg">{report.followUp}</p>
              </div>
            </div>
          )}
        </Section>
      </Reveal>

      {/* 话术 */}
      <Reveal>
        <ScriptCard script={report.script} color={c} soft={soft} />
      </Reveal>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  en,
  color,
  children,
}: {
  icon: typeof Flag
  title: string
  en: string
  color: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-6 shadow-lg sm:p-9">
      <div className="mb-7 flex items-center gap-3">
        <Icon className="size-5" style={{ color }} />
        <h2 className="text-2xl font-bold">
          {title}
          <span className="ml-2 text-base font-semibold text-subtle">{en}</span>
        </h2>
      </div>
      {children}
    </section>
  )
}

function MiniStat({ children, soft }: { children: ReactNode; soft?: CSSProperties }) {
  return (
    <div className="rounded-lg border border-line bg-card2 p-5" style={soft}>
      {children}
    </div>
  )
}

function Sub({ children }: { children: ReactNode }) {
  return <div className="mt-2 text-xs text-muted">{children}</div>
}

function PointCard({
  icon: Icon,
  title,
  en,
  detail,
  color,
}: {
  icon: typeof Flag
  title: string
  en: string
  detail: string
  color: string
}) {
  return (
    <div className="rounded-lg border border-line bg-card2 p-5">
      <Icon className="mb-3 size-4" style={{ color }} />
      <div className="mb-1 text-xl font-bold">{title}</div>
      <div className="mb-2 text-xs text-muted">{en}</div>
      <p className="text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  )
}

function ScriptCard({ script, color, soft }: { script: string[]; color: string; soft: CSSProperties }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(script.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <section className="rounded-2xl border p-6 shadow-lg sm:p-9" style={{ ...soft, borderColor: hexToRgba(color, 0.3) }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="size-5" style={{ color }} />
          <div>
            <h2 className="text-2xl font-bold">建议话术</h2>
            <p className="text-xs text-muted">Suggested Reply · 先接住诉求 → 给具体下一步 → 不逼单</p>
          </div>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: color }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? '已复制' : '复制全部'}
        </button>
      </div>
      <div className="max-w-2xl space-y-3">
        {script.map((line, i) => (
          <div
            key={i}
            className="rounded-bl-2xl rounded-r-2xl border border-line bg-card2 p-4 text-[15px] leading-relaxed text-fg"
          >
            {line}
          </div>
        ))}
      </div>
    </section>
  )
}
