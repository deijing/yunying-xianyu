import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, CheckCircle2, XCircle, Clock, Trash2, Cpu, ChevronDown, ChevronUp } from 'lucide-react'

type Job = {
  id: string
  model: string
  status: 'running' | 'done' | 'error'
  startedAt: number
  finishedAt?: number
  duration?: number
  messageSnippet: string
  resultTitle?: string
  errorMsg?: string
}

function elapsed(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000)
}

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function ProcessPanel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [, setTick] = useState(0)
  const timerRef = useRef(0)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/processes')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch { /* 后端挂了不报错 */ }
  }, [])

  useEffect(() => {
    fetchJobs()
    const int = setInterval(fetchJobs, 2000)
    return () => clearInterval(int)
  }, [fetchJobs])

  // 每秒刷新运行中任务的计时
  useEffect(() => {
    if (jobs.some((j) => j.status === 'running')) {
      timerRef.current = window.setInterval(() => setTick((t) => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [jobs])

  const clearJob = async (id: string) => {
    try { await fetch(`/api/processes/${id}`, { method: 'DELETE' }) } catch {}
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const clearAll = async () => {
    try { await fetch('/api/processes', { method: 'DELETE' }) } catch {}
    setJobs([])
  }

  const running = jobs.filter((j) => j.status === 'running')
  const done = jobs.filter((j) => j.status === 'done')
  const errors = jobs.filter((j) => j.status === 'error')

  if (jobs.length === 0) return null

  return (
    <div className="rounded-xl border border-line/50 bg-card/60 backdrop-blur-xl shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-brand" />
          <span className="text-sm font-semibold text-fg">进程管理</span>
          <span className="rounded-full bg-card2 px-1.5 text-[11px] text-muted">
            {running.length} 运行 / {done.length + errors.length} 完成
          </span>
        </div>
        <div className="flex items-center gap-2">
          {jobs.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearAll() }}
              className="rounded-md p-1 text-muted hover:bg-red-500/10 hover:text-red-400"
              title="清除全部"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
          {collapsed ? <ChevronDown className="size-4 text-muted" /> : <ChevronUp className="size-4 text-muted" />}
        </div>
      </button>

      {!collapsed && (
        <div className="max-h-[300px] overflow-y-auto border-t border-line/30">
          {/* 运行中 */}
          {running.map((j) => (
            <div key={j.id} className="flex items-center gap-3 border-b border-line/20 px-4 py-2.5">
              <Loader2 className="size-3.5 animate-spin text-brand/80 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-xs text-fg">{j.messageSnippet}</span>
                  <span className="shrink-0 rounded bg-brand/10 px-1 text-[10px] text-brand">{j.model}</span>
                </div>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted">{elapsed(j.startedAt)}s</span>
            </div>
          ))}

          {/* 已完成 */}
          {done.slice(0, 20).map((j) => (
            <div key={j.id} className="flex items-center gap-3 border-b border-line/20 px-4 py-2.5">
              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-xs text-fg">{j.resultTitle || j.messageSnippet}</span>
                  <span className="shrink-0 rounded bg-card2 px-1 text-[10px] text-muted">{j.model}</span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted/60 flex items-center gap-1">
                <Clock className="size-3" /> {j.duration ? fmtDuration(j.duration) : '-'}
              </span>
              <button
                onClick={() => clearJob(j.id)}
                className="shrink-0 rounded p-0.5 text-muted/40 hover:bg-card2 hover:text-muted"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          {/* 失败 */}
          {errors.map((j) => (
            <div key={j.id} className="flex items-center gap-3 border-b border-line/20 px-4 py-2.5">
              <XCircle className="size-3.5 text-red-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-xs text-fg">{j.messageSnippet}</span>
                  <span className="shrink-0 rounded bg-card2 px-1 text-[10px] text-muted">{j.model}</span>
                </div>
                {j.errorMsg && (
                  <p className="mt-0.5 truncate text-[11px] text-red-400/70">{j.errorMsg}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted/60">{j.duration ? fmtDuration(j.duration) : '-'}</span>
              <button
                onClick={() => clearJob(j.id)}
                className="shrink-0 rounded p-0.5 text-muted/40 hover:bg-card2 hover:text-muted"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          {jobs.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-muted">暂无进程记录</p>
          )}
        </div>
      )}
    </div>
  )
}
