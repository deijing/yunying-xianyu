import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useTheme } from '@/store/useTheme'

const PALETTE = ['#0A84FF', '#5E5CE6', '#64D2FF', '#30D158', '#FFD60A', '#8E8E93', '#FF9F0A']

function useChartTokens() {
  const dark = useTheme((s) => s.dark)
  return {
    track: dark ? '#2a2a2a' : '#e6e6ea',
    tooltip: {
      background: dark ? '#1f1f1f' : '#ffffff',
      border: `1px solid ${dark ? '#2c2c2c' : '#e0e0e5'}`,
      borderRadius: 10,
      fontSize: 12,
      color: dark ? '#fff' : '#1d1d1f',
    },
    cursor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  }
}

export function SegmentDonut({ data }: { data: { name: string; value: number }[] }) {
  const { track, tooltip } = useChartTokens()
  const has = data.some((d) => d.value > 0)
  const display = has ? data : [{ name: '暂无', value: 1 }]
  return (
    <ResponsiveContainer width="100%" height={150}>
      <PieChart>
        <Pie data={display} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2} stroke="none">
          {display.map((_, i) => (
            <Cell key={i} fill={has ? PALETTE[i % PALETTE.length] : track} />
          ))}
        </Pie>
        {has && <Tooltip contentStyle={tooltip} />}
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StageFunnel({
  data,
  color = '#0A84FF',
}: {
  data: { name: string; value: number }[]
  color?: string
}) {
  const { tooltip, cursor } = useChartTokens()
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={48} tick={{ fill: '#8a8a8e', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltip} cursor={{ fill: cursor }} />
        <Bar dataKey="value" fill={color} radius={[0, 5, 5, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MiniDonut({ value, color = '#0A84FF' }: { value: number; color?: string }) {
  const { track } = useChartTokens()
  const data = [
    { name: 'v', value },
    { name: 'r', value: 100 - value },
  ]
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={38} outerRadius={52} stroke="none" startAngle={90} endAngle={-270}>
          <Cell fill={color} />
          <Cell fill={track} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
