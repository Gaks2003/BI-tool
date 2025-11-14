import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  barField: string
  lineField: string
}

export default function ComboChart({ data, xAxis, barField, lineField }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={barField} fill="#667eea" />
        <Line type="monotone" dataKey={lineField} stroke="#10b981" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
