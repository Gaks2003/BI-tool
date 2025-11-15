import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
  sizeField: string
}

export default function BubbleChart({ data, xAxis, yAxis, sizeField }: Props) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
  
  // Check if fields are numeric
  const isXNumeric = !isNaN(parseFloat(data[0]?.[xAxis]))
  const isYNumeric = !isNaN(parseFloat(data[0]?.[yAxis]))
  const isSizeNumeric = !isNaN(parseFloat(data[0]?.[sizeField]))
  
  if (!isXNumeric || !isYNumeric) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Invalid Bubble Chart Configuration</p>
          <p className="text-sm">Both X and Y axes must contain numeric data</p>
          <p className="text-xs mt-2">Try: years_experience (X) vs salary (Y) vs project_count (Size)</p>
        </div>
      </div>
    )
  }
  
  const processedData = data.map((item, index) => ({
    x: parseFloat(item[xAxis]) || 0,
    y: parseFloat(item[yAxis]) || 0,
    z: isSizeNumeric ? parseFloat(item[sizeField]) || 10 : 10,
    name: item[xAxis],
    category: item[xAxis],
    color: colors[index % colors.length]
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" name={xAxis} />
        <YAxis dataKey="y" name={yAxis} />
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'y') return [value, yAxis]
            return [value, name]
          }}
          labelFormatter={(value) => `${xAxis}: ${value}`}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-white p-3 border rounded shadow">
                  <p className="font-semibold">{`${xAxis}: ${data.x}`}</p>
                  <p>{`${yAxis}: ${data.y}`}</p>
                  <p>{`${sizeField}: ${data.z}`}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Scatter dataKey="y">
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}