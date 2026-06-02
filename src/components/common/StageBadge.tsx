import { Eye, Scale, Handshake, CheckCircle2, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Stage } from '@/types'
import { Badge } from '@/components/ui/badge'

const ICON: Record<Stage, LucideIcon> = {
  观望咨询: Eye,
  比较犹豫: Scale,
  准备成交: Handshake,
  已付费推进: CheckCircle2,
  复购续费: RefreshCw,
}

export function StageBadge({ stage }: { stage: Stage }) {
  const Icon = ICON[stage]
  return (
    <Badge variant="brand">
      <Icon className="size-3" />
      {stage}
    </Badge>
  )
}
