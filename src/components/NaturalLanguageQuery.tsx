import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

type Props = {
  data: any[]
  onQueryResult: (result: any) => void
}

export default function NaturalLanguageQuery({ data, onQueryResult }: Props) {
  const [query, setQuery] = useState('')
  const [processing, setProcessing] = useState(false)

  const processQuery = () => {
    setProcessing(true)
    const lowerQuery = query.toLowerCase()

    try {
      // Simple NLP parsing
      if (lowerQuery.includes('top') && lowerQuery.includes('by')) {
        const match = lowerQuery.match(/top (\d+) (.+) by (.+)/)
        if (match) {
          const [, limit, field, metric] = match
          const sorted = [...data].sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0))
          onQueryResult({ type: 'table', data: sorted.slice(0, Number(limit)) })
        }
      } else if (lowerQuery.includes('average') || lowerQuery.includes('avg')) {
        const field = lowerQuery.replace(/average|avg|of|the/g, '').trim()
        const values = data.map(row => Number(row[field]) || 0)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        onQueryResult({ type: 'kpi', value: avg.toFixed(2), label: `Average ${field}` })
      } else if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
        const field = lowerQuery.replace(/total|sum|of|the/g, '').trim()
        const total = data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0)
        onQueryResult({ type: 'kpi', value: total.toLocaleString(), label: `Total ${field}` })
      } else if (lowerQuery.includes('count')) {
        onQueryResult({ type: 'kpi', value: data.length, label: 'Total Records' })
      } else {
        alert('Try queries like: "top 5 products by sales", "average profit", "total sales"')
      }
    } catch (err) {
      alert('Could not understand query. Try: "top 10 products by sales"')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={20} style={{ color: '#667eea' }} />
        Ask a Question
      </h3>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="e.g., 'Show me top 10 products by sales'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && processQuery()}
          style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button
          onClick={processQuery}
          disabled={!query || processing}
          style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Send size={18} />
          {processing ? 'Processing...' : 'Ask'}
        </button>
      </div>
    </div>
  )
}
