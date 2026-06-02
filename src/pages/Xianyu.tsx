import { ShoppingBag } from 'lucide-react'

export function Xianyu() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <ShoppingBag className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">闲鱼选品</h1>
          <p className="text-sm text-muted">发现和管理有潜力的闲鱼商品</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-line bg-card p-8 text-center text-muted">
        闲鱼选品功能开发中...
      </div>
    </div>
  )
}
