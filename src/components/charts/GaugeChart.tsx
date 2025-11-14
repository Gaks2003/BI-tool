type Props = {
  value: number
  max: number
  label: string
}

export default function GaugeChart({ value, max, label }: Props) {
  const percentage = (value / max) * 100
  const angle = (percentage / 100) * 180 - 90

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#667eea"
          strokeWidth="20"
          strokeDasharray={`${percentage * 2.51} 251`}
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="#333"
          strokeWidth="3"
          transform={`rotate(${angle} 100 100)`}
        />
        <circle cx="100" cy="100" r="8" fill="#333" />
      </svg>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{value}</div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#999' }}>Target: {max}</div>
      </div>
    </div>
  )
}
