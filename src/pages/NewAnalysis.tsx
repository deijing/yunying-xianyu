import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, FileJson, AlertCircle, Wand2, MessageSquareText, Loader2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/common/Reveal'
import type { IntentReport } from '@/types'
import { STAGES } from '@/types'

const TEMPLATE = `{
  "title": "客户一句话主题",
  "titleEn": "English Subtitle",
  "brandColor": "#FF2442",
  "quickRead": "把客户那段话翻成人话的一句速读",
  "intent": "他此刻最想拿到的具体东西",
  "deepGoal": "他最终图什么",
  "evidence": "凭哪句话这么判断",
  "closeProbability": 80,
  "intentLevel": 5,
  "stage": "准备成交",
  "signals": [{ "title": "信号标题", "detail": "说明" }],
  "concerns": [{ "title": "顾虑标题", "detail": "说明" }],
  "risk": "关键风险一句话",
  "teaching": {
    "framework": [{ "title": "步骤名", "detail": "说明" }],
    "trialLesson": { "title": "第一节体验课主题", "points": ["要点1", "要点2"], "why": "为什么这么排" }
  },
  "actions": [{ "title": "动作", "detail": "说明" }],
  "followUp": "跟进节奏",
  "script": ["话术第一句", "话术第二句"]
}`

type Mode = 'json' | 'message'

export function NewAnalysis() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { customers, addReport, addCustomer } = useStore()

  const preCustomer = params.get('customer')
  const [mode, setMode] = useState<Mode>('json')
  const [target, setTarget] = useState<string>(preCustomer || '__new__')
  const [newName, setNewName] = useState('')
  const [json, setJson] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const preName = useMemo(() => customers.find((c) => c.id === preCustomer)?.name, [customers, preCustomer])

  function saveReport(parsed: Partial<IntentReport>) {
    let customerId = target
    if (target === '__new__') {
      const name = newName.trim()
      if (!name) {
        setError('请填写新客户的名字，或选择一个已有客户。')
        return
      }
      customerId = addCustomer({
        name,
        source: '',
        segment: '其他',
        stage: (parsed.stage as IntentReport['stage']) || '观望咨询',
        intentLevel: parsed.intentLevel || 3,
        tags: [],
        note: parsed.quickRead || '',
      })
    }

    const report: Omit<IntentReport, 'id' | 'createdAt'> = {
      customerId,
      title: parsed.title || '',
      titleEn: parsed.titleEn,
      brandColor: parsed.brandColor || '#0A84FF',
      quickRead: parsed.quickRead || '',
      intent: parsed.intent || '',
      deepGoal: parsed.deepGoal || '',
      evidence: parsed.evidence || '',
      closeProbability: parsed.closeProbability ?? 50,
      intentLevel: parsed.intentLevel ?? 3,
      stage: (parsed.stage as IntentReport['stage']) || '观望咨询',
      signals: parsed.signals || [],
      concerns: parsed.concerns || [],
      risk: parsed.risk || '',
      teaching: parsed.teaching || { framework: [] },
      actions: parsed.actions || [],
      followUp: parsed.followUp || '',
      script: parsed.script || [''],
    }
    const rid = addReport(report)
    nav(`/reports/${rid}`)
  }

  const generateFromJSON = () => {
    setError('')
    let parsed: Partial<IntentReport>
    try {
      parsed = JSON.parse(json)
    } catch {
      setError('JSON 解析失败，请检查格式（少了逗号/引号之类）。')
      return
    }
    if (!parsed.title || !parsed.quickRead || !Array.isArray(parsed.script)) {
      setError('缺少必要字段（至少要有 title、quickRead、script）。可点「加载模板」参考格式。')
      return
    }
    saveReport(parsed)
  }

  const generateFromMessage = async () => {
    setError('')
    const msg = customerMessage.trim()
    if (!msg) {
      setError('请粘贴客户发送的消息。')
      return
    }

    if (target === '__new__' && !newName.trim()) {
      setError('请填写新客户的名字，或选择一个已有客户。')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || '分析失败，请稍后重试。')
        return
      }
      saveReport(data.report as IntentReport)
    } catch (e: any) {
      setError('请求失败，请确认后端服务已启动（npm run dev --prefix server）。')
    } finally {
      setLoading(false)
    }
  }

  const TAB: { value: Mode; label: string; icon: typeof FileJson }[] = [
    { value: 'json', label: '粘贴 JSON', icon: FileJson },
    { value: 'message', label: '粘贴客户消息', icon: MessageSquareText },
  ]

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Sparkles className="size-7 text-brand" /> 新建意图分析
          </h1>
          <p className="mt-1 text-sm text-muted">
            粘贴 skill 输出的 JSON，或直接粘贴客户消息调用本地 Agent 自动分析。
          </p>
        </div>
      </Reveal>

      <div className="flex gap-1 rounded-xl bg-card2 p-1">
        {TAB.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.value}
              onClick={() => setMode(t.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                mode === t.value
                  ? 'bg-card text-fg shadow-sm'
                  : 'text-muted hover:text-fg'
              )}
            >
              <Icon className="size-4" /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="p-6">
            {mode === 'json' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <FileJson className="size-4 text-brand" /> 意图分析 JSON
                  </Label>
                  <Button variant="ghost" size="sm" onClick={() => setJson(TEMPLATE)}>
                    <Wand2 className="size-3.5" /> 加载模板
                  </Button>
                </div>
                <Textarea
                  className="min-h-[420px] font-mono text-xs leading-relaxed"
                  placeholder="把 skill 输出的 JSON 粘贴到这里…"
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                />
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-1.5 text-sm">
                  <MessageSquareText className="size-4 text-brand" /> 客户原始消息
                </div>
                <Textarea
                  className="min-h-[420px] leading-relaxed"
                  placeholder={`把客户发来的消息（微信语音转文字、聊天记录等）粘贴到这里…\n\n示例：\n其实我有一个小红书想跟你分享一下…我现在做的事呢就是…我沟通以后发现我其实比如说很简单要求先从网站上去查一些数据…`}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                />
              </>
            )}
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="p-6">
            <Label className="text-sm">归属客户</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__new__">➕ 新建客户</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}（{c.segment}）</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {target === '__new__' && (
              <div className="mt-4">
                <Label>新客户名字</Label>
                <Input className="mt-1" placeholder="如 林小姐" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
            )}
            {preName && target === preCustomer && (
              <p className="mt-3 text-xs text-muted">将归档到「{preName}」名下</p>
            )}

            <Button
              className="mt-6 w-full"
              onClick={mode === 'json' ? generateFromJSON : generateFromMessage}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> 分析中…</>
              ) : (
                <><Sparkles className="size-4" /> 生成报告</>
              )}
            </Button>

            <div className="mt-6 space-y-2 rounded-xl border border-line bg-card2 p-4 text-xs leading-relaxed text-muted">
              <div className="font-semibold text-muted">小贴士</div>
              {mode === 'json' ? (
                <>
                  <p>报告里的 <span className="text-brand">brandColor</span> 是自动识别的品牌色，高亮色会随它变化。</p>
                  <p><span className="text-brand">stage</span> 可选：{STAGES.join(' / ')}</p>
                </>
              ) : (
                <>
                  <p>粘贴客户消息后，系统会调本地 Agent 自动分析并生成完整报告。</p>
                  <p>首次使用请先启动后端：<code className="rounded bg-card2 px-1 text-brand">npm run dev --prefix server</code></p>
                </>
              )}
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
