import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Props = {
  data: any[]
  label: string
  metric: string
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']

export default function PieChart({ data, label, metric }: Props) {
  // Aggregate data by label
  const grouped: Record<string, number> = {}
  data.forEach(item => {
    const key = item[label] || 'Unknown'
    grouped[key] = (grouped[key] || 0) + (Number(item[metric]) || 0)
  })

  const chartData = Object.entries(grouped).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPie>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
