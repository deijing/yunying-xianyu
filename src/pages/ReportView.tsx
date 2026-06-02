import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { ReportRenderer } from '@/components/report/ReportRenderer'
import { useNavigate } from 'react-router-dom'

export function ReportView() {
  const { id } = useParams()
  const nav = useNavigate()
  const { reports, customers, removeReport } = useStore()
  const report = reports.find((r) => r.id === id)

  if (!report) return <EmptyState icon={FileText} title="报告不存在" hint="可能已被删除" />
  const customer = customers.find((c) => c.id === report.customerId)

  const del = () => {
    if (confirm('确定删除这份报告？')) {
      removeReport(report.id)
      nav(customer ? `/customers/${customer.id}` : '/customers')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={customer ? `/customers/${customer.id}` : '/customers'}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> {customer ? `返回 ${customer.name} 的档案` : '返回'}
        </Link>
        <Button variant="danger" size="sm" onClick={del}><Trash2 className="size-4" />删除报告</Button>
      </div>
      <ReportRenderer report={report} />
    </div>
  )
}
