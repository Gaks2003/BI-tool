import { useState } from 'react'
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'

type Props = {
  data: any[]
}

export default function AIInsights({ data }: Props) {
  const [insights, setInsights] = useState<any[]>([])

  const generateInsights = () => {
    const newInsights = []

    // Find numeric columns
    const numericCols = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    )

    // Trend analysis
    numericCols.forEach(col => {
      const values = data.map(row => Number(row[col]) || 0)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing'
      
      newInsights.push({
        type: 'trend',
        icon: TrendingUp,
        message: `${col} is ${trend} with an average of ${avg.toFixed(2)}`
      })
    })

    // Anomaly detection
    numericCols.forEach(col => {
      const values = data.map(row => Number(row[col]) || 0)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length)
      
      const outliers = values.filter(v => Math.abs(v - avg) > 2 * stdDev)
      if (outliers.length > 0) {
        newInsights.push({
          type: 'anomaly',
          icon: AlertTriangle,
          message: `Found ${outliers.length} outliers in ${col}`
        })
      }
    })

    setInsights(newInsights.slice(0, 5))
  }

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: '#667eea' }} />
          AI Insights
        </h3>
        <button
          onClick={generateInsights}
          style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', borderRadius: '4px', fontSize: '0.875rem' }}
        >
          Generate Insights
        </button>
      </div>

      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {insights.map((insight, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '4px' }}>
              <insight.icon size={18} style={{ color: insight.type === 'anomaly' ? '#f59e0b' : '#10b981', marginTop: '0.125rem' }} />
              <span style={{ fontSize: '0.875rem' }}>{insight.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
