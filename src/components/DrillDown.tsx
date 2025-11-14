import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

type Props = {
  data: any[]
  levels: string[]
  metric: string
}

export default function DrillDown({ data, levels, metric }: Props) {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string[]>([])

  const getCurrentData = () => {
    let filtered = data
    selectedPath.forEach((val, i) => {
      filtered = filtered.filter(row => row[levels[i]] === val)
    })
    return filtered
  }

  const getGroupedData = () => {
    const current = getCurrentData()
    const level = levels[currentLevel]
    const grouped: Record<string, number> = {}

    current.forEach(row => {
      const key = row[level]
      grouped[key] = (grouped[key] || 0) + (Number(row[metric]) || 0)
    })

    return Object.entries(grouped).sort((a, b) => b[1] - a[1])
  }

  const handleDrillDown = (value: string) => {
    if (currentLevel < levels.length - 1) {
      setSelectedPath([...selectedPath, value])
      setCurrentLevel(currentLevel + 1)
    }
  }

  const handleDrillUp = () => {
    if (currentLevel > 0) {
      setSelectedPath(selectedPath.slice(0, -1))
      setCurrentLevel(currentLevel - 1)
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        <button onClick={handleDrillUp} disabled={currentLevel === 0} style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', borderRadius: '4px' }}>
          ← Back
        </button>
        {selectedPath.map((val, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ChevronRight size={14} />
            {val}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {getGroupedData().map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleDrillDown(key)}
            disabled={currentLevel === levels.length - 1}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              cursor: currentLevel < levels.length - 1 ? 'pointer' : 'default'
            }}
          >
            <span style={{ fontWeight: '600' }}>{key}</span>
            <span style={{ color: '#667eea' }}>{value.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
