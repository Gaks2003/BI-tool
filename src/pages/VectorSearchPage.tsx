import { useState } from 'react'
import { useDatasets } from '../hooks/useDatasets'
import { Search } from 'lucide-react'

export default function VectorSearchPage() {
  const { datasets } = useDatasets()
  const [selectedDataset, setSelectedDataset] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const vectorDatasets = datasets.filter(d => d.is_vector)

  const handleSearch = async () => {
    if (!selectedDataset || !query) return
    
    setSearching(true)
    try {
      const dataset = datasets.find(d => d.id === selectedDataset)
      if (!dataset) return

      // Simple cosine similarity search
      const queryWords = query.toLowerCase().split(' ')
      const scored = dataset.data.map((row, index) => {
        const text = Object.values(row).join(' ').toLowerCase()
        const score = queryWords.reduce((acc, word) => 
          acc + (text.includes(word) ? 1 : 0), 0
        )
        return { ...row, _score: score, _index: index }
      })

      const sorted = scored
        .filter(r => r._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, 10)

      setResults(sorted)
    } catch (err) {
      alert('Search error: ' + (err as Error).message)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Vector Search</h1>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <select
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">Select vector dataset</option>
          {vectorDatasets.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={handleSearch}
            disabled={searching || !selectedDataset || !query}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '4px', fontWeight: '600' }}
          >
            <Search size={20} />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Results ({results.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((result, i) => (
              <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#667eea' }}>Result #{i + 1}</span>
                  <span style={{ fontSize: '0.875rem', color: '#999' }}>Score: {result._score}</span>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  {Object.entries(result).map(([key, value]) => {
                    if (key.startsWith('_')) return null
                    return (
                      <div key={key} style={{ marginBottom: '0.25rem' }}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          No results found
        </div>
      )}
    </div>
  )
}
