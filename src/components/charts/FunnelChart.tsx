type Props = {
  data: any[]
  stage: string
  value: string
}

export default function FunnelChart({ data, stage, value }: Props) {
  const maxValue = Math.max(...data.map(d => Number(d[value])))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '2rem' }}>
      {data.map((item, i) => {
        const val = Number(item[value])
        const width = (val / maxValue) * 100
        const conversionRate = i > 0 ? ((val / Number(data[i-1][value])) * 100).toFixed(1) : 100

        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: `${width}%`,
                background: `hsl(${240 - i * 30}, 70%, 60%)`,
                padding: '1rem',
                borderRadius: '4px',
                color: 'white',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              <div>{item[stage]}</div>
              <div style={{ fontSize: '1.25rem' }}>{val.toLocaleString()}</div>
              {i > 0 && <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{conversionRate}%</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
