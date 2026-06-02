import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { STAGES } from '@/types'
import type { Customer, Stage } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Customer | null
}

interface FormState {
  name: string
  source: string
  segment: string
  stage: string
  intentLevel: number
  tags: string
  note: string
}

const empty: FormState = {
  name: '',
  source: '',
  segment: '',
  stage: '观望咨询',
  intentLevel: 3,
  tags: '',
  note: '',
}

export function CustomerFormDialog({ open, onOpenChange, editing }: Props) {
  const { segments, addCustomer, updateCustomer } = useStore()
  const [form, setForm] = useState<FormState>({ ...empty, segment: segments[0] })

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        source: editing.source,
        segment: editing.segment,
        stage: editing.stage,
        intentLevel: editing.intentLevel,
        tags: editing.tags.join(', '),
        note: editing.note,
      })
    } else {
      setForm({ ...empty, segment: segments[0] })
    }
  }, [editing, open, segments])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      source: form.source.trim(),
      segment: form.segment,
      stage: form.stage as Stage,
      intentLevel: form.intentLevel,
      tags: form.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      note: form.note.trim(),
    }
    if (editing) updateCustomer(editing.id, payload)
    else addCustomer(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? '编辑客户' : '新建客户'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>客户姓名/昵称</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <Label>来源渠道</Label>
              <Input className="mt-1" placeholder="小红书 / 闲鱼 / 私域" value={form.source} onChange={(e) => set('source', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>人群分类</Label>
              <Select value={form.segment} onValueChange={(v) => set('segment', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>成交阶段</Label>
              <Select value={form.stage} onValueChange={(v) => set('stage', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>意向强度：<span className="font-semibold text-brand">{form.intentLevel}</span> / 5</Label>
            <input
              type="range" min={1} max={5} value={form.intentLevel}
              onChange={(e) => set('intentLevel', Number(e.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </div>
          <div>
            <Label>标签（逗号分隔）</Label>
            <Input className="mt-1" placeholder="数据分析, 体验课, 高意向" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </div>
          <div>
            <Label>备注</Label>
            <Textarea className="mt-1" rows={3} value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
          <Button className="flex-1" onClick={save}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
