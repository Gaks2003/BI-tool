import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar } from 'recharts'

type Props = {
  data: any[]
  category: string
  metric: string
}

export default function BoxPlotChart({ data, category, metric }: Props) {
  // Calculate box plot statistics for each category
  const processedData = data.reduce((acc, item) => {
    const cat = item[category]
    const value = parseFloat(item[metric]) || 0
    
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(value)
    return acc
  }, {} as Record<string, number[]>)

  const boxPlotData = Object.entries(processedData).map(([cat, values]) => {
    values.sort((a, b) => a - b)
    const q1 = values[Math.floor(values.length * 0.25)]
    const median = values[Math.floor(values.length * 0.5)]
    const q3 = values[Math.floor(values.length * 0.75)]
    const min = values[0]
    const max = values[values.length - 1]
    
    return {
      category: cat,
      min,
      q1,
      median,
      q3,
      max,
      iqr: q3 - q1
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={boxPlotData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [value, name]}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Bar dataKey="median" fill="#3b82f6" name="Median">
          <ErrorBar dataKey="iqr" width={4} stroke="#1e40af" />
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  )
}