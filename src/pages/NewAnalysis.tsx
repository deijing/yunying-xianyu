import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileSearch, AlertCircle, MessageSquareText, Loader2, Info, Terminal, CheckCircle2, XCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/common/Reveal'
import type { IntentReport } from '@/types'

type LogEntry = { text: string; stderr?: boolean }

export function NewAnalysis() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { customers, addReport, addCustomer } = useStore()

  const preCustomer = params.get('customer')
  const [target, setTarget] = useState<string>(preCustomer || '__new__')
  const [newName, setNewName] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusLine, setStatusLine] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [done, setDone] = useState(false)
  const logBoxRef = useRef<HTMLDivElement>(null)

  // auto-scroll logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight
    }
  }, [logs])

  const preName = useMemo(() => customers.find((c) => c.id === preCustomer)?.name, [customers, preCustomer])

  const saveReport = useCallback((parsed: Partial<IntentReport>) => {
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
  }, [target, newName, addCustomer, addReport, nav])

  const generateFromMessage = async () => {
    setError('')
    setLogs([])
    setStatusLine('')
    setDone(false)
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

      if (!res.ok || !res.body) {
        setError(`服务异常 (${res.status})，请确认后端已启动。`)
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const raw = line.slice(6)
            try {
              const data = JSON.parse(raw)
              if (currentEvent === 'status') {
                setStatusLine(data.msg)
              } else if (currentEvent === 'log') {
                setLogs((prev) => [...prev, { text: data.text, stderr: !!data.stderr }])
              } else if (currentEvent === 'done') {
                setStatusLine('✅ 分析完成，正在跳转...')
                setDone(true)
                setLoading(false)
                setTimeout(() => saveReport(data.report as IntentReport), 400)
                return
              } else if (currentEvent === 'error') {
                setError(data.msg)
                setLoading(false)
                return
              }
            } catch {
              // malformed SSE line, skip
            }
          } else if (line === '') {
            currentEvent = ''
          }
        }
      }
      // stream ended without done event
      setError('连接中断，Agent 未返回完整结果。')
    } catch {
      setError('请求失败，请确认后端服务已启动（npm run dev --prefix server）。')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex flex-col justify-between rounded-3xl bg-card/40 p-8 shadow-lg shadow-brand/5 ring-1 ring-inset ring-white/10 backdrop-blur-2xl transition-all hover:bg-card/50 sm:flex-row sm:items-end">
            <div>
              <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-fg drop-shadow-sm">
                <FileSearch className="size-8 text-brand" /> 新建意图分析
              </h1>
              <p className="mt-2 text-sm font-medium text-muted">粘贴客户消息，调用本地 Agent 自动提取深层意图并生成专业报告。</p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card className="group relative h-full overflow-hidden border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-fg">
                <MessageSquareText className="size-5 text-brand" /> 客户原始消息
              </div>
              <Textarea
                className="min-h-[280px] resize-none rounded-xl border-line/40 bg-card2/30 p-5 text-sm leading-relaxed transition-all focus:border-brand/50 focus:bg-card2/50 focus:ring-4 focus:ring-brand/10"
                placeholder={`把客户发来的消息（微信语音转文字、聊天记录等）粘贴到这里…\n\n示例：\n其实我有一个小红书想跟你分享一下…我现在做的事呢就是…我沟通以后发现我其实比如说很简单要求先从网站上去查一些数据…`}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                disabled={loading}
              />

              {/* Log Panel */}
              {(loading || logs.length > 0 || done) && (
                <div className="mt-4 overflow-hidden rounded-xl border border-line/60 bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-2 border-b border-line/30 px-4 py-2.5">
                    <Terminal className="size-4 text-brand" />
                    <span className="text-xs font-semibold text-muted">Agent 运行日志</span>
                    {loading && <Loader2 className="ml-auto size-3.5 animate-spin text-brand/70" />}
                    {done && <CheckCircle2 className="ml-auto size-3.5 text-emerald-400" />}
                    {error && <XCircle className="ml-auto size-3.5 text-red-400" />}
                  </div>
                  <div
                    ref={logBoxRef}
                    className="max-h-[220px] overflow-y-auto p-4 font-mono text-xs leading-relaxed"
                  >
                    {logs.length === 0 && loading && (
                      <p className="text-muted/60 animate-pulse">{statusLine || '等待 Agent 响应...'}</p>
                    )}
                    {logs.map((l, i) => (
                      <p
                        key={i}
                        className={cn(
                          'whitespace-pre-wrap break-all',
                          l.stderr ? 'text-amber-400/80' : 'text-emerald-400/80'
                        )}
                      >
                        {l.text}
                      </p>
                    ))}
                    {loading && statusLine && (
                      <p className="mt-1 animate-pulse text-brand/70">{statusLine}</p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 shadow-sm backdrop-blur-md">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="border border-line/50 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:shadow-brand/5">
              <Label className="text-sm font-semibold text-fg">归属客户</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="mt-3 rounded-xl border-line/40 bg-card2/30 transition-all hover:bg-card2/50 focus:ring-brand/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">➕ 新建客户</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}（{c.segment}）</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {target === '__new__' && (
                <div className="mt-5">
                  <Label className="text-sm font-semibold text-fg">新客户名字</Label>
                  <Input
                    className="mt-2 rounded-xl border-line/40 bg-card2/30 transition-all hover:bg-card2/50 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                    placeholder="如 林小姐"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              )}
              {preName && target === preCustomer && (
                <p className="mt-3 text-xs font-medium text-brand/80">将归档到「{preName}」名下</p>
              )}

              <Button
                className="group relative mt-8 w-full overflow-hidden rounded-xl bg-brand py-6 text-base font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand/90 hover:shadow-xl hover:shadow-brand/30 disabled:opacity-90"
                onClick={generateFromMessage}
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center drop-shadow-sm">
                  {loading ? (
                    <><Loader2 className="mr-2 size-5 animate-spin" /> Agent 分析中...</>
                  ) : (
                    <><FileSearch className="mr-2 size-5 transition-transform group-hover:scale-110" /> 生成报告</>
                  )}
                </span>
              </Button>

              <div className="mt-8 space-y-3 rounded-2xl border border-line bg-card2/50 p-5 text-xs leading-relaxed text-muted-foreground backdrop-blur-sm">
                <div className="flex items-center gap-1.5 font-bold text-fg">
                  <Info className="size-4 text-brand" /> 智能分析提示
                </div>
                <p>粘贴客户消息后，系统会调本地 Agent 自动提取深层意图、顾虑并生成完整跟进报告。</p>
                <p className="mt-2 text-[11px] opacity-80">首次使用请先启动后端：<br/><code className="mt-1 block rounded bg-card px-2 py-1 font-mono text-fg shadow-sm border border-line">npm run dev --prefix server</code></p>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
