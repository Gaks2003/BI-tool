import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  data: any[]
  category: string
  metric: string
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b', '#4ecdc4']

export default function TreemapChart({ data, category, metric }: Props) {
  // Aggregate data by category
  const grouped: Record<string, number> = {}
  data.forEach(item => {
    const key = item[category] || 'Unknown'
    grouped[key] = (grouped[key] || 0) + (Number(item[metric]) || 0)
  })

  const chartData = Object.entries(grouped).map(([name, size], index) => ({
    name,
    size,
    fill: COLORS[index % COLORS.length]
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={chartData}
        dataKey="size"
        stroke="#fff"
        fill="#667eea"
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  )
}
