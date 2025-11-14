import { useState } from 'react'
import { Filter } from 'lucide-react'

type Props = {
  fields: string[]
  onFilterChange: (filters: Record<string, string>) => void
}

export default function DashboardFilters({ fields, onFilterChange }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', borderRadius: '4px' }}
      >
        <Filter size={16} />
        Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
      </button>

      {showFilters && (
        <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {fields.map(field => (
              <div key={field}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>{field}</label>
                <input
                  type="text"
                  placeholder={`Filter ${field}...`}
                  value={filters[field] || ''}
                  onChange={(e) => handleFilterChange(field, e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.875rem' }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={clearFilters}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '4px', fontSize: '0.875rem' }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
