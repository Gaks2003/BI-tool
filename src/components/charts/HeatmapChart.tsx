type Props = {
  data: any[]
  xAxis: string
  yAxis: string
  metric: string
}

export default function HeatmapChart({ data, xAxis, yAxis, metric }: Props) {
  const xValues = [...new Set(data.map(d => d[xAxis]))]
  const yValues = [...new Set(data.map(d => d[yAxis]))]
  
  const getValue = (x: any, y: any) => {
    const item = data.find(d => d[xAxis] === x && d[yAxis] === y)
    return item ? Number(item[metric]) : 0
  }
  
  const allValues = data.map(d => Number(d[metric]))
  const max = Math.max(...allValues)
  const min = Math.min(...allValues)
  
  const getColor = (value: number) => {
    const intensity = (value - min) / (max - min)
    const r = Math.floor(102 + intensity * 153)
    const g = Math.floor(126 + intensity * 100)
    const b = Math.floor(234 - intensity * 100)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '1rem' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.75rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}></th>
            {xValues.map(x => (
              <th key={String(x)} style={{ padding: '0.5rem', border: '1px solid #ddd', fontWeight: '600' }}>{String(x)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map(y => (
            <tr key={String(y)}>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontWeight: '600' }}>{String(y)}</td>
              {xValues.map(x => {
                const value = getValue(x, y)
                return (
                  <td
                    key={`${x}-${y}`}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      background: getColor(value),
                      color: value > (max + min) / 2 ? 'white' : 'black',
                      textAlign: 'center',
                      minWidth: '50px'
                    }}
                  >
                    {value.toFixed(0)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
