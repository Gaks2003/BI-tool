import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
}

export default function AreaChart({ data, xAxis, yAxis }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsArea data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={yAxis} stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
      </RechartsArea>
    </ResponsiveContainer>
  )
}
