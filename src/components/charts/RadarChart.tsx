import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  data: any[]
  category: string
  metric: string
}

export default function RadarChart({ data, category, metric }: Props) {
  // Aggregate data by category
  const grouped: Record<string, number> = {}
  data.forEach(item => {
    const key = item[category] || 'Unknown'
    grouped[key] = (grouped[key] || 0) + (Number(item[metric]) || 0)
  })

  const chartData = Object.entries(grouped).map(([name, value]) => ({
    [category]: name,
    [metric]: value
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadar data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey={category} />
        <PolarRadiusAxis />
        <Radar dataKey={metric} stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
        <Tooltip />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
