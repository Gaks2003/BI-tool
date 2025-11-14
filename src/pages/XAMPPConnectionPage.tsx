import { useState, useEffect } from 'react'
import { Database, CheckCircle, Upload, Save } from 'lucide-react'
import { parseExcel, parseCSV } from '../utils/dataParser'
import { useDatasets } from '../hooks/useDatasets'
import { useNavigate } from 'react-router-dom'

export default function XAMPPConnectionPage() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('xampp_config')
    return saved ? JSON.parse(saved) : {
      host: 'localhost',
      port: '3306',
      database: 'bi_datasets',
      username: 'root',
      password: ''
    }
  })
  const [connected, setConnected] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [data, setData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const { createDataset } = useDatasets()
  const navigate = useNavigate()

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/xampp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const result = await response.json()
      if (result.success) {
        setConnected(true)
        setTables(result.tables)
        localStorage.setItem('xampp_config', JSON.stringify(config))
        alert('Connected to XAMPP MySQL!')
      } else {
        alert('Connection failed: ' + result.error)
      }
    } catch (err) {
      alert('Error: Make sure XAMPP MySQL is running and backend server is started')
    }
  }

  // Auto-connect on mount if config exists
  useEffect(() => {
    const saved = localStorage.getItem('xampp_config')
    if (saved) {
      testConnection()
    }
  }, [])

  const loadTable = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/xampp/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          query: `SELECT * FROM ${selectedTable} LIMIT 10000`
        })
      })
      const result = await response.json()
      setData(result.data)
      alert(`Loaded ${result.data.length} rows from ${selectedTable}`)
    } catch (err) {
      alert('Error loading table: ' + (err as Error).message)
    }
  }

  const saveAsDataset = async () => {
    if (data.length === 0) return
    try {
      await createDataset(selectedTable, data)
      alert(`✅ Saved as dataset: ${selectedTable}\nGo to Dashboards to create visualizations!`)
      navigate('/datasets')
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      let parsedData: any[]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await parseExcel(file)
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text()
        parsedData = parseCSV(text)
      } else if (file.name.endsWith('.json')) {
        const text = await file.text()
        parsedData = JSON.parse(text)
      } else {
        throw new Error('Unsupported file type')
      }
      
      const tableName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_')

      const response = await fetch('http://localhost:3001/api/xampp/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          tableName,
          data: parsedData
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`✅ ${result.message}\nTable: ${tableName}`)
        testConnection()
      } else {
        alert('❌ Import failed: ' + result.error)
      }
    } catch (err) {
      alert('❌ Error: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>XAMPP MySQL Connection</h1>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={24} />
          Database Configuration
        </h2>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Host</label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Port</label>
              <input
                type="text"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Database Name</label>
            <input
              type="text"
              value={config.database}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
              placeholder="e.g., sales_db"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Username</label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={testConnection}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '4px', fontWeight: '600' }}
        >
          {connected ? <CheckCircle size={20} /> : <Database size={20} />}
          {connected ? 'Connected' : 'Test Connection'}
        </button>
      </div>

      {connected && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} />
            Upload File to MySQL
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Upload Excel, CSV, or JSON files. All rows will be imported (no limits!).</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ padding: '0.75rem', border: '2px dashed #ddd', borderRadius: '4px', width: '100%', cursor: 'pointer' }}
          />
          {uploading && <p style={{ marginTop: '1rem', color: '#667eea' }}>⏳ Uploading and importing data...</p>}
        </div>
      )}

      {connected && tables.length > 0 && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Available Tables</h3>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem' }}
          >
            <option value="">Select a table</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={loadTable}
              disabled={!selectedTable}
              style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '4px', fontWeight: '600' }}
            >
              Load Table Data
            </button>
            {data.length > 0 && (
              <button
                onClick={saveAsDataset}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '4px', fontWeight: '600' }}
              >
                <Save size={20} />
                Save as Dataset
              </button>
            )}
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Data Preview ({data.length} rows)
          </h3>
          <div style={{ overflow: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #ddd' }}>
                  {Object.keys(data[0]).map(col => (
                    <th key={col} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 100).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} style={{ padding: '0.75rem' }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
