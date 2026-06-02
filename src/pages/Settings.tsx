import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Download, Upload, RotateCcw, Plus, X, Users, Database } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Reveal } from '@/components/common/Reveal'
import type { ArchiveData } from '@/types'

export function Settings() {
  const { customers, reports, segments, setSegments, importData, resetDemo } = useStore()
  const [newSeg, setNewSeg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addSeg = () => {
    const v = newSeg.trim()
    if (v && !segments.includes(v)) setSegments([...segments, v])
    setNewSeg('')
  }
  const removeSeg = (s: string) => setSegments(segments.filter((x) => x !== s))

  const exportData = () => {
    const data: ArchiveData = { customers, reports, segments }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '意图管理-数据备份.json'
    a.click()
  }

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (data.customers) {
          importData(data)
          alert('导入成功')
        } else alert('文件里没有 customers 字段')
      } catch {
        alert('文件格式不对')
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="mt-1 text-sm text-muted">Settings · 分类与数据管理</p>
        </div>
      </Reveal>

      <Reveal>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 text-brand" /> 人群分类管理
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {segments.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-card2 px-3 py-1.5 text-sm">
                {s}
                <button onClick={() => removeSeg(s)} className="text-subtle hover:text-red-400">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex max-w-sm gap-2">
            <Input
              placeholder="新增人群分类，如「跨境卖家」"
              value={newSeg}
              onChange={(e) => setNewSeg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSeg()}
            />
            <Button variant="secondary" onClick={addSeg}><Plus className="size-4" />添加</Button>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Database className="size-4 text-brand" /> 数据管理
          </div>
          <p className="mb-4 text-xs text-muted">
            数据保存在本机浏览器（localStorage）。换电脑或备份时，用导出/导入迁移。当前：{customers.length} 位客户 · {reports.length} 份报告。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={exportData}><Download className="size-4" />导出数据</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="size-4" />导入数据</Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={onImport} />
            <Button
              variant="danger"
              onClick={() => confirm('重置为示例数据？当前数据会被覆盖。') && resetDemo()}
            >
              <RotateCcw className="size-4" />重置为示例
            </Button>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}
