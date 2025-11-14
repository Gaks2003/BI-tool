import { useState } from 'react'
import { paginateData } from '../../lib/dataAggregator'

type Props = {
  data: any[]
}

export default function DataTable({ data }: Props) {
  const [page, setPage] = useState(1)
  const pageSize = 50
  
  if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No data</div>

  const columns = Object.keys(data[0])
  const paginated = paginateData(data, page, pageSize)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', position: 'sticky', top: 0 }}>
              {columns.map(col => (
                <th key={col} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '0.75rem' }}>{String(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginated.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid #ddd' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', background: page === 1 ? '#ddd' : '#667eea', color: page === 1 ? '#999' : 'white', borderRadius: '4px' }}>Previous</button>
          <span style={{ fontSize: '0.875rem' }}>Page {page} of {paginated.pages} ({data.length} rows)</span>
          <button onClick={() => setPage(p => Math.min(paginated.pages, p + 1))} disabled={page === paginated.pages} style={{ padding: '0.5rem 1rem', background: page === paginated.pages ? '#ddd' : '#667eea', color: page === paginated.pages ? '#999' : 'white', borderRadius: '4px' }}>Next</button>
        </div>
      )}
    </div>
  )
}
