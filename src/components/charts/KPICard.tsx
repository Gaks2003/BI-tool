type Props = {
  data: any[]
  metric: string
  name: string
}

export default function KPICard({ data, metric, name }: Props) {
  const value = data.reduce((sum, item) => sum + (Number(item[metric]) || 0), 0)
  const avg = data.length > 0 ? value / data.length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
      <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>{name}</h3>
      <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.5rem' }}>
        Avg: {avg.toFixed(2)}
      </div>
    </div>
  )
}
