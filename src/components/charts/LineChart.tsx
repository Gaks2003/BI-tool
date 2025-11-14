import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
}

export default function LineChart({ data, xAxis, yAxis }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yAxis} stroke="#667eea" strokeWidth={2} />
      </RechartsLine>
    </ResponsiveContainer>
  )
}
