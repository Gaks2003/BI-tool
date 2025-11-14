import { ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
}

export default function ScatterChart({ data, xAxis, yAxis }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatter>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} name={xAxis} />
        <YAxis dataKey={yAxis} name={yAxis} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={data} fill="#667eea" />
      </RechartsScatter>
    </ResponsiveContainer>
  )
}
