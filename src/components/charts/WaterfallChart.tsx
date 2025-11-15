import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = {
  data: any[]
  category: string
  value: string
}

export default function WaterfallChart({ data, category, value }: Props) {
  let cumulative = 0
  
  const processedData = data.map((item, index) => {
    const val = parseFloat(item[value]) || 0
    const start = cumulative
    cumulative += val
    
    return {
      name: item[category],
      value: val,
      cumulative,
      start,
      isPositive: val >= 0,
      isTotal: index === data.length - 1
    }
  })

  const colors = {
    positive: '#10b981',
    negative: '#ef4444',
    total: '#3b82f6'
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [value, name]}
          labelFormatter={(label) => `Step: ${label}`}
        />
        <Bar dataKey="value" name="Change">
          {processedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isTotal ? colors.total : entry.isPositive ? colors.positive : colors.negative} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}