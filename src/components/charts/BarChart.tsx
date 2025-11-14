import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
}

export default function BarChart({ data, xAxis, yAxis }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yAxis} fill="#667eea" />
      </RechartsBar>
    </ResponsiveContainer>
  )
}
